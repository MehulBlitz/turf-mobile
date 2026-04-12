<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Turf Mobile

Mobile-first web app and Capacitor Android wrapper for booking turf grounds.

## GitHub Actions

This repository includes a CI workflow at `.github/workflows/ci.yml` that runs on `push` and `pull_request` to `main`.
It installs dependencies, lints the code, and builds the production app.

## Run Locally

**Prerequisites:** Node.js 20+, npm

1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`
3. Open `http://localhost:3000`

## Android / Capacitor

1. Build web assets and sync Android:
   `npm run android:build`
2. Build debug APK:
   `npm run android:debug`
3. Install on a connected device:
   `npm run android:install`

## Android build workflow

This repository includes a GitHub Actions workflow at `.github/workflows/android-build.yml` that builds the Android debug APK on pushes to `main` or manually via workflow dispatch. The build output is uploaded as a workflow artifact named `app-debug-apk`.

## Android release workflow

There is also a manual release workflow at `.github/workflows/android-release.yml`. Use it to build the Android debug APK and publish it as a GitHub release asset.

### Triggering the release workflow

1. Open this repository on GitHub.
2. Click the `Actions` tab.
3. Select `Android Release` from the list of workflows.
4. Click `Run workflow` and choose the branch `main`.
5. Start the workflow.

The workflow publishes the debug APK as a GitHub Release asset named `app-debug.apk`.

## Web deployment

This app is configured for Firebase Hosting in `firebase.json`.

Live demo: https://turf-booking-171bf.web.app

To deploy the current build to Firebase Hosting locally:

```bash
npm run firebase:deploy
```

For GitHub Actions deployment, add these secrets to this repository:

- `FIREBASE_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

T

- `FIREBASE_TOKEN`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The workflow will deploy automatically on pushes to `main`.

If you need service account deployment:

```bash
npm run firebase:deploy:sa
```

## Notes

- The app is currently optimized for mobile and Android; desktop viewport support is intentionally limited.
- If you want to enable desktop support later, update `src/App.jsx` and add responsive layouts.
- Make sure `.env.local` contains your Supabase keys for local development.
