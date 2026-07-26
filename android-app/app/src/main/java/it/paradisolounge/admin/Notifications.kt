package it.paradisolounge.admin

import android.Manifest
import android.app.Application
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.Worker
import androidx.work.WorkerParameters
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import java.util.concurrent.TimeUnit

class ParadisoApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        val manager = getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(
                "bookings",
                "Nuove prenotazioni",
                NotificationManager.IMPORTANCE_HIGH,
            ).apply {
                description = "Avvisi immediati per le nuove prenotazioni del Paradiso"
                enableVibration(true)
            },
        )
        manager.createNotificationChannel(
            NotificationChannel(
                "gateway",
                "Gateway SMS",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Mantiene attivo il controllo delle prenotazioni e l'invio SMS"
            },
        )
        val syncRequest = PeriodicWorkRequestBuilder<BookingSyncWorker>(15, TimeUnit.MINUTES)
            .setConstraints(Constraints.Builder().setRequiredNetworkType(NetworkType.CONNECTED).build())
            .build()
        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "paradiso-booking-sync",
            ExistingPeriodicWorkPolicy.UPDATE,
            syncRequest,
        )
    }
}

class ParadisoMessagingService : FirebaseMessagingService() {
    override fun onNewToken(token: String) {
        val sessionToken = SecureStorage(applicationContext).readToken() ?: return
        Thread {
            runCatching {
                ApiClient().registerDevice(
                    sessionToken,
                    token,
                    "${Build.MANUFACTURER} ${Build.MODEL}",
                )
            }
        }.start()
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val title = message.notification?.title
            ?: message.data["title"]
            ?: "Nuova prenotazione"
        val body = message.notification?.body
            ?: message.data["body"]
            ?: "Apri Paradiso Admin per i dettagli."
        val smsResult = if (message.data["type"] == "booking.created") {
            SmsGateway.sendBookingConfirmation(
                context = this,
                bookingId = message.data["bookingId"].orEmpty(),
                code = message.data["code"].orEmpty(),
                phone = message.data["phone"].orEmpty(),
                reservationDate = message.data["date"].orEmpty(),
                reservationTime = message.data["time"].orEmpty(),
                guests = message.data["guests"]?.toIntOrNull() ?: 0,
            )
        } else {
            SmsGatewayResult.DISABLED
        }
        val notificationBody = when (smsResult) {
            SmsGatewayResult.QUEUED -> "$body · SMS di conferma inviato"
            SmsGatewayResult.PERMISSION_MISSING -> "$body · SMS non inviato: autorizzazione mancante"
            SmsGatewayResult.NO_TELEPHONY,
            SmsGatewayResult.INVALID_DESTINATION,
            SmsGatewayResult.FAILED,
            -> "$body · SMS di conferma non inviato"
            else -> body
        }
        showParadisoNotification(this, title, notificationBody)
    }
}

class BookingSyncWorker(
    context: Context,
    parameters: WorkerParameters,
) : Worker(context, parameters) {
    override fun doWork(): Result {
        val token = SecureStorage(applicationContext).readToken() ?: return Result.success()
        return runCatching {
            BookingGatewaySync.synchronize(applicationContext, token)
            Result.success()
        }.getOrElse { error ->
            if (error is ApiException && error.status == 401) Result.success() else Result.retry()
        }
    }
}

internal object BookingGatewaySync {
    @Synchronized
    fun synchronize(context: Context, token: String) {
        val bookings = ApiClient().bookings(token)
        val newest = bookings.maxOfOrNull { it.createdAt } ?: return
        val preferences = context.getSharedPreferences("paradiso_sync", Context.MODE_PRIVATE)
        val previous = preferences.getString("latest_booking", null)
        if (previous == null) {
            preferences.edit().putString("latest_booking", newest).apply()
            return
        }

        val additions = bookings
            .filter { it.createdAt > previous && it.status == "Nuovo" }
            .sortedBy { it.createdAt }
        val outcomes = additions.map { booking ->
            SmsGateway.sendBookingConfirmation(
                context = context,
                bookingId = booking.id,
                code = booking.code,
                phone = booking.phone,
                reservationDate = booking.reservationDate,
                reservationTime = booking.reservationTime,
                guests = booking.guests,
            )
        }
        if (additions.isNotEmpty() && outcomes.any { it != SmsGatewayResult.ALREADY_SENT }) {
            val latest = additions.last()
            val queued = outcomes.count { it == SmsGatewayResult.QUEUED }
            val failed = outcomes.count {
                it == SmsGatewayResult.FAILED ||
                    it == SmsGatewayResult.PERMISSION_MISSING ||
                    it == SmsGatewayResult.NO_TELEPHONY ||
                    it == SmsGatewayResult.INVALID_DESTINATION
            }
            val details = buildList {
                add(
                    if (additions.size == 1) {
                        "${latest.reservationDate} alle ${latest.reservationTime} · ${latest.guests} ospiti"
                    } else {
                        "${additions.size} nuove richieste"
                    },
                )
                if (queued > 0) add("$queued SMS in invio")
                if (failed > 0) add("$failed SMS non inviati")
            }.joinToString(" · ")
            showParadisoNotification(context, "Nuova prenotazione ${latest.code}", details)
        }
        preferences.edit().putString("latest_booking", newest).apply()
    }
}

internal fun showParadisoNotification(context: Context, title: String, body: String) {
    if (Build.VERSION.SDK_INT >= 33 &&
        context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    ) return
    val intent = Intent(context, MainActivity::class.java).apply {
        addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
    }
    val pendingIntent = PendingIntent.getActivity(
        context,
        0,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )
    val notification = Notification.Builder(context, "bookings")
        .setSmallIcon(R.drawable.ic_notification)
        .setColor(context.getColor(R.color.paradiso_gold))
        .setContentTitle(title)
        .setContentText(body)
        .setStyle(Notification.BigTextStyle().bigText(body))
        .setAutoCancel(true)
        .setContentIntent(pendingIntent)
        .build()
    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    manager.notify(System.currentTimeMillis().toInt(), notification)
}
