package it.paradisolounge.admin

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class SmsGatewayTest {
    @Test
    fun normalizesItalianMobileNumbers() {
        assertEquals("+393331234567", normalizeSmsDestination("+39 333 123 4567"))
        assertEquals("+393331234567", normalizeSmsDestination("3331234567"))
        assertEquals("+393331234567", normalizeSmsDestination("0039 333 123 4567"))
        assertEquals("+393932498699", normalizeSmsDestination("3932498699"))
        assertNull(normalizeSmsDestination("123"))
    }

    @Test
    fun buildsConciseBookingConfirmation() {
        val message = bookingConfirmationSms("P-ABC12345", "2026-07-27", "21:30", 4)
        assertEquals(
            "Paradiso Lounge Bar: prenotazione P-ABC12345 confermata il 27/07/2026 alle 21:30 per 4 persone. Mostra il QR ricevuto via email.",
            message,
        )
        assertTrue(message.length <= 160)
    }
}
