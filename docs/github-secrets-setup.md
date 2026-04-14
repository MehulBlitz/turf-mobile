# GitHub Secrets Setup for iOS & Android CI/CD

This guide walks through adding necessary secrets to GitHub for automated builds.

## Quick Setup (5 minutes)

### Step 1: Go to Repository Secrets
1. Open: https://github.com/MehulBlitz/turf-mobile/settings/secrets/actions
2. Click **"New repository secret"** button

### Step 2: Add Required Secrets (Minimal - For Unsigned Builds)

Add these 2 secrets first (required for both iOS and Android):

#### Secret 1: VITE_SUPABASE_URL
| Field | Value |
|-------|-------|
| Name | `VITE_SUPABASE_URL` |
| Secret | Your Supabase project URL (e.g., `https://abc123.supabase.co`) |

**Where to find:** Supabase Dashboard → Settings → API → Project URL

#### Secret 2: VITE_SUPABASE_ANON_KEY
| Field | Value |
|-------|-------|
| Name | `VITE_SUPABASE_ANON_KEY` |
| Secret | Your Supabase anonymous key (starts with `eyJ...`) |

**Where to find:** Supabase Dashboard → Settings → API → `anon` key

✅ **With just these 2 secrets, you'll get:**
- ✓ Automatic debug APK builds on Android (via `android-build.yml`)
- ✓ Automatic debug IPA builds on iOS (via `ios-build.yml`)
- ✓ Firebase Hosting deployments

---

## Step 3: Add Code Signing Secrets (Optional - For App Store/PlayStore)

### iOS Code Signing (For TestFlight & App Store)

Add these 5 additional secrets for iOS releases:

#### Secret 3: IOS_SIGNING_CERTIFICATE_BASE64
```bash
# On macOS, create base64 certificate:
base64 -i signing-certificate.p12 | pbcopy
# Then paste into GitHub Secret
```

#### Secret 4: CERTIFICATE_PASSWORD
Password for your .p12 certificate file

#### Secret 5: IOS_PROVISIONING_PROFILE_BASE64
```bash
# On macOS:
base64 -i profile.mobileprovision | pbcopy
```

#### Secret 6: KEYCHAIN_PASSWORD
Any strong password for temporary CI keychain (e.g., `MySecure123!`)

#### Secret 7: APPLE_TEAM_ID
Your 10-digit Apple Team ID
- Find at: https://developer.apple.com/account/ → Membership

#### Secret 8: APPLE_API_KEY_ID (for TestFlight uploads)
App Store Connect API Key ID
- Generate at: App Store Connect → Users and Access → API Keys

#### Secret 9: APPLE_API_ISSUER_ID (for TestFlight uploads)
App Store Connect Issuer ID (associated with your API Key)

### Android Code Signing (For PlayStore)

#### Secret 10: ANDROID_KEYSTORE_BASE64
```bash
# On any OS:
base64 -i keystore.jks | pbcopy
```

#### Secret 11: ANDROID_KEYSTORE_PASSWORD
Password for keystore file

#### Secret 12: ANDROID_KEY_ALIAS
Key alias name from your keystore

#### Secret 13: ANDROID_KEY_PASSWORD
Password for the specific key in keystore

---

## Verify Secrets Are Added

After adding secrets:

1. Go to https://github.com/MehulBlitz/turf-mobile/settings/secrets/actions
2. You should see your secrets listed (values are hidden for security)
3. Click on each to view the masked value

## Test the Builds

### Trigger iOS Debug Build
1. Go to: **Actions** tab → **iOS Build** workflow
2. Click **"Run workflow"**
3. Leave build type as "debug" (default)
4. Click **"Run workflow"**
5. Wait ~15 minutes for build to complete
6. Download IPA from workflow artifacts

### Trigger Android Debug Build
1. Go to: **Actions** tab → **Android Build** workflow
2. Click **"Run workflow"**
3. Wait ~10 minutes for build to complete
4. Download APK from workflow artifacts

## Troubleshooting

### "Secret not found" error in workflow
- Verify secret name matches exactly (case-sensitive)
- Secret must be added BEFORE the workflow triggered
- Workflows use secrets at runtime, not at parse time

### Base64 encoding issues
- For macOS: Use `base64 -i file` (add `-i` flag)
- Verify encoding: Encoded value should be 1/3 longer than original
- Don't include newlines when copying

### Certificate errors
- Ensure certificate is in .p12 format (not .cer or .key)
- Password must be correct for the .p12 file
- Certificate must be valid (not expired)

### Provisioning profile errors
- Ensure .mobileprovision file is valid
- Profile must match Bundle ID: `com.turfbooking.app`
- Profile must be for distribution (not development)

---

## Secrets Reference

| Secret Name | Required | Platform | Purpose |
|------------|----------|----------|---------|
| `VITE_SUPABASE_URL` | **YES** | Both | Build configuration |
| `VITE_SUPABASE_ANON_KEY` | **YES** | Both | Build configuration |
| `IOS_SIGNING_CERTIFICATE_BASE64` | No | iOS | Code signing cert |
| `CERTIFICATE_PASSWORD` | No | iOS | Cert password |
| `IOS_PROVISIONING_PROFILE_BASE64` | No | iOS | Provisioning profile |
| `KEYCHAIN_PASSWORD` | No | iOS | CI keychain password |
| `APPLE_TEAM_ID` | No | iOS | Apple Team identifier |
| `APPLE_API_KEY_ID` | No | iOS | TestFlight API key |
| `APPLE_API_ISSUER_ID` | No | iOS | TestFlight issuer |
| `ANDROID_KEYSTORE_BASE64` | No | Android | Keystore file |
| `ANDROID_KEYSTORE_PASSWORD` | No | Android | Keystore password |
| `ANDROID_KEY_ALIAS` | No | Android | Key alias |
| `ANDROID_KEY_PASSWORD` | No | Android | Key password |

---

## Security Best Practices

1. **Never commit secrets** to git (they're in `.gitignore` ✓)
2. **Use strong passwords** for keystore/certificate
3. **Rotate secrets periodically** (quarterly recommended)
4. **Limit access** - only repo owners can manage secrets
5. **Audit usage** - check Actions logs for secret access
6. **Use GitHub's environment protection** for prod secrets (advanced)

For more info: https://docs.github.com/en/actions/security-guides/encrypted-secrets
