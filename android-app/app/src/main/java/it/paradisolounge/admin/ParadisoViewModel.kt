package it.paradisolounge.admin

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import java.time.LocalDate
import java.util.concurrent.Executors

class ParadisoViewModel(application: Application) : AndroidViewModel(application) {
    private val api = ApiClient()
    private val storage = SecureStorage(application)
    private val executor = Executors.newFixedThreadPool(3)

    var state by mutableStateOf(AppState())
        private set

    init {
        restoreSession()
    }

    fun login(email: String, password: String) {
        if (email.isBlank() || password.isBlank()) {
            notice("Inserisci email e password.", true)
            return
        }
        state = state.copy(isLoading = true)
        background(
            work = { api.login(email, password) },
            success = { newToken ->
                storage.saveToken(newToken)
                state = state.copy(token = newToken, isLoading = false)
                refreshBookings()
            },
        )
    }

    fun logout() {
        storage.clear()
        state = AppState()
    }

    fun refresh() {
        when (state.selectedSection) {
            Section.BOOKINGS -> refreshBookings()
            Section.ACCOUNTING -> refreshAccounting()
        }
    }

    fun setSection(section: Section) {
        state = state.copy(selectedSection = section)
        if (section == Section.ACCOUNTING && !state.accountingLoaded) {
            refreshAccounting()
        }
    }

    fun setStatusFilter(status: String) {
        state = state.copy(statusFilter = status)
    }

    fun openBookingFromQr(rawValue: String) {
        val code = extractBookingCode(rawValue)
        if (code == null) {
            notice("QR non valido: il codice prenotazione non è stato riconosciuto.", true)
            return
        }
        openBooking(bookingTarget(null, code)!!, "${code}: prenotazione trovata.")
    }

    fun openBookingFromNotification(target: BookingTarget) {
        openBooking(target)
    }

    fun consumeTargetBooking() {
        state = state.copy(targetBooking = null)
    }

    private fun openBooking(target: BookingTarget, successMessage: String? = null) {
        val token = state.token ?: return
        val cached = state.bookings.firstOrNull {
            it.id == target.bookingId || it.code.equals(target.code, ignoreCase = true)
        }
        if (cached != null) {
            presentBooking(cached)
            successMessage?.let { notice(it) }
            return
        }

        state = state.copy(isLoading = true)
        background(
            work = {
                target.code?.let { api.bookingByCode(token, it) }
                    ?: api.bookings(token).firstOrNull { it.id == target.bookingId }
                    ?: throw ApiException(404, "Prenotazione non trovata.")
            },
            success = { booking ->
                presentBooking(booking)
                successMessage?.let { notice(it) }
            },
        )
    }

    private fun presentBooking(booking: Booking) {
        val updatedBookings = state.bookings
            .filterNot { it.id == booking.id }
            .toMutableList()
            .apply { add(0, booking) }
        state = state.copy(
            isLoading = false,
            bookings = updatedBookings,
            selectedSection = Section.BOOKINGS,
            statusFilter = "Tutti",
            targetBooking = booking,
        )
    }

    fun updateStatus(booking: Booking, status: String) {
        val token = state.token ?: return
        state = state.copy(isLoading = true)
        background(
            work = { api.updateBookingStatus(token, booking.id, status) },
            success = {
                state = state.copy(
                    isLoading = false,
                    bookings = state.bookings.map {
                        if (it.id == booking.id) it.copy(status = status) else it
                    },
                )
                notice("${booking.code}: stato aggiornato.")
            },
        )
    }

    fun addLedgerEntry(
        kind: String,
        amount: Double,
        date: String,
        category: String,
        description: String,
        paymentMethod: String,
        onDone: () -> Unit,
    ) {
        val token = state.token ?: return
        if (amount <= 0 || category.trim().length < 2 || runCatching { LocalDate.parse(date) }.isFailure) {
            notice("Controlla importo, data e categoria.", true)
            return
        }
        state = state.copy(isLoading = true)
        background(
            work = {
                api.createLedgerEntry(token, date, kind, category, description, paymentMethod, amount)
            },
            success = {
                onDone()
                notice("Movimento registrato.")
                refreshAccounting()
            },
        )
    }

    fun registerIncome(
        booking: Booking,
        amount: Double,
        date: String,
        paymentMethod: String,
        onDone: () -> Unit,
    ) {
        val token = state.token ?: return
        if (amount <= 0 || runCatching { LocalDate.parse(date) }.isFailure) {
            notice("Controlla importo e data.", true)
            return
        }
        state = state.copy(isLoading = true)
        background(
            work = { api.registerBookingIncome(token, booking.id, amount, date, paymentMethod) },
            success = {
                onDone()
                notice("Incasso ${booking.code} registrato.")
                refreshAccounting()
            },
        )
    }

    fun registerDevice(messagingToken: String, deviceName: String) {
        val token = state.token ?: return
        background(
            work = { api.registerDevice(token, messagingToken, deviceName) },
            success = {},
            showLoading = false,
            reportError = false,
        )
    }

    fun clearNotice() {
        state = state.copy(notice = null, noticeIsError = false)
    }

    override fun onCleared() {
        executor.shutdownNow()
        super.onCleared()
    }

    private fun restoreSession() {
        val saved = storage.readToken()
        state = AppState(token = saved)
        if (saved != null) refreshBookings()
    }

    private fun refreshBookings() {
        val token = state.token ?: return
        state = state.copy(isLoading = true)
        background(
            work = { api.bookings(token) },
            success = { bookings ->
                state = state.copy(isLoading = false, bookings = bookings)
            },
        )
    }

    private fun refreshAccounting() {
        val token = state.token ?: return
        state = state.copy(isLoading = true)
        val period = currentPeriod()
        background(
            work = { api.accounting(token, period.first, period.second) },
            success = { (summary, entries) ->
                state = state.copy(
                    isLoading = false,
                    summary = summary,
                    entries = entries,
                    accountingLoaded = true,
                )
            },
        )
    }

    private fun <T> background(
        work: () -> T,
        success: (T) -> Unit,
        showLoading: Boolean = true,
        reportError: Boolean = true,
        failure: ((Throwable) -> Unit)? = null,
    ) {
        executor.execute {
            runCatching(work).fold(
                onSuccess = { result ->
                    getApplication<Application>().mainExecutor.execute { success(result) }
                },
                onFailure = { error ->
                    getApplication<Application>().mainExecutor.execute {
                        if (showLoading) state = state.copy(isLoading = false)
                        if (failure != null) {
                            failure(error)
                        } else if (error is ApiException && error.status == 401) {
                            logout()
                            notice("Sessione scaduta. Accedi di nuovo.", true)
                        } else if (reportError) {
                            notice(error.message ?: "Connessione non disponibile.", true)
                        }
                    }
                },
            )
        }
    }

    private fun notice(message: String, error: Boolean = false) {
        state = state.copy(notice = message, noticeIsError = error, isLoading = false)
    }

    private fun currentPeriod(): Pair<String, String> {
        val today = LocalDate.now()
        return today.withDayOfMonth(1).toString() to today.toString()
    }
}
