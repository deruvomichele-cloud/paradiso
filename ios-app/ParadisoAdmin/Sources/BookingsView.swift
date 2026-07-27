import SwiftUI

struct BookingsView: View {
    @EnvironmentObject private var store: AppStore
    @Binding var scannerPresented: Bool

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                summary
                filters

                if store.filteredBookings.isEmpty {
                    ContentUnavailableView(
                        "Nessuna prenotazione",
                        systemImage: "calendar.badge.exclamationmark",
                        description: Text("Modifica i filtri o aggiorna l’elenco.")
                    )
                    .foregroundStyle(ParadisoTheme.muted)
                    .padding(.top, 48)
                } else {
                    ForEach(store.filteredBookings) { booking in
                        Button {
                            store.selectedBooking = booking
                        } label: {
                            BookingRow(booking: booking)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(16)
        }
        .background(ParadisoTheme.background)
        .navigationTitle("Prenotazioni")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(ParadisoTheme.header, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Image("BrandMark")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 30, height: 30)
                    .accessibilityLabel("Paradiso")
            }
            ToolbarItemGroup(placement: .topBarTrailing) {
                Button {
                    scannerPresented = true
                } label: {
                    Image(systemName: "qrcode.viewfinder")
                }
                .accessibilityLabel("Leggi QR code")

                Button {
                    Task { await store.refreshAll() }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .accessibilityLabel("Aggiorna")
            }
        }
        .refreshable {
            await store.refreshBookings()
        }
    }

    private var summary: some View {
        LazyVGrid(columns: columns, spacing: 10) {
            SummaryTile(
                title: "Nuove",
                value: "\(store.bookings.filter { $0.status == "Nuovo" }.count)",
                icon: "sparkles",
                color: ParadisoTheme.gold
            )
            SummaryTile(
                title: "Ospiti",
                value: "\(activeBookings.reduce(0) { $0 + $1.guests })",
                icon: "person.2.fill",
                color: ParadisoTheme.accent
            )
            SummaryTile(
                title: "Richieste",
                value: "\(activeBookings.count)",
                icon: "calendar",
                color: ParadisoTheme.green
            )
            SummaryTile(
                title: "Valore stimato",
                value: DateFormatters.currency(activeBookings.reduce(0) { $0 + $1.estimatedTotal }),
                icon: "eurosign.circle.fill",
                color: ParadisoTheme.text
            )
        }
    }

    private var filters: some View {
        VStack(spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundStyle(ParadisoTheme.muted)
                TextField("Cerca cliente, codice o telefono", text: $store.searchText)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .foregroundStyle(ParadisoTheme.text)
                if !store.searchText.isEmpty {
                    Button {
                        store.searchText = ""
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                    }
                    .foregroundStyle(ParadisoTheme.muted)
                    .accessibilityLabel("Cancella ricerca")
                }
            }
            .padding(.horizontal, 12)
            .frame(height: 44)
            .background(ParadisoTheme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(ParadisoTheme.line, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))

            Picker("Stato", selection: $store.statusFilter) {
                ForEach(BookingStatus.all, id: \.self) {
                    Text($0).tag($0)
                }
            }
            .pickerStyle(.menu)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal, 12)
            .frame(height: 42)
            .background(ParadisoTheme.surface)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(ParadisoTheme.line, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
    }

    private var activeBookings: [Booking] {
        store.bookings.filter { $0.status != "Annullato" }
    }
}

private struct SummaryTile: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        Panel {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text(title)
                        .font(.caption)
                        .foregroundStyle(ParadisoTheme.muted)
                    Spacer(minLength: 6)
                    Image(systemName: icon)
                        .foregroundStyle(color)
                }
                Text(value)
                    .font(.title3.weight(.bold))
                    .foregroundStyle(ParadisoTheme.text)
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
            }
        }
    }
}

private struct BookingRow: View {
    let booking: Booking

    var body: some View {
        Panel {
            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 3) {
                        Text(booking.customerName)
                            .font(.headline)
                            .foregroundStyle(ParadisoTheme.text)
                            .multilineTextAlignment(.leading)
                        Text(booking.code)
                            .font(.caption.monospaced().weight(.medium))
                            .foregroundStyle(ParadisoTheme.accent)
                    }
                    Spacer(minLength: 8)
                    StatusBadge(status: booking.status)
                }

                Divider().overlay(ParadisoTheme.line)

                HStack(spacing: 14) {
                    Label(
                        "\(DateFormatters.bookingDate(booking.reservationDate)), \(booking.reservationTime)",
                        systemImage: "calendar"
                    )
                    .lineLimit(1)
                    .minimumScaleFactor(0.78)
                    Spacer(minLength: 0)
                    Label("\(booking.guests)", systemImage: "person.2")
                }
                .font(.subheadline)
                .foregroundStyle(ParadisoTheme.muted)

                HStack {
                    Text(booking.phone)
                        .font(.subheadline)
                        .foregroundStyle(ParadisoTheme.muted)
                    Spacer()
                    if booking.estimatedTotal > 0 {
                        Text(DateFormatters.currency(booking.estimatedTotal))
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(ParadisoTheme.text)
                    }
                }
            }
        }
    }
}
