import SwiftUI

@main
struct ParadisoAdminApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @StateObject private var store = AppStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(store)
                .preferredColorScheme(.dark)
                .onOpenURL { url in
                    guard let code = BookingCode.extract(from: url.absoluteString),
                          let target = BookingTarget(bookingId: nil, code: code) else {
                        store.show("Collegamento prenotazione non valido.", error: true)
                        return
                    }
                    Task {
                        await store.routeToBooking(target)
                    }
                }
        }
    }
}
