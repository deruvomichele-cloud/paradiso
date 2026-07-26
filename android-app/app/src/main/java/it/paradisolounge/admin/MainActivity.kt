package it.paradisolounge.admin

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalance
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.RestaurantMenu
import androidx.compose.material.icons.filled.Sms
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.filled.Wallet
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.google.firebase.FirebaseApp
import com.google.firebase.messaging.FirebaseMessaging
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.codescanner.GmsBarcodeScannerOptions
import com.google.mlkit.vision.codescanner.GmsBarcodeScanning
import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private val Night = Color(0xFF080D14)
private val SurfaceDark = Color(0xFF101821)
private val SurfaceRaised = Color(0xFF17222E)
private val Gold = Color(0xFFD8B56C)
private val TextPrimary = Color(0xFFF5F1E8)
private val TextMuted = Color(0xFF98A3AE)
private val Green = Color(0xFF65D6A1)
private val Red = Color(0xFFFF9090)
private val euro = NumberFormat.getCurrencyInstance(Locale.ITALY)
private val italianDate = DateTimeFormatter.ofPattern("dd/MM/yyyy")

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            ParadisoTheme {
                ParadisoApp()
            }
        }
    }
}

@Composable
private fun ParadisoTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = androidx.compose.material3.darkColorScheme(
            primary = Gold,
            onPrimary = Night,
            secondary = Gold,
            background = Night,
            surface = SurfaceDark,
            surfaceVariant = SurfaceRaised,
            onBackground = TextPrimary,
            onSurface = TextPrimary,
            onSurfaceVariant = TextMuted,
            error = Red,
        ),
        typography = MaterialTheme.typography.copy(
            headlineLarge = MaterialTheme.typography.headlineLarge.copy(fontWeight = FontWeight.Black),
            headlineMedium = MaterialTheme.typography.headlineMedium.copy(fontWeight = FontWeight.Bold),
            titleLarge = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
        ),
        content = content,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ParadisoApp(vm: ParadisoViewModel = viewModel()) {
    val state = vm.state
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    var selectedBooking by remember { mutableStateOf<Booking?>(null) }
    var showLedgerDialog by remember { mutableStateOf(false) }
    var showSmsGatewayDialog by remember { mutableStateOf(false) }
    var smsGatewayEnabled by remember { mutableStateOf(SmsGateway.isEnabled(context)) }
    var smsPermissionDenied by remember { mutableStateOf(false) }
    val qrScanner = remember(context) {
        val options = GmsBarcodeScannerOptions.Builder()
            .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
            .enableAutoZoom()
            .build()
        GmsBarcodeScanning.getClient(context, options)
    }
    val startQrScanner = {
        qrScanner.startScan()
            .addOnSuccessListener { barcode ->
                vm.openBookingFromQr(barcode.rawValue.orEmpty())
            }
            .addOnFailureListener {
                vm.scannerUnavailable()
            }
        Unit
    }

    val notificationPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) {}
    val smsPermission = rememberLauncherForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { granted ->
        SmsGateway.setEnabled(context, granted)
        smsGatewayEnabled = granted
        if (granted) BookingGatewayService.start(context)
        smsPermissionDenied = !granted
        showSmsGatewayDialog = !granted
    }

    LaunchedEffect(Unit) {
        if (Build.VERSION.SDK_INT >= 33 &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            notificationPermission.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    LaunchedEffect(state.token) {
        if (state.token != null && FirebaseApp.getApps(context).isNotEmpty()) {
            runCatching {
                FirebaseMessaging.getInstance().token.addOnSuccessListener { messagingToken ->
                    vm.registerDevice(messagingToken, "${Build.MANUFACTURER} ${Build.MODEL}")
                }
            }
        }
        if (state.token != null && SmsGateway.isEnabled(context)) {
            BookingGatewayService.start(context)
        } else if (!state.isRestoringSession && state.token == null) {
            BookingGatewayService.stop(context)
        }
        if (state.token != null && !SmsGateway.hasBeenConfigured(context)) {
            showSmsGatewayDialog = true
        }
    }

    LaunchedEffect(state.notice) {
        state.notice?.let {
            snackbar.showSnackbar(it)
            vm.clearNotice()
        }
    }

    LaunchedEffect(state.scannedBooking?.id) {
        state.scannedBooking?.let {
            selectedBooking = it
            vm.consumeScannedBooking()
        }
    }

    when {
        state.isRestoringSession -> LoadingScreen()
        state.token == null -> Scaffold(snackbarHost = { SnackbarHost(snackbar) }) { padding ->
            LoginScreen(
                loading = state.isLoading,
                onLogin = vm::login,
                modifier = Modifier.padding(padding),
            )
        }
        else -> Scaffold(
            containerColor = Night,
            snackbarHost = { SnackbarHost(snackbar) },
            topBar = {
                TopAppBar(
                    colors = TopAppBarDefaults.topAppBarColors(containerColor = SurfaceDark),
                    title = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Logo()
                            Spacer(Modifier.width(11.dp))
                            Column {
                                Text("Paradiso", fontWeight = FontWeight.Black)
                                Text("Gestione", color = TextMuted, fontSize = 11.sp)
                            }
                        }
                    },
                    actions = {
                        IconButton(onClick = { showSmsGatewayDialog = true }) {
                            Icon(
                                Icons.Default.Sms,
                                contentDescription = if (smsGatewayEnabled) {
                                    "Gateway SMS attivo"
                                } else {
                                    "Attiva gateway SMS"
                                },
                                tint = if (smsGatewayEnabled) Green else TextMuted,
                            )
                        }
                        IconButton(onClick = startQrScanner) {
                            Icon(Icons.Default.QrCodeScanner, contentDescription = "Scansiona QR prenotazione")
                        }
                        IconButton(onClick = vm::refresh) {
                            Icon(Icons.Default.Refresh, contentDescription = "Aggiorna")
                        }
                        IconButton(onClick = vm::logout) {
                            Icon(Icons.Default.Logout, contentDescription = "Esci")
                        }
                    },
                )
            },
            bottomBar = {
                NavigationBar(containerColor = SurfaceDark) {
                    NavigationBarItem(
                        selected = state.selectedSection == Section.BOOKINGS,
                        onClick = { vm.setSection(Section.BOOKINGS) },
                        icon = { Icon(Icons.Default.CalendarMonth, null) },
                        label = { Text("Prenotazioni") },
                    )
                    NavigationBarItem(
                        selected = state.selectedSection == Section.ACCOUNTING,
                        onClick = { vm.setSection(Section.ACCOUNTING) },
                        icon = { Icon(Icons.Default.AccountBalance, null) },
                        label = { Text("Contabilità") },
                    )
                }
            },
            floatingActionButton = {
                if (state.selectedSection == Section.ACCOUNTING) {
                    Button(onClick = { showLedgerDialog = true }) {
                        Icon(Icons.Default.Add, null)
                        Spacer(Modifier.width(8.dp))
                        Text("Movimento")
                    }
                }
            },
        ) { padding ->
            Box(Modifier.fillMaxSize().padding(padding)) {
                when (state.selectedSection) {
                    Section.BOOKINGS -> BookingsScreen(
                        state = state,
                        onFilter = vm::setStatusFilter,
                        onBooking = { selectedBooking = it },
                        onScan = startQrScanner,
                    )
                    Section.ACCOUNTING -> AccountingScreen(state)
                }
                if (state.isLoading) {
                    LinearProgressIndicator(Modifier.fillMaxWidth().align(Alignment.TopCenter))
                }
            }
        }
    }

    selectedBooking?.let { booking ->
        BookingDialog(
            booking = booking,
            incomeRegistered = state.entries.any { it.bookingId == booking.id && it.kind == "income" },
            onDismiss = { selectedBooking = null },
            onStatus = {
                vm.updateStatus(booking, it)
                selectedBooking = null
            },
            onRegisterIncome = { amount, date, method ->
                vm.registerIncome(booking, amount, date, method) { selectedBooking = null }
            },
        )
    }

    if (showLedgerDialog) {
        LedgerDialog(
            onDismiss = { showLedgerDialog = false },
            onSave = { kind, amount, date, category, description, method ->
                vm.addLedgerEntry(kind, amount, date, category, description, method) {
                    showLedgerDialog = false
                }
            },
        )
    }

    if (showSmsGatewayDialog) {
        SmsGatewayDialog(
            enabled = smsGatewayEnabled,
            permissionDenied = smsPermissionDenied,
            onDismiss = {
                showSmsGatewayDialog = false
                smsPermissionDenied = false
            },
            onEnable = {
                smsPermissionDenied = false
                if (context.checkSelfPermission(Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED) {
                    SmsGateway.setEnabled(context, true)
                    smsGatewayEnabled = true
                    BookingGatewayService.start(context)
                    showSmsGatewayDialog = false
                } else {
                    smsPermission.launch(Manifest.permission.SEND_SMS)
                }
            },
            onDisable = {
                SmsGateway.setEnabled(context, false)
                smsGatewayEnabled = false
                BookingGatewayService.stop(context)
                showSmsGatewayDialog = false
            },
        )
    }
}

