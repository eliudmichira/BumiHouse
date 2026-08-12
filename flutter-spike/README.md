# BumiHouse Flutter Spike

A minimal Flutter app to evaluate the **native feel** against the current
Capacitor (React-in-webview) mobile app. It wires the *real* backend — the
same Firebase project the web app uses — with three screens:

1. **Auth** — email/password sign-in, sign-up, or "continue as guest"
   (`FirebaseAuth`).
2. **Listings** — live list of properties streamed from the Firestore
   `properties` collection (`cloud_firestore`), with search + rent/sale filter.
3. **Map** — Google Map centered on **Westlands, Nairobi**, with a marker per
   property within 20 km that has coordinates; tap a marker for a preview
   sheet (`google_maps_flutter`).

The Property model accepts every coordinate shape the web app handles
(GeoPoint at `coordinates`, `{lat,lng}` at `coordinates`/`location`/root), so
the spike works against the existing seed data with zero migrations.

## Prerequisites

- Flutter SDK **stable (3.27+)** — check with `flutter --version`
  (Dart 3.6+ is required by the pubspec)
- Android Studio (or a device/emulator) for Android runs
- Access to the existing Firebase project (the one the web app uses)

## 1. Generate platform folders

The repo contains only `lib/` + `pubspec.yaml` (no `android/`/`ios/` yet —
those are generated):

```bash
cd flutter-spike
flutter create . --org com.bumihouse --project-name bumihouse_spike --platforms=android,ios
flutter pub get
```

`flutter create .` only adds missing files — it will **not** overwrite the
existing `lib/` code or `pubspec.yaml`.

## 2. Connect Firebase (Android)

1. In the Firebase console, open the project the web app uses and add an
   **Android app** with package id `com.bumihouse.spike` (or change
   `applicationId` in `android/app/build.gradle.kts` to match an existing
   Firebase Android app). Download **`google-services.json`**.
2. Copy it in:
   ```bash
   cp /path/to/google-services.json android/app/
   ```
3. Add the Google services plugin to `android/app/build.gradle.kts`:
   ```kotlin
   plugins {
     id("com.android.application")
     id("kotlin-android")
     id("dev.flutter.flutter-gradle-plugin")
     id("com.google.gms.google-services")   // <- add this line
   }
   ```
   (If your build uses `android/build.gradle` Groovy syntax, add
   `classpath 'com.google.gms:google-services:4.4.2'` to the top-level
   `buildscript` dependencies and `apply plugin: 'com.google.gms.google-services'`
   in the app module instead.)
4. If you plan to use email/password or guest sign-in, enable
   **Email/Password** and/or **Anonymous** in Firebase console → Authentication
   → Sign-in method.

> iOS: add `GoogleService-Info.plist` to `ios/Runner` via Xcode and follow the
> `flutterfire configure` flow if you want iOS. Android is the fastest path.

## 3. Google Maps API key

1. In Google Cloud console enable **Maps SDK for Android** for the project.
2. Add the key to `android/app/src/main/AndroidManifest.xml`, inside `<application>`:
   ```xml
   <meta-data
     android:name="com.google.android.geo.API_KEY"
     android:value="YOUR_ANDROID_MAPS_KEY" />
   ```
3. Release builds also need `<uses-permission android:name="android.permission.INTERNET"/>`
   in the manifest (debug/profile get it automatically).

## 4. Run

```bash
flutter run          # pick your device/emulator
```

You should land on the auth screen → sign in (or guest) → the live property
list streams in → switch to the Map tab for Westlands.

## What to evaluate while it runs

- Scroll smoothness on the 500-doc list vs the webview list
- App startup time and first-frame feel vs the Capacitor splash
- Map pan/zoom + marker interaction (native SDK vs JS map in webview)
- Keyboard, back gesture, and bottom-sheet behavior on Android

## Verification status (smoke-tested)

- **Flutter 3.44.8 / Dart 3.12.2** — `flutter pub get` resolves all pinned
  versions cleanly (firebase_core 4.13.0, cloud_firestore 6.8.0, firebase_auth
  6.5.7, google_maps_flutter 2.18.0)
- `flutter analyze` — **no issues**
- `flutter test` — **4/4 passing** (Property model: GeoPoint + `{lat,lng}`
  shapes, string numerics, price formatting)
- `flutter build apk --debug` — **builds green** (163s first Gradle run;
  APK at `build/app/outputs/flutter-apk/app-debug.apk`)

What still can't be verified here: running on a device requires the real
`google-services.json` + Google Maps key, which are project-specific and must
come from your Firebase/Cloud consoles (steps 2–3 above).

## Honest caveats

- Google sign-in is wired (google_sign_in 7.x): enable the **Google** provider
  in the Firebase console; on Android it uses the SHA-1-registered OAuth
  client + `default_web_client_id` from `google-services.json`.
- Anonymous (guest) sign-in must be enabled in the Firebase console too
  (Authentication → Sign-in method → Anonymous).
- Anonymous sign-in may be blocked if your Firestore rules require a verified
  email — use email/password in that case.
