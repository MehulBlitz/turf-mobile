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

## Web deployment

This app is configured for Firebase Hosting in `firebase.json`.

To deploy the current build to Firebase Hosting:

```bash
npm run firebase:deploy
```

If you need service account deployment:

```bash
npm run firebase:deploy:sa
```

## Notes

- The app is currently optimized for mobile and Android; desktop viewport support is intentionally limited.
- If you want to enable desktop support later, update `src/App.jsx` and add responsive layouts.
- Make sure `.env.local` contains your Supabase keys for local development.
