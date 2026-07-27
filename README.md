# Paradiso Lounge Bar

Sito, API di prenotazione, dashboard amministrativa e app native Android/iOS per il Paradiso Lounge Bar di Nova Milanese.

## Architettura

```text
Browser clienti ─┐
Dashboard web ───┼── HTTPS ──> Fly Machine (sito statico + API Go)
App Android/iOS ┘                         │
                                          ├── SQLite su Fly Volume
                                          └── FCM opzionale (push immediato)
```

- Un solo container Fly serve il sito e l'API `/v1`, evitando CORS e configurazioni duplicate.
- SQLite su volume persistente è l'unica fonte dati per prenotazioni, stati, dispositivi e contabilità.
- Le notifiche usano una transactional outbox: prenotazione e evento push vengono salvati nella stessa transazione.
- Android controlla periodicamente le nuove richieste anche senza Firebase; FCM aggiunge il push immediato su Android e iOS.
- Firebase non contiene dati del locale: quando configurato, viene usato soltanto come canale FCM.
- GitHub Actions verifica backend, JavaScript e app Android/iOS, conserva l'APK e può distribuire automaticamente su Fly.

## Funzioni

- prenotazione tavolo con eventuale preordine dal menu;
- codice prenotazione generato dal server;
- login amministratore protetto da password bcrypt e sessione JWT;
- ricerca, filtri e aggiornamento stato prenotazioni;
- esportazione CSV di prenotazioni e libro cassa;
- contabilità con incassi, spese, rimborsi, categorie e saldo netto;
- registrazione dell'incasso reale collegato a una prenotazione;
- app native Android e iOS con le stesse funzioni amministrative;
- lettura del QR ricevuto dal cliente per aprire e gestire subito la prenotazione;
- notifica push alla creazione di una prenotazione;
- build APK scaricabile dagli artifact GitHub o dalle release `android-v*`.

Il valore del preordine è una stima. Il saldo contabile usa soltanto i movimenti realmente registrati.

## Struttura

```text
.
├── index.html, admin.html, *.css, *.js  # sito e dashboard
├── assets/                              # immagini e video
├── backend/                             # API Go, migrazioni, Docker e fly.toml
├── android-app/                         # app Android Kotlin + Compose
├── ios-app/                             # app iOS SwiftUI + XcodeGen
└── .github/workflows/                   # CI, APK, release e deploy Fly
```

## Avvio locale

Prerequisito: Go 1.25+. SQLite è incorporato nel binario e non richiede servizi locali.

```bash
cp backend/.env.example backend/.env
set -a
source backend/.env
set +a
cd backend
go run ./cmd/api
```

Con `WEB_ROOT=..`, sito e API sono disponibili su `http://localhost:8080`. Database, migrazioni e account iniziale vengono creati automaticamente. A ogni avvio `ADMIN_EMAIL` e `ADMIN_PASSWORD` sincronizzano le credenziali amministrative.

## Prima distribuzione su Fly

1. Installare `flyctl`, accedere e creare l'app indicata in `backend/fly.toml`:

   ```bash
   fly auth login
   fly apps create faithful-violet-707
   ```

2. Creare un volume persistente da 1 GB nella regione di Francoforte:

   ```bash
   fly volumes create paradiso_data --region fra --size 1 -a faithful-violet-707
   ```

   Il volume costa circa 0,15 USD/mese; la Machine è configurata per fermarsi quando inattiva.

3. Impostare autenticazione e primo amministratore:

   ```bash
   fly secrets set \
     JWT_SECRET="<ALMENO_32_CARATTERI_CASUALI>" \
     ADMIN_EMAIL="admin@tuodominio.it" \
     ADMIN_PASSWORD="<PASSWORD_FORTE_DI_ALMENO_12_CARATTERI>" \
     -a faithful-violet-707
   ```

4. Distribuire sito e API insieme:

   ```bash
   fly deploy --config backend/fly.toml --dockerfile backend/Dockerfile
   ```

Il sito pubblico sarà su `https://loungebarparadiso.it/`, l'admin su `/admin.html`
e l'indirizzo tecnico Fly resterà `https://faithful-violet-707.fly.dev/`.

Se il nome Fly viene cambiato, aggiornare:

- `app` e `ALLOWED_ORIGINS` in `backend/fly.toml`;
- `PARADISO_API_BASE_URL` in `android-app/app/build.gradle.kts`;
- `PARADISO_API_BASE_URL` in `ios-app/ParadisoAdmin/Info.plist`;
- il valore `url` nei dati strutturati di `index.html`.

## Notifiche Android e iOS

1. Creare un progetto Firebase e aggiungere un'app Android con package `it.paradisolounge.admin`.
2. Abilitare Cloud Messaging.
3. Scaricare `google-services.json` e copiarlo in `android-app/app/`.
4. Creare una service account Firebase e impostare su Fly:

   ```bash
   fly secrets set \
     FIREBASE_PROJECT_ID="<PROJECT_ID>" \
     FIREBASE_CREDENTIALS_JSON="$(tr -d '\n' < service-account.json)" \
     -a faithful-violet-707
   ```

5. Per abilitare FCM anche nelle build GitHub Actions, salvare il contenuto base64 di `google-services.json` nel secret repository facoltativo `GOOGLE_SERVICES_JSON_BASE64`.

Per iOS, aggiungere nello stesso progetto Firebase l'app con bundle identifier
`it.paradisolounge.admin.ios`, scaricare `GoogleService-Info.plist` in
`ios-app/ParadisoAdmin/` e caricare in Firebase la chiave APNs dell'account
Apple. Per la CI, il plist può essere salvato nel secret facoltativo
`GOOGLE_SERVICE_INFO_PLIST_BASE64`.

Senza questi valori l'app e l'API continuano a funzionare, ma il push resta disabilitato.

## Lettore QR

Nella sezione Prenotazioni, toccare **Scansiona QR prenotazione** e inquadrare il
QR della conferma ricevuta dal cliente. Le app estraggono il codice `P-XXXXXXXX`,
recuperano la prenotazione dall'API e aprono direttamente la scheda da cui aggiornare
lo stato o registrare l'incasso. Android usa Google Code Scanner; iOS usa
AVFoundation e richiede l'autorizzazione alla fotocamera.

## Deploy e APK da GitHub

Configurare nel repository:

- secret `FLY_API_TOKEN`, ottenuto con un deploy token Fly;
- secret facoltativo `GOOGLE_SERVICES_JSON_BASE64` per il push FCM immediato;
- variabile `FLY_DEPLOY_ENABLED=true`.

Ogni push su `main` esegue il deploy Fly. Ogni branch e pull request eseguono:

- controllo sintassi JavaScript;
- test, race detector e build dell'API Go;
- test Android e generazione di `app-debug.apk`, pubblicato come artifact `paradiso-admin-apk`.
- generazione progetto, build e test dell'app iOS su simulatore.

Per creare una GitHub Release installabile:

```bash
git tag android-v1.0.0
git push origin android-v1.0.0
```

## Sicurezza operativa

- Non commettere `google-services.json`, service account, keystore o file `.env`.
- Cambiare immediatamente le credenziali iniziali se sono state condivise.
- Il sito pubblico può solo creare prenotazioni; lettura, stati, contabilità e dispositivi richiedono JWT admin.
- Prezzi e totale del preordine sono informativi. Gli incassi reali sono registrati separatamente.
- Per la produzione conviene aggiungere un dominio proprio, snapshot/backup del volume e una seconda utenza amministrativa.