@Composable
private fun LoadingScreen() {
    Box(Modifier.fillMaxSize().background(Night), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Logo(72)
            Spacer(Modifier.height(22.dp))
            CircularProgressIndicator(color = Gold)
        }
    }
}

@Composable
private fun SmsGatewayDialog(
    enabled: Boolean,
    permissionDenied: Boolean,
    onDismiss: () -> Unit,
    onEnable: () -> Unit,
    onDisable: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("SMS automatici") },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    if (enabled) {
                        "Gateway attivo: l'app controlla continuamente le nuove prenotazioni e invia automaticamente l'SMS."
                    } else {
                        "Questo telefono invierà le conferme ai clienti usando la propria SIM."
                    },
                )
                Text(
                    "Imposta 3914371297 come SIM predefinita per gli SMS nelle impostazioni Android.",
                    color = Gold,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    "Quando è attivo resta una notifica fissa. Gli SMS consumano il credito o i messaggi inclusi nel piano della SIM.",
                    color = TextMuted,
                    fontSize = 13.sp,
                )
                if (permissionDenied) {
                    Text(
                        "Autorizzazione SMS negata. Concedila per attivare l'invio automatico.",
                        color = Red,
                        fontWeight = FontWeight.Bold,
                    )
                }
            }
        },
        confirmButton = {
            Button(onClick = if (enabled) onDisable else onEnable) {
                Text(if (enabled) "Disattiva" else "Attiva SMS")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Chiudi")
            }
        },
    )
}

