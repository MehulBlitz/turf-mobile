# TurfBook Android Release Information

## Release APK Details

**File Location**: `android/app/build/outputs/apk/release/app-release.apk`
**File Size**: 7.0 MB
**Status**: ✅ Signed and Ready for Google Play Store

---

## Signing Key Information

**Keystore File**: `android/app/turf-booking.keystore`
**Key Alias**: `turfbooking`
**Store Password**: `turfbook123`
**Key Password**: `turfbook123`
**Validity**: 10,000 days (27+ years)
**Algorithm**: RSA 2048-bit

⚠️ **IMPORTANT**: Keep the keystore file and passwords secure! You'll need them for all future app updates.

---

## Features Implemented

### ✅ Notifications
- **Local Notifications**: Send push-like notifications to users
- **Booking Confirmations**: Automatic notifications when booking is confirmed
- **Notification Center**: Click bell icon to view all notifications
- **Toast Notifications**: Quick feedback for actions (success, error, warning)

### ✅ Native Android Integration
- **StatusBar**: Emerald green color matching app theme
- **Network Status**: Real-time WiFi/offline indicator
- **Geolocation**: Native GPS with browser fallback
- **Camera**: Photo capture and gallery access
- **Toast**: Native toast notifications for user feedback

### 🔄 In Progress
- **Widgets**: Quick-access shortcuts

### ✅ Booking Ticket Enhancements (v1.0.3)
- **QR Code Check-in**: Dynamic QR codes for each booking with scannable data
- **Share to Apps**: One-tap sharing to WhatsApp, Messenger, SMS, Email, etc.
- **Download as PDF**: Save tickets as printable PDF documents
- **Copy Booking ID**: Quick copy-to-clipboard of booking reference

### ✅ Calendar Marking
- **Bookings Calendar**: Full calendar view showing all marked bookings
- **Date Selection**: Click on any date to see all bookings for that day
- **Persistent Storage**: Bookings saved to device storage (survive app restart)
- **Calendar Stats**: Shows total bookings, monthly bookings, and total spent
- **Delete Bookings**: Remove bookings from calendar with one tap
- **Auto-Mark**: Bookings automatically marked when confirmed

### 📱 Responsive UI
- Mobile-optimized for all screen sizes
- Fixed viewport issues
- Scrollable modals and dropdowns
- Emerald green theme (#10b981)

---

## How to Use the Release APK

### Option 1: Direct Installation (Testing)
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: Google Play Store (Production)
1. Go to [Google Play Console](https://play.google.com/console)
2. Create/select your app
3. Upload the APK to Internal Testing/Beta/Production
4. Add app details, screenshots, and description
5. Review and publish

### Option 3: Alternative App Stores
- [Amazon Appstore](https://developer.amazon.com/appstore)
- [Samsung Galaxy Store](https://store.samsungapps.com/)
- [GitHub Releases](https://github.com/)

---

## Build Commands

```bash
# Build debug APK (for testing)
npm run android:build && npm run android:debug

# Build signed release APK (for distribution)
cd android && ./gradlew clean assembleRelease

# Install APK on device
adb install android/app/build/outputs/apk/release/app-release.apk

# View signing certificate details
keytool -list -v -keystore android/app/turf-booking.keystore -storepass turfbook123
```

---

## Version Information

**Current Version**: 1.0.3
**Build Number**: 4
**Package Name**: `com.turfbooking.app`

To increment for future releases:
- Edit `android/app/build.gradle`:
  - `versionCode` = increment by 1
  - `versionName` = "1.1.0", "1.2.0", etc.

---

## Pre-Launch Checklist

Before publishing to Google Play Store:

- [ ] Test all features on real device
- [ ] Verify notifications work
- [ ] Test camera and gallery
- [ ] Check location functionality
- [ ] Verify Supabase connectivity
- [ ] Check APK size (currently 6.8 MB)
- [ ] Review app screenshots
- [ ] Write app description
- [ ] Set privacy policy URL
- [ ] Configure app ratings
- [ ] Set target age range
- [ ] Configure app permissions explanation

---

## Troubleshooting

### Notifications Not Showing
- Grant app notification permission in device settings
- Check Settings → Apps → TurfBook → Permissions → Notifications

### Camera Not Working
- Grant app camera permission
- Check Settings → Apps → TurfBook → Permissions → Camera

### Location Not Detecting
- Enable location services on device
- Grant location permission to app
- Check Settings → Apps → TurfBook → Permissions → Location

### App Crashes
- Check logcat: `adb logcat | grep TurfBook`
- Ensure Supabase URL and key are correct
- Verify internet connection

---

## Support & Resources

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Documentation**: https://developer.android.com/docs
- **Google Play Console**: https://play.google.com/console
- **Supabase Documentation**: https://supabase.com/docs

---

**Built with**: React 19 + Capacitor 8 + Supabase + Tailwind CSS
**Last Updated**: March 18, 2026
**Status**: Ready for Production ✅
