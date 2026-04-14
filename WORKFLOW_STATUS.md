# Workflow Status - April 14, 2026

## Recent Actions
✅ Applied `.gitattributes` for LF line ending enforcement across all YAML workflows
✅ Verified iOS platform is initialized with Capacitor
✅ Verified workflow YAML syntax is valid

## Workflows
- **ios-build.yml** - Automatically triggers on push to main, builds Debug and Release IPAs
- **ios-release.yml** - Manual trigger available, builds App Store Release IPA
- **android-build.yml** - Automatically triggers on push to main
- **ci.yml** - Lint and build validation
- **firebase-deploy.yml** - Firebase Hosting deployment

## Prerequisites for Full Workflow Success
Ensure these GitHub Secrets are configured in Settings → Secrets and variables → Actions:

### Required:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Optional (for iOS builds):
- `APPLE_TEAM_ID`
- `IOS_PROVISIONING_PROFILE_BASE64`
- `IOS_SIGNING_CERTIFICATE_BASE64`
- `KEYCHAIN_PASSWORD`
- `CERTIFICATE_PASSWORD`

Last updated: 2026-04-14
