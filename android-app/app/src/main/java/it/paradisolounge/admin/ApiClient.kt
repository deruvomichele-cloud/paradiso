package it.paradisolounge.admin

import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

class ApiException(val status: Int, message: String) : Exception(message)

class ApiClient(private val baseUrl: String = BuildConfig.API_BASE_URL) {
    fun login(email: String, password: String): String {
        val body = JSONObject()
            .put("email", email.trim())
            .put("password", password)
        return request("POST", "/v1/auth/login", body).getString("token")
    }

    fun bookings(token: String): List<Booking> {
        val result = request("GET", "/v1/bookings?limit=300", token = token)
        val array = result.optJSONArray("bookings") ?: return emptyList()
        return List(array.length()) { array.getJSONObject(it).toBooking() }
    }

    fun bookingByCode(token: String, code: String): Booking {
        val encoded = URLEncoder.encode(code, StandardCharsets.UTF_8.name())
        val result = request("GET", "/v1/bookings?q=$encoded&limit=10", token = token)
        val array = result.optJSONArray("bookings")
        val bookings = if (array == null) {
            emptyList()
        } else {
            List(array.length()) { array.getJSONObject(it).toBooking() }
        }
        return bookings.firstOrNull { it.code.equals(code, ignoreCase = true) }
            ?: throw ApiException(404, "Prenotazione $code non trovata.")
    }

    fun updateBookingStatus(token: String, bookingId: String, status: String) {
        request(
            "PATCH",
            "/v1/bookings/$bookingId/status",
            JSONObject().put("status", status),
            token,
        )
    }

    fun accounting(token: String, from: String, to: String): Pair<AccountingSummary, List<LedgerEntry>> {
        val query = "?from=$from&to=$to"
        val summaryJson = request("GET", "/v1/accounting/summary$query", token = token)
        val entriesJson = request("GET", "/v1/accounting/entries$query", token = token)
        val entriesArray = entriesJson.optJSONArray("entries")
        val entries = if (entriesArray == null) {
            emptyList()
        } else {
            List(entriesArray.length()) { entriesArray.getJSONObject(it).toLedgerEntry() }
        }
        return AccountingSummary(
            income = summaryJson.optDouble("income"),
            expenses = summaryJson.optDouble("expenses"),
            refunds = summaryJson.optDouble("refunds"),
            net = summaryJson.optDouble("net"),
        ) to entries
    }

    fun createLedgerEntry(
        token: String,
        occurredOn: String,
        kind: String,
        category: String,
        description: String,
        paymentMethod: String,
        amount: Double,
    ) {
        val body = JSONObject()
            .put("occurredOn", occurredOn)
            .put("kind", kind)
            .put("category", category)
            .put("description", description)
            .put("paymentMethod", paymentMethod)
            .put("amount", amount)
        request("POST", "/v1/accounting/entries", body, token)
    }

    fun registerBookingIncome(
        token: String,
        bookingId: String,
        amount: Double,
        occurredOn: String,
        paymentMethod: String,
    ) {
        val body = JSONObject()
            .put("amount", amount)
            .put("occurredOn", occurredOn)
            .put("paymentMethod", paymentMethod)
        request("POST", "/v1/accounting/bookings/$bookingId/register-income", body, token)
    }

    fun registerDevice(token: String, fid: String, deviceName: String) {
        val body = JSONObject().put("fid", fid).put("deviceName", deviceName)
        request("POST", "/v1/devices", body, token)
    }

    private fun request(
        method: String,
        path: String,
        body: JSONObject? = null,
        token: String? = null,
    ): JSONObject {
        val connection = URL(baseUrl.trimEnd('/') + path).openConnection() as HttpURLConnection
        try {
            connection.requestMethod = method
            connection.connectTimeout = 7_000
            connection.readTimeout = 12_000
            connection.setRequestProperty("Accept", "application/json")
            if (token != null) connection.setRequestProperty("Authorization", "Bearer $token")
            if (body != null) {
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")
                connection.outputStream.bufferedWriter(Charsets.UTF_8).use { it.write(body.toString()) }
            }
            val status = connection.responseCode
            val stream = if (status in 200..299) connection.inputStream else connection.errorStream
            val text = stream?.bufferedReader()?.use { it.readText() }.orEmpty()
            val result = if (text.isBlank()) JSONObject() else JSONObject(text)
            if (status !in 200..299) {
                val message = result.optJSONObject("error")?.optString("message")
                    ?.takeIf { it.isNotBlank() }
                    ?: "Operazione non riuscita."
                throw ApiException(status, message)
            }
            return result
        } finally {
            connection.disconnect()
        }
    }
}
