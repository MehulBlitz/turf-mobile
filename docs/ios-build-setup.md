# iOS Build & Deployment Guide

This guide covers setting up iOS development, building IPA files, and deploying to App Store/TestFlight using Capacitor and GitHub Actions.

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Building iOS Locally](#building-ios-locally)
3. [GitHub Actions Setup](#github-actions-setup)
4. [Code Signing & Certificates](#code-signing--certificates)
5. [Deployment to TestFlight](#deployment-to-testflight)
6. [Troubleshooting](#troubleshooting)

---

## Local Development Setup

### Prerequisites

- **macOS** 12.0 or later
- **Xcode** 14.0 or later
- **Node.js** 18+ (recommend 24.x like in CI)
- **Cocoapods** (included with Xcode)
- **Apple Developer Account** (for code signing, $99/year)

### Initial Setup

1. **Install Capacitor iOS platform:**
   ```bash
   npm run ios:prebuild
   ```
   This creates the `ios/` folder with Xcode project structure.

2. **Sync web assets:**
   ```bash
   npm run build
   npm run ios:sync
   ```

3. **Install CocoaPods dependencies:**
   ```bash
   cd ios/App
   pod install --repo-update
   cd ../..
   ```

4. **Open Xcode project:**
   ```bash
   npm run ios:open
   ```
   This opens `ios/App/App.xcworkspace` (always use the workspace, not the `.xcodeproj`).

### Development Commands

| Command | Purpose |
|---------|---------|
| `npm run ios:build` | Build web assets and sync to iOS |
| `npm run ios:open` | Open Xcode workspace |
| `npm run ios:sync` | Sync web assets to iOS platform |
| `npm run ios:debug` | Build Debug configuration |
| `npm run ios:release` | Build Release configuration |

---

## Building iOS Locally

### Debug Build (for development/testing)

1. **Build web and sync:**
   ```bash
   npm run build
   npm run ios:sync
   ```

2. **Build in Xcode:**
   - Open `ios/App/App.xcworkspace`
   - Select **Product** > **Build** (⌘B)
   - Or use terminal: `npm run ios:debug`

3. **Run on simulator:**
   - Select a simulator in Xcode
   - Click **Play** button or press **⌘R**

4. **Run on physical device:**
   - Connect iPhone via USB
   - Select device in Xcode
   - Click **Play** button

### Release Build (for App Store)

1. **Build web and sync:**
   ```bash
   npm run build
   npm run ios:sync
   ```

2. **Archive for distribution:**
   ```bash
   cd ios/App
   xcodebuild -workspace App.xcworkspace \
     -scheme App \
     -configuration Release \
     -derivedDataPath ../../build \
     -allowProvisioningUpdates \
     archive \
     -archivePath ../../build/App-Release.xcarchive
   ```

3. **Export IPA:**
   You need `ExportOptions.plist` (see [Code Signing](#code-signing--certificates)):
   ```bash
   xcodebuild -exportArchive \
     -archivePath build/App-Release.xcarchive \
     -exportOptionsPlist ios/ExportOptions.plist \
     -exportPath build/ipa
   ```

---

## GitHub Actions Setup

### Automated iOS Builds

Two workflows are configured:

#### 1. **ios-build.yml** (Automatic on main push)
- **Trigger:** Push to `main` branch or manual dispatch
- **Outputs:** 
  - Debug IPA (on push to main)
  - Release IPA (if manually triggered with `release` option)
- **Artifacts:** Available for 30 days
- **Release:** Creates GitHub Release with IPA attached

#### 2. **ios-release.yml** (Manual release workflow)
- **Trigger:** Workflow dispatch (manual)
- **Input:** Option to upload to TestFlight
- **Outputs:** Release IPA
- **Artifacts:** Available for 60 days

### Minimal Secrets Setup (Basic - No Code Signing)

For unsigned/development builds, set these GitHub Secrets:

| Secret | Value |
|--------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anonymous key |

### Full Secrets Setup (With Code Signing)

To enable code signing in CI/CD:

| Secret | Description |
|--------|-------------|
| `IOS_SIGNING_CERTIFICATE_BASE64` | Base64-encoded .p12 certificate |
| `CERTIFICATE_PASSWORD` | Password for .p12 certificate |
| `IOS_PROVISIONING_PROFILE_BASE64` | Base64-encoded .mobileprovision file |
| `KEYCHAIN_PASSWORD` | Temporary keychain password for CI |
| `APPLE_TEAM_ID` | Your Apple Team ID (10-digit) |
| `APPLE_API_KEY_ID` | App Store Connect API key ID (for TestFlight upload) |
| `APPLE_API_ISSUER_ID` | App Store Connect API issuer ID |

### How to Add Secrets to GitHub

1. Go to **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Add each secret with the values from your development setup

---

## Code Signing & Certificates

### Create Signing Certificate

1. **In Apple Developer Portal (developer.apple.com):**
   - Go to **Certificates, Identifiers & Profiles** > **Certificates**
   - Click **+** and select **iOS Distribution** (for App Store)
   - Follow the wizard to create and download `.cer`

2. **Create .p12 file for CI/CD:**
   ```bash
   # In Xcode: Preferences > Accounts > Manage Certificates
   # Or via terminal with Certificate Assistant
   openssl pkcs12 -export -out certificate.p12 -inkey private_key.key -in certificate.cer
   ```

3. **Encode for GitHub Secrets:**
   ```bash
   base64 -i certificate.p12 | pbcopy
   # Paste into GITHUB_SECRET: IOS_SIGNING_CERTIFICATE_BASE64
   ```

### Create Provisioning Profile

1. **In Apple Developer Portal:**
   - Go to **Certificates, Identifiers & Profiles** > **Profiles**
   - Click **+** and select **iOS App Distribution**
   - Select App ID: `com.turfbooking.app`
   - Select certificate
   - Download `.mobileprovision`

2. **Encode for GitHub Secrets:**
   ```bash
   base64 -i profile.mobileprovision | pbcopy
   # Paste into GITHUB_SECRET: IOS_PROVISIONING_PROFILE_BASE64
   ```

### Xcode Code Signing Setup

1. Open `ios/App/App.xcworkspace`
2. Select **App** project in left panel
3. Select **Signing & Capabilities** tab
4. Set **Team** to your Apple Developer Team
5. Verify **Bundle Identifier** is `com.turfbooking.app`
6. Xcode will auto-create/manage provisioning profiles

---

## Deployment to TestFlight

### Setup App Store Connect

1. Go to **App Store Connect** (appstoreconnect.apple.com)
2. Create app entry if not already present
3. Note down **Bundle ID**: `com.turfbooking.app`
4. Create **App Store Connect API** credentials:
   - Go to **Users and Access** > **API Keys**
   - Select role: **App Manager** or **Developer**
   - Download `.json` or note the **Key ID** and **Issuer ID**

### Create ExportOptions.plist

For App Store distribution, create `ios/ExportOptions.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>provisioningProfiles</key>
    <dict>
        <key>com.turfbooking.app</key>
        <string>iOS App Store Provisioning Profile: com.turfbooking.app</string>
    </dict>
    <key>signingCertificate</key>
    <string>Apple Distribution</string>
    <key>stripSwiftSymbols</key>
    <true/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

Replace `YOUR_TEAM_ID` with your 10-digit Apple Team ID.

### Upload to TestFlight (Manual)

Using `altool` (Xcode command-line tool):

```bash
xcrun altool --upload-app \
  --file build/app-release-X.ipa \
  --type ios \
  --apiKey YOUR_API_KEY_ID \
  --apiIssuer YOUR_API_ISSUER_ID \
  --show-progress
```

### Upload via GitHub Actions

1. Set GitHub Secrets:
   - `APPLE_API_KEY_ID`
   - `APPLE_API_ISSUER_ID`

2. Trigger workflow with TestFlight option:
   - Go to **Actions** > **iOS Release**
   - Click **Run workflow**
   - Set **Deploy to TestFlight** to `true`
   - Click **Run workflow**

3. Monitor progress in workflow logs
4. Build will appear in TestFlight within a few minutes

---

## Troubleshooting

### Common Issues

#### "Container ref is defined but not hydrated" Error
**Solution:** This occurs if motion system is trying to use `useScroll` with a container before it's rendered. Check `src/App.jsx` — ensure `useScroll()` is called without parameters initially.

#### CocoaPods Installation Fails
```bash
rm -rf ios/App/Pods
rm -rf ios/App/Podfile.lock
cd ios/App && pod install --repo-update
```

#### Xcode Build Fails with "Signing for 'App' requires a development team"
1. Open `ios/App/App.xcworkspace`
2. Select **App** project
3. Go to **Signing & Capabilities**
4. Select your team from dropdown
5. Let Xcode auto-create provisioning profiles

#### "No provisioning profile found" Error
```bash
# Reset provisioning profiles
security delete-certificate -c "iPhone Developer" ~/Library/Keychains/login.keychain
```

Then re-download from Apple Developer Portal.

#### GitHub Actions: "Certificate not trusted"
Verify:
- Base64 encoding is correct: `base64 -i file.p12 | wc -c` should show proper length
- Certificate password is correct in `CERTIFICATE_PASSWORD` secret
- Keychain password is set in `KEYCHAIN_PASSWORD` secret

#### App Crashes on Startup
Check:
- Supabase credentials in environment (check workflow logs)
- iOS deployment target matches (`ios/App/App/Info.plist` → should be 14.0+)
- Plugin permissions in `capacitor.config.json` are added to `ios/App/App/Info.plist`

---

## Next Steps

1. **Create App Store listing** on App Store Connect
2. **Configure push notifications** (optional)
3. **Set up push certificate** for iOS push support
4. **Monitor builds** in GitHub Actions tab
5. **Test on TestFlight** with beta testers
6. **Submit IPA to App Store** review

For additional help, see:
- [Capacitor iOS Documentation](https://capacitorjs.com/docs/ios)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
