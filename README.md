<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/6f28abe0-faa6-4ef2-a112-1850b8ac32c0

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Firebase Hosting

1. Install the Firebase CLI if needed:
   `npm install -g firebase-tools`
2. Initialize Firebase hosting once:
   `npx firebase init hosting`
   - Use `dist` as the public directory
   - Configure as a single-page app
3. Set your Firebase project ID in `.firebaserc`.
4. Authenticate with Firebase:
   `npm run firebase:login`
5. For local non-interactive deployment, set a Firebase CI token:
   `set FIREBASE_TOKEN=your_token` on PowerShell or `export FIREBASE_TOKEN=your_token` on bash
6. Deploy using the token:
   `npm run firebase:deploy:ci`

## Service account deployment (Google Application Credentials)

1. In the Google Cloud console, create a service account for the project `turf-booking-171bf`.
2. Grant it the following roles:
   - `Firebase Hosting Admin`
   - `Firebase Admin`
   - `Storage Admin`
   - `Cloud Firestore Admin` or `Firebase Rules Admin`
   - `Service Usage Consumer` (required so the CLI can verify that Firebase Storage / Firestore APIs are enabled)
3. Download the JSON key file.
4. Set the environment variable:
   - PowerShell: `$env:GOOGLE_APPLICATION_CREDENTIALS="C:\path\to\service-account.json"`
   - Bash: `export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"`
5. Deploy using:
   `npm run firebase:deploy:sa`

The generated `firebase.json` is configured to serve the Vite `dist/` output and rewrite all routes to `index.html` for SPA support.
