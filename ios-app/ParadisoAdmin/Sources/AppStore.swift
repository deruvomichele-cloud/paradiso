import Foundation
import UIKit
import UserNotifications

@MainActor
final class AppStore: ObservableObject {
    @Published private(set) var token: String?
    @Published private(set) var bookings: [Booking] = []
    @Published private(set) var entries: [LedgerEntry] = []
    @Published private(set) var summary: AccountingSummary = .empty
    @Published private(set) var isLoading = false
    @Published private(set) var notificationStatus: UNAuthorizationStatus = .notDetermined
    @Published var selectedSection: AdminSection = .bookings
    @Published var statusFilter = "Tutti"
    @Published var searchText = ""
    @Published var selectedBooking: Booking?
    @Published var message: AppMessage?

    private let api: APIClient
    private let keychain: KeychainStore
    private var pendingFCMToken: String?
    private var pendingBookingTarget: BookingTarget?
    private var observers: [NSObjectProtocol] = []

    init(api: APIClient = APIClient(), keychain: KeychainStore = KeychainStore()) {
        self.api = api
        self.keychain = keychain
        self.token = keychain.readToken()
        self.pendingBookingTarget = PendingBookingRoute.shared.take()
        observeNotifications()

        Task {
            await updateNotificationStatus()
            if token != nil {
                await refreshAll()
                await requestNotificationsIfNeeded()
                await openPendingBookingIfNeeded()
            }
        }
    }

    deinit {
        observers.forEach(NotificationCenter.default.removeObserver)
    }

    var filteredBookings: [Booking] {
        bookings.filter { booking in
            let matchesStatus = statusFilter == "Tutti" || booking.status == statusFilter
            let query = searchText.trimmingCharacters(in: .whitespacesAndNewlines)
            let matchesSearch = query.isEmpty
                || booking.code.localizedCaseInsensitiveContains(query)
                || booking.customerName.localizedCaseInsensitiveContains(query)
                || booking.phone.localizedCaseInsensitiveContains(query)
            return matchesStatus && matchesSearch
        }
    }

    func login(email: String, password: String) async {
        guard !email.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty,
              !password.isEmpty else {
            show("Inserisci email e password.", error: true)
            return
        }

        isLoading = true
        defer { isLoading = false }
        do {
            let sessionToken = try await api.login(email: email, password: password)
            try keychain.saveToken(sessionToken)
            token = sessionToken
            async let loadedBookings: Void = refreshBookings(showLoading: false)
            async let loadedAccounting: Void = loadAccounting(month: Date(), showLoading: false)
            _ = await (loadedBookings, loadedAccounting)
            await registerPendingDevice()
            await requestNotificationsIfNeeded()
            await openPendingBookingIfNeeded()
        } catch {
            show(error.localizedDescription, error: true)
        }
    }

    func logout() {
        keychain.deleteToken()
        token = nil
        bookings = []
        entries = []
        summary = .empty
        selectedBooking = nil
        selectedSection = .bookings
    }

    func refreshAll() async {
        guard token != nil else { return }
        isLoading = true
        async let loadedBookings: Void = refreshBookings(showLoading: false)
        async let loadedAccounting: Void = loadAccounting(month: Date(), showLoading: false)
        _ = await (loadedBookings, loadedAccounting)
        isLoading = false
        await registerPendingDevice()
    }

    func refreshBookings(showLoading: Bool = true) async {
        guard let token else { return }
        if showLoading { isLoading = true }
        defer { if showLoading { isLoading = false } }
        do {
            bookings = try await api.bookings(token: token)
            if let selectedBooking,
               let refreshed = bookings.first(where: { $0.id == selectedBooking.id }) {
                self.selectedBooking = refreshed
            }
        } catch let error as APIError where error.status == 401 {
            expireSession()
        } catch {
            show(error.localizedDescription, error: true)
        }
    }

    func loadAccounting(month: Date, showLoading: Bool = true) async {
        guard let token else { return }
        if showLoading { isLoading = true }
        defer { if showLoading { isLoading = false } }
        let range = DateFormatters.monthRange(containing: month)
        do {
            let result = try await api.accounting(
                token: token,
                from: DateFormatters.apiDate.string(from: range.start),
                to: DateFormatters.apiDate.string(from: range.end)
            )
            summary = result.0
            entries = result.1
        } catch let error as APIError where error.status == 401 {
            expireSession()
        } catch {
            show(error.localizedDescription, error: true)
        }
    }

    func openBooking(_ target: BookingTarget) async {
        selectedSection = .bookings
        if let cached = bookings.first(where: { booking in
            let matchesID = target.bookingId.map { $0 == booking.id } ?? false
            let matchesCode = target.code.map {
                $0.caseInsensitiveCompare(booking.code) == .orderedSame
            } ?? false
            return matchesID || matchesCode
        }) {
            selectedBooking = cached
            return
        }

        guard let token else {
            show("Accedi per aprire la prenotazione.", error: true)
            return
        }
        do {
            if let code = target.code {
                selectedBooking = try await api.bookingByCode(token: token, code: code)
            } else {
                await refreshBookings()
                selectedBooking = bookings.first(where: { $0.id == target.bookingId })
                if selectedBooking == nil {
                    show("Prenotazione non trovata.", error: true)
                }
            }
        } catch {
            show(error.localizedDescription, error: true)
        }
    }

