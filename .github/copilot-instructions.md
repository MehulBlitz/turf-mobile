# GitHub Copilot Workspace Instructions

## Purpose
This repo is a React + Tailwind web app wrapped with Capacitor for Android. It targets a turf booking experience with Supabase authentication and native Android features such as camera, geolocation, and network status.

Use this file to orient the AI assistant quickly and to avoid duplicating existing documentation.

## Key repository facts
- Frontend: `src/` uses React + Tailwind + Vite.
- Mobile wrapper: Capacitor Android project under `android/`.
- Native helpers: `src/lib/capacitorPlugins.js`.
- Supabase client: `src/lib/supabase.js`.
- Main app entry: `src/App.jsx`.
- Important components: `src/components/OwnerDashboard.jsx`, `src/components/AuthScreen.jsx`, `src/components/AdminDashboard.jsx`, `src/components/CustomerProfilePage.jsx`.

## Build and test commands
Prefer these npm scripts rather than raw Gradle commands when working in this repo.

- `npm install`
- `npm run dev`
- `npm run build`
- `npm run android:build`  — build web assets and sync Android
- `npm run android:debug`  — build debug APK
- `npm run android:release`  — build release APK
- `npm run android:bundle`  — build Play Store bundle
- `npm run android:install`  — install debug APK
- `npm run android:run`  — run on connected Android device/emulator
- `npm run android:sync`  — sync Capacitor Android project

## Important files and locations
- `ANDROID_QUICKSTART.md` — primary quick Android build guide.
- `ANDROID_SETUP.md` — detailed Android SDK/setup/troubleshooting instructions.
- `CLAUDE.md` — project status, implementation plan, and phase checklist.
- `vite.config.js` — Vite build configuration.
- `package.json` — dependencies and Android build scripts.
- `android/app/src/main/AndroidManifest.xml` — Android permissions and manifest settings.
- `android/app/build.gradle` — Android app build configuration.

## Preferred workflow for Android work
1. Read `ANDROID_QUICKSTART.md` and `ANDROID_SETUP.md` for context and environment requirements.
2. Use `npm run android:build` first to generate `dist/` and sync the Android project.
3. Use `npm run android:debug` to create the debug APK.
4. Test on device/emulator with `npm run android:install` or `npm run android:run`.
5. Avoid editing Android build files unless the change is necessary for the feature.

## Project conventions
- Keep Android-specific changes in `android/` and web-specific changes in `src/`.
- Use Capacitor helper functions in `src/lib/capacitorPlugins.js` for native device features.
- Prefer code-splitting in `src/App.jsx` for large screens or feature modules when adding new navigation flows.

## What to avoid
- Do not overwrite or duplicate the existing Android setup docs.
- Do not assume Android SDK or `ANDROID_HOME` is configured in this environment without verification.
- Do not add signing or key material to git.

## Example prompt patterns
- "Inspect `src/components/OwnerDashboard.jsx` and add Capacitor camera support using `src/lib/capacitorPlugins.js`."
- "Find Android build commands in `package.json` and explain the safest development workflow for this repo."
- "Update `src/App.jsx` to use native geolocation and network status from the Capacitor helpers."

## Suggested next agent customization
- Create a custom agent prompt for Android tasks that focuses on `ANDROID_QUICKSTART.md`, `ANDROID_SETUP.md`, and `package.json` build scripts.
- Create a code-review prompt for Capacitor native feature work in `src/lib/capacitorPlugins.js` and `src/components/OwnerDashboard.jsx`.
