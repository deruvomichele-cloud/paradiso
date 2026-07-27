import SwiftUI

struct MainView: View {
    @EnvironmentObject private var store: AppStore
    @State private var scannerPresented = false

    var body: some View {
        TabView(selection: $store.selectedSection) {
            NavigationStack {
                BookingsView(scannerPresented: $scannerPresented)
            }
            .tag(AdminSection.bookings)
            .tabItem {
                Label("Prenotazioni", systemImage: "calendar")
            }

            NavigationStack {
                AccountingView()
            }
            .tag(AdminSection.accounting)
            .tabItem {
                Label("Contabilità", systemImage: "eurosign.circle")
            }

            NavigationStack {
                SettingsView()
            }
            .tag(AdminSection.settings)
            .tabItem {
                Label("Impostazioni", systemImage: "gearshape")
            }
        }
        .tint(ParadisoTheme.accent)
        .toolbarBackground(ParadisoTheme.header, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
        .sheet(isPresented: $scannerPresented) {
            QRScannerView { value in
                scannerPresented = false
                Task {
                    await store.openScannedValue(value)
                }
            }
            .ignoresSafeArea()
        }
        .sheet(item: $store.selectedBooking) { booking in
            NavigationStack {
                BookingDetailView(booking: booking)
            }
            .presentationBackground(ParadisoTheme.background)
        }
    }
}
