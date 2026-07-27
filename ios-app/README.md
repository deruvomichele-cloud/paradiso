# Paradiso Admin iOS

App nativa SwiftUI equivalente alla dashboard amministrativa e all'app Android.

## Funzioni

- login admin con token protetto nel Portachiavi;
- elenco, ricerca, filtri e dettaglio prenotazioni;
- cambio stato e registrazione degli incassi;
- riepilogo mensile, movimenti e inserimento di incassi, spese e rimborsi;
- lettura QR con AVFoundation;
- push Firebase/APNs con apertura diretta della prenotazione;
- deep link `paradisoadmin://booking/P-XXXXXXXX`;
- layout scuro coordinato con la dashboard web.

L'invio automatico di SMS dalla SIM resta nell'app Android: iOS non consente a
un'app di inviare SMS in background senza interazione dell'utente.

## Generazione progetto

Il progetto Xcode è descritto da `project.yml` per evitare file `.pbxproj`
generati e difficili da revisionare.

```bash
brew install xcodegen
cd ios-app
xcodegen generate
open ParadisoAdmin.xcodeproj
```

Il target minimo è iOS 17 e il bundle identifier è
`it.paradisolounge.admin.ios`.

## Firebase e notifiche

1. Nello stesso progetto Firebase del backend, aggiungere un'app iOS con bundle
   identifier `it.paradisolounge.admin.ios`.
2. Scaricare `GoogleService-Info.plist` in `ios-app/ParadisoAdmin/Resources/`.
3. Nel progetto Firebase, caricare la chiave APNs dell'account Apple.
4. In Xcode, scegliere il team di firma e verificare la capability Push
   Notifications.
5. Eseguire l'app su un iPhone reale, accedere e autorizzare le notifiche.

Il file Firebase reale è ignorato da Git. In GitHub Actions può essere fornito
come secret base64 `GOOGLE_SERVICE_INFO_PLIST_BASE64`.

## Build e test

```bash
cd ios-app
xcodegen generate
xcodebuild \
  -project ParadisoAdmin.xcodeproj \
  -scheme ParadisoAdmin \
  -destination 'platform=iOS Simulator,name=iPhone 16 Pro' \
  CODE_SIGNING_ALLOWED=NO \
  test
```

Per archivio App Store serve un Mac con Xcode, un account Apple Developer e la
firma del target configurata.
