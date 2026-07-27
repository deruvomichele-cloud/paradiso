import XCTest
@testable import ParadisoAdmin

final class BookingCodeTests: XCTestCase {
    func testExtractsPlainBookingCode() {
        XCTAssertEqual(BookingCode.extract(from: "P-12ab34cd"), "P-12AB34CD")
    }

    func testExtractsCodeFromEncodedURL() {
        let value = "https://loungebarparadiso.it/admin.html%3Fbooking%3DP-A1B2C3D4"
        XCTAssertEqual(BookingCode.extract(from: value), "P-A1B2C3D4")
    }

    func testRejectsCodeEmbeddedInLongerToken() {
        XCTAssertNil(BookingCode.extract(from: "XP-A1B2C3D4Z"))
    }

    func testBookingTargetNormalizesValues() {
        let target = BookingTarget(bookingId: " booking-1 ", code: " p-a1b2c3d4 ")
        XCTAssertEqual(target?.bookingId, "booking-1")
        XCTAssertEqual(target?.code, "P-A1B2C3D4")
    }

    func testBookingTargetRejectsEmptyValues() {
        XCTAssertNil(BookingTarget(bookingId: " ", code: nil))
    }
}
