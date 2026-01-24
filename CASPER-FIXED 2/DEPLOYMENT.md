# Rork Casper Control Center - Deployment Guide

## Deployment Status: 90% Complete ✅

**Last Updated**: January 4, 2026, 5:00 AM EST

---

## ✅ Completed Infrastructure

### 1. Supabase Backend (100% Complete)
- **Project URL**: `https://qhgmukwoennurwuvmbhy.supabase.co`
- **Database**: Production instance configured (29.41MB/100GB)
- **Authentication**: Legacy JWT-based auth configured
- **API Keys**: Anon and service_role keys generated
- **Status**: ✅ Fully operational

### 2. Replit Backend Server (100% Complete)
- **Deployment URL**: https://rork.com/p/pw5968wd6du8xw0c3gnuo
- **Environment Secrets Configured**:
  - ✅ `SESSION_SECRET`
  - ✅ `SUPABASE_URL`
  - ✅ `SUPABASE_ANON_KEY`
- **API Endpoints**: Operational
- **Status**: ✅ Backend fully configured

### 3. Repository Configuration (100% Complete)
- ✅ Package dependencies installed (`@supabase/supabase-js` v2.89.0)
- ✅ `.env.example` template with all required variables
- ✅ `eas.json` configuration for mobile builds
- ✅ RBAC implementation (Admin/Operator/Guest roles)
- ✅ Brand dashboards created:
  - Sole Exchange
  - Pinky Promise ATL
  - Blueprint Architecture
- ✅ GoldFrame component for 2026 aesthetic

---

## 📋 Remaining Steps: Mobile App Deployment

### Prerequisites
- Node.js v18+ installed
- Git installed
- Expo account (sign up at https://expo.dev/signup)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
eas login
```

### Step 2: Clone and Setup Repository
```bash
git clone https://github.com/dolodorsey/rork-casper-control-center.git
cd rork-casper-control-center
npm install
```

### Step 3: Configure Environment Variables
Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://qhgmukwoennurwuvmbhy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_ENV=production
```

> **Note**: Replace the `EXPO_PUBLIC_SUPABASE_ANON_KEY` with the actual key from Supabase dashboard.

### Step 4: Configure EAS Secrets
```bash
# Add Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://qhgmukwoennurwuvmbhy.supabase.co

# Add Supabase Anon Key
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY_HERE

# Set environment
eas secret:create --scope project --name EXPO_PUBLIC_ENV --value production
```

### Step 5: Build Mobile Apps

#### Build for Android
```bash
# Production build (AAB for Play Store)
eas build --platform android --profile production

# Preview build (APK for testing)
eas build --platform android --profile preview
```

#### Build for iOS
```bash
# Production build (for App Store)
eas build --platform ios --profile production

# Preview build (for TestFlight)
eas build --platform ios --profile preview
```

### Step 6: Monitor Build Progress
```bash
# List all builds
eas build:list

# View specific build
eas build:view [BUILD_ID]
```

### Step 7: Submit to App Stores

#### Submit to Google Play Store
```bash
eas submit --platform android
```

#### Submit to Apple App Store
```bash
eas submit --platform ios
```

---

## 🔐 Security Configuration

### Supabase API Keys Location
1. Go to: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy/settings/api-keys/legacy
2. Copy the `anon public` key
3. **Never commit this key to version control**

### Environment Variable Best Practices
- ✅ Use `EXPO_PUBLIC_` prefix for client-accessible variables
- ✅ Store sensitive keys in EAS Secrets
- ✅ Keep `.env` in `.gitignore`
- ✅ Use different keys for development/staging/production

---

## 📱 App Configuration

### Bundle Identifiers (configured in `eas.json`)
- **iOS**: `com.caspergroup.controlcenter`
- **Android**: `com.caspergroup.controlcenter`

### Build Profiles
- **development**: For local testing with Expo Go
- **preview**: Internal testing builds (APK/IPA)
- **production**: App store releases

---

## 🚀 Quick Start Guide

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Testing on Physical Devices
```bash
# Install Expo Go app on your device
# Scan QR code from terminal
npm start
```

---

## 🔄 Continuous Integration

EAS Build automatically handles:
- ✅ Dependency installation
- ✅ Native code compilation
- ✅ Code signing (with proper credentials)
- ✅ Binary generation
- ✅ Build artifact hosting

---

## 🚀 iOS App Store Deployment - Complete Guide

### Deployment Status
- **Bundle Identifier**: `app.rork.casper-boh` ✅
- **GitHub Actions Workflow**: Configured ✅
- **Deployment Script**: Created ✅
- **Ready for App Store**: YES ✅

### Three Deployment Methods

#### Method 1: Automated via GitHub Actions (Recommended)

Every push to `main` branch automatically triggers an iOS production build.

**How it works:**
1. Push code to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) runs
3. EAS builds iOS production app
4. Monitor at https://expo.dev

