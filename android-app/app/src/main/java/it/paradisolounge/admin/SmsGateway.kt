package it.paradisolounge.admin

import android.Manifest
import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.telephony.SmsManager
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private const val SMS_PREFERENCES = "paradiso_sms_gateway"
private const val SMS_ENABLED = "enabled"
private const val SMS_CONFIGURED = "configured"
private const val SMS_SENDER_NUMBER = "sender_number"
private const val DEFAULT_SMS_SENDER_NUMBER = "3932498699"
private const val SENT_BOOKING_IDS = "sent_booking_ids"
private const val PENDING_BOOKING_IDS = "pending_booking_ids"
private const val MAX_SAVED_BOOKING_IDS = 100
private const val ACTION_SMS_SENT = "it.paradisolounge.admin.SMS_SENT"
private const val ACTION_SMS_DELIVERED = "it.paradisolounge.admin.SMS_DELIVERED"
private const val EXTRA_BOOKING_ID = "booking_id"
private const val EXTRA_BOOKING_CODE = "booking_code"

enum class SmsGatewayResult {
    QUEUED,
    ALREADY_SENT,
    DISABLED,
    PERMISSION_MISSING,
    NO_TELEPHONY,
    INVALID_DESTINATION,
    SENDER_SIM_NOT_FOUND,
    FAILED,
}

object SmsGateway {
    fun isEnabled(context: Context): Boolean =
        preferences(context).getBoolean(SMS_ENABLED, false)

    fun hasBeenConfigured(context: Context): Boolean =
        preferences(context).getBoolean(SMS_CONFIGURED, false)

    fun setEnabled(context: Context, enabled: Boolean) {
        preferences(context).edit()
            .putBoolean(SMS_ENABLED, enabled)
            .putBoolean(SMS_CONFIGURED, true)
            .apply()
    }

    fun senderNumber(context: Context): String =
        preferences(context).getString(SMS_SENDER_NUMBER, DEFAULT_SMS_SENDER_NUMBER)
            .orEmpty()

    fun setSenderNumber(context: Context, value: String): Boolean {
        val sender = value.trim()
        if (normalizeSmsDestination(sender) == null) return false
        preferences(context).edit().putString(SMS_SENDER_NUMBER, sender).apply()
        return true
    }

    @Synchronized
    fun sendBookingConfirmation(
        context: Context,
        bookingId: String,
        code: String,
        phone: String,
        reservationDate: String,
        reservationTime: String,
        guests: Int,
    ): SmsGatewayResult {
        if (!isEnabled(context)) return SmsGatewayResult.DISABLED
        if (!hasSmsPermissions(context)) {
            return SmsGatewayResult.PERMISSION_MISSING
        }
        if (!context.packageManager.hasSystemFeature(PackageManager.FEATURE_TELEPHONY)) {
            return SmsGatewayResult.NO_TELEPHONY
        }
        if (wasAlreadySent(context, bookingId) || isPending(context, bookingId)) {
            return SmsGatewayResult.ALREADY_SENT
        }

        val destination = normalizeSmsDestination(phone) ?: return SmsGatewayResult.INVALID_DESTINATION
        val message = bookingConfirmationSms(code, reservationDate, reservationTime, guests)
        return runCatching {
            val manager = smsManagerForConfiguredSender(context)
                ?: return SmsGatewayResult.SENDER_SIM_NOT_FOUND
            rememberPending(context, bookingId)
            manager.sendTextMessage(
                destination,
                null,
                message,
                statusIntent(context, ACTION_SMS_SENT, bookingId, code),
                statusIntent(context, ACTION_SMS_DELIVERED, bookingId, code),
            )
            SmsGatewayResult.QUEUED
        }.getOrElse {
            clearPending(context, bookingId)
            SmsGatewayResult.FAILED
        }
    }

    private fun preferences(context: Context) =
        context.getSharedPreferences(SMS_PREFERENCES, Context.MODE_PRIVATE)

    private fun hasSmsPermissions(context: Context): Boolean = listOf(
        Manifest.permission.SEND_SMS,
        Manifest.permission.READ_PHONE_NUMBERS,
        Manifest.permission.READ_PHONE_STATE,
    ).all { permission ->
        context.checkSelfPermission(permission) == PackageManager.PERMISSION_GRANTED
    }

    private fun smsManagerForConfiguredSender(context: Context): SmsManager? {
        val configuredNumber = normalizeSmsDestination(senderNumber(context)) ?: return null
        val subscriptions = context.getSystemService(SubscriptionManager::class.java)
            ?.activeSubscriptionInfoList
            .orEmpty()
        val senderSubscription = subscriptions.firstOrNull { subscription ->
            normalizeSmsDestination(subscription.phoneNumber()) == configuredNumber
        } ?: return null
        return SmsManager.getSmsManagerForSubscriptionId(senderSubscription.subscriptionId)
    }

    private fun wasAlreadySent(context: Context, bookingId: String): Boolean {
        if (bookingId.isBlank()) return false
        return preferences(context).getStringSet(SENT_BOOKING_IDS, emptySet()).orEmpty().contains(bookingId)
    }

