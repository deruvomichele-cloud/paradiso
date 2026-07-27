import Foundation

struct BookingItem: Codable, Hashable, Identifiable {
    let id: String
    let name: String
    let price: Double
    let quantity: Int
}

struct Booking: Codable, Hashable, Identifiable {
    let id: String
    let code: String
    let createdAt: String
    let updatedAt: String?
    let customerName: String
    let phone: String
    let email: String
    let reservationDate: String
    let reservationTime: String
    let guests: Int
    let notes: String
    let items: [BookingItem]
    let estimatedTotal: Double
    let paymentMethod: String
    var status: String
}

struct LedgerEntry: Codable, Hashable, Identifiable {
    let id: String
    let occurredOn: String
    let kind: String
    let category: String
    let description: String
    let paymentMethod: String
    let amount: Double
    let bookingId: String?
    let bookingCode: String?
    let createdAt: String?
}

struct AccountingSummary: Codable, Hashable {
    let income: Double
    let expenses: Double
    let refunds: Double
    let net: Double
    let entryCount: Int?

    static let empty = AccountingSummary(
        income: 0,
        expenses: 0,
        refunds: 0,
        net: 0,
        entryCount: 0
    )
}

struct BookingTarget: Hashable {
    let bookingId: String?
    let code: String?

    init?(bookingId: String?, code: String?) {
        let cleanID = bookingId?.trimmingCharacters(in: .whitespacesAndNewlines)
        let cleanCode = code?
            .trimmingCharacters(in: .whitespacesAndNewlines)
            .uppercased()
        if cleanID?.isEmpty != false && cleanCode?.isEmpty != false {
            return nil
        }
        self.bookingId = cleanID?.isEmpty == false ? cleanID : nil
        self.code = cleanCode?.isEmpty == false ? cleanCode : nil
    }
}

struct AppMessage: Identifiable, Equatable {
    let id = UUID()
    let text: String
    let isError: Bool
}

enum AdminSection: Hashable {
    case bookings
    case accounting
    case settings
}

enum BookingStatus {
    static let all = ["Tutti", "Nuovo", "Confermato", "Completato", "Annullato"]
    static let editable = ["Nuovo", "Confermato", "Completato", "Annullato"]
}

enum LedgerKind: String, CaseIterable, Identifiable {
    case income
    case expense
    case refund

    var id: String { rawValue }

    var label: String {
        switch self {
        case .income: "Incasso"
        case .expense: "Spesa"
        case .refund: "Rimborso"
        }
    }
}