    func routeToBooking(_ target: BookingTarget) async {
        guard token != nil else {
            pendingBookingTarget = target
            return
        }
        await openBooking(target)
    }

    func openScannedValue(_ value: String) async {
        guard let code = BookingCode.extract(from: value),
              let target = BookingTarget(bookingId: nil, code: code) else {
            show("Questo QR code non contiene una prenotazione valida.", error: true)
            return
        }
        await openBooking(target)
    }

    func updateStatus(for booking: Booking, to status: String) async {
        guard let token, BookingStatus.editable.contains(status) else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            try await api.updateBookingStatus(token: token, bookingID: booking.id, status: status)
            if let index = bookings.firstIndex(where: { $0.id == booking.id }) {
                bookings[index].status = status
                selectedBooking = bookings[index]
            }
            show("Stato aggiornato.", error: false)
        } catch {
            show(error.localizedDescription, error: true)
        }
    }

    func createLedgerEntry(
        kind: LedgerKind,
        amount: Double,
        date: Date,
        category: String,
        description: String,
        paymentMethod: String,
        month: Date
    ) async -> Bool {
        guard let token, amount > 0,
              category.trimmingCharacters(in: .whitespacesAndNewlines).count >= 2 else {
            show("Controlla importo e categoria.", error: true)
            return false
        }
        isLoading = true
        defer { isLoading = false }
        do {
            try await api.createLedgerEntry(
                token: token,
                occurredOn: DateFormatters.apiDate.string(from: date),
                kind: kind.rawValue,
                category: category,
                description: description,
                paymentMethod: paymentMethod,
                amount: amount
            )
            await loadAccounting(month: month, showLoading: false)
            show("Movimento salvato.", error: false)
            return true
        } catch {
            show(error.localizedDescription, error: true)
            return false
        }
    }

    func registerIncome(
        booking: Booking,
        amount: Double,
        date: Date,
        paymentMethod: String
    ) async -> Bool {
        guard let token, amount > 0 else {
            show("Inserisci un importo valido.", error: true)
            return false
        }
        isLoading = true
        defer { isLoading = false }
        do {
            try await api.registerBookingIncome(
                token: token,
                bookingID: booking.id,
                amount: amount,
                occurredOn: DateFormatters.apiDate.string(from: date),
                paymentMethod: paymentMethod
            )
            await loadAccounting(month: date, showLoading: false)
            show("Incasso registrato.", error: false)
            return true
        } catch {
            show(error.localizedDescription, error: true)
            return false
        }
    }

    func incomeRegistered(for booking: Booking) -> Bool {
        entries.contains { $0.bookingId == booking.id && $0.kind == LedgerKind.income.rawValue }
    }

    func requestNotifications() async {
        do {
            let granted = try await NotificationService.requestAuthorization()
            await updateNotificationStatus()
            show(
                granted ? "Notifiche attivate." : "Notifiche non autorizzate.",
                error: !granted
            )
        } catch {
            show(error.localizedDescription, error: true)
        }
    }

    func updateNotificationStatus() async {
        notificationStatus = await NotificationService.authorizationStatus()
    }

    func show(_ text: String, error: Bool) {
        message = AppMessage(text: text, isError: error)
    }

    private func observeNotifications() {
        observers.append(
            NotificationCenter.default.addObserver(
                forName: .messagingTokenReceived,
                object: nil,
                queue: .main
            ) { [weak self] notification in
                guard let fid = notification.userInfo?["fid"] as? String else { return }
                Task { @MainActor in
                    self?.pendingFCMToken = fid
                    await self?.registerPendingDevice()
                }
            }
        )
        observers.append(
            NotificationCenter.default.addObserver(
                forName: .bookingNotificationOpened,
                object: nil,
                queue: .main
            ) { [weak self] notification in
                let id = notification.userInfo?["bookingId"] as? String
                let code = notification.userInfo?["code"] as? String
                guard let target = BookingTarget(bookingId: id, code: code) else { return }
                _ = PendingBookingRoute.shared.take()
                Task { @MainActor in
                    await self?.routeToBooking(target)
                }
            }
        )
        observers.append(
            NotificationCenter.default.addObserver(
                forName: .bookingNotificationReceived,
                object: nil,
                queue: .main
            ) { [weak self] _ in
                Task { @MainActor in
                    await self?.refreshBookings(showLoading: false)
                }
            }
        )
    }

    private func registerPendingDevice() async {
        guard let token, let fid = pendingFCMToken else { return }
        do {
            try await api.registerDevice(
                token: token,
                fid: fid,
                deviceName: UIDevice.current.name + " (iOS)"
            )
            pendingFCMToken = nil
        } catch let error as APIError where error.status == 401 {
            expireSession()
        } catch {
            show("Token notifiche non registrato: \(error.localizedDescription)", error: true)
        }
    }

    private func requestNotificationsIfNeeded() async {
        await updateNotificationStatus()
        if notificationStatus == .notDetermined {
            await requestNotifications()
        } else if notificationStatus == .authorized || notificationStatus == .provisional {
            UIApplication.shared.registerForRemoteNotifications()
        }
    }

    private func openPendingBookingIfNeeded() async {
        guard let target = pendingBookingTarget else { return }
        pendingBookingTarget = nil
        await openBooking(target)
    }

    private func expireSession() {
        logout()
        show("Sessione scaduta. Accedi di nuovo.", error: true)
    }
}