    private fun isPending(context: Context, bookingId: String): Boolean {
        if (bookingId.isBlank()) return false
        return preferences(context).getStringSet(PENDING_BOOKING_IDS, emptySet()).orEmpty().contains(bookingId)
    }

    private fun rememberPending(context: Context, bookingId: String) {
        if (bookingId.isBlank()) return
        val pending = preferences(context).getStringSet(PENDING_BOOKING_IDS, emptySet()).orEmpty().toMutableSet()
        pending += bookingId
        preferences(context).edit().putStringSet(PENDING_BOOKING_IDS, pending).apply()
    }

    internal fun markSent(context: Context, bookingId: String) {
        if (bookingId.isBlank()) return
        val saved = preferences(context).getStringSet(SENT_BOOKING_IDS, emptySet()).orEmpty().toMutableSet()
        if (saved.size >= MAX_SAVED_BOOKING_IDS) saved.remove(saved.first())
        saved += bookingId
        val pending = preferences(context).getStringSet(PENDING_BOOKING_IDS, emptySet()).orEmpty().toMutableSet()
        pending -= bookingId
        preferences(context).edit()
            .putStringSet(SENT_BOOKING_IDS, saved)
            .putStringSet(PENDING_BOOKING_IDS, pending)
            .apply()
    }

    internal fun clearPending(context: Context, bookingId: String) {
        if (bookingId.isBlank()) return
        val pending = preferences(context).getStringSet(PENDING_BOOKING_IDS, emptySet()).orEmpty().toMutableSet()
        pending -= bookingId
        preferences(context).edit().putStringSet(PENDING_BOOKING_IDS, pending).apply()
    }

    private fun statusIntent(
        context: Context,
        action: String,
        bookingId: String,
        code: String,
    ): PendingIntent {
        val intent = Intent(context, SmsStatusReceiver::class.java).apply {
            this.action = action
            putExtra(EXTRA_BOOKING_ID, bookingId)
            putExtra(EXTRA_BOOKING_CODE, code)
        }
        return PendingIntent.getBroadcast(
            context,
            "$action:$bookingId".hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }
}

@Suppress("DEPRECATION")
private fun SubscriptionInfo.phoneNumber(): String = number.orEmpty()

class SmsStatusReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val bookingId = intent.getStringExtra(EXTRA_BOOKING_ID).orEmpty()
        val code = intent.getStringExtra(EXTRA_BOOKING_CODE).orEmpty()
        when (intent.action) {
            ACTION_SMS_SENT -> {
                if (resultCode == Activity.RESULT_OK) {
                    SmsGateway.markSent(context, bookingId)
                    showParadisoNotification(
                        context,
                        "SMS inviato",
                        "La conferma per $code è stata accettata dalla rete Vodafone.",
                        bookingTarget(bookingId, code),
                    )
                } else {
                    SmsGateway.clearPending(context, bookingId)
                    showParadisoNotification(
                        context,
                        "SMS non inviato",
                        "La rete mobile ha rifiutato la conferma per $code (${smsError(resultCode)}).",
                        bookingTarget(bookingId, code),
                    )
                }
            }

            ACTION_SMS_DELIVERED -> {
                val delivered = resultCode == Activity.RESULT_OK
                showParadisoNotification(
                    context,
                    if (delivered) "SMS consegnato" else "Consegna SMS non confermata",
                    if (delivered) {
                        "Il cliente della prenotazione $code ha ricevuto la conferma."
                    } else {
                        "Vodafone non ha confermato la consegna per $code."
                    },
                    bookingTarget(bookingId, code),
                )
            }
        }
    }
}

private fun smsError(resultCode: Int): String = when (resultCode) {
    SmsManager.RESULT_ERROR_NO_SERVICE -> "nessun servizio"
    SmsManager.RESULT_ERROR_RADIO_OFF -> "rete mobile disattivata"
    SmsManager.RESULT_ERROR_LIMIT_EXCEEDED -> "limite SMS raggiunto"
    SmsManager.RESULT_ERROR_GENERIC_FAILURE -> "errore operatore"
    else -> "codice $resultCode"
}

internal fun normalizeSmsDestination(rawPhone: String): String? {
    val trimmed = rawPhone.trim()
    val hadInternationalPrefix = trimmed.startsWith("+") || trimmed.startsWith("00")
    var digits = trimmed.filter(Char::isDigit)
    if (digits.startsWith("00")) digits = digits.drop(2)
    if (digits.length !in 8..15) return null
    return when {
        hadInternationalPrefix -> "+$digits"
        digits.length == 10 && digits.startsWith("3") -> "+39$digits"
        else -> digits
    }
}

internal fun bookingConfirmationSms(
    code: String,
    reservationDate: String,
    reservationTime: String,
    guests: Int,
): String {
    val date = runCatching {
        LocalDate.parse(reservationDate).format(DateTimeFormatter.ofPattern("dd/MM/yyyy", Locale.ITALY))
    }.getOrDefault(reservationDate)
    val party = if (guests == 1) "1 persona" else "$guests persone"
    return "Paradiso Lounge Bar: prenotazione $code confermata il $date alle $reservationTime per $party. Mostra il QR ricevuto via email."
}
