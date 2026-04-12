# Quick Start - Building Android App

## What Was Done

Your React JS + Supabase turf booking app has been configured for Android using **Capacitor**. Here's what was set up:

✅ **Capacitor Framework** - Bridges React web app to native Android
✅ **Android Platform** - Added full Android project structure
✅ **Required Plugins** - Camera, Geolocation, Network, App
✅ **Permissions** - Camera, Location, Storage, Internet configured
✅ **npm Scripts** - Easy-to-use build commands added

## Prerequisites to Install

Before building, you need:

1. **Java JDK 17+** - Download from oracle.com or install via Android Studio
2. **Android SDK** - Install Android Studio from developer.android.com
3. **Set Environment Variables**:
   - `ANDROID_HOME` = Your Android SDK path (e.g., `C:\Users\YourName\AppData\Local\Android\Sdk`)
   - Add `%ANDROID_HOME%\platform-tools` to PATH

## Build Your App (3 Simple Steps)

### Step 1: Prepare the build
```bash
npm run android:build
```
This command:
- Builds your React app into `dist/` folder
- Syncs it to the Android project
- Ready for APK creation

### Step 2: Build APK (choose one)

**For Testing/Development:**
```bash
npm run android:debug
# Creates: android/app/build/outputs/apk/debug/app-debug.apk
```

**For Release/Google Play Store:**
```bash
npm run android:release
# Creates: android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Step 3: Run on Device/Emulator (Optional)

**Using Android Studio (Easiest):**
1. Run: `npm run android:open`
2. Click the green "Run" button in Android Studio
3. Select your device or emulator

**Using Command Line:**
```bash
npm run android:install  # Install APK
npm run android:run      # Run app on connected device
```

## Available npm Commands

```bash
npm run android:build      # Build React + sync Android (always do this first!)
npm run android:open       # Open project in Android Studio
npm run android:sync       # Update Android with React changes
npm run android:debug      # Build debug APK
npm run android:release    # Build release APK
npm run android:bundle     # Build for Play Store
npm run android:install    # Install current APK
npm run android:run        # Run on device/emulator
```

## Development Workflow

**When you make changes to your React code:**

1. Make changes in `src/` folder
2. Run: `npm run android:build`
3. Build APK: `npm run android:debug`
4. Test on device/emulator
5. Repeat!

## Using Capacitor Features in Your App

Your app now has access to native Android features:

### Camera
```javascript
import { Camera, CameraResultType } from '@capacitor/camera';

const photo = await Camera.getPhoto({
  quality: 90,
  allowEditing: true,
  resultType: CameraResultType.Uri
});
```

### Geolocation
```javascript
import { Geolocation } from '@capacitor/geolocation';

const coordinates = await Geolocation.getCurrentPosition();
console.log('Latitude:', coordinates.coords.latitude);
```

### Network Status
```javascript
import { Network } from '@capacitor/network';

const status = await Network.getStatus();
console.log('Connected:', status.connected);
```

## Troubleshooting

### "gradle: command not found"
- Gradle runs from within `android/` folder
- Use `npm run` commands instead

### "ANDROID_HOME not set"
- Set in Windows Environment Variables
- Restart terminal after setting

### "Build fails during sync"
```bash
cd android && ./gradlew clean
npm run android:build
```

### "APK won't install"
- Uninstall old version first: `adb uninstall com.turfbooking.app`
- Then install debug version: `npm run android:install`

## Next Steps

1. ✅ Install prerequisites (Java, Android SDK)
2. ✅ Run `npm run android:build`
3. ✅ Test with `npm run android:debug`
4. ✅ Customize app icons in `android/app/src/main/res/mipmap/`
5. ✅ Update app name in `android/app/src/main/res/values/strings.xml`
6. ✅ When ready: `npm run android:bundle` for Play Store

See **ANDROID_SETUP.md** for detailed setup instructions and troubleshooting.

---

**Your Capacitor Android app is ready to build! 🚀**
