import SwiftUI

struct BookingDetailView: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let booking: Booking
    @State private var incomePresented = false

    private var currentBooking: Booking {
        store.bookings.first(where: { $0.id == booking.id }) ?? booking
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                header
                customer
                reservation
                if !currentBooking.items.isEmpty {
                    order
                }
                if !currentBooking.notes.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
                    Panel {
                        Label("Note", systemImage: "note.text")
                            .font(.headline)
                        Text(currentBooking.notes)
                            .foregroundStyle(ParadisoTheme.muted)
                            .padding(.top, 6)
                    }
                }
                actions
            }
            .padding(16)
        }
        .background(ParadisoTheme.background)
        .navigationTitle(currentBooking.code)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(ParadisoTheme.header, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Chiudi") { dismiss() }
            }
        }
        .sheet(isPresented: $incomePresented) {
            IncomeSheet(booking: currentBooking)
                .presentationDetents([.medium])
                .presentationBackground(ParadisoTheme.background)
        }
    }

    private var header: some View {
        Panel {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 5) {
                    Text(currentBooking.customerName)
                        .font(.title3.weight(.bold))
                        .foregroundStyle(ParadisoTheme.text)
                    Text("Creata \(displayCreatedAt)")
                        .font(.caption)
                        .foregroundStyle(ParadisoTheme.muted)
                }
                Spacer(minLength: 8)
                StatusBadge(status: currentBooking.status)
            }
        }
    }

    private var customer: some View {
        Panel {
            Text("Cliente")
                .font(.headline)
                .foregroundStyle(ParadisoTheme.text)
            VStack(alignment: .leading, spacing: 12) {
                if let phoneURL {
                    Link(destination: phoneURL) {
                        Label(currentBooking.phone, systemImage: "phone.fill")
                    }
                } else {
                    Label(currentBooking.phone, systemImage: "phone.fill")
                }
                if !currentBooking.email.isEmpty, let emailURL {
                    Link(destination: emailURL) {
                        Label(currentBooking.email, systemImage: "envelope.fill")
                    }
                }
            }
            .foregroundStyle(ParadisoTheme.accent)
            .padding(.top, 10)
        }
    }

    private var reservation: some View {
        Panel {
            Text("Prenotazione")
                .font(.headline)
                .foregroundStyle(ParadisoTheme.text)
            VStack(alignment: .leading, spacing: 10) {
                DetailLine(
                    icon: "calendar",
                    label: "Data",
                    value: DateFormatters.bookingDate(currentBooking.reservationDate)
                )
                DetailLine(icon: "clock", label: "Ora", value: currentBooking.reservationTime)
                DetailLine(icon: "person.2", label: "Ospiti", value: "\(currentBooking.guests)")
                if !currentBooking.paymentMethod.isEmpty {
                    DetailLine(
                        icon: "creditcard",
                        label: "Pagamento",
                        value: currentBooking.paymentMethod
                    )
                }
            }
            .padding(.top, 10)
        }
    }

    private var order: some View {
        Panel {
            Text("Consumazioni")
                .font(.headline)
                .foregroundStyle(ParadisoTheme.text)
            VStack(spacing: 10) {
                ForEach(currentBooking.items) { item in
                    HStack(alignment: .firstTextBaseline) {
                        Text("\(item.quantity) × \(item.name)")
                            .foregroundStyle(ParadisoTheme.muted)
                        Spacer()
                        Text(DateFormatters.currency(item.price * Double(item.quantity)))
                            .foregroundStyle(ParadisoTheme.text)
                    }
                }
                Divider().overlay(ParadisoTheme.line)
                HStack {
                    Text("Totale stimato")
                        .fontWeight(.semibold)
                    Spacer()
                    Text(DateFormatters.currency(currentBooking.estimatedTotal))
                        .fontWeight(.bold)
                }
                .foregroundStyle(ParadisoTheme.text)
            }
            .padding(.top, 10)
        }
    }

    private var actions: some View {
        VStack(spacing: 12) {
            Menu {
                ForEach(BookingStatus.editable, id: \.self) { status in
                    Button {
                        Task {
                            await store.updateStatus(for: currentBooking, to: status)
                        }
                    } label: {
                        if status == currentBooking.status {
                            Label(status, systemImage: "checkmark")
                        } else {
                            Text(status)
                        }
                    }
                }
            } label: {
                Label("Cambia stato", systemImage: "arrow.triangle.2.circlepath")
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
            }
            .buttonStyle(.bordered)

            if currentBooking.estimatedTotal > 0,
               currentBooking.status != "Annullato",
               !store.incomeRegistered(for: currentBooking) {
                Button {
                    incomePresented = true
                } label: {
                    Label("Registra incasso", systemImage: "eurosign.circle.fill")
                        .frame(maxWidth: .infinity)
                        .frame(height: 44)
                }
                .buttonStyle(.borderedProminent)
            } else if store.incomeRegistered(for: currentBooking) {
                Label("Incasso già registrato", systemImage: "checkmark.circle.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(ParadisoTheme.green)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
            }
        }
    }

    private var displayCreatedAt: String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: currentBooking.createdAt) else {
            return currentBooking.createdAt
        }
        return DateFormatters.displayDate.string(from: date)
    }

    private var phoneURL: URL? {
        let allowed = currentBooking.phone.filter { $0.isNumber || $0 == "+" }
        return URL(string: "tel:\(allowed)")
    }

    private var emailURL: URL? {
        var components = URLComponents()
        components.scheme = "mailto"
        components.path = currentBooking.email
        return components.url
    }
}

private struct DetailLine: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(alignment: .firstTextBaseline, spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(ParadisoTheme.accent)
                .frame(width: 20)
            Text(label)
                .foregroundStyle(ParadisoTheme.muted)
            Spacer(minLength: 12)
            Text(value)
                .foregroundStyle(ParadisoTheme.text)
                .multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}

private struct IncomeSheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let booking: Booking
    @State private var amount: String
    @State private var date = Date()
    @State private var paymentMethod = "Carta"

    init(booking: Booking) {
        self.booking = booking
        _amount = State(initialValue: String(format: "%.2f", booking.estimatedTotal))
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Importo", text: $amount)
                        .keyboardType(.decimalPad)
                    DatePicker("Data", selection: $date, displayedComponents: .date)
                    Picker("Pagamento", selection: $paymentMethod) {
                        ForEach(["Carta", "Contanti", "Bonifico", "Non specificato"], id: \.self) {
                            Text($0).tag($0)
                        }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(ParadisoTheme.background)
            .navigationTitle("Registra incasso")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") {
                        let value = Double(amount.replacingOccurrences(of: ",", with: ".")) ?? 0
                        Task {
                            if await store.registerIncome(
                                booking: booking,
                                amount: value,
                                date: date,
                                paymentMethod: paymentMethod
                            ) {
                                dismiss()
                            }
                        }
                    }
                }
            }
        }
    }
}
