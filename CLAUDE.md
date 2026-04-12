# Turf Mobile - Capacitor Android Implementation Context

## Project Status

**Current Phase**: Prerequisites Setup (Android SDK Installation)
**Overall Progress**: ~15% - Capacitor setup complete, waiting for Android SDK

### What's Done ✅
- Capacitor framework installed and configured
- Android project structure created
- React app builds successfully to `dist/`
- All plugins installed (Camera, Geolocation, Network, App)
- Permissions configured in AndroidManifest.xml
- Helper functions created in `src/lib/capacitorPlugins.js`
- npm scripts added for easy building
- Comprehensive documentation created

### What's Blocked ⚠️
- Android SDK + Java JDK not installed on system
- Need to set ANDROID_HOME environment variable
- Need to add %ANDROID_HOME%\platform-tools to PATH
- Build APK cannot proceed until above is done

---

## Implementation Plan - 4 Phases

See: `C:\Users\DeLL\.claude\plans\ticklish-crafting-biscuit.md`

### PHASE 1: Build Verification & Testing (30-45 min)
**Status**: PENDING - Blocked by SDK setup
- Verify Gradle build works
- Build debug APK
- Test on emulator/device
- Verify web assets load and Supabase connection works

### PHASE 2: Android Customization & Branding (45-60 min)
**Status**: PENDING
- Update app strings in `android/app/src/main/res/values/strings.xml`
- Update theme colors in `android/app/src/main/res/values/styles.xml` and create `colors.xml`
- Replace app icons for all densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Update splash screen (optional)
- Configure version in `android/app/build.gradle`

### PHASE 3: Native Feature Integration (60-90 min)
**Status**: PENDING
- Camera integration in `src/components/OwnerDashboard.jsx`
  - Use `capturePhoto()` and `pickPhotoFromGallery()` from `src/lib/capacitorPlugins.js`
- Enhanced geolocation in `src/App.jsx`
  - Replace browser geolocation with `getCurrentLocation()` from capacitorPlugins
- Network status monitoring
  - Add `checkNetworkStatus()` and `onNetworkStatusChange()` to App
- App lifecycle handling (optional)
  - Add `onAppResume()` and `onAppPause()` listeners

### PHASE 4: Optimization & Polish (60-120 min)
**Status**: PENDING
- Install and configure @capacitor/status-bar plugin
- Code-split App.jsx (1,379 lines → lazy-loaded routes)
  - Extract AuthScreen, OwnerDashboard, AdminDashboard, CustomerProfilePage
- Optimize Vite build configuration
- Build and verify release APK size
- Final testing and verification

---

## Prerequisites Checklist

Before building APK, complete these on your machine:

### Before Next Session:
- [ ] **Java JDK 17+** installed
  - Download: https://www.oracle.com/java/technologies/javase-jdk17-downloads.html
  - Or: Get via Android Studio (easier)
  - Verify: `java -version` should show 17+

- [ ] **Android SDK** installed via Android Studio
  - Download: https://developer.android.com/studio
  - Run installer, select "Standard" setup
  - Takes ~10-30 minutes depending on internet

- [ ] **Environment Variables Set**
  - Windows: Set `ANDROID_HOME` = `C:\Users\YourName\AppData\Local\Android\Sdk`
  - Add to PATH: `%ANDROID_HOME%\platform-tools`
  - Add to PATH: `%ANDROID_HOME%\tools`
  - Restart terminal completely after setting

- [ ] **Verification** (in NEW terminal):
  ```bash
  java -version
  adb --version
  echo %ANDROID_HOME%
  ```
  All three should show output (no "command not found")

---

## Remaining Todos (In Order)

### Phase 1: Build Verification
1. [ ] Verify Android SDK installed correctly
2. [ ] Run `npm run android:build` successfully
3. [ ] Build debug APK: `npm run android:debug`
4. [ ] Verify APK created at: `android/app/build/outputs/apk/debug/app-debug.apk`
5. [ ] Test on emulator or device: `npm run android:install` + `npm run android:run`
6. [ ] Verify app launches without crashes
7. [ ] Test Supabase authentication (login/signup)