@Composable
private fun LoginScreen(loading: Boolean, onLogin: (String, String) -> Unit, modifier: Modifier = Modifier) {
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var showPassword by remember { mutableStateOf(false) }

    Box(
        modifier.fillMaxSize().background(Night).padding(24.dp),
        contentAlignment = Alignment.Center,
    ) {
        Card(
            modifier = Modifier.fillMaxWidth().widthIn(max = 480.dp),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            border = BorderStroke(1.dp, Color.White.copy(alpha = 0.09f)),
        ) {
            Column(Modifier.padding(28.dp), horizontalAlignment = Alignment.Start) {
                Logo(64)
                Spacer(Modifier.height(30.dp))
                Text("AREA RISERVATA", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(8.dp))
                Text("Bentornato", style = MaterialTheme.typography.headlineLarge)
                Spacer(Modifier.height(8.dp))
                Text("Gestisci prenotazioni, incassi e spese.", color = TextMuted)
                Spacer(Modifier.height(26.dp))
                OutlinedTextField(
                    value = email,
                    onValueChange = { email = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Email") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                )
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = password,
                    onValueChange = { password = it },
                    modifier = Modifier.fillMaxWidth(),
                    label = { Text("Password") },
                    singleLine = true,
                    visualTransformation = if (showPassword) VisualTransformation.None else PasswordVisualTransformation(),
                    trailingIcon = {
                        IconButton(onClick = { showPassword = !showPassword }) {
                            Icon(
                                if (showPassword) Icons.Default.VisibilityOff else Icons.Default.Visibility,
                                contentDescription = if (showPassword) "Nascondi password" else "Mostra password",
                            )
                        }
                    },
                )
                Spacer(Modifier.height(20.dp))
                Button(
                    onClick = { onLogin(email, password) },
                    enabled = !loading,
                    modifier = Modifier.fillMaxWidth().height(50.dp),
                ) {
                    if (loading) {
                        CircularProgressIndicator(Modifier.size(20.dp), color = Night, strokeWidth = 2.dp)
                    } else {
                        Text("Accedi", fontWeight = FontWeight.Black)
                    }
                }
            }
        }
    }
}

@Composable
private fun BookingsScreen(
    state: AppState,
    onFilter: (String) -> Unit,
    onBooking: (Booking) -> Unit,
    onScan: () -> Unit,
) {
    val filtered = if (state.statusFilter == "Tutti") {
        state.bookings
    } else {
        state.bookings.filter { it.status == state.statusFilter }
    }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Prenotazioni", style = MaterialTheme.typography.headlineMedium)
            Text("Sincronizzate con il sito Paradiso", color = TextMuted)
            Spacer(Modifier.height(14.dp))
            OutlinedButton(onClick = onScan, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.QrCodeScanner, contentDescription = null)
                Spacer(Modifier.width(8.dp))
                Text("Scansiona QR prenotazione", fontWeight = FontWeight.Bold)
            }
            Spacer(Modifier.height(18.dp))
            BookingStats(state.bookings)
            Spacer(Modifier.height(18.dp))
            Row(
                Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                listOf("Tutti", "Nuovo", "Confermato", "Completato", "Annullato").forEach {
                    FilterChip(
                        selected = state.statusFilter == it,
                        onClick = { onFilter(it) },
                        label = { Text(it) },
                    )
                }
            }
        }
        if (filtered.isEmpty()) {
            item { EmptyState("Nessuna prenotazione", "Le nuove richieste compariranno qui.") }
        } else {
            items(filtered, key = { it.id }) { booking ->
                BookingCard(booking, onClick = { onBooking(booking) })
            }
        }
    }
}

