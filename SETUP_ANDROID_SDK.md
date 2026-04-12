# Android SDK Setup Guide - Required Before Building

Your Capacitor setup is ready, but we need to install **Android SDK and Java JDK** before building the APK. Follow these steps:

## Step 1: Install Java JDK 17+

### Option A: Install via Android Studio (Recommended - Includes everything)
1. Download Android Studio: https://developer.android.com/studio
2. Run the installer
3. During setup, select "Standard" installation
4. Android Studio will install JDK automatically

### Option B: Install Java separately
1. Download Java 17+ from: https://www.oracle.com/java/technologies/javase-jdk17-downloads.html
   - Or use OpenJDK from: https://jdk.java.net/
2. Install to `C:\Program Files\Java\jdk-17` (or newer)

---

## Step 2: Install Android SDK (via Android Studio)

1. **Download Android Studio** from: https://developer.android.com/studio
2. **Run installer** and follow the setup wizard
3. **Select "Standard" installation** - this installs:
   - Android SDK
   - Android SDK Platform Tools
   - Android Emulator
   - JDK (optional if you installed separately)

4. **Wait** for components to download (~5-10 GB)

---

## Step 3: Set Environment Variables

**CRITICAL: Without this, Gradle won't find the SDK**

### Windows 10/11:
1. **Open Environment Variables**:
   - Right-click "This PC" or "My Computer" → Properties
   - Click "Advanced system settings"
   - Click "Environment variables..." button
   - Click "New..." (under System variables)

2. **Add ANDROID_HOME**:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\YourName\AppData\Local\Android\Sdk`
   - (Replace `YourName` with your Windows username!)
   - Click OK

3. **Add to PATH**:
   - Click on existing "Path" variable → Edit
   - Click "New"
   - Add: `%ANDROID_HOME%\platform-tools`
   - Click "New"
   - Add: `%ANDROID_HOME%\tools`
   - Click OK → OK → OK

4. **RESTART your terminal/PowerShell/CMD** (critical!)
   - Close and reopen terminal completely
   - Close Visual Studio Code and reopen if using integrated terminal

---

## Step 4: Verify Installation

Run these commands in a **NEW terminal window**:

```bash
# Check Java
java -version
# Should show: openjdk version "17..." or "21..."

# Check Android SDK
echo %ANDROID_HOME%
# Should show: C:\Users\YourName\AppData\Local\Android\Sdk

# Check ADB (Android Debug Bridge)
adb version
# Should show version info

# Check Gradle
cd /c/turf-mobile/android
./gradlew --version
# Should show gradle version
```

If any command shows "not found" or error:
- ANDROID_HOME not set correctly
- Terminal not restarted after setting variables
- Paths have typos

---

## Step 5: Accept Android Licenses

Android SDK requires you to accept licenses:

```bash
cd /c/turf-mobile/android
./gradlew build
# This will prompt you during the build to accept licenses
```

Or accept all licenses upfront:
```bash
yes | sdkmanager --licenses
```

---

## Step 6: (Optional) Create Android Emulator

To test without a physical device:

1. **Open Android Studio**
2. **Click "Device Manager"** (left sidebar)
3. **Click "Create device"**
4. **Select device type**: Pixel 5 (recommended)
5. **Select Android version**: API 33 or higher
6. **Click "Finish"** and wait for download

To start emulator:
```bash
emulator -avd Pixel_5_API_33
```

---

## Now You Can Build! 🚀

Once you've completed all steps above, come back and run:

```bash
# Build the APK
npm run android:debug

# Or open Android Studio and click Run
npm run android:open
```

---

## Troubleshooting

### "Command not found: java"
- Java not installed or not in PATH
- Install Java JDK 17+ and add to PATH
- Restart terminal

### "ANDROID_HOME not set"
- Set the environment variable (Step 3)
- Restart terminal completely
- Verify with: `echo %ANDROID_HOME%`

### "SDK location not found"
- ANDROID_HOME not pointing to correct location
- Check: `C:\Users\YourName\AppData\Local\Android\Sdk` exists
- Run: `adb --version` to confirm SDK is installed

### "License agreements not accepted"
- Run: `yes | sdkmanager --licenses`
- Gradle will also prompt you on build

### "Gradle daemon could not connect"
- Run: `cd android && ./gradlew clean`
- Try build again

### "Emulator won't start"
- Ensure Hyper-V or virtualization is enabled in BIOS
- Try deleting emulator and creating new one in Device Manager

---

## After Setup Verification

Once everything is installed and verified, you'll have both prerequisites ready:

✅ Java JDK installed
✅ Android SDK installed
✅ ANDROID_HOME set
✅ PATH updated
✅ Terminal restarted

Then you can proceed with:
```bash
npm run android:debug    # Build APK
npm run android:run      # Run on emulator/device
npm run android:open     # Open in Android Studio
```

---

## Estimated Time
- Java + Android Studio download/install: 20-30 minutes
- Environment variables setup: 5 minutes
- Verification: 5 minutes
- **Total: ~30-40 minutes on first setup**

---

## Help References
- Android Studio Setup: https://developer.android.com/studio/install
- Android SDK Setup: https://developer.android.com/about/versions/14/setup-sdk
- Environment Variables: https://www.java.com/en/download/help/path.html
- Capacitor Setup: https://capacitorjs.com/docs/getting-started

---

**⚠️ IMPORTANT: You MUST complete this setup before we can build the APK. Let me know once you have:**
1. Java JDK 17+ installed
2. Android SDK installed (via Android Studio)
3. ANDROID_HOME environment variable set
4. Terminal restarted

Then we can continue with `npm run android:debug`!
