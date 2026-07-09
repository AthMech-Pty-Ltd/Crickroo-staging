# CrickRoo — Project Handover Document

**Product:** CrickRoo — AI-powered cricket training & analytics mobile app
**Platforms:** Android & iOS (React Native)
**Application ID (Android):** `com.athmech.crickroo`
**Bundle ID (iOS):** `com.athmech.crickroo2`
**Status:** v1.0 — feature complete

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [What CrickRoo Does (Feature Catalog)](#2-what-crickroo-does-feature-catalog)
3. [User Roles & Modes](#3-user-roles--modes)
4. [Technology Stack](#4-technology-stack)
5. [High-Level Architecture](#5-high-level-architecture)
6. [Project Structure](#6-project-structure)
7. [Navigation & App Flow](#7-navigation--app-flow)
8. [Authentication & Onboarding](#8-authentication--onboarding)
9. [Player Features (Detailed)](#9-player-features-detailed)
10. [Coach Features (Detailed)](#10-coach-features-detailed)
11. [The Recording & ML Pipeline](#11-the-recording--ml-pipeline-technical-core)
12. [Backend / API Integration](#12-backend--api-integration)
13. [Data Models](#13-data-models)
14. [State Management & Offline Behaviour](#14-state-management--offline-behaviour)
15. [Push Notifications](#15-push-notifications)
16. [Native Modules](#16-native-modules)
17. [Third-Party Dependencies](#17-third-party-dependencies)
18. [Configuration & Environment](#18-configuration--environment)
19. [Permissions](#19-permissions)
20. [Build & Release](#20-build--release)
21. [Local Development Setup](#21-local-development-setup)

---

## 1. Executive Summary

CrickRoo is a mobile application that lets cricketers **record their batting/bowling sessions with their phone**, automatically **analyses each delivery using computer vision**, and presents **rich performance analytics, visualizations, and shareable highlight clips**. It also has a full **coach mode** for managing players in batches and reviewing each player's analytics.

The technically distinctive part of the product is the **on-device recording pipeline**: the phone records high-frame-rate video, runs an on-device AI model to detect the stumps for calibration, chunks the video into short segments, and uploads those segments to the cloud in the background while recording continues. The backend then performs ball tracking and returns per-delivery analytics, visualizations, and highlights.

**Two apps in one:**
- **Player experience** — personal stats dashboard, visualizations (pitch map, beehive, release points, speed distribution), session highlights, favourite clips, and profile.
- **Coach experience** — academy roster organised into batches, per-player analytics, join-request approvals, and a coach code players use to link to the coach.

The app is built with **React Native 0.84.1** and ships custom **native modules (Kotlin on Android, Swift on iOS)** for the camera and segmented recorder.

---

## 2. What CrickRoo Does (Feature Catalog)

| Area | Capability |
|---|---|
| **Account** | Email/password signup with OTP verification, Google Sign-In, Apple Sign-In, password reset via OTP |
| **Onboarding** | Guided profile setup: personal details, role selection (player/coach), cricket profile, playing style, face capture (3 angles), permissions |
| **Recording** | Phone-camera session recording at 1080p/60fps, on-device stump detection for calibration, chunked recording + background upload |
| **Analytics (Player)** | Batting/bowling dashboard with KPI rings (ball lengths & outcomes), totals (balls/time), interactive filtering |
| **Visualizations** | Pitch Map, Beehive, Release Points (ball dots overlaid on graphics), Speed Distribution bar chart; expandable detail view with filters |
| **Highlights** | Per-session highlight clips, full-screen swipeable reel with ball trajectory overlay, outcome editing, and player tagging |
| **Favourites** | Save clips, bulk-select, generate a combined highlight reel, download/share |
| **Coach / Academy** | Batches (create/rename/delete), assign/move/remove players, unassigned-player handling, join-request approvals, per-player stats, coach code sharing |
| **Notifications** | Push notifications (Firebase) when sessions are processed / highlights are ready, with auto-download of generated highlights |
| **Profile & Settings** | Edit profile sections, manage permissions, link/unlink coach, subscription/plan badge, help & support (FAQ), account deletion |
| **Offline** | Network detection with banners; cached auth/profile so the app opens offline if already logged in |

---

## 3. User Roles & Modes

There are **two related but distinct concepts**, both defined in [src/types/auth.ts](src/types/auth.ts):

### Roles (`UserRole`) — what the account *is*
- `player`
- `coach`
- `head_coach`
- `freelance_coach`

Helper predicates:
- `isCoachRole(role)` → true for `coach`, `head_coach`, `freelance_coach`
- `canManageRoster(role)` → true **only** for `head_coach`, `freelance_coach`

### Mode (`AppMode`) — what the user is *currently doing*
- `coach`
- `player`

A coach account can **switch between coach mode and player mode** in-app (so a coach can also record and review their own sessions). A `player` account is always in player mode. The active mode is held in `RootNavigator` state and drives which home screen and tabs are shown.

### Role-based permission matrix (coach features)

| Action | `coach` | `head_coach` | `freelance_coach` |
|---|:--:|:--:|:--:|
| View batches & players | ✓ | ✓ | ✓ |
| **Add Batch** | ✓ | ✓ | ✓ |
| Rename / delete batch | ✗ | ✓ | ✓ |
| Move player between batches | ✗ | ✓ | ✓ |
| Delete / remove player | ✗ | ✓ | ✓ |
| View a player's full stats | ✓ | ✓ | ✓ |

Gating is implemented in [src/screens/CoachHome/index.tsx](src/screens/CoachHome/index.tsx) via `canManage = canManageRoster(role)` (rename/delete/move) and `canAddBatch = isCoachRole(role)` (add batch).

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Framework | React Native **0.84.1**, React **19.2.3** |
| Language | TypeScript **5.8.3** (strict), Kotlin (Android native), Swift (iOS native) |
| Navigation | **Custom state machine** (no React Navigation) — see [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx) |
| HTTP | Axios **1.13.6** with interceptors |
| Camera | `react-native-vision-camera` 4.7.3 + custom native Camera2 (Android) |
| On-device ML | `react-native-fast-tflite` 2.0.0 (+ `vision-camera-resize-plugin`), `jpeg-js` |
| Video | `react-native-video` 6.19.1, `react-native-create-thumbnail` |
| Background upload | `react-native-background-upload` 6.6.0 (patched) |
| Auth/Push | Firebase (`@react-native-firebase/app`, `/auth`, `/messaging` 24.0.0), Google Sign-In, Apple Authentication, Notifee |
| Storage | `@react-native-async-storage/async-storage`, `react-native-fs` |
| Animation/UI | `react-native-reanimated` 4.3.0, `react-native-gesture-handler`, `react-native-svg`, `react-native-linear-gradient`, `phosphor-react-native` |
| Config | `react-native-config` (`.env`) |

Native dependency patches live in [patches/](patches/) and are applied via `patch-package` on `postinstall`:
- `react-native+0.84.1.patch`
- `react-native-background-upload+6.6.0.patch`
- `@react-native-community+slider+5.2.0.patch`
- `react-native-fast-tflite+2.0.0.patch`

> **Important:** These patches are required. Always run `npm install` (which triggers `postinstall` → `patch-package`). Do not bump these packages without re-checking the patches.

---

## 5. High-Level Architecture

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
│ favourites,   │ player stats)            │                    │
│ profile)      │                          │                    │
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

**Key architectural decisions:**
- **No navigation library.** Routing is a `useState<RootScreen>` machine in `RootNavigator`, with a `BACK_MAP` describing one-way back routes and a custom Android hardware-back handler. New engineers should note this is intentional and centralised.
- **Service layer pattern.** All network access goes through typed service modules that wrap a single Axios `apiClient` with auth-token injection and automatic 401 refresh.
- **In-house native recording.** Rather than relying solely on a library recorder, the app has its own segmented recorder for chunked, upload-while-recording behaviour on both platforms.

---

## 6. Project Structure

```
MyApp/
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
│   ├── screens/              # 40+ screens (see Navigation section)
│   ├── services/             # API service layer + upload/ pipeline
│   ├── theme/                # colors, typography, appStyles
│   ├── types/                # Domain types (auth, session, academy, ballTracking, …)
│   └── utils/                # storage, network, photoInference, stumpGeometry, date, …
└── __tests__/                # App.test.tsx (boilerplate)
```

Scale: ~28k lines of TS/TSX across ~44 screens and ~32 components, plus native Kotlin/Swift.

---

## 7. Navigation & App Flow

Navigation is a single state machine in [src/navigation/RootNavigator.tsx](src/navigation/RootNavigator.tsx). The top-level screens (`RootScreen`) are:

`splash` · `onboarding` · `signin` · `social_role` · `registration` · `reset_email` · `dashboard` · `session_selection` · `session_details` · `camera` · `session_summary` · `profile_details` · `personal_profile` · `face_recognition` · `app_permissions` · `cricket_profile` · `playing_style` · `highlight_playback` · `highlight_reel` · `help_support` · `notifications`

**Startup gate:**
```
Splash (animated)
  → token in storage?
      no  → Onboarding → SignIn / Registration
      yes → GET /onboarding/status
              completed → Dashboard
              incomplete → Registration (resume at current step)
      offline → trust cached status (open Dashboard if previously authed)
```

`dashboard` hosts a bottom **TabNavigator**. Tabs differ by mode:
- **Player mode:** Stats · Highlights · Favourites · Settings
- **Coach mode:** Home (CoachHome) · Highlights · Favourites · Settings

**Representative flow — recording a session (player):**
```
Dashboard → "+" → session_details (CreateNewSession)
  → createSession() → camera (record + stump detect + chunk upload)
  → session_summary (upload progress) → Dashboard
  → (push) "Highlights ready" → highlight_playback → highlight_reel
```

---

## 8. Authentication & Onboarding

### Auth methods ([src/services/auth.service.ts](src/services/auth.service.ts), [src/screens/Auth/](src/screens/Auth/))
- **Email/password** with OTP (`sendOtp` / `verifyOtp`)
- **Google Sign-In** and **Apple Sign-In** → Firebase ID token → `POST /auth/social-login`
  - If the backend needs a role for a new social user, it returns a "role required" signal and the app routes to the `social_role` screen to pick player/coach, then retries.
- **Password reset** via email OTP (`forgot-password` / `verify-reset-otp` / `reset-password`)
- **Logout** (sends refresh token; clears storage), **Delete account**

### Token handling ([src/services/api/apiClient.ts](src/services/api/apiClient.ts), [src/utils/storage.ts](src/utils/storage.ts))
- Access + refresh tokens and the user object are stored in **AsyncStorage**.
- **Request interceptor:** checks connectivity, attaches `Authorization: Bearer <token>`.
- **Response interceptor:** on `401`, calls `POST /auth/refresh` once, retries the original request; on refresh failure, clears storage (forces re-login).
- Cached keys: `access_token`, `refresh_token`, `user_data`, cached onboarding status, cached profile summary.

### Onboarding ([src/services/onboarding.service.ts](src/services/onboarding.service.ts), [src/screens/Auth/RegistrationFlow/](src/screens/Auth/RegistrationFlow/))
Multi-step registration: email/OTP → role selection (registers the account) → personal profile (name, DOB, height, weight) → permissions → **face capture (front, left, right)** uploaded to S3 → `POST /onboarding/complete`. Onboarding status/summary endpoints let the app resume an incomplete signup and render the profile-completion hub.

---

## 9. Player Features (Detailed)

### 9.1 Stats Dashboard — [src/screens/HomeScreen/index.tsx](src/screens/HomeScreen/index.tsx)
- **BATTING / BOWLING** segmented toggle and a **session-range** dropdown (`Last Session`, `Last 5/10/25`, `All Sessions`). Changing either refetches.
- **KPI rings** (`StatCircle`) in two groups:
  - **Ball length:** Short, Good Length, Full, Yorker
  - **Outcome:** Played, Missed, Left, Bowled
  - Each ring shows `value / group-total` as progress. **Tapping a ring toggles a filter**; base (unfiltered) counts are cached so ring labels stay stable while filtered.
- **Summary row:** Balls, Time (`formatMinutes`), Matchups (*currently hardcoded 0 — see Limitations*).
- **Visualizations carousel** (horizontal, paged) → tap to open the expandable detail view.
- **Data flow:** `dashboardService.getDashboard({ mode, sessions?, length? })` for KPIs; the four visualization endpoints fetched in parallel with `{ mode, sessions?, length?, hit? }`.

### 9.2 Visualizations — [src/components/stats/](src/components/stats/)
- **VizImage** overlays normalized ball coordinates (0–1) as dots on graphic backgrounds. Per-graph **viewports** ([viewports.ts](src/components/stats/viewports.ts)) define the live area on each image; Y is inverted (0 = bottom).
  - Pitch Map, Beehive, Release Points.
- **SpeedDistributionChart** — bar chart over speed buckets (`<80`, `80–100`, `100–120`, `120–140`, `140+` km/h) with auto-scaled axis.
- **VizDetailModal** — full-screen, paged carousel of all graphs + KPI rings with live filtering. (Recently hardened for iOS safe-area and for preserving the viewed graph across filter reloads.)

### 9.3 Highlights — [src/screens/Highlights/](src/screens/Highlights/)
- **HighlightsScreen** — a 14-day date bar; tapping a date lists that day's sessions as cards (2-col grid). In **coach mode** it adds a player dropdown (*My Sessions / All Players / each player*) that scopes the query.
- **HighlightPlaybackScreen** — a session's clips: a featured video player on top + a paginated 3-col grid of all deliveries (30/page). Favourite toggling per clip; loads session players for tagging.
- **HighlightReelScreen** — full-screen vertical swipeable reel. Per clip: tap-to-play, **ball-trajectory overlay** (SVG from `ballTracking.getTrajectory`), **outcome editing**, **player tagging**, like/favourite, and a **filmstrip scrubber** for seeking. Videos are downloaded and cached locally (hashed paths) with prefetch/pagination.

### 9.4 Favourites — [src/screens/FavoritesScreen/](src/screens/FavoritesScreen/) + [src/store/favoritesStore.ts](src/store/favoritesStore.ts)
- Clips grouped by month; long-press → multi-select → **delete** or **CREATE HIGHLIGHT** (`generateHighlight` stitches selected clips server-side; user is notified when ready).
- A global, subscribable favourites store keeps favourite state in sync across the reel, playback, and favourites screens (optimistic updates with revert on failure).
- Download to device (Android: `Downloads/`) / share (iOS share sheet).

### 9.5 Profile & Settings — [src/screens/Profile/](src/screens/Profile/)
- **ProfileScreen** — settings hub with a **plan/subscription badge** (`planService.getUserPlan` → free tier / trial / individual subscription / academy-managed), and entries for Personal Profile, Cricket Profile, Playing Style, App Permissions, Notifications, Help & Support, and Account.
- **Coach linking** for players: enter a coach code → `playerService.linkCoach` (creates a join request); unlink supported.
- **PersonalProfileScreen** (name/DOB/height/weight with unit conversion), **CricketProfileScreen** (batsman/bowler/all-rounder), **PlayingStyleScreen** (hand/position/arm/style), **NotificationsScreen** (paginated feed, deep-links into sessions), **HelpSupportScreen** (collapsible FAQ), account deletion.

---

## 10. Coach Features (Detailed)

### 10.1 Coach Home — [src/screens/CoachHome/index.tsx](src/screens/CoachHome/index.tsx)
- **Stat cards:** Players (with pending-join-request badge; opens roster), Active, Sessions.
- **Batches** as expandable cards (`BatchCard`); expanding lazy-loads that batch's players. A virtual **"Unassigned batch"** surfaces players who linked but aren't placed yet.
- **Add Batch** (all coach roles); rename/delete/move/remove gated to `head_coach`/`freelance_coach`.
- Modals in [src/screens/CoachHome/modals/](src/screens/CoachHome/modals/): `AddBatchModal`, `RenameBatchModal`, `DeleteBatchModal`, `BatchOptionsModal`, `ChangeBatchModal`, `PlayerOptionsModal`, `DeletePlayerModal`, `AddPlayerModal` (currently not surfaced), `CoachCodeModal`, `PlayerPreview`.

### 10.2 Roster / Players — [src/screens/Players/index.tsx](src/screens/Players/index.tsx)
- Full-screen roster with **search**, **Assigned** and **Unassigned** sections, per-player options (change/assign batch, delete), and **Join Requests** (`JoinRequestsModal` → approve/reject `coach/join-requests`).

### 10.3 Player Stats (coach view) — [src/screens/Players/PlayerStatsScreen/](src/screens/Players/PlayerStatsScreen/)
- A coach opens any player's **full analytics** (same dashboard + visualizations + filters as the player sees), **scoped by `cric_id`** on every dashboard/visualization call so a coach only sees that player's data.

### 10.4 Coach code & academy
- Each coach has a **coach code** (`user.coach_code`) shared via `CoachCodeModal` (copy/share). Players enter it to request linking; the coach approves in Join Requests. Batches belong to the coach's `academy_id`.

### 10.5 Coach behaviour in shared screens
- **Highlights** dropdown maps to query scope: *My Sessions* → `scope=own` + `session_mode=coach`; *All Players* → `scope=students` + `session_mode=player`; a specific player → `cric_id=<player>` + `session_mode=player`.
- **Session creation** in coach mode tags sessions with `user_type=coach` and is oriented to group sessions.

---

## 11. The Recording & ML Pipeline (Technical Core)

This is the most complex subsystem. It spans JS, on-device ML, and native code on both platforms.

### 11.1 Camera screen — [src/screens/CameraScreen/index.tsx](src/screens/CameraScreen/index.tsx)
- Targets **1920×1080 @ 60 fps**.
- **Calibration:** the user aligns two on-screen guide boxes (striker / non-striker stumps), captures a still photo, and the app runs **on-device stump detection** on that JPEG. The user can re-detect until aligned.
- **Recording:** on start, the app sends session config (stump coordinates + metadata) to the backend, then the native encoder records and **rotates to a new file at keyframes (~5s chunks)**; a timer shows elapsed time.
- **Stop:** finalises the last chunk, fetches the final batch of upload URLs, and drains remaining chunks to the upload queue.
- **Platform rendering:** Android uses a **native Camera2 TextureView** (`Camera2View`); iOS uses **VisionCamera** with a frame processor.

### 11.2 On-device ML — stump detection
- **Model:** [src/assets/models/stump_yolov9_t_960_float16.tflite](src/assets/models/) — YOLOv9-Tiny, FP16, **960×960** input, 2 classes (full stump group / single stump). ~5.4 MB.
- **Inference:** [src/utils/photoInference.ts](src/utils/photoInference.ts) decodes the JPEG (`jpeg-js`), handles EXIF rotation, letterboxes to 960×960, runs `react-native-fast-tflite`, then applies confidence threshold (~0.5) + NMS (IoU ~0.45).
- **Geometry:** [src/utils/stumpGeometry.ts](src/utils/stumpGeometry.ts) expands detected boxes using real stump dimensions (single 22.86 cm, full group 71.12 cm) and maps back to screen/image coordinates.
- Detection is **photo-based at calibration**, not per-frame, keeping the live recording path light.

### 11.3 Native segmented recorder
**Android** — [android/app/src/main/java/com/athmech/crickroo/segmentedrec/](android/app/src/main/java/com/athmech/crickroo/segmentedrec/)
- `SegmentedRecorderEngine.kt` — singleton encoder: H.264 video (~16 Mbps CBR, 1s I-frame interval, 60 fps) + AAC audio (44.1 kHz mono, 128 kbps), `MediaMuxer` MP4 output, dedicated encode/audio threads, **chunk rotation at keyframes**. API: `prepare / start / rotate / stop`, callbacks `onChunkReady`, `onStopped`.
- `SegmentedRecorderModule.kt` (RN bridge, emits `onChunkReady`), `SegmentedRecorderPlugin.kt` (VisionCamera frame processor), `SegmentedRecorderPackage.kt`.
- Companion **Camera2** module — `Camera2Manager.kt` (hardware capability checks, surface-mode encoder, JPEG still capture), `Camera2ViewManager.kt`, `Camera2Module.kt` (`takePhoto`), `Camera2Package.kt`.

**iOS** — [ios/Crickeroo/](ios/Crickeroo/)
- `SegmentedRecorderEngine.swift` (AVAssetWriter-based, H.264 + AAC, single writer queue, keyframe rotation), `SegmentedRecorderModule.swift` (RCTEventEmitter), `SegmentedRecorderPlugin.swift` (VisionCamera frame processor).

**JS bridges:** [src/native/Camera2View.tsx](src/native/), [src/native/SegmentedRecorder.ts](src/native/).

### 11.4 Upload pipeline — [src/services/upload/](src/services/upload/), [src/services/upload.service.ts](src/services/upload.service.ts)
- The app pre-fetches **presigned S3 URLs** in batches (`POST /upload/clip-urls`) and keeps a small pool topped up.
- Each finalised chunk (`onChunkReady`) is matched to a URL and enqueued in the **UploadManager** singleton, which uploads via `react-native-background-upload` (`PUT` to S3), with **bounded parallelism (~7)**, **retries (~3)**, and **per-session progress** (`onSessionProgress`) consumed by the Session Summary screen.
- Android runs uploads under a silent **foreground service** notification; iOS uses background `URLSession`. Path conventions differ (`file://` on iOS).

### 11.5 Session config — [src/services/upload.service.ts](src/services/upload.service.ts) → `POST /sessions/{id}/config`
Sends `{ meta.mode, stump[] (box_id, label, x1/x2/y1/y2 in image space, detected), users[], platform, pitch_length, user_type? }`. The stump calibration snapshot is also uploaded (`/upload/stump-detection-url`). The backend uses these to perform ball tracking and produce analytics/highlights.

---

## 12. Backend / API Integration

- **Base URL:** `https://athmech.net/api/v1` (from `.env` `API_BASE_URL`), timeout 10s.
- All endpoints are centralised in [src/config/api.config.ts](src/config/api.config.ts) and consumed through the typed services in [src/services/](src/services/).

**Endpoint catalogue (grouped):**

- **Auth:** `POST /auth/register`, `/auth/login`, `/auth/social-login`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/send-otp`, `/auth/verify-otp`, `/auth/verify-reset-otp`
- **Onboarding:** `GET /onboarding/status`, `GET /onboarding/summary`, `PATCH /onboarding/personal-profile`, `/onboarding/cricket-profile`, `/onboarding/playing-style`, `/onboarding/academy-details`, `POST /onboarding/complete`
- **User / device:** `DELETE /user/profile`, `POST /user/device-token`, `GET /user/me/plan`
- **Sessions:** `POST /sessions`, `GET /sessions` (filters: `date`, `session_mode`, `scope`, `cric_id`), `GET /sessions/latest-date`, `POST /sessions/{id}/end`, `POST /sessions/{id}/config`, `GET /sessions/{id}/highlights`, `GET /sessions/{id}/players`
- **Uploads (presigned):** `POST /upload/clip-urls`, `/upload/face-urls`, `/upload/profile-image-url`, `/upload/stump-detection-url`
- **Favourites:** `POST /favourites`, `DELETE /favourites`, `GET /favourites`
- **Highlights / notifications:** `POST /highlights/generate`, `GET /notifications`
- **Ball tracking:** `GET /balls/{id}/trajectory`, `GET /balls/{id}/detail`, `PATCH /balls/{id}/outcome`, `PATCH /balls/{id}/players`
- **Dashboard analytics:** `GET /users/me/dashboard`, `/users/me/pitch-map`, `/users/me/beehive`, `/users/me/release-points`, `/users/me/speed-distribution`
- **Players / search:** `GET /search`, `POST /player/link-coach`, `DELETE /player/unlink-coach`
- **Academy / coach:** `GET /coach/batches`, `GET /coach/join-requests` (+ approve/reject), `admin/academies/{id}/batches` (+ `{batchId}` rename/delete, `/players` list/assign/remove), `admin/academies/{id}/players` (list/delete/move-batch)

> **Backend note:** Some list endpoints (academy batches/players) have been observed returning either a bare array **or** an object-wrapped list. The academy service tolerates both ([src/services/academy.service.ts](src/services/academy.service.ts) `asList()`), but the backend response contract for these should be confirmed and the types tightened (see Limitations).

---

## 13. Data Models

Key domain types in [src/types/](src/types/):

- **User / auth** ([auth.ts](src/types/auth.ts)): `User` (id, `cric_id`, `coach_code`, `academy_id`, role, onboarding flags), `AuthResponse`, `RegistrationData`, `UserRole`, `AppMode`.
- **Session** ([session.ts](src/types/session.ts)): `Session` (id, number, name, type solo/group, mode batting/bowling, pitchLength, players, totals, thumbnail).
- **Academy** ([academy.ts](src/types/academy.ts)): `Batch`, `BatchPlayer`, `AcademyPlayer` (incl. `is_assigned`, `cric_id`), `CoachPlayer`.
- **Ball tracking** ([ballTracking.ts](src/types/ballTracking.ts)): `BallTrajectoryResponse` (frames, trajectory points, display stats), `BallDetail` (pitch_map, metrics, outcome, batter/bowler).
- **Highlights** ([highlights.ts](src/types/highlights.ts)): `HighlightClip`, `SessionHighlightsResponse`.
- **Upload** ([upload.ts](src/types/upload.ts)): `SessionConfigRequest`, `ClipUrlRequest`.
- **Onboarding** ([onboarding.ts](src/types/onboarding.ts)): status/summary/profile request shapes, `LinkedCoach`.
- **Dashboard** ([services/dashboard.service.ts](src/services/dashboard.service.ts)): `DashboardResponse`, length/outcome counts, `SpeedBuckets`, `BallLengthFilter`, `HitFilter`, `GetDashboardParams`.

---

## 14. State Management & Offline Behaviour

- **No Redux/MobX.** State is managed with React state/hooks plus two focused stores:
  - **AuthContext** ([src/store](src/store)) — `isAuthenticated`, registration form data, OS permission status.
  - **favoritesStore** — subscribable singleton for favourite clips (used via `useSyncExternalStore`-style subscriptions).
- **RootNavigator** owns cross-screen runtime state (current screen, mode, role, active session info, reel data).
- **Offline:** `useNetworkStatus` (NetInfo) drives connectivity banners; every request checks connectivity first; onboarding status and profile summary are cached so an already-authenticated user can open the app offline. Recorded clips remain on device until uploaded.

---

## 15. Push Notifications

- **Firebase Cloud Messaging** + **Notifee** (local notifications).
- Background handler registered in [index.js](index.js) **before** `AppRegistry` so a `highlight_ready` message can **auto-download** the generated highlight even when the app is killed ([src/services/highlightDownload.service.ts](src/services/)).
- Foreground messages handled via `useNotifications`. The device FCM token is synced to the backend (`POST /user/device-token`) after login/register/refresh.
- Notification types include `session_highlights_ready` and `highlight_ready`; the in-app Notifications screen lists them and deep-links into the relevant session.
- **Requires:** Firebase config files (already present: `android/app/google-services.json`, `ios/Crickeroo/GoogleService-Info.plist`).

---

## 16. Native Modules

| Module | Platform | Purpose |
|---|---|---|
| `SegmentedRecorder*` | Android (Kotlin) + iOS (Swift) | Chunked H.264/AAC recording with keyframe rotation; emits `onChunkReady` |
| `Camera2*` | Android (Kotlin) | Native Camera2 preview (TextureView), 60fps capability checks, JPEG still capture |
| VisionCamera frame-processor plugins | Both | Pipe camera frames into the segmented recorder |
| TFLite (fast-tflite) | Both | Runs the stump-detection model |
| background-upload | Both (patched) | Background S3 chunk uploads |

JS access points live under [src/native/](src/native/). The Android native source is under `android/app/src/main/java/com/athmech/crickroo/` (`segmentedrec/`, `camera2/`); iOS under `ios/Crickeroo/`.

---

## 17. Third-Party Dependencies

Notable runtime dependencies (see [package.json](package.json) for the full pinned list):

- **UI/UX:** react-native-reanimated, react-native-gesture-handler, react-native-screens, react-native-safe-area-context, react-native-svg, react-native-linear-gradient, phosphor-react-native
- **Media/ML:** react-native-vision-camera, vision-camera-resize-plugin, react-native-fast-tflite, react-native-video, react-native-create-thumbnail, jpeg-js
- **Networking/upload:** axios, react-native-background-upload, @react-native-community/netinfo
- **Firebase/auth:** @react-native-firebase/app, /auth, /messaging, @react-native-google-signin/google-signin, @invertase/react-native-apple-authentication, @notifee/react-native
- **Storage/system:** @react-native-async-storage/async-storage, react-native-fs, react-native-permissions, @react-native-camera-roll/camera-roll, react-native-config

---

## 18. Configuration & Environment

- **`.env`** (consumed by `react-native-config`) — keys in use:
  - `API_BASE_URL` (e.g. `https://athmech.net/api/v1`)
  - `API_TIMEOUT` (e.g. `10000`)
  - `GOOGLE_WEB_CLIENT_ID` (Google Sign-In web client ID)
- **`.env` is not committed** and must be provided per environment. There is currently **one** environment file; if staging/prod separation is needed, introduce env-specific files/build flavors.
- Firebase config files are committed in the native projects (see Push Notifications).

> **Action for client:** rotate/replace the API base URL, Google client ID, and Firebase projects with client-owned credentials before public release if these currently point to the development/agency accounts.

---

## 19. Permissions

**Android** ([android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml)):
`INTERNET`, `ACCESS_NETWORK_STATE`, `CAMERA`, `RECORD_AUDIO`, `ACCESS_FINE_LOCATION`, `ACCESS_COARSE_LOCATION`, `FOREGROUND_SERVICE`, `FOREGROUND_SERVICE_DATA_SYNC`, `POST_NOTIFICATIONS`, `READ_MEDIA_IMAGES`, `READ_MEDIA_VIDEO`.

**iOS** (Info.plist usage strings): Camera, Microphone, Location (When-In-Use), Photo Library, Photo Library Add.

---

## 20. Build & Release

### Versioning (current)
| | Android | iOS |
|---|---|---|
| Version name / marketing | `1.0` | `1.0` |
| Build number | `versionCode 13` | `CURRENT_PROJECT_VERSION 26` |
| Min OS | `minSdkVersion 24` (Android 7) | `IPHONEOS_DEPLOYMENT_TARGET 15.1` |
| Compile/Target SDK | `36` | — |

### Android release signing ([android/app/build.gradle](android/app/build.gradle))
- Release build uses `signingConfigs.release`, which reads from Gradle properties: `MYAPP_RELEASE_STORE_FILE`, `MYAPP_RELEASE_STORE_PASSWORD`, `MYAPP_RELEASE_KEY_ALIAS`, `MYAPP_RELEASE_KEY_PASSWORD`.
- **The release keystore and these credentials are not in the repo** and must be supplied (typically in `~/.gradle/gradle.properties` or `android/gradle.properties`). ProGuard/minify is currently **off**.
- Build: `cd android && ./gradlew assembleRelease` (APK) or `bundleRelease` (AAB for Play Store).

### iOS release
- Xcode workspace: `ios/Crickeroo.xcworkspace` (target **Crickeroo**). Install pods first: `cd ios && bundle install && bundle exec pod install`.
- Archive/upload via Xcode or `xcodebuild` with the client's Apple Developer signing (provisioning profiles & certificates required).

> Note: the iOS Xcode project/target is named **"Crickeroo"** (legacy spelling) while the product display name is **"CrickRoo"**. Purely cosmetic, but worth knowing when navigating the iOS project.

---

## 21. Local Development Setup

```sh
# 1. Install JS deps (also applies required patches via postinstall)
npm install

# 2. Provide environment + native config
#    - create .env with API_BASE_URL, API_TIMEOUT, GOOGLE_WEB_CLIENT_ID
#    - ensure android/app/google-services.json and ios/.../GoogleService-Info.plist exist

# 3a. Android
npm run android        # device/emulator with API 24+

# 3b. iOS (first run)
cd ios && bundle install && bundle exec pod install && cd ..
npm run ios            # simulator/device, iOS 15.1+

# Metro (if not auto-started)
npm start

# Lint / format / test
npm run lint
npm run format
npm test
```

**Requirements:** Node (per RN 0.84 toolchain), JDK 17, Android SDK 36, Xcode (iOS 15.1+ SDK), CocoaPods/Ruby bundler. A **physical device is recommended** for camera/ML/recording — the simulator/emulator cannot exercise the 60fps capture pipeline meaningfully.

---

*Prepared as the engineering + product handover for CrickRoo (v1.0). For the deepest technical detail, the code paths referenced throughout are the source of truth; this document maps the territory and explains the non-obvious decisions.*
