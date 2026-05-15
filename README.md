# Hackaton

Starter monorepo za hakatonsku aplikaciju koja može krenuti kao Android aplikacija, web aplikacija ili oboje. Ključna sigurnosna odluka: OpenAI API se nikad ne poziva direktno iz Android ili web klijenta. Klijenti pozivaju Firebase Cloud Functions, a funkcije server-side čuvaju `OPENAI_API_KEY`.

## Trenutni status projekta

Projekt je složen u root direktoriju:

```text
/Users/home/Documents/Codex/2026-05-15/hackaton
```

Dosad je napravljeno:

- Monorepo struktura je generirana: `android-app`, `web-app`, `functions`, `docs`.
- Firebase projekt je povezan kao `sheepai-hackaton`.
- Web aplikacija ima Vite + TypeScript setup i Firebase config kroz `web-app/.env`.
- Web build je deployan na Firebase Hosting: `https://sheepai-hackaton.web.app`.
- Android aplikacija je postavljena kao Kotlin + XML + MVVM + StateFlow + Coroutines + Hilt.
- Android package name je `com.hackaton`.
- `android-app/app/google-services.json` je postavljen lokalno, ali je ignoriran u gitu.
- Android Gradle wrapper je dodan i pinan na Gradle `8.9`.
- Android debug build je provjeren komandom `./gradlew :app:assembleDebug --no-daemon` i prolazi.
- Firebase Cloud Functions TypeScript backend je postavljen.
- Deployane su callable funkcije `generateAiText` i `createUserProfileIfMissing`.
- `generateAiText` validira auth i input, poziva OpenAI samo server-side i sprema preview log u RTDB.
- OpenAI API key je postavljen server-side kroz Firebase Secret Manager i ne nalazi se u client kodu.
- Realtime Database rules su dodane u `docs/firebase-rtdb-rules.json` i deployane.
- Anonymous Auth provider je omogućen.
- Produkcijski test za anonymous auth + AI function poziv je prošao.
- Lokalni Git repozitorij je inicijaliziran na branchu `main`.
- GitHub remote `origin` je postavljen na `https://github.com/intelektualcici/hackaton.git`.
- Projekt je pushan u private GitHub repository: `https://github.com/intelektualcici/hackaton`.

Još treba napraviti ručno:

- Otvoriti Android projekt iz točne putanje `android-app` u Android Studio.
- U Android Studio koristiti Gradle wrapper iz projekta.
- Pokrenuti Android app na emulatoru ili fizičkom uređaju i provjeriti login/displayName/AI flow.

## Što projekt sadrži

- `android-app`: Android Kotlin aplikacija s XML layoutima, MVVM-om, `StateFlow`, coroutines i Hilt dependency injectionom.
- `web-app`: Vite + TypeScript web aplikacija bez kompleksnog frameworka.
- `functions`: Firebase Cloud Functions TypeScript backend s callable funkcijama.
- `docs/firebase-rtdb-rules.json`: početna Realtime Database security rules konfiguracija.
- `firebase.json`: Firebase CLI konfiguracija za functions, RTDB rules i emulatore.
- Firebase Hosting za web demo: `https://sheepai-hackaton.web.app`.
- OpenAI proxy kroz backend: `generateAiText` callable funkcija poziva OpenAI Responses API.

## Struktura

```text
hackaton/
  android-app/
  web-app/
  functions/
  docs/
  README.md
  .gitignore
  firebase.json
```

## RUČNO MORAŠ ODRADITI

Već odrađeno:

- [x] 1. Kreirati Firebase projekt
- [x] 2. Omogućiti Firebase Authentication
- [x] 3. U Authentication omogućiti Anonymous sign-in provider
- [x] 4. Kreirati Realtime Database
- [x] 5. Odabrati regiju baze
- [x] 6. Postaviti početna security rules iz `docs/firebase-rtdb-rules.json`
- [x] 7. Registrirati Android aplikaciju u Firebase projektu
- [x] 8. Upisati točan Android package name, trenutno `com.hackaton`
- [x] 9. Preuzeti `google-services.json`
- [x] 10. Staviti `google-services.json` u `android-app/app/`
- [x] 11. Registrirati Web aplikaciju u Firebase projektu
- [x] 12. Kopirati web Firebase config u `web-app/.env`
- [x] 13. Instalirati Firebase CLI
- [x] 14. Login u Firebase CLI
- [x] 15. Povezati lokalni projekt s Firebase projektom
- [x] 16. Postaviti OpenAI API key za functions environment
- [x] 17. Deployati functions
- [x] 18. Deployati RTDB rules
- [ ] 19. Testirati Android login na emulatoru ili uređaju
- [x] 20. Testirati web login
- [x] 21. Testirati AI function poziv

## Lokalno pokretanje

### Android

1. Otvori točno ovaj direktorij u Android Studio: `/Users/home/Documents/Codex/2026-05-15/hackaton/android-app`.
2. Stavi Firebase `google-services.json` u `android-app/app/`.
3. Provjeri da package name u Firebase konzoli odgovara `applicationId` vrijednosti u `android-app/app/build.gradle.kts`.
4. U Android Studio Gradle postavkama koristi `gradle-wrapper.properties`.
5. Pokreni app na emulatoru ili uređaju.

