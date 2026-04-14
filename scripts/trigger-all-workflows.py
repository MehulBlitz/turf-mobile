#!/usr/bin/env python3
"""
Trigger all GitHub Actions workflows for turf-mobile
Requires: GITHUB_TOKEN environment variable or ~/.gh/config.yml
"""

import subprocess
import sys
import os

REPO = "MehulBlitz/turf-mobile"
BRANCH = "main"

# List of workflows to trigger
WORKFLOWS = [
    ("ci.yml", {}, "CI (Lint + Build)"),
    ("android-build.yml", {}, "Android Build"),
    ("ios-build.yml", {"build_type": "debug"}, "iOS Build (Debug)"),
    ("firebase-deploy.yml", {}, "Firebase Deploy"),
]

def trigger_workflow(workflow_id, inputs, description):
    """Trigger a single workflow"""
    print(f"📊 Triggering {description}...", end=" ", flush=True)
    
    cmd = ["gh", "workflow", "run", workflow_id, "-R", REPO, "-r", BRANCH]
    
    # Add inputs if provided
    for key, value in inputs.items():
        cmd.extend(["-f", f"{key}={value}"])
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("✅")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e.stderr}")
        return False
    except FileNotFoundError:
        print("❌ GitHub CLI not found")
        return False

def main():
    print("=" * 60)
    print("🚀 GitHub Actions Workflow Trigger")
    print("=" * 60)
    print(f"Repository: {REPO}")
    print(f"Branch: {BRANCH}")
    print()
    
    # Check if gh is available
    try:
        subprocess.run(["gh", "--version"], capture_output=True, check=True)
    except (FileNotFoundError, subprocess.CalledProcessError):
        print("❌ GitHub CLI not found!")
        print()
        print("Install from: https://cli.github.com/")
        print("Then authenticate: gh auth login")
        sys.exit(1)
    
    print("🔄 Checking authentication...")
    try:
        subprocess.run(["gh", "auth", "status"], capture_output=True, check=True)
        print("✅ Authenticated with GitHub")
        print()
    except subprocess.CalledProcessError:
        print("❌ Not authenticated with GitHub")
        print("Run: gh auth login")
        sys.exit(1)
    
    print("=" * 60)
    print("📋 Triggering workflows:")
    print("=" * 60)
    print()
    
    success_count = 0
    for workflow_id, inputs, description in WORKFLOWS:
        if trigger_workflow(workflow_id, inputs, description):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"✨ Summary: {success_count}/{len(WORKFLOWS)} workflows triggered")
    print("=" * 60)
    print()
    print("📊 Monitor progress:")
    print(f"   https://github.com/{REPO}/actions")
    print()
    print("⏱️  Expected completion times:")
    print("   - CI: ~3 minutes")
    print("   - Android: ~10 minutes")
    print("   - iOS: ~15 minutes")
    print("   - Firebase: ~5 minutes")
    print()

if __name__ == "__main__":
    main()