### Phase 2: Customization & Branding
8. [ ] Update `android/app/src/main/res/values/strings.xml` with app name
9. [ ] Create `android/app/src/main/res/values/colors.xml` with theme colors
10. [ ] Update `android/app/src/main/res/values/styles.xml` to use colors
11. [ ] Replace app icons:
    - [ ] ic_launcher.png (all mipmap folders)
    - [ ] ic_launcher_round.png (all mipmap folders)
    - [ ] ic_launcher_foreground.xml
    - [ ] ic_launcher_background.xml
12. [ ] Update `android/app/build.gradle` version info (versionCode, versionName)
13. [ ] Rebuild: `npm run android:build && npm run android:debug`
14. [ ] Verify icons and colors display correctly

### Phase 3: Native Features
15. [ ] Add camera integration to `src/components/OwnerDashboard.jsx`
    - Replace file input with camera buttons
    - Use `capturePhoto()` and `pickPhotoFromGallery()`
16. [ ] Enhance geolocation in `src/App.jsx`
    - Replace browser geolocation with `getCurrentLocation()`
17. [ ] Add network status monitoring to App
    - Use `checkNetworkStatus()` and `onNetworkStatusChange()`
    - Show offline/online badge
18. [ ] Add app lifecycle handlers (optional)
    - Use `onAppResume()` and `onAppPause()`
19. [ ] Test each feature: camera, location, network status
20. [ ] Rebuild and verify: `npm run android:build && npm run android:debug`

