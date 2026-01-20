#!/bin/bash

# Casper Control - Complete Deployment Script
# Run this to deploy iOS production build to App Store

set -e

echo "🚀 Casper Control Deployment Starting..."
echo ""

# Step 1: Install EAS CLI
echo "📦 Step 1/3: Installing EAS CLI..."
npm install -g eas-cli
echo "✅ EAS CLI installed"
echo ""

# Step 2: Login to EAS
echo "🔐 Step 2/3: Logging in to EAS..."
if [ -z "$EXPO_TOKEN" ]; then
  echo "⚠️  EXPO_TOKEN not found in environment"
  echo "Please run: export EXPO_TOKEN=your_token_here"
  echo "Or login manually: eas login"
  eas login
else
  echo "Using EXPO_TOKEN from environment"
fi
echo "✅ Logged in to EAS"
echo ""

# Step 3: Trigger Production Build
echo "🏗️  Step 3/3: Triggering iOS production build..."
eas build --platform ios --profile production --non-interactive
echo ""
echo "✅ Build submitted successfully!"
echo ""
echo "📱 Next steps:"
echo "1. Monitor build progress at: https://expo.dev"
echo "2. Once build completes, submit to App Store: eas submit --platform ios"
echo "3. Bundle ID: app.rork.casper-boh"
echo ""
echo "🎉 Deployment script complete!"