Terminal build provjera:

```bash
cd /Users/home/Documents/Codex/2026-05-15/hackaton/android-app
./gradlew :app:assembleDebug --no-daemon
```

Android app radi:

- Anonymous login preko Firebase Auth.
- Nakon logina kreira `users/{uid}` profil ako ne postoji.
- Home screen prikazuje `uid` i `displayName`.
- Promjena `displayName` sprema se u Realtime Database.
- AI screen poziva callable function `generateAiText`.

### Web

```bash
cd web-app
npm install
cp .env.example .env
npm run dev
```

Deployani web demo:

```text
https://sheepai-hackaton.web.app
```

Popuni `web-app/.env` vrijednostima iz Firebase Web App configa:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_DATABASE_URL=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_USE_FIREBASE_EMULATORS=false
```

Firebase web config smije biti u browseru. OpenAI key nikad ne ide u `web-app/.env`, jer sve `VITE_` varijable završavaju u client bundleu.

### Functions

```bash
cd functions
npm install
npm run build
```

Za lokalni emulator možeš napraviti lokalni `functions/.env`:

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4.1-mini
```

`functions/.env` je ignoriran u gitu. Za deploy preporuka je Firebase Secret Manager:

```bash
firebase login
firebase use --add
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions
```

`OPENAI_MODEL` je obična server-side config vrijednost. Možeš je držati u `functions/.env` za lokalni rad, ili u Firebase environment konfiguraciji za deploy. Ako nije postavljena, fallback je definiran na jednom mjestu u `functions/src/openaiClient.ts`.

Za emulatore iz root direktorija:

```bash
firebase emulators:start
```

Za deploy:

```bash
firebase deploy --only functions
firebase deploy --only database
```

## Environment varijable

### Web

Primjer je u `web-app/.env.example`. U web env idu samo Firebase web config vrijednosti:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_USE_FIREBASE_EMULATORS`

### Functions

Primjer je u `functions/.env.example`:

- `OPENAI_API_KEY`: OpenAI API key, samo server-side.
- `OPENAI_MODEL`: model za Responses API, npr. `gpt-4.1-mini`.

OpenAI key se nikad ne stavlja u Android app, web app ili bilo koju `VITE_` varijablu.

## Cloud Functions

### `generateAiText`

Callable HTTPS funkcija koja:

- zahtijeva Firebase Auth korisnika preko callable `request.auth`;
- prima `{ prompt: string, mode?: "default" | "short" | "creative" }`;
- validira auth, tip prompta, duljinu prompta do 2000 znakova i dopuštene mode vrijednosti;
- poziva OpenAI Responses API iz `functions/src/openaiClient.ts`;
- ne logira puni prompt;
- vraća `{ text, createdAt }`;
- sprema RTDB log u `aiLogs/{uid}/{pushId}` s `promptPreview`, `responsePreview`, `createdAt` i `mode`.

### `createUserProfileIfMissing`

Callable helper funkcija koja za auth korisnika kreira `users/{uid}` ako profil ne postoji.

## Realtime Database rules

Početna pravila su u `docs/firebase-rtdb-rules.json`.

`users` piše klijent, ali samo za svoj `uid`:

```json
"users": {
  "$uid": {
    ".read": "auth != null && auth.uid === $uid",
    ".write": "auth != null && auth.uid === $uid"
  }
}
```

`aiLogs` čitaju samo vlasnici, a klijenti ne smiju pisati:

```json
"aiLogs": {
  "$uid": {
    ".read": "auth != null && auth.uid === $uid",
    ".write": false
  }
}
```

`aiLogs` pišu samo Cloud Functions preko Firebase Admin SDK-a. Admin SDK zaobilazi client security rules, zato je sigurno da client write bude `false`.

## Test flow

1. Pokreni Android ili web.
2. Login anonymously.
3. Spremi `displayName`.
4. Pošalji prompt prema AI function.
5. Provjeri odgovor u UI-u.
6. Provjeri `aiLogs/{uid}` u Realtime Database.

## Sigurnosne napomene

- Nikad ne izlagati OpenAI API key u client appu.
- RTDB rules moraju ograničiti pristup po `uid`-u.
- Cloud Functions moraju validirati auth i input.
- Rate limit kasnije dodati po `uid`-u.
- Ne logirati privatne podatke ni puni prompt.
- Za produkciju dodati Firebase App Check.
- Ne committati `.env`, API ključeve, produkcijske Firebase confige, keystore datoteke ili `google-services.json` s osjetljivim podacima.

## Datoteke koje moraš ručno popuniti

- `android-app/app/google-services.json`: preuzmi iz Firebase konzole.
- `web-app/.env`: napravi iz `web-app/.env.example`.
- `functions/.env`: samo lokalno, napravi iz `functions/.env.example` ako koristiš emulatore.
- Firebase Secret Manager: postavi `OPENAI_API_KEY` za deploy.

## Brzo proširivanje

- Android featuree dodaj kroz novi `Fragment`, `ViewModel`, repository/usecase po potrebi i route u `nav_graph.xml`.
- Web featuree dodaj kao male module u `web-app/src`.
- Backend AI logiku mijenjaj u `functions/src/openaiClient.ts`.
- Validaciju requestova dodaj u `functions/src/validators.ts`.