### Phase 4: Optimization & Polish
21. [ ] Install StatusBar plugin: `npm install @capacitor/status-bar --legacy-peer-deps`
22. [ ] Add StatusBar configuration to `src/App.jsx`
    - Set color to emerald green (#10b981)
23. [ ] Code-split `src/App.jsx`:
    - [ ] Extract AuthScreen to lazy component
    - [ ] Extract OwnerDashboard to lazy component
    - [ ] Extract AdminDashboard to lazy component
    - [ ] Extract CustomerProfilePage to lazy component
    - [ ] Wrap with Suspense + LoadingSkeletons
24. [ ] Optimize Vite build in `vite.config.js`:
    - [ ] Add rollup chunk optimization
    - [ ] Enable compression
    - [ ] Configure minification
25. [ ] Rebuild: `npm run android:build && npm run android:release`
26. [ ] Verify bundle sizes:
    - [ ] Debug APK < 80 MB
    - [ ] Release APK < 60 MB
27. [ ] Final testing on device/emulator
28. [ ] Verify status bar color and app performance

---

## Key File Locations

**React Components**:
- `src/App.jsx` - Main app, needs geolocation + network + lifecycle + status bar
- `src/components/OwnerDashboard.jsx` - Needs camera integration
- `src/components/AuthScreen.jsx` - Can be lazy-loaded (Phase 4)
- `src/components/AdminDashboard.jsx` - Can be lazy-loaded (Phase 4)
- `src/components/CustomerProfilePage.jsx` - Can be lazy-loaded (Phase 4)

**Helper Functions**:
- `src/lib/capacitorPlugins.js` - All Capacitor plugin helpers (already created)
- `src/lib/supabase.js` - Supabase client

**Android Files**:
- `android/app/src/main/AndroidManifest.xml` - Permissions (already configured)
- `android/app/src/main/res/values/strings.xml` - App strings
- `android/app/src/main/res/values/styles.xml` - Theme styles
- `android/app/src/main/res/values/colors.xml` - Color definitions (need to create)
- `android/app/src/main/res/mipmap-*/*.png` - App icons (need to replace)
- `android/app/build.gradle` - Build configuration

**Configuration**:
- `capacitor.config.json` - Capacitor config (already configured)
- `vite.config.js` - Vite build config (needs optimization)
- `package.json` - npm scripts (already added)

---

## Quick Build Commands

```bash
# Development workflow
npm run android:build      # Always do this first! Builds React + syncs Android
npm run android:debug      # Build debug APK
npm run android:release    # Build release APK
npm run android:bundle     # Build for Play Store

# Testing
npm run android:install    # Install APK on device
npm run android:run        # Run on connected device/emulator
npm run android:open       # Open Android Studio

# Syncing
npm run android:sync       # Update Android with React changes
npm run android:copy       # Copy web assets only
```

---

## Important Notes

1. **Always start with `npm run android:build`** - This builds React and syncs to Android
2. **Environment variables critical** - Without ANDROID_HOME set, Gradle won't find SDK
3. **Terminal restart required** - After setting environment variables, close and reopen terminal
4. **Test on real device** - Emulator can be slow; physical device gives better performance feedback
5. **Never commit signing keys** - Keep `android/keystore` files out of git
6. **Keep debug + release separate** - Debug for testing, release for Play Store
7. **Increment versionCode** - Each release must have higher versionCode

---

## Success Criteria (Final)

✅ APK builds without errors
✅ App launches on Android device/emulator
✅ All tab navigation works
✅ Supabase authentication working
✅ Camera can take photos
✅ Location detection works
✅ Network status shows
✅ App icons display correctly
✅ Theme colors match React app
✅ Status bar styled (emerald green)
✅ Debug APK < 80 MB
✅ Release APK < 60 MB
✅ App ready for Google Play Store

---

## How to Resume

When coming back to work:

1. **Verify prerequisites** (if first time):
   ```bash
   java -version
   adb --version
   echo %ANDROID_HOME%
   ```

2. **Sync with latest Capacitor changes**:
   ```bash
   npx cap sync android
   ```

3. **Start building**:
   ```bash
   npm run android:build
   npm run android:debug
   ```

4. **Check current todos** - See "Remaining Todos" section above

---

## Useful Links

- **Implementation Plan**: `C:\Users\DeLL\.claude\plans\ticklish-crafting-biscuit.md`
- **Setup Guide**: `SETUP_ANDROID_SDK.md`
- **Quick Start**: `ANDROID_QUICKSTART.md`
- **Detailed Setup**: `ANDROID_SETUP.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Docs**: https://developer.android.com/docs
- **Google Play Console**: https://play.google.com/console

---

## Current Directory Structure

```
c:\turf-mobile\
├── android/                    # Android native project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml     ✅ Permissions configured
│   │   │   ├── res/
│   │   │   │   ├── values/strings.xml  ⏳ Need to update
│   │   │   │   ├── values/styles.xml   ⏳ Need to update
│   │   │   │   ├── values/colors.xml   ⏳ Need to create
│   │   │   │   ├── mipmap-*/           ⏳ Need new icons
│   │   │   │   └── drawable-*/
│   │   │   └── assets/public/          # React build files
│   │   └── build.gradle                ⏳ Need to update versions
│   └── ...
│
├── src/                        # React source code
│   ├── components/
│   │   ├── App.jsx             ⏳ Needs geolocation + network + lifecycle + statusbar + code-split
│   │   ├── OwnerDashboard.jsx  ⏳ Needs camera integration
│   │   ├── AuthScreen.jsx      ⏳ Can be lazy-loaded
│   │   ├── AdminDashboard.jsx  ⏳ Can be lazy-loaded
│   │   ├── CustomerProfilePage.jsx ⏳ Can be lazy-loaded
│   │   └── ...
│   ├── lib/
│   │   ├── capacitorPlugins.js ✅ Already created with helpers
│   │   └── supabase.js         ✅
│   └── ...
│
├── dist/                       ✅ React build output
├── node_modules/               ✅
│
├── capacitor.config.json       ✅ Configured
├── vite.config.js              ⏳ Needs optimization in Phase 4
├── package.json                ✅ npm scripts added
│
├── SETUP_ANDROID_SDK.md        ✅ Step-by-step SDK installation
├── ANDROID_QUICKSTART.md       ✅ Quick reference
├── ANDROID_SETUP.md            ✅ Detailed setup
├── IMPLEMENTATION_SUMMARY.md   ✅ Complete overview
└── CLAUDE.md                   ✅ This file
```

---

**Status**: Ready to proceed once Android SDK + Java JDK are installed and ANDROID_HOME is set.

**Next Session**: Verify SDK installation, then execute Phase 1-4 implementation.