@Composable
private fun BookingStats(bookings: List<Booking>) {
    val active = bookings.filter { it.status != "Annullato" }
    val newCount = bookings.count { it.status == "Nuovo" }
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatCard("Nuove", newCount.toString(), Icons.Default.Notifications, Modifier.weight(1f))
            StatCard("Ospiti", active.sumOf { it.guests }.toString(), Icons.Default.People, Modifier.weight(1f))
        }
        Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            StatCard("Richieste", bookings.size.toString(), Icons.Default.CalendarMonth, Modifier.weight(1f))
            StatCard("Valore stimato", euro.format(active.sumOf { it.estimatedTotal }), Icons.Default.Wallet, Modifier.weight(1f))
        }
    }
}

@Composable
private fun StatCard(label: String, value: String, icon: androidx.compose.ui.graphics.vector.ImageVector, modifier: Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = BorderStroke(1.dp, Color.White.copy(alpha = 0.08f)),
    ) {
        Column(Modifier.padding(16.dp)) {
            Icon(icon, null, tint = Gold, modifier = Modifier.size(20.dp))
            Spacer(Modifier.height(15.dp))
            Text(value, fontSize = 21.sp, fontWeight = FontWeight.Black, maxLines = 1)
            Text(label.uppercase(), color = TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun BookingCard(booking: Booking, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = BorderStroke(1.dp, statusColor(booking.status).copy(alpha = 0.28f)),
    ) {
        Column(Modifier.padding(17.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(booking.code, color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Black)
                    Text(booking.customerName, style = MaterialTheme.typography.titleLarge, maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                StatusPill(booking.status)
            }
            Spacer(Modifier.height(14.dp))
            HorizontalDivider(color = Color.White.copy(alpha = 0.08f))
            Spacer(Modifier.height(13.dp))
            Row {
                Icon(Icons.Default.CalendarMonth, null, tint = TextMuted, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("${formatDate(booking.reservationDate)} · ${booking.reservationTime}", fontWeight = FontWeight.Bold)
                Spacer(Modifier.weight(1f))
                Text("${booking.guests} ospiti", color = TextMuted)
            }
            Spacer(Modifier.height(8.dp))
            Row {
                Icon(Icons.Default.RestaurantMenu, null, tint = TextMuted, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text(
                    if (booking.items.isEmpty()) "Solo tavolo" else "${booking.items.sumOf { it.quantity }} prodotti",
                    color = TextMuted,
                )
                Spacer(Modifier.weight(1f))
                Text(euro.format(booking.estimatedTotal), fontWeight = FontWeight.Black)
            }
        }
    }
}

@Composable
private fun StatusPill(status: String) {
    Surface(
        color = statusColor(status).copy(alpha = 0.12f),
        shape = CircleShape,
        border = BorderStroke(1.dp, statusColor(status).copy(alpha = 0.45f)),
    ) {
        Text(status, Modifier.padding(horizontal = 10.dp, vertical = 6.dp), color = statusColor(status), fontSize = 10.sp, fontWeight = FontWeight.Black)
    }
}

@Composable
private fun AccountingScreen(state: AppState) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp, 16.dp, 16.dp, 100.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Text("Contabilità", style = MaterialTheme.typography.headlineMedium)
            Text("Libro cassa del mese corrente", color = TextMuted)
            Spacer(Modifier.height(18.dp))
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    MoneyCard("Incassi", state.summary.income, Green, Icons.Default.TrendingUp, Modifier.weight(1f))
                    MoneyCard("Spese", state.summary.expenses, Red, Icons.Default.TrendingDown, Modifier.weight(1f))
                }
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    MoneyCard("Rimborsi", state.summary.refunds, Red, Icons.Default.TrendingDown, Modifier.weight(1f))
                    MoneyCard("Saldo netto", state.summary.net, if (state.summary.net >= 0) Gold else Red, Icons.Default.Wallet, Modifier.weight(1f))
                }
            }
            Spacer(Modifier.height(22.dp))
            Text("MOVIMENTI", color = Gold, fontSize = 11.sp, fontWeight = FontWeight.Black)
        }
        if (state.entries.isEmpty()) {
            item { EmptyState("Nessun movimento", "Usa “Movimento” per registrare un incasso o una spesa.") }
        } else {
            items(state.entries, key = { it.id }) { LedgerRow(it) }
        }
    }
}

