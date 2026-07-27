import Foundation

enum BookingCode {
    private static let expression = try! NSRegularExpression(
        pattern: #"(?i)(?<![A-Z0-9])P-[A-F0-9]{8}(?![A-Z0-9])"#
    )

    static func extract(from rawValue: String) -> String? {
        let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return nil }

        let candidates = [trimmed, trimmed.removingPercentEncoding].compactMap { $0 }
        for candidate in candidates {
            let range = NSRange(candidate.startIndex..., in: candidate)
            guard let match = expression.firstMatch(in: candidate, range: range),
                  let swiftRange = Range(match.range, in: candidate) else {
                continue
            }
            return String(candidate[swiftRange]).uppercased()
        }
        return nil
    }
}
