# Turf Booking - Android App Setup Guide

## Prerequisites

Before building the Android app, ensure you have the following installed:

### Fresh laptop setup checklist
- Install Node.js and npm
- Install Java JDK 17+ (or let Android Studio install it)
- Install Android Studio
- Install Android SDK components through Android Studio
- Set Windows environment variables for SDK and JDK
- Run `npm install` in the repo
- Build the web app and sync Capacitor before Android builds

### 1. **Java Development Kit (JDK) 17+**
   - Download from: https://www.oracle.com/java/technologies/javase-jdk17-downloads.html
   - Or install via Android Studio
   - Set JAVA_HOME environment variable

### 2. **Android SDK**
   - Install via Android Studio (Recommended)
   - Download from: https://developer.android.com/studio
   - Required SDK components:
     - Android SDK Platform (latest)
     - Android SDK Tools
     - Android Emulator

### 3. **Node.js & npm**
   - Install the latest stable Node.js version
   - Run `npm install` in the project root after cloning the repo

### 4. **Gradle**
   - Automatically included via Android SDK or can be installed separately

## Initial Setup

### Step 1: Verify Installation
```bash
# Check Java
java -version

# Check Android SDK
echo %ANDROID_HOME%  # Should show your Android SDK path
```

### Step 2: Set Environment Variables (Windows)

Add these to your system environment variables:
- `ANDROID_HOME`: `C:\Users\YourUsername\AppData\Local\Android\Sdk`
- `JAVA_HOME`: `C:\Program Files\Java\jdk-17`
- Add to PATH: `%ANDROID_HOME%\platform-tools` and `%ANDROID_HOME%\tools`

### Step 3: Accept Android Licenses
```bash
cd android
./gradlew --version  # This will prompt you to accept licenses

# Or accept all licenses with:
yes | sdkmanager --licenses
```

## Building the App

### Development Workflow

```bash
# 1. Make changes to your React code
# 2. Build the React app
npm run build

# 3. Sync changes with Android
npx cap sync android

# 4. Build Android APK for testing
cd android
./gradlew build

# 5. Build release APK
./gradlew assembleRelease
```

### Build Commands

#### For Development/Testing
```bash
# Build debug APK
cd android
./gradlew assembleDebug

# This creates: android/app/build/outputs/apk/debug/app-debug.apk
```

#### For Release (Google Play Store)
```bash
# Build release APK (unsigned)
cd android
./gradlew assembleRelease

# Build release bundle for Play Store
cd android
./gradlew bundleRelease
```

## Running on Android

### Option 1: Android Studio (Recommended)

1. Open Android Studio
2. File → Open → Select `android` folder in your project
3. Wait for Gradle sync to complete
4. Connect device or start emulator
5. Click "Run" button or press Shift+F10

### Option 2: Command Line

#### Using Emulator
```bash
# List available emulators
emulator -list-avds

# Start an emulator
emulator -avd Pixel_5_API_33

# Install and run debug APK
cd android
./gradlew installDebug
./gradlew run
```

#### Using Physical Device
```bash
# 1. Enable USB Debugging on device
#    Settings → About Phone → Tap Build Number 7 times
#    Settings → Developer Options → Enable USB Debugging

# 2. Connect device via USB

# 3. Install APK
cd android
./gradlew installDebug

# 4. Open app on device
```

## Troubleshooting

### "ANDROID_HOME not set"
- Set ANDROID_HOME environment variable to your Android SDK path
- On Windows: Add to System Properties → Environment Variables

### "Gradle build failed"
```bash
# Clear Gradle cache
cd android
./gradlew clean

# Rebuild
./gradlew build
```

### "Method not found" errors
- Ensure your Capacitor plugins are up to date
- Run: `npx cap sync android`

### "Signature mismatch" errors
- Usually occurs when changing JDK version
- Solution:
  ```bash
  cd android
  ./gradlew clean
  ./gradlew build
  ```

### Emulator issues
- Ensure virtualization is enabled in BIOS
- Use Android Studio AVD Manager for easier setup
- Try: `emulator -avd <name> -wipe-data`

## File Structure

```
turf-mobile/
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml          # Permissions & activities
│   │   │   ├── java/com/turfbooking/app/   # Java code
│   │   │   ├── assets/public/              # Built React app
│   │   │   └── res/                        # Resources (icons, strings)
│   │   └── build.gradle
│   └── build.gradle
├── dist/                    # Built React app (source for APK)
├── src/                     # React source code
└── capacitor.config.json    # Capacitor configuration
```

## Important Files to Modify

### 1. `android/app/src/main/res/values/strings.xml`
Update app name and labels:
```xml
<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">Turf Booking</string>
    <string name="title_activity_main">Turf Booking</string>
</resources>
```

### 2. `android/app/src/main/res/mipmap/`
Add app icons for different screen sizes (xxhdpi, xhdpi, hdpi, mdpi)

### 3. `android/app/build.gradle`
Update app version and package name:
```gradle
android {
    compileSdk 34

    defaultConfig {
        applicationId "com.turfbooking.app"
        minSdk 23
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
}
```

## Next Steps for Production

1. **Create Signing Key** for release build
   ```bash
   cd android
   keytool -genkey -v -keystore my-key.jks -keyalg RSA -keysize 2048 -validity 10000
   ```

2. **Sign APK**
   ```bash
   cd android/app/build/outputs/apk/release/
   jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ../../../../../../my-key.jks app-release-unsigned.apk my-key-alias
   ```

3. **Prepare for Play Store**
   - Create Google Play Developer account ($25 one-time fee)
   - Build bundle: `./gradlew bundleRelease`
   - Upload bundle to Google Play Console
   - Fill in store listing details
   - Submit for review

## Common Capacitor Commands

```bash
# Update web assets from dist/
npx cap sync android

# Specific platform sync
npx cap copy android

# Open Android Studio
npx cap open android

# Run on connected device/emulator
npx cap run android

# Build release
npx cap build android --prod
```

## Performance Tips

1. **Enable ProGuard/R8 in release builds** (enabled by default)
2. **Use dynamic imports** for code splitting
3. **Optimize assets** (images, videos)
4. **Lazy load components** in React
5. **Use Capacitor plugins** instead of web APIs when available

## Security Notes

- Never commit signing keys to version control
- Store API keys in environment variables
- Use HTTPS for all external requests
- Validate user input
- Keep dependencies updated

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/docs)
- [Google Play Console](https://play.google.com/console)
- [Android Studio Setup](https://developer.android.com/studio/install)

---

## Quick Reference Commands

```bash
# Development cycle
npm run build                  # Build React app
npx cap sync android          # Sync to Android
cd android && ./gradlew build # Build APK

# Testing
npx cap open android          # Open in Android Studio
./gradlew assembleDebug       # Build debug APK
./gradlew installDebug        # Install on device

# Release
./gradlew assembleRelease     # Build release APK
./gradlew bundleRelease       # Build Play Store bundle
```
