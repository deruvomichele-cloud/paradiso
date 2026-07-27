import SwiftUI

struct LoginView: View {
    @EnvironmentObject private var store: AppStore
    @State private var email = ""
    @State private var password = ""
    @FocusState private var focusedField: Field?

    private enum Field {
        case email
        case password
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                Spacer(minLength: 54)

                Image("BrandMark")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 92, height: 92)
                    .accessibilityHidden(true)

                VStack(spacing: 6) {
                    Text("Paradiso")
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(ParadisoTheme.text)
                    Text("Amministrazione")
                        .font(.headline)
                        .foregroundStyle(ParadisoTheme.muted)
                }

                VStack(spacing: 14) {
                    TextField("Email", text: $email)
                        .textContentType(.username)
                        .keyboardType(.emailAddress)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                        .focused($focusedField, equals: .email)
                        .submitLabel(.next)
                        .onSubmit { focusedField = .password }
                        .textFieldStyle(ParadisoTextFieldStyle(icon: "envelope"))

                    SecureField("Password", text: $password)
                        .textContentType(.password)
                        .focused($focusedField, equals: .password)
                        .submitLabel(.go)
                        .onSubmit { signIn() }
                        .textFieldStyle(ParadisoTextFieldStyle(icon: "lock"))

                    Button(action: signIn) {
                        Label("Accedi", systemImage: "arrow.right.circle.fill")
                            .font(.headline)
                            .frame(maxWidth: .infinity)
                            .frame(height: 48)
                    }
                    .buttonStyle(.borderedProminent)
                    .disabled(store.isLoading)
                }
                .frame(maxWidth: 440)

                Spacer(minLength: 32)
            }
            .padding(.horizontal, 24)
        }
        .scrollDismissesKeyboard(.interactively)
        .background(ParadisoTheme.background)
    }

    private func signIn() {
        focusedField = nil
        Task {
            await store.login(email: email, password: password)
        }
    }
}

private struct ParadisoTextFieldStyle: TextFieldStyle {
    let icon: String

    func _body(configuration: TextField<Self._Label>) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(ParadisoTheme.muted)
                .frame(width: 20)
            configuration
                .foregroundStyle(ParadisoTheme.text)
        }
        .padding(.horizontal, 14)
        .frame(height: 50)
        .background(ParadisoTheme.surface)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(ParadisoTheme.line, lineWidth: 1)
        )
        .clipShape(RoundedRectangle(cornerRadius: 8))
    }
}
