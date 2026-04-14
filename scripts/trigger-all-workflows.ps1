# trigger-all-workflows.ps1
# Manually trigger all GitHub Actions workflows for turf-mobile
# 
# Prerequisites:
# - GitHub CLI (gh) must be installed: https://cli.github.com/
# - Must be authenticated: gh auth login
# - Must have admin access to the repository
#
# Usage: .\trigger-all-workflows.ps1

param(
    [string]$Repo = "MehulBlitz/turf-mobile",
    [string]$Branch = "main"
)

Write-Host "🚀 Triggering all workflows for $Repo..." -ForegroundColor Green
Write-Host ""

# Check if gh is installed
try {
    $ghVersion = gh --version 2>&1 | Select-Object -First 1
    Write-Host "✅ GitHub CLI found: $ghVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 1. Trigger CI Workflow
Write-Host "📝 Triggering CI workflow..." -ForegroundColor Cyan
gh workflow run ci.yml -R $Repo -r $Branch
Write-Host "✅ CI workflow triggered" -ForegroundColor Green
Write-Host ""

# 2. Trigger Android Build
Write-Host "🤖 Triggering Android Build workflow..." -ForegroundColor Cyan
gh workflow run android-build.yml -R $Repo -r $Branch
Write-Host "✅ Android Build workflow triggered" -ForegroundColor Green
Write-Host ""

# 3. Trigger iOS Build (Debug)
Write-Host "🍎 Triggering iOS Build workflow (debug)..." -ForegroundColor Cyan
gh workflow run ios-build.yml -R $Repo -r $Branch -f build_type=debug
Write-Host "✅ iOS Build workflow triggered (debug)" -ForegroundColor Green
Write-Host ""

# 4. Trigger Firebase Deploy
Write-Host "🔥 Triggering Firebase Deploy workflow..." -ForegroundColor Cyan
gh workflow run firebase-deploy.yml -R $Repo -r $Branch
Write-Host "✅ Firebase Deploy workflow triggered" -ForegroundColor Green
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "✨ All workflows have been triggered!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

Write-Host "📊 Monitor progress:" -ForegroundColor Yellow
Write-Host "   https://github.com/$Repo/actions"
Write-Host ""

Write-Host "⏱️  Expected build times:" -ForegroundColor Yellow
Write-Host "   - CI: ~3 minutes"
Write-Host "   - Android: ~10 minutes"
Write-Host "   - iOS: ~15 minutes"
Write-Host "   - Firebase: ~5 minutes"
Write-Host ""

Write-Host "💡 Tip: You can also trigger workflows manually from GitHub Actions tab" -ForegroundColor Cyan
