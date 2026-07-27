import SwiftUI
import UIKit
import UserNotifications

struct SettingsView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        List {
            Section("Notifiche") {
                LabeledContent {
                    Text(notificationLabel)
                        .foregroundStyle(notificationColor)
                } label: {
                    Label("Stato", systemImage: "bell.badge")
                }

                if !FirebaseConfiguration.isAvailable {
                    LabeledContent {
                        Text("Da configurare")
                            .foregroundStyle(ParadisoTheme.gold)
                    } label: {
                        Label("Firebase iOS", systemImage: "flame")
                    }
                }

                Button {
                    if store.notificationStatus == .denied {
                        openSystemSettings()
                    } else {
                        Task { await store.requestNotifications() }
                    }
                } label: {
                    Label(
                        store.notificationStatus == .denied ? "Apri impostazioni iOS" : "Attiva notifiche",
                        systemImage: store.notificationStatus == .denied ? "gear" : "bell.badge.fill"
                    )
                }
            }

            Section("Connessione") {
                LabeledContent {
                    Text(APIClient.configuredBaseURL.host ?? "loungebarparadiso.it")
                        .foregroundStyle(ParadisoTheme.muted)
                } label: {
                    Label("Server", systemImage: "network")
                }
            }

            Section("Gateway") {
                LabeledContent {
                    Text("Solo Android")
                        .foregroundStyle(ParadisoTheme.muted)
                } label: {
                    Label("SMS automatici da SIM", systemImage: "message")
                }
            }

            Section {
                Button(role: .destructive) {
                    store.logout()
                } label: {
                    Label("Esci", systemImage: "rectangle.portrait.and.arrow.right")
                }
            }
        }
        .scrollContentBackground(.hidden)
        .background(ParadisoTheme.background)
        .navigationTitle("Impostazioni")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(ParadisoTheme.header, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .task {
            await store.updateNotificationStatus()
        }
    }

    private var notificationLabel: String {
        switch store.notificationStatus {
        case .authorized, .provisional, .ephemeral: "Attive"
        case .denied: "Disattivate"
        case .notDetermined: "Non configurate"
        @unknown default: "Sconosciuto"
        }
    }

    private var notificationColor: Color {
        switch store.notificationStatus {
        case .authorized, .provisional, .ephemeral: ParadisoTheme.green
        case .denied: ParadisoTheme.red
        default: ParadisoTheme.gold
        }
    }

    private func openSystemSettings() {
        guard let url = URL(string: UIApplication.openSettingsURLString) else { return }
        UIApplication.shared.open(url)
    }
}