**Setup required:**
- Configure `EXPO_TOKEN` in GitHub repository secrets
- Go to: Settings → Secrets → Actions → New repository secret
- Name: `EXPO_TOKEN`
- Value: Your Expo token from https://expo.dev/accounts/[account]/settings/access-tokens

#### Method 2: Manual Deployment Script

Run the provided script for one-command deployment:

```bash
# Make executable (first time)
chmod +x .deploy-complete.sh

# Run deployment
./.deploy-complete.sh
```

**The script automatically:**
1. Installs EAS CLI globally
2. Handles authentication (EXPO_TOKEN or interactive)
3. Triggers iOS production build
4. Provides next steps

#### Method 3: Manual EAS Commands

For advanced users:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build for production
eas build --platform ios --profile production

# Submit to App Store (after build completes)
eas submit --platform ios --profile production
```

### Build Configuration

Production iOS build settings in `eas.json`:

```json
{
  "build": {
    "production": {
      "ios": {
        "bundleIdentifier": "app.rork.casper-boh"
      }
    }
  }
}
```

### Post-Build Steps

#### 1. Monitor Build
- Visit https://expo.dev
- Check build status and logs
- Build typically takes 15-30 minutes

#### 2. Submit to App Store

Once build completes:

```bash
eas submit --platform ios --profile production
```

**You'll need:**
- Apple Developer account ($99/year)
- App Store Connect API Key OR
- Apple ID with app-specific password

#### 3. App Store Connect

1. Log in to https://appstoreconnect.apple.com
2. Select your app (or create new)
3. Complete metadata:
   - App name, description, keywords
   - Screenshots (required sizes)
   - Privacy policy URL
   - Support URL
4. Submit for review
5. Apple review typically takes 1-3 days

### Troubleshooting

#### Build Fails

**Check logs:**
```bash
eas build:list
eas build:view [BUILD_ID]
```

**Common issues:**
- Missing `EXPO_TOKEN`: Add to GitHub secrets or environment
- Bundle ID mismatch: Verify `eas.json` has `app.rork.casper-boh`
- iOS certificates: Run `eas credentials` to manage

#### Authentication Issues

**Reset authentication:**
```bash
eas logout
eas login
```

**Verify setup:**
```bash
eas whoami
eas credentials
```

#### GitHub Actions Not Running

1. Check `.github/workflows/deploy.yml` exists
2. Verify `EXPO_TOKEN` in repository secrets
3. Check Actions tab for logs
4. Ensure workflow has permissions

### Files Reference

- **`.github/workflows/deploy.yml`**: Automated build workflow
- **`.deploy-complete.sh`**: One-command deployment script  
- **`eas.json`**: EAS build configuration
- **`app.json`**: Expo app configuration

### Quick Reference Commands

```bash
# Check EAS CLI version
eas --version

# View account info
eas whoami

# List recent builds
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Manage iOS credentials
eas credentials

# Submit latest build
eas submit --platform ios --latest
```

## 📞 Support & Resources

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **Supabase Docs**: https://supabase.com/docs
- **Repository**: https://github.com/dolodorsey/rork-casper-control-center

---

## ✅ Deployment Checklist

- [x] Supabase project configured
- [x] Replit backend deployed
- [x] Environment secrets configured
- [x] Repository structure verified
- [x] RBAC implementation complete
- [x] Brand dashboards created
- [x] `eas.json` configuration added
- [ ] EAS CLI installed locally
- [ ] Android production build generated
- [ ] iOS production build generated
- [ ] App submitted to Google Play Store
- [ ] App submitted to Apple App Store

---

**Next Action**: Install EAS CLI locally and run production builds for both platforms.
