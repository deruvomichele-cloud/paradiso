import SwiftUI

struct AccountingView: View {
    @EnvironmentObject private var store: AppStore
    @State private var month = Date()
    @State private var entryPresented = false

    private let columns = [
        GridItem(.flexible(), spacing: 10),
        GridItem(.flexible(), spacing: 10)
    ]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 14) {
                monthControls
                LazyVGrid(columns: columns, spacing: 10) {
                    AccountingTile(
                        title: "Incassi",
                        value: store.summary.income,
                        color: ParadisoTheme.green,
                        icon: "arrow.down.circle.fill"
                    )
                    AccountingTile(
                        title: "Spese",
                        value: store.summary.expenses,
                        color: ParadisoTheme.red,
                        icon: "arrow.up.circle.fill"
                    )
                    AccountingTile(
                        title: "Rimborsi",
                        value: store.summary.refunds,
                        color: ParadisoTheme.gold,
                        icon: "arrow.uturn.backward.circle.fill"
                    )
                    AccountingTile(
                        title: "Netto",
                        value: store.summary.net,
                        color: store.summary.net >= 0 ? ParadisoTheme.accent : ParadisoTheme.red,
                        icon: "equal.circle.fill"
                    )
                }

                HStack {
                    Text("Movimenti")
                        .font(.headline)
                        .foregroundStyle(ParadisoTheme.text)
                    Spacer()
                    Button {
                        entryPresented = true
                    } label: {
                        Label("Aggiungi", systemImage: "plus")
                    }
                    .buttonStyle(.bordered)
                }

                if store.entries.isEmpty {
                    ContentUnavailableView(
                        "Nessun movimento",
                        systemImage: "tray",
                        description: Text(DateFormatters.month.string(from: month).capitalized)
                    )
                    .foregroundStyle(ParadisoTheme.muted)
                    .padding(.top, 36)
                } else {
                    ForEach(store.entries) { entry in
                        LedgerEntryRow(entry: entry)
                    }
                }
            }
            .padding(16)
        }
        .background(ParadisoTheme.background)
        .navigationTitle("Contabilità")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(ParadisoTheme.header, for: .navigationBar)
        .toolbarBackground(.visible, for: .navigationBar)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    Task { await store.loadAccounting(month: month) }
                } label: {
                    Image(systemName: "arrow.clockwise")
                }
                .accessibilityLabel("Aggiorna contabilità")
            }
        }
        .refreshable {
            await store.loadAccounting(month: month)
        }
        .sheet(isPresented: $entryPresented) {
            LedgerEntrySheet(month: month)
                .presentationDetents([.large])
                .presentationBackground(ParadisoTheme.background)
        }
    }

    private var monthControls: some View {
        HStack {
            Button {
                moveMonth(-1)
            } label: {
                Image(systemName: "chevron.left")
                    .frame(width: 36, height: 36)
            }
            .accessibilityLabel("Mese precedente")

            Spacer()
            Text(DateFormatters.month.string(from: month).capitalized)
                .font(.headline)
                .foregroundStyle(ParadisoTheme.text)
            Spacer()

            Button {
                moveMonth(1)
            } label: {
                Image(systemName: "chevron.right")
                    .frame(width: 36, height: 36)
            }
            .accessibilityLabel("Mese successivo")
        }
        .buttonStyle(.bordered)
    }

    private func moveMonth(_ value: Int) {
        month = Calendar.current.date(byAdding: .month, value: value, to: month) ?? month
        Task {
            await store.loadAccounting(month: month)
        }
    }
}

private struct AccountingTile: View {
    let title: String
    let value: Double
    let color: Color
    let icon: String

    var body: some View {
        Panel {
            HStack {
                Text(title)
                    .font(.caption)
                    .foregroundStyle(ParadisoTheme.muted)
                Spacer()
                Image(systemName: icon)
                    .foregroundStyle(color)
            }
            Text(DateFormatters.currency(value))
                .font(.title3.weight(.bold))
                .foregroundStyle(color)
                .lineLimit(1)
                .minimumScaleFactor(0.72)
                .padding(.top, 7)
        }
    }
}

private struct LedgerEntryRow: View {
    let entry: LedgerEntry

    private var color: Color {
        switch entry.kind {
        case LedgerKind.income.rawValue: ParadisoTheme.green
        case LedgerKind.expense.rawValue: ParadisoTheme.red
        default: ParadisoTheme.gold
        }
    }

    private var sign: String {
        entry.kind == LedgerKind.income.rawValue ? "+" : "−"
    }

    var body: some View {
        Panel {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: entry.kind == LedgerKind.income.rawValue ? "arrow.down" : "arrow.up")
                    .font(.headline)
                    .foregroundStyle(color)
                    .frame(width: 34, height: 34)
                    .background(color.opacity(0.12))
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text(entry.category)
                        .font(.headline)
                        .foregroundStyle(ParadisoTheme.text)
                    if !entry.description.isEmpty {
                        Text(entry.description)
                            .font(.subheadline)
                            .foregroundStyle(ParadisoTheme.muted)
                    }
                    HStack(spacing: 8) {
                        Text(DateFormatters.bookingDate(entry.occurredOn))
                        if !entry.paymentMethod.isEmpty {
                            Text("•")
                            Text(entry.paymentMethod)
                        }
                        if let code = entry.bookingCode {
                            Text("•")
                            Text(code)
                        }
                    }
                    .font(.caption)
                    .foregroundStyle(ParadisoTheme.muted)
                }
                Spacer(minLength: 8)
                Text("\(sign)\(DateFormatters.currency(entry.amount))")
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(color)
                    .lineLimit(1)
                    .minimumScaleFactor(0.75)
            }
        }
    }
}

private struct LedgerEntrySheet: View {
    @EnvironmentObject private var store: AppStore
    @Environment(\.dismiss) private var dismiss
    let month: Date
    @State private var kind: LedgerKind = .expense
    @State private var amount = ""
    @State private var date = Date()
    @State private var category = ""
    @State private var description = ""
    @State private var paymentMethod = "Carta"

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    Picker("Tipo", selection: $kind) {
                        ForEach(LedgerKind.allCases) { kind in
                            Text(kind.label).tag(kind)
                        }
                    }
                    .pickerStyle(.segmented)

                    TextField("Importo", text: $amount)
                        .keyboardType(.decimalPad)
                    DatePicker("Data", selection: $date, displayedComponents: .date)
                    TextField("Categoria", text: $category)
                    TextField("Descrizione", text: $description, axis: .vertical)
                        .lineLimit(2...4)
                    Picker("Pagamento", selection: $paymentMethod) {
                        ForEach(["Carta", "Contanti", "Bonifico", "Non specificato"], id: \.self) {
                            Text($0).tag($0)
                        }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .background(ParadisoTheme.background)
            .navigationTitle("Nuovo movimento")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Annulla") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Salva") {
                        save()
                    }
                }
            }
        }
    }

    private func save() {
        let value = Double(amount.replacingOccurrences(of: ",", with: ".")) ?? 0
        Task {
            if await store.createLedgerEntry(
                kind: kind,
                amount: value,
                date: date,
                category: category,
                description: description,
                paymentMethod: paymentMethod,
                month: month
            ) {
                dismiss()
            }
        }
    }
}
