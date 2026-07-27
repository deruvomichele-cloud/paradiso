package it.paradisolounge.admin

import java.util.Locale

data class BookingTarget(
    val bookingId: String?,
    val code: String?,
) {
    val key: String
        get() = bookingId ?: code.orEmpty()
}

internal fun bookingTarget(bookingId: String?, code: String?): BookingTarget? {
    val cleanId = bookingId?.trim()?.takeIf { it.isNotEmpty() }
    val cleanCode = code
        ?.trim()
        ?.takeIf { it.isNotEmpty() }
        ?.uppercase(Locale.ROOT)
    if (cleanId == null && cleanCode == null) return null
    return BookingTarget(cleanId, cleanCode)
}
