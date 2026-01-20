#!/bin/bash

# ============================================
# CASPER GROUP BOH - ONE-COMMAND DEPLOYMENT
# ============================================
# This script does EVERYTHING automatically
# Your VA just runs: ./deploy-complete.sh

set -e

echo "🚀 CASPER GROUP BOH - AUTOMATED DEPLOYMENT"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "📦 Installing EAS CLI..."
    npm install -g eas-cli
    echo -e "${GREEN}✅ EAS CLI installed${NC}"
else
    echo -e "${GREEN}✅ EAS CLI already installed${NC}"
fi

echo ""
echo "🔐 Configuring production credentials..."

# Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://qhgmukwoennurwuvmbhy.supabase.co --type string --force 2>/dev/null || eas secret:push --scope project EXPO_PUBLIC_SUPABASE_URL --value https://qhgmukwoennurwuvmbhy.supabase.co --type string

# Set Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZ211a3dvZW5udXJ3dXZtYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODI1NDksImV4cCI6MjA4MjU1ODU0OX0.DhNcV9_h8_wdvKHfGyK9kdxKTlT6ZJ1t-JbCKBGD-Kw --type string --force 2>/dev/null || eas secret:push --scope project EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFoZ211a3dvZW5udXJ3dXZtYmh5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODI1NDksImV4cCI6MjA4MjU1ODU0OX0.DhNcV9_h8_wdvKHfGyK9kdxKTlT6ZJ1t-JbCKBGD-Kw --type string

echo -e "${GREEN}✅ Credentials configured${NC}"
echo ""

echo "🏗️  Building iOS production app..."
echo "This takes 15-30 minutes. You'll get an email when done."
echo ""

# Build iOS for App Store
eas build --platform ios --profile production --non-interactive --no-wait

echo ""
echo -e "${GREEN}✅ BUILD STARTED!${NC}"
echo ""
echo "📧 You will receive an email when the build completes"
echo "📱 Then you can submit to App Store with:"
echo "   ${BLUE}eas submit --platform ios --latest${NC}"
echo ""
echo "🎯 Track progress at: https://expo.dev"
echo ""
echo -e "${GREEN}🎉 DEPLOYMENT INITIATED - CHECK YOUR EMAIL${NC}"
