import FirebaseCore
import FirebaseMessaging
import UIKit
import UserNotifications

extension Notification.Name {
    static let messagingTokenReceived = Notification.Name("messagingTokenReceived")
    static let bookingNotificationOpened = Notification.Name("bookingNotificationOpened")
    static let bookingNotificationReceived = Notification.Name("bookingNotificationReceived")
}

enum FirebaseConfiguration {
    static var isAvailable: Bool {
        Bundle.main.url(forResource: "GoogleService-Info", withExtension: "plist") != nil
    }
}

final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
    ) -> Bool {
        let center = UNUserNotificationCenter.current()
        center.delegate = self
        center.setNotificationCategories([
            UNNotificationCategory(
                identifier: "BOOKING_CREATED",
                actions: [],
                intentIdentifiers: [],
                options: []
            )
        ])

        if FirebaseConfiguration.isAvailable {
            FirebaseApp.configure()
            Messaging.messaging().delegate = self
        }
        return true
    }

    func application(
        _ application: UIApplication,
        didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
    ) {
        guard FirebaseConfiguration.isAvailable else { return }
        Messaging.messaging().apnsToken = deviceToken
    }

    func application(
        _ application: UIApplication,
        didFailToRegisterForRemoteNotificationsWithError error: Error
    ) {
        NotificationCenter.default.post(
            name: .bookingNotificationReceived,
            object: nil,
            userInfo: ["error": error.localizedDescription]
        )
    }

    func application(
        _ application: UIApplication,
        didReceiveRemoteNotification userInfo: [AnyHashable: Any],
        fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
    ) {
        NotificationCenter.default.post(
            name: .bookingNotificationReceived,
            object: nil,
            userInfo: normalized(userInfo)
        )
        completionHandler(.newData)
    }
}

extension AppDelegate: MessagingDelegate {
    func messaging(_ messaging: Messaging, didReceiveRegistrationToken fcmToken: String?) {
        guard let fcmToken, !fcmToken.isEmpty else { return }
        NotificationCenter.default.post(
            name: .messagingTokenReceived,
            object: nil,
            userInfo: ["fid": fcmToken]
        )
    }
}

extension AppDelegate: UNUserNotificationCenterDelegate {
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        NotificationCenter.default.post(
            name: .bookingNotificationReceived,
            object: nil,
            userInfo: normalized(notification.request.content.userInfo)
        )
        completionHandler([.banner, .list, .sound])
    }

    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        PendingBookingRoute.shared.store(response.notification.request.content.userInfo)
        NotificationCenter.default.post(
            name: .bookingNotificationOpened,
            object: nil,
            userInfo: normalized(response.notification.request.content.userInfo)
        )
        completionHandler()
    }
}

final class PendingBookingRoute {
    static let shared = PendingBookingRoute()

    private let lock = NSLock()
    private var target: BookingTarget?

    private init() {}

    func store(_ userInfo: [AnyHashable: Any]) {
        let bookingID = userInfo["bookingId"].map { String(describing: $0) }
        let code = userInfo["code"].map { String(describing: $0) }
        guard let target = BookingTarget(bookingId: bookingID, code: code) else { return }
        lock.lock()
        self.target = target
        lock.unlock()
    }

    func take() -> BookingTarget? {
        lock.lock()
        defer { lock.unlock() }
        let value = target
        target = nil
        return value
    }
}

private func normalized(_ userInfo: [AnyHashable: Any]) -> [String: Any] {
    Dictionary(uniqueKeysWithValues: userInfo.map { (String(describing: $0.key), $0.value) })
}

enum NotificationService {
    static func requestAuthorization() async throws -> Bool {
        guard FirebaseConfiguration.isAvailable else {
            throw APIError(
                status: 0,
                message: "Configurazione Firebase iOS mancante."
            )
        }
        let center = UNUserNotificationCenter.current()
        let granted = try await center.requestAuthorization(options: [.alert, .badge, .sound])
        if granted {
            await MainActor.run {
                UIApplication.shared.registerForRemoteNotifications()
            }
        }
        return granted
    }

    static func authorizationStatus() async -> UNAuthorizationStatus {
        await UNUserNotificationCenter.current().notificationSettings().authorizationStatus
    }
}
