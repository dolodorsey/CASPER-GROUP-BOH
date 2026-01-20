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
