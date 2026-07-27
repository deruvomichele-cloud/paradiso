package it.paradisolounge.admin

import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test

class ModelsTest {
    @Test
    fun bookingJsonIsParsed() {
        val booking = JSONObject(
            """
            {
              "id": "97a94ac8-48b6-4eef-9b20-31fe03cb20ba",
              "code": "P-ABC12345",
              "createdAt": "2026-07-25T20:00:00Z",
              "customerName": "Mario Rossi",
              "phone": "+39 333 1234567",
              "email": "mario@example.com",
              "reservationDate": "2026-07-26",
              "reservationTime": "21:30",
              "guests": 4,
              "notes": "",
              "items": [{"id":"drink-1","name":"Negroni","price":8,"quantity":2}],
              "estimatedTotal": 16,
              "paymentMethod": "Contanti o carta al locale",
              "status": "Nuovo"
            }
            """.trimIndent(),
        ).toBooking()

        assertEquals("P-ABC12345", booking.code)
        assertEquals(4, booking.guests)
        assertEquals(1, booking.items.size)
        assertEquals(16.0, booking.estimatedTotal, 0.001)
    }

    @Test
    fun bookingCodeIsExtractedFromQrPayloads() {
        assertEquals("P-ABC12345", extractBookingCode("P-ABC12345"))
        assertEquals(
            "P-ABC12345",
            extractBookingCode("https://paradiso.example/prenotazione?code=P%2Dabc12345"),
        )
        assertEquals(
            "P-ABC12345",
            extractBookingCode("""{"id":"P-abc12345","source":"paradiso-booking-v1"}"""),
        )
    }

    @Test
    fun invalidQrPayloadHasNoBookingCode() {
        assertNull(extractBookingCode("https://example.com/altro"))
        assertNull(extractBookingCode(""))
        assertNull(extractBookingCode("P-TOO-SHORT"))
    }

    @Test
    fun notificationTargetKeepsBookingIdentity() {
        assertEquals(
            BookingTarget("booking-123", "P-ABC12345"),
            bookingTarget(" booking-123 ", "p-abc12345"),
        )
        assertEquals("P-ABC12345", bookingTarget(null, "p-abc12345")?.key)
        assertNull(bookingTarget(" ", " "))
    }
}
