#!/bin/bash

# ============================================
# CASPER GROUP BOH - Production Deployment Script
# ============================================
# This script automates the production deployment process
# Run this after completing all development work

set -e  # Exit on error

echo "🚀 CASPER GROUP BOH - Production Deployment"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${RED}❌ EAS CLI is not installed${NC}"
    echo "Install with: npm install -g eas-cli"
    exit 1
fi

echo -e "${GREEN}✅ EAS CLI found${NC}"

# Check if logged in to Expo
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Expo${NC}"
    echo "Logging in..."
    eas login
fi

echo -e "${GREEN}✅ Expo authentication verified${NC}"
echo ""

# Prompt for environment variables
echo "🔐 Checking EAS Secrets..."
echo ""
echo "You'll need your Supabase credentials:"
echo "Get them from: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy/settings/api"
echo ""

read -p "Have you added EXPO_PUBLIC_SUPABASE_ANON_KEY to EAS Secrets? (y/n): " has_secrets

if [ "$has_secrets" != "y" ]; then
    echo ""
    echo "Add secrets with:"
    echo ""
    echo "  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://qhgmukwoennurwuvmbhy.supabase.co --type string"
    echo ""
    echo "  eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --type string"
    echo ""
    read -p "Press Enter after adding secrets..."
fi

echo -e "${GREEN}✅ Secrets configured${NC}"
echo ""

# Build selection
echo "📱 Select build platform:"
echo "1) iOS only"
echo "2) Android only"
echo "3) Both platforms"
read -p "Enter choice (1-3): " platform_choice

case $platform_choice in
    1)
        PLATFORM="ios"
        ;;
    2)
        PLATFORM="android"
        ;;
    3)
        PLATFORM="all"
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo "🏗️  Starting production build for: $PLATFORM"
echo ""
echo "This will:"
echo "  - Use production build profile from eas.json"
echo "  - Include EAS Secrets in build"
echo "  - Create App Store/Play Store ready binaries"
echo "  - Take 15-30 minutes to complete"
echo ""
read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Build cancelled."
    exit 0
fi

# Execute build
echo ""
echo "🔨 Building $PLATFORM..."
eas build --platform "$PLATFORM" --profile production --non-interactive

echo ""
echo -e "${GREEN}✅ Build completed!${NC}"
echo ""
echo "📥 Download builds:"
echo "  Visit: https://expo.dev/accounts/[your-account]/projects/casper-boh/builds"
echo ""

# Submission prompt
read -p "Submit to app stores now? (y/n): " submit_now

if [ "$submit_now" == "y" ]; then
    echo ""
    echo "📤 Submitting to stores..."
    echo ""
    echo "Note: You'll need:"
    echo "  - Apple Developer account for iOS"
    echo "  - Google Play Console account for Android"
    echo ""
    
    eas submit --platform "$PLATFORM" --latest --non-interactive
    
    echo ""
    echo -e "${GREEN}✅ Submission complete!${NC}"
    echo ""
    echo "📱 Next steps:"
    echo "  - iOS: Review in App Store Connect"
    echo "  - Android: Review in Google Play Console"
    echo "  - Both: Monitor for review feedback"
else
    echo ""
    echo "📋 To submit later:"
    echo "  eas submit --platform $PLATFORM --latest"
fi

echo ""
echo "🎉 Deployment process complete!"
echo ""
echo "📊 Track status:"
echo "  - EAS Dashboard: https://expo.dev"
echo "  - Supabase Dashboard: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy"
echo ""
echo -e "${GREEN}✅ CASPER GROUP BOH is ready for production${NC}"
