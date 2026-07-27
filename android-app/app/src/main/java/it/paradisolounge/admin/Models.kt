package it.paradisolounge.admin

import org.json.JSONArray
import org.json.JSONObject

data class BookingItem(
    val id: String,
    val name: String,
    val price: Double,
    val quantity: Int,
)

data class Booking(
    val id: String,
    val code: String,
    val createdAt: String,
    val customerName: String,
    val phone: String,
    val email: String,
    val reservationDate: String,
    val reservationTime: String,
    val guests: Int,
    val notes: String,
    val items: List<BookingItem>,
    val estimatedTotal: Double,
    val paymentMethod: String,
    val status: String,
)

data class LedgerEntry(
    val id: String,
    val occurredOn: String,
    val kind: String,
    val category: String,
    val description: String,
    val paymentMethod: String,
    val amount: Double,
    val bookingId: String?,
    val bookingCode: String?,
)

data class AccountingSummary(
    val income: Double = 0.0,
    val expenses: Double = 0.0,
    val refunds: Double = 0.0,
    val net: Double = 0.0,
)

data class AppState(
    val token: String? = null,
    val isLoading: Boolean = false,
    val bookings: List<Booking> = emptyList(),
    val entries: List<LedgerEntry> = emptyList(),
    val summary: AccountingSummary = AccountingSummary(),
    val accountingLoaded: Boolean = false,
    val selectedSection: Section = Section.BOOKINGS,
    val statusFilter: String = "Tutti",
    val targetBooking: Booking? = null,
    val notice: String? = null,
    val noticeIsError: Boolean = false,
)

enum class Section { BOOKINGS, ACCOUNTING }

internal fun JSONObject.toBooking(): Booking {
    val parsedItems = mutableListOf<BookingItem>()
    val array = optJSONArray("items") ?: JSONArray()
    for (index in 0 until array.length()) {
        val item = array.getJSONObject(index)
        parsedItems += BookingItem(
            id = item.optString("id"),
            name = item.optString("name"),
            price = item.optDouble("price"),
            quantity = item.optInt("quantity"),
        )
    }
    return Booking(
        id = getString("id"),
        code = getString("code"),
        createdAt = optString("createdAt"),
        customerName = getString("customerName"),
        phone = getString("phone"),
        email = optString("email"),
        reservationDate = getString("reservationDate"),
        reservationTime = getString("reservationTime"),
        guests = getInt("guests"),
        notes = optString("notes"),
        items = parsedItems,
        estimatedTotal = optDouble("estimatedTotal"),
        paymentMethod = optString("paymentMethod"),
        status = getString("status"),
    )
}

internal fun JSONObject.toLedgerEntry() = LedgerEntry(
    id = getString("id"),
    occurredOn = getString("occurredOn"),
    kind = getString("kind"),
    category = getString("category"),
    description = optString("description"),
    paymentMethod = optString("paymentMethod"),
    amount = getDouble("amount"),
    bookingId = optNullableString("bookingId"),
    bookingCode = optNullableString("bookingCode"),
)

private fun JSONObject.optNullableString(key: String): String? {
    if (!has(key) || isNull(key)) return null
    return optString(key).takeIf { it.isNotBlank() }
}