@Composable
private fun MoneyCard(
    label: String,
    amount: Double,
    color: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    modifier: Modifier,
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        border = BorderStroke(1.dp, color.copy(alpha = 0.24f)),
    ) {
        Column(Modifier.padding(15.dp)) {
            Icon(icon, null, tint = color, modifier = Modifier.size(20.dp))
            Spacer(Modifier.height(14.dp))
            Text(euro.format(amount), color = color, fontSize = 19.sp, fontWeight = FontWeight.Black, maxLines = 1)
            Text(label.uppercase(), color = TextMuted, fontSize = 10.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun LedgerRow(entry: LedgerEntry) {
    val color = if (entry.kind == "income") Green else Red
    val sign = if (entry.kind == "income") "+" else "−"
    val label = when (entry.kind) {
        "income" -> "Incasso"
        "expense" -> "Spesa"
        else -> "Rimborso"
    }
    Card(colors = CardDefaults.cardColors(containerColor = SurfaceDark)) {
        Row(Modifier.fillMaxWidth().padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text(entry.category, fontWeight = FontWeight.Bold)
                Text(
                    listOfNotNull(label, entry.bookingCode, formatDate(entry.occurredOn)).joinToString(" · "),
                    color = TextMuted,
                    fontSize = 12.sp,
                )
                if (entry.description.isNotBlank()) {
                    Text(entry.description, color = TextMuted, fontSize = 12.sp, maxLines = 1)
                }
            }
            Text("$sign${euro.format(entry.amount)}", color = color, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
private fun BookingDialog(
    booking: Booking,
    incomeRegistered: Boolean,
    onDismiss: () -> Unit,
    onStatus: (String) -> Unit,
    onRegisterIncome: (Double, String, String) -> Unit,
) {
    var showIncome by remember { mutableStateOf(false) }
    if (showIncome) {
        IncomeDialog(
            booking = booking,
            onDismiss = { showIncome = false },
            onSave = onRegisterIncome,
        )
        return
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        confirmButton = { TextButton(onClick = onDismiss) { Text("Chiudi") } },
        title = {
            Column {
                Text(booking.code, color = Gold, fontSize = 12.sp)
                Text(booking.customerName)
            }
        },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                DetailLine("Quando", "${formatDate(booking.reservationDate)} alle ${booking.reservationTime}")
                DetailLine("Ospiti", booking.guests.toString())
                DetailLine("Telefono", booking.phone)
                DetailLine("Email", booking.email)
                DetailLine("Ordine", if (booking.items.isEmpty()) "Solo tavolo" else booking.items.joinToString { "${it.quantity}× ${it.name}" })
                DetailLine("Totale stimato", euro.format(booking.estimatedTotal))
                DetailLine("Note", booking.notes.ifBlank { "Nessuna nota" })
                Spacer(Modifier.height(12.dp))
                Text("STATO", color = Gold, fontSize = 10.sp, fontWeight = FontWeight.Black)
                Row(
                    Modifier.horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(7.dp),
                ) {
                    listOf("Nuovo", "Confermato", "Completato", "Annullato").forEach {
                        FilterChip(selected = booking.status == it, onClick = { onStatus(it) }, label = { Text(it) })
                    }
                }
                Spacer(Modifier.height(16.dp))
                if (incomeRegistered) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.CheckCircle, null, tint = Green)
                        Spacer(Modifier.width(8.dp))
                        Text("Incasso registrato", color = Green, fontWeight = FontWeight.Bold)
                    }
                } else if (booking.estimatedTotal > 0 && booking.status != "Annullato") {
                    OutlinedButton(onClick = { showIncome = true }, modifier = Modifier.fillMaxWidth()) {
                        Text("Registra incasso")
                    }
                }
            }
        },
    )
}

@Composable
private fun DetailLine(label: String, value: String) {
    Text(label.uppercase(), color = TextMuted, fontSize = 9.sp, fontWeight = FontWeight.Bold)
    Text(value, Modifier.padding(bottom = 10.dp), fontWeight = FontWeight.Medium)
}

@Composable
private fun IncomeDialog(
    booking: Booking,
    onDismiss: () -> Unit,
    onSave: (Double, String, String) -> Unit,
) {
    var amount by remember { mutableStateOf("%.2f".format(Locale.US, booking.estimatedTotal)) }
    var date by remember { mutableStateOf(LocalDate.now().toString()) }
    var method by remember { mutableStateOf("Contanti") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Registra incasso") },
        text = {
            Column {
                Text("${booking.code} · ${booking.customerName}", color = TextMuted)
                Spacer(Modifier.height(12.dp))
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Importo") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                )
                OutlinedTextField(value = date, onValueChange = { date = it }, label = { Text("Data (AAAA-MM-GG)") }, singleLine = true)
                OutlinedTextField(value = method, onValueChange = { method = it }, label = { Text("Metodo") }, singleLine = true)
            }
        },
        confirmButton = {
            Button(onClick = { onSave(amount.replace(',', '.').toDoubleOrNull() ?: 0.0, date, method) }) {
                Text("Registra")
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Annulla") } },
    )
}

@Composable
private fun LedgerDialog(
    onDismiss: () -> Unit,
    onSave: (String, Double, String, String, String, String) -> Unit,
) {
    var kind by remember { mutableStateOf("expense") }
    var amount by remember { mutableStateOf("") }
    var date by remember { mutableStateOf(LocalDate.now().toString()) }
    var category by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var method by remember { mutableStateOf("Contanti") }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Nuovo movimento") },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf("income" to "Incasso", "expense" to "Spesa", "refund" to "Rimborso").forEach {
                        FilterChip(selected = kind == it.first, onClick = { kind = it.first }, label = { Text(it.second) })
                    }
                }
                OutlinedTextField(
                    value = amount,
                    onValueChange = { amount = it },
                    label = { Text("Importo") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    singleLine = true,
                )
                OutlinedTextField(value = date, onValueChange = { date = it }, label = { Text("Data (AAAA-MM-GG)") }, singleLine = true)
                OutlinedTextField(value = category, onValueChange = { category = it }, label = { Text("Categoria") }, singleLine = true)
                OutlinedTextField(value = method, onValueChange = { method = it }, label = { Text("Metodo") }, singleLine = true)
                OutlinedTextField(value = description, onValueChange = { description = it }, label = { Text("Descrizione") }, minLines = 2)
            }
        },
        confirmButton = {
            Button(onClick = {
                onSave(kind, amount.replace(',', '.').toDoubleOrNull() ?: 0.0, date, category, description, method)
            }) { Text("Salva") }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("Annulla") } },
    )
}

@Composable
private fun EmptyState(title: String, copy: String) {
    Column(
        Modifier.fillMaxWidth().padding(vertical = 50.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(Icons.Default.CalendarMonth, null, tint = TextMuted, modifier = Modifier.size(38.dp))
        Spacer(Modifier.height(12.dp))
        Text(title, fontWeight = FontWeight.Bold)
        Text(copy, color = TextMuted, fontSize = 12.sp)
    }
}

@Composable
private fun Logo(size: Int = 44) {
    Box(
        Modifier.size(size.dp).background(Gold, CircleShape),
        contentAlignment = Alignment.Center,
    ) {
        Text("P", color = Night, fontSize = (size * 0.56f).sp, fontWeight = FontWeight.Black)
    }
}

private fun statusColor(status: String) = when (status) {
    "Nuovo" -> Gold
    "Confermato" -> Color(0xFF77B9FF)
    "Completato" -> Green
    else -> Red
}

private fun formatDate(value: String): String = runCatching {
    LocalDate.parse(value).format(italianDate)
}.getOrDefault(value)
