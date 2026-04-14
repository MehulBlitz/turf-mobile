#!/bin/bash
# trigger-all-workflows.sh
# Manually trigger all GitHub Actions workflows for turf-mobile

# Prerequisites:
# - GitHub CLI (gh) must be installed: https://cli.github.com/
# - Must be authenticated: gh auth login
# - Must have admin access to the repository

set -e

REPO="MehulBlitz/turf-mobile"
BRANCH="main"

echo "🚀 Triggering all workflows for $REPO..."
echo ""

# 1. Trigger CI Workflow
echo "📝 Triggering CI workflow..."
gh workflow run ci.yml -R "$REPO" -r "$BRANCH"
echo "✅ CI workflow triggered"
echo ""

# 2. Trigger Android Build
echo "🤖 Triggering Android Build workflow..."
gh workflow run android-build.yml -R "$REPO" -r "$BRANCH"
echo "✅ Android Build workflow triggered"
echo ""

# 3. Trigger iOS Build
echo "🍎 Triggering iOS Build workflow (debug)..."
gh workflow run ios-build.yml -R "$REPO" -r "$BRANCH" -f build_type=debug
echo "✅ iOS Build workflow triggered (debug)"
echo ""

# 4. Trigger Firebase Deploy
echo "🔥 Triggering Firebase Deploy workflow..."
gh workflow run firebase-deploy.yml -R "$REPO" -r "$BRANCH"
echo "✅ Firebase Deploy workflow triggered"
echo ""

echo "================================================"
echo "✨ All workflows have been triggered!"
echo "================================================"
echo ""
echo "📊 Monitor progress:"
echo "   https://github.com/$REPO/actions"
echo ""
echo "⏱️  Expected build times:"
echo "   - CI: ~3 minutes"
echo "   - Android: ~10 minutes" 
echo "   - iOS: ~15 minutes"
echo "   - Firebase: ~5 minutes"
echo ""
echo "💡 Tip: You can also trigger workflows manually from GitHub Actions tab"
