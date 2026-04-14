# Manual Workflow Trigger Guide

Since secrets are already configured and Android builds successfully, you can now trigger all workflows!

## Option 1: GitHub Web UI (Easiest - No Installation)

### ✅ Trigger CI Workflow
1. Go to: https://github.com/MehulBlitz/turf-mobile/actions
2. Click **CI** workflow in the left sidebar
3. Click **Run workflow** button
4. Select `main` branch (default)
5. Click **Run workflow**
6. Wait ~3 minutes for completion

### ✅ Trigger Android Build
1. Go to: https://github.com/MehulBlitz/turf-mobile/actions
2. Click **Android Build** workflow
3. Click **Run workflow** button
4. Select `main` branch (default)
5. Click **Run workflow**
6. Wait ~10 minutes for completion

### ✅ Trigger iOS Build (Debug)
1. Go to: https://github.com/MehulBlitz/turf-mobile/actions
2. Click **iOS Build** workflow
3. Click **Run workflow** button
4. Select `main` branch (default)
5. For **build_type**, choose `debug` (this is the default)
6. Click **Run workflow**
7. Wait ~15 minutes for completion

### ✅ Trigger Firebase Deploy
1. Go to: https://github.com/MehulBlitz/turf-mobile/actions
2. Click **Firebase Deploy** workflow
3. Click **Run workflow** button
4. Select `main` branch (default)
5. Click **Run workflow**
6. Wait ~5 minutes for completion

---

## Option 2: GitHub CLI (If Installed)

### PowerShell (Windows)
```powershell
# Install GitHub CLI first: https://cli.github.com/
# Then authenticate: gh auth login

# Trigger each workflow
gh workflow run ci.yml -R MehulBlitz/turf-mobile -r main
gh workflow run android-build.yml -R MehulBlitz/turf-mobile -r main
gh workflow run ios-build.yml -R MehulBlitz/turf-mobile -r main -f build_type=debug
gh workflow run firebase-deploy.yml -R MehulBlitz/turf-mobile -r main
```

### Bash/Zsh (macOS/Linux)
```bash
# Install GitHub CLI: https://cli.github.com/
# Then authenticate: gh auth login

./scripts/trigger-all-workflows.sh
```

---

## Option 3: GitHub API Directly (Advanced)

If you have `curl` installed:

```bash
# Set these variables
REPO="MehulBlitz/turf-mobile"
BRANCH="main"
TOKEN="your_github_token_here"

# Trigger CI
curl -X POST \
  https://api.github.com/repos/$REPO/actions/workflows/ci.yml/dispatches \
  -H "authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github.v3+raw+json" \
  -d "{\"ref\":\"$BRANCH\"}"

# Trigger Android Build
curl -X POST \
  https://api.github.com/repos/$REPO/actions/workflows/android-build.yml/dispatches \
  -H "authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github.v3+raw+json" \
  -d "{\"ref\":\"$BRANCH\"}"

# Trigger iOS Build (Debug)
curl -X POST \
  https://api.github.com/repos/$REPO/actions/workflows/ios-build.yml/dispatches \
  -H "authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github.v3+raw+json" \
  -d "{\"ref\":\"$BRANCH\", \"inputs\": {\"build_type\": \"debug\"}}"

# Trigger Firebase Deploy
curl -X POST \
  https://api.github.com/repos/$REPO/actions/workflows/firebase-deploy.yml/dispatches \
  -H "authorization: Bearer $TOKEN" \
  -H "Accept: application/vnd.github.v3+raw+json" \
  -d "{\"ref\":\"$BRANCH\"}"
```

---

## 📊 Monitor Workflows

After triggering, monitor them here:
- **Actions Page**: https://github.com/MehulBlitz/turf-mobile/actions
- **Real-time Logs**: Click on each workflow run to see live output
- **Artifacts**: Download APK/IPA after builds complete

---

## ⏱️ Expected Build Times

| Workflow | Platform | Time | Artifact |
|----------|----------|------|----------|
| CI | Ubuntu | ~3 min | - |
| Android Build | Ubuntu | ~10 min | app-debug.apk |
| iOS Build | macOS | ~15 min | app-debug.ipa |
| Firebase Deploy | Ubuntu | ~5 min | Firebase Hosting |

---

## ✅ Success Indicators

For each workflow:
- ✅ Workflow shows **green checkmark**
- ✅ Build logs show **"✓ built"** or similar success message
- ✅ Artifacts tab shows downloadable files (APK, IPA, etc.)

---

## 🔗 Recommendation

**Use Option 1 (Web UI)** - it's the simplest and requires no installation!

Just click through the links above and hit "Run workflow" for each one. It takes about 2 minutes to trigger all four.

---

## Questions?

- **Workflow Failed?** Check logs in the Actions tab for detailed error messages
- **Secrets Not Working?** They're already configured (Android proves it), so builds should work
- **Need Real-time Triggers?** Consider setting `push` trigger in workflow yml files

All workflows are ready to go! 🚀
