import SwiftUI

enum ParadisoTheme {
    static let background = Color(hex: 0x070B11)
    static let header = Color(hex: 0x0A1018)
    static let surface = Color(hex: 0x0D121B)
    static let raised = Color(hex: 0x111D2C)
    static let accent = Color(hex: 0x6FB9E9)
    static let text = Color(hex: 0xF4F7FB)
    static let muted = Color(hex: 0xA3AFBD)
    static let line = Color(hex: 0x253447)
    static let green = Color(hex: 0x61D49B)
    static let red = Color(hex: 0xFF8E8E)
    static let gold = Color(hex: 0xE7C76C)

    static func statusColor(_ status: String) -> Color {
        switch status {
        case "Nuovo": gold
        case "Confermato": accent
        case "Completato": green
        default: red
        }
    }
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(
            .sRGB,
            red: Double((hex >> 16) & 0xff) / 255,
            green: Double((hex >> 8) & 0xff) / 255,
            blue: Double(hex & 0xff) / 255,
            opacity: alpha
        )
    }
}

enum DateFormatters {
    static let apiDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.calendar = Calendar(identifier: .gregorian)
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.dateFormat = "yyyy-MM-dd"
        return formatter
    }()

    static let displayDate: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "it_IT")
        formatter.dateFormat = "EEE d MMM yyyy"
        return formatter
    }()

    static let month: DateFormatter = {
        let formatter = DateFormatter()
        formatter.locale = Locale(identifier: "it_IT")
        formatter.dateFormat = "MMMM yyyy"
        return formatter
    }()

    static let currencyFormatter: NumberFormatter = {
        let formatter = NumberFormatter()
        formatter.locale = Locale(identifier: "it_IT")
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        return formatter
    }()

    static func currency(_ value: Double) -> String {
        currencyFormatter.string(from: NSNumber(value: value)) ?? String(format: "€ %.2f", value)
    }

    static func bookingDate(_ raw: String) -> String {
        guard let date = apiDate.date(from: raw) else { return raw }
        return displayDate.string(from: date).capitalized
    }

    static func monthRange(containing date: Date) -> (start: Date, end: Date) {
        let calendar = Calendar(identifier: .gregorian)
        let start = calendar.date(from: calendar.dateComponents([.year, .month], from: date))!
        let nextMonth = calendar.date(byAdding: .month, value: 1, to: start)!
        let end = calendar.date(byAdding: .day, value: -1, to: nextMonth)!
        return (start, end)
    }
}

struct Panel<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(ParadisoTheme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(ParadisoTheme.line, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}

struct StatusBadge: View {
    let status: String

    var body: some View {
        Text(status)
            .font(.caption.weight(.semibold))
            .foregroundStyle(ParadisoTheme.statusColor(status))
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(ParadisoTheme.statusColor(status).opacity(0.12))
            .clipShape(Capsule())
            .accessibilityLabel("Stato \(status)")
    }
}

struct LoadingOverlay: View {
    let visible: Bool

    var body: some View {
        if visible {
            ZStack {
                Color.black.opacity(0.22).ignoresSafeArea()
                ProgressView()
                    .controlSize(.large)
                    .tint(ParadisoTheme.accent)
            }
            .transition(.opacity)
        }
    }
}
