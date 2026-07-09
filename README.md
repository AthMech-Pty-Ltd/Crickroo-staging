# CrickRoo

**AI-powered cricket training & analytics mobile app.**

CrickRoo lets cricketers **record their batting/bowling sessions with their phone**, automatically **analyses each delivery using computer vision**, and presents **rich performance analytics, visualizations, and shareable highlight clips**. It also ships a full **coach mode** for managing players in batches and reviewing each player's analytics.

- **Platforms:** Android & iOS
- **Application ID (Android):** `com.athmech.crickroo`
- **Bundle ID (iOS):** `com.athmech.crickroo2`
- **Framework:** React Native 0.84.1 · React 19.2.3 · TypeScript 5.8.3 (strict)
- **Backend:** REST API at `https://athmech.net/api/v1` · AWS S3 (presigned uploads) · Firebase (Auth + FCM)

> The iOS Xcode project/target is named **"Crickeroo"** (legacy spelling) while the product display name is **"CrickRoo"**. Purely cosmetic, but worth knowing when navigating the iOS project.

---

## Table of Contents

1. [What it does](#what-it-does)
2. [Tech stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Quick start](#quick-start)
5. [Environment & native config](#environment--native-config)
6. [Available scripts](#available-scripts)
7. [Project structure](#project-structure)
8. [Architecture overview](#architecture-overview)
9. [Build & release](#build--release)
10. [Troubleshooting](#troubleshooting)
11. [Further reading](#further-reading)

---

## What it does

**Two experiences in one app:**

- **Player** — personal stats dashboard, visualizations (pitch map, beehive, release points, speed distribution), session highlights, favourite clips, and profile.
- **Coach** — academy roster organised into batches, per-player analytics, join-request approvals, and a coach code players use to link to the coach.

| Area | Capability |
|---|---|
| **Account** | Email/password signup with OTP verification, Google Sign-In, Apple Sign-In, password reset via OTP |
| **Onboarding** | Guided profile setup: personal details, role selection, cricket profile, playing style, face capture (3 angles), permissions |
| **Recording** | Phone-camera session recording at 1080p/60fps, on-device stump detection for calibration, chunked recording + background upload |
| **Analytics (Player)** | Batting/bowling dashboard with KPI rings (ball lengths & outcomes), totals, interactive filtering |
| **Visualizations** | Pitch Map, Beehive, Release Points, Speed Distribution chart; expandable detail view with filters |
| **Highlights** | Per-session clips, full-screen swipeable reel with ball-trajectory overlay, outcome editing, player tagging |
| **Favourites** | Save clips, bulk-select, generate a combined highlight reel, download/share |
| **Coach / Academy** | Batches (create/rename/delete), assign/move/remove players, join-request approvals, per-player stats, coach code sharing |
| **Notifications** | Push (Firebase) when sessions are processed / highlights are ready, with auto-download of generated highlights |
| **Offline** | Network detection with banners; cached auth/profile so the app opens offline if already logged in |

The technically distinctive part is the **on-device recording pipeline**: the phone records high-frame-rate video, runs an on-device AI model to detect the stumps for calibration, chunks the video into short (~5s) segments, and uploads those segments to the cloud in the background while recording continues. The backend then performs ball tracking and returns per-delivery analytics, visualizations, and highlights.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React Native **0.84.1**, React **19.2.3** |
| Language | TypeScript **5.8.3** (strict), Kotlin (Android native), Swift (iOS native) |
| Navigation | **Custom state machine** (no React Navigation) — `src/navigation/RootNavigator.tsx` |
| HTTP | Axios **1.13.6** with auth-token interceptors + 401 refresh |
| Camera | `react-native-vision-camera` 4.7.3 + custom native Camera2 (Android) |
| On-device ML | `react-native-fast-tflite` 2.0.0 (+ `vision-camera-resize-plugin`), `jpeg-js` |
| Video | `react-native-video` 6.19.1, `react-native-create-thumbnail` |
| Background upload | `react-native-background-upload` 6.6.0 (patched) |
| Auth/Push | Firebase (`@react-native-firebase/app`, `/auth`, `/messaging` 24.0.0), Google Sign-In, Apple Authentication, Notifee |
| Storage | `@react-native-async-storage/async-storage`, `react-native-fs` |
| Animation/UI | `react-native-reanimated` 4.3.0, `react-native-gesture-handler`, `react-native-svg`, `react-native-linear-gradient`, `phosphor-react-native` |
| Config | `react-native-config` (`.env`) |

### Native patches (required)

Native dependency patches live in [`patches/`](patches/) and are applied automatically via `patch-package` on `postinstall`:

- `react-native+0.84.1.patch`
- `react-native-background-upload+6.6.0.patch`
- `@react-native-community+slider+5.2.0.patch`
- `react-native-fast-tflite+2.0.0.patch`

> **Important:** These patches are required. Always install with `npm install` (which triggers `postinstall` → `patch-package`). Do not bump these packages without re-checking the patches.

---

## Prerequisites

- **Node.js** (per the RN 0.84 toolchain) and npm
- **JDK 17** (Android Gradle build)
- **Android SDK 36** + Android Studio (its bundled JDK works for release builds too)
- **Xcode** with the iOS 15.1+ SDK (macOS only)
- **CocoaPods** (via Ruby `bundler`)
- A **physical device is strongly recommended** — the simulator/emulator cannot meaningfully exercise the 60fps capture + ML pipeline.

> ⚠️ **Path with no spaces:** RN 0.84's prebuilt `ReactNativeCore` download fails if the project path contains a space (e.g. `~/Desktop/New Cricket/`). Keep the project at a space-free path such as `~/crickroo-mobile-fe`.

---

## Quick start

```sh
# 1. Install JS deps (also applies required patches via postinstall)
npm install

# 2. Provide environment + native config (see next section)

# 3a. Android — device/emulator with API 24+
npm run android

# 3b. iOS — first run installs CocoaPods, then launches the simulator/device (iOS 15.1+)
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios

# Metro (if not auto-started)
npm start
```

---

## Environment & native config

### `.env` (consumed by `react-native-config`)

`.env` is **not committed** and must be provided per environment. Keys in use:

| Key | Example | Purpose |
|---|---|---|
| `API_BASE_URL` | `https://athmech.net/api/v1` | Backend base URL |
| `API_TIMEOUT` | `10000` | Axios timeout (ms) |
| `GOOGLE_WEB_CLIENT_ID` | `…apps.googleusercontent.com` | Google Sign-In web client ID |

There is currently **one** environment file; if staging/prod separation is needed, introduce env-specific files / build flavors.

### Firebase config files (required for auth + push)

These are committed in the native projects, but must point at the correct Firebase project:

- `android/app/google-services.json`
- `ios/Crickeroo/GoogleService-Info.plist`

---

## Available scripts

| Command | Description |
|---|---|
| `npm start` | Start the Metro bundler |
| `npm run android` | Build & run on an Android device/emulator (API 24+) |
| `npm run ios` | Build & run on an iOS simulator/device (iOS 15.1+) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format the codebase |
| `npm test` | Run Jest tests |

---

## Project structure

```
crickroo-mobile-fe/
├── App.tsx                     # Root component (providers + navigator)
├── index.js                    # Entry; registers app + FCM background handler
├── android/                    # Android native project (Kotlin modules)
├── ios/                        # iOS native project (Swift modules; target "Crickeroo")
├── patches/                    # patch-package patches (required)
├── src/
│   ├── assets/
│   │   ├── fonts/              # Inter (Regular/Medium/SemiBold)
│   │   ├── images/
│   │   └── models/            # stump_yolov9_t_960_float16.tflite (5.4 MB)
│   ├── components/            # Reusable UI (auth, common, highlights, stats, session, …)
│   ├── config/               # api.config.ts (endpoints, base URL)
│   ├── constants/            # assets.ts, etc.
│   ├── context / store/      # AuthContext, favoritesStore
│   ├── hooks/                # useAuth, useNetworkStatus, useNotifications, …
│   ├── native/               # JS bridges to native modules (Camera2View, SegmentedRecorder)
│   ├── navigation/           # RootNavigator.tsx
│   ├── screens/              # 40+ screens
│   ├── services/             # API service layer + upload/ pipeline
│   ├── theme/                # colors, typography, appStyles
│   ├── types/                # Domain types (auth, session, academy, ballTracking, …)
│   └── utils/                # storage, network, photoInference, stumpGeometry, date, …
└── __tests__/                # App.test.tsx (boilerplate)
```

Scale: ~28k lines of TS/TSX across ~44 screens and ~32 components, plus native Kotlin/Swift.

---

## Architecture overview

```
┌──────────────────────────────────────────────────────────────┐
│  App.tsx                                                       │
│   └─ SafeAreaProvider → AuthProvider → RootNavigator          │
│      (Google Sign-In configured at startup)                   │
├──────────────────────────────────────────────────────────────┤
│  RootNavigator (custom state machine)                         │
│   • holds rootScreen, mode, userRole, session state           │
│   • gates auth (token → onboarding status → dashboard)        │
├───────────────┬──────────────────────────┬───────────────────┤
│ Player Home   │ Coach Home               │ Session Recording  │
│ (stats,       │ (batches, players,       │ (camera + ML +     │
│ highlights,   │ join requests,           │ chunked upload)    │
│ favourites)   │ player stats)            │                    │
├───────────────┴──────────────────────────┴───────────────────┤
│  Services layer (src/services/*) — Axios apiClient            │
│   auth, onboarding, session, dashboard, academy, player,      │
│   upload, ballTracking, notifications, plan, social, …        │
├──────────────────────────────────────────────────────────────┤
│  Native modules: SegmentedRecorder (Kotlin/Swift),            │
│   Camera2 (Kotlin), TFLite stump model, background upload     │
├──────────────────────────────────────────────────────────────┤
│  Backend REST API  →  https://athmech.net/api/v1              │
│  AWS S3 (presigned uploads)  •  Firebase (auth + FCM push)    │
└──────────────────────────────────────────────────────────────┘
```

**Key decisions:**

- **No navigation library.** Routing is a `useState<RootScreen>` machine in `RootNavigator`, with a `BACK_MAP` for one-way back routes and a custom Android hardware-back handler. This is intentional and centralised.
- **Service layer pattern.** All network access goes through typed service modules wrapping a single Axios `apiClient` with auth-token injection and automatic 401 refresh.
- **In-house native recording.** A custom segmented recorder provides chunked, upload-while-recording behaviour on both platforms (Kotlin on Android, Swift on iOS), feeding from a VisionCamera frame processor.
- **No Redux/MobX.** State is React hooks plus two focused stores: `AuthContext` and a subscribable `favoritesStore`.

For the full subsystem-by-subsystem breakdown (recording/ML pipeline, API catalogue, data models, native modules), see [`HANDOVER.md`](HANDOVER.md).

---

## Build & release

### Versioning

Set in [`android/app/build.gradle`](android/app/build.gradle) (`versionCode` / `versionName`) and the iOS Xcode project (`CURRENT_PROJECT_VERSION` / marketing version).

### Android (APK / AAB)

Release builds use `signingConfigs.release`, which reads from Gradle properties: `MYAPP_RELEASE_STORE_FILE`, `MYAPP_RELEASE_STORE_PASSWORD`, `MYAPP_RELEASE_KEY_ALIAS`, `MYAPP_RELEASE_KEY_PASSWORD`. The release keystore and credentials are **not in the repo** and must be supplied (typically in `android/gradle.properties` or `~/.gradle/gradle.properties`).

```sh
cd android
./gradlew assembleRelease   # APK
./gradlew bundleRelease      # AAB (for Play Store)
```

Output AAB: `android/app/build/outputs/bundle/release/app-release.aab`.

> Use **JDK 17** (or the Android Studio bundled JDK) for release builds — the system default JDK may fail the worklets CMake step. ProGuard/R8 minify is currently **off**.

### iOS

```sh
cd ios && bundle install && bundle exec pod install
```

Open `ios/Crickeroo.xcworkspace` (target **Crickeroo**) and archive/upload via Xcode, or use `xcodebuild` with the appropriate Apple Developer signing (provisioning profiles & certificates required).

---

## Troubleshooting

- **`pod install` fails with "bad component (expected absolute path component)"** — the project path contains a space. Move it to a space-free path (e.g. `~/crickroo-mobile-fe`) and reinstall.
- **`FirebaseAuth/FirebaseAuth-Swift.h file not found` in Xcode** — usually **indexer noise**, not a build failure. The header is generated *during* a build. Let indexing finish, Clean Build Folder, and run a real build (`Cmd+B`). The Podfile already configures Firebase as static frameworks (`$RNFirebaseAsStaticFramework`) so the generated `-Swift.h` resolves.
- **Build-system PIF error ("unable to initiate PIF transfer")** — quit Xcode fully, delete `~/Library/Developer/Xcode/DerivedData`, reopen the workspace, and let indexing complete before building.
- **CocoaPods version drift** — this project is locked to **CocoaPods 1.16.2** (`Podfile.lock`). Match that version and avoid deleting `Podfile.lock` so dependency versions stay reproducible.
- **Patches not applied** — always use `npm install` (runs `postinstall` → `patch-package`). The build will break without the patches in [`patches/`](patches/).

---

## Further reading

- [`HANDOVER.md`](HANDOVER.md) — the full engineering + product handover (deep technical detail, API catalogue, data models, native modules).
- [React Native docs](https://reactnative.dev/docs/getting-started)
</content>
</invoke>
