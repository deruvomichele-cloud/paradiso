package it.paradisolounge.admin

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder

class BookingGatewayService : Service() {
    @Volatile
    private var running = false
    private var pollingThread: Thread? = null

    override fun onCreate() {
        super.onCreate()
        startForeground(NOTIFICATION_ID, gatewayNotification("Controllo prenotazioni attivo"))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (pollingThread?.isAlive == true) return START_STICKY
        running = true
        pollingThread = Thread({
            while (running) {
                val token = SecureStorage(applicationContext).readToken()
                if (token == null || !SmsGateway.isEnabled(applicationContext)) {
                    stopSelf()
                    break
                }
                var unauthorized = false
                runCatching {
                    BookingGatewaySync.synchronize(applicationContext, token)
                }.onFailure { error ->
                    if (error is ApiException && error.status == 401) {
                        unauthorized = true
                    }
                }
                if (unauthorized) {
                    stopSelf()
                    break
                }
                try {
                    Thread.sleep(POLL_INTERVAL_MS)
                } catch (_: InterruptedException) {
                    break
                }
            }
        }, "paradiso-booking-gateway").apply {
            isDaemon = true
            start()
        }
        return START_STICKY
    }

    override fun onDestroy() {
        running = false
        pollingThread?.interrupt()
        pollingThread = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun gatewayNotification(status: String): Notification {
        val openApp = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return Notification.Builder(this, "gateway")
            .setSmallIcon(R.drawable.ic_notification)
            .setColor(getColor(R.color.paradiso_gold))
            .setContentTitle("Paradiso · Gateway SMS")
            .setContentText(status)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(openApp)
            .build()
    }

    companion object {
        private const val NOTIFICATION_ID = 1907
        private const val POLL_INTERVAL_MS = 20_000L

        fun start(context: Context) {
            if (!SmsGateway.isEnabled(context) || SecureStorage(context).readToken() == null) return
            context.startForegroundService(Intent(context, BookingGatewayService::class.java))
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, BookingGatewayService::class.java))
        }
    }
}
