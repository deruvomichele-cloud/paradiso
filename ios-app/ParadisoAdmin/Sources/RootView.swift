import SwiftUI

struct RootView: View {
    @EnvironmentObject private var store: AppStore

    var body: some View {
        ZStack {
            ParadisoTheme.background.ignoresSafeArea()
            if store.token == nil {
                LoginView()
                    .transition(.opacity)
            } else {
                MainView()
                    .transition(.opacity)
            }
            LoadingOverlay(visible: store.isLoading)
        }
        .animation(.easeOut(duration: 0.18), value: store.token != nil)
        .alert(
            store.message?.isError == true ? "Attenzione" : "Paradiso Admin",
            isPresented: Binding(
                get: { store.message != nil },
                set: { if !$0 { store.message = nil } }
            ),
            presenting: store.message
        ) { _ in
            Button("OK", role: .cancel) {
                store.message = nil
            }
        } message: { message in
            Text(message.text)
        }
        .tint(ParadisoTheme.accent)
    }
}
