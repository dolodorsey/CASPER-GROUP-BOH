# 🏆 CASPER GROUP BOH - Back of House Control System

> **Production-grade restaurant operations platform spanning 10 brands across 8 cities**

[![Status](https://img.shields.io/badge/status-production%20ready-success)](https://github.com/dolodorsey/rork-casper-control-center)
[![Backend](https://img.shields.io/badge/supabase-operational-success)](https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](package.json)

**Stack**: React Native 0.81.5 • Expo 54 • TypeScript • Supabase • Zustand

---

## 🎯 What This Is

CASPER GROUP BOH is the unified back-of-house management system for Kollective Hospitality Group's restaurant operations. It provides:

- **Real-time Operations Dashboard**: Live metrics, alerts, and performance tracking
- **Multi-Brand Management**: Centralized control across 10 restaurant brands
- **Multi-City Coordination**: Seamless operations across 8 metropolitan markets
- **Role-Based Access**: Admin, Employee, and Partner portals with granular permissions
- **Alert & Incident Management**: Proactive issue resolution with automated playbooks
- **Performance Analytics**: KPI tracking, revenue insights, and trend analysis

---

## 🏢 CASPER GROUP Brands

| Brand | Category | Status |
|-------|----------|--------|
| ANGEL WINGS | Wings & Fries | ✅ Active |
| PASTA BISH | Italian | ✅ Active |
| TACO YAKI | Asian-Fusion | ✅ Active |
| PATTY DADDY | Burgers | ✅ Active |
| ESPRESSO CO | Coffee | ✅ Active |
| MORNING AFTER | Brunch | ✅ Active |
| TOSS'D | Salads | ✅ Active |
| SWEET TOOTH | Desserts | ✅ Active |
| MOJO JUICE | Smoothies | ✅ Active |
| MR. OYSTER | Seafood | ✅ Active |

---

## 🌍 Operational Markets

- **Atlanta** (HQ) - Multiple locations
- **Houston** - Texas operations
- **Las Vegas** - Nevada hub
- **Washington DC** - East Coast HQ
- **Charlotte** - Carolina market
- **Miami** - Florida operations
- **New York** - NYC expansion
- **Los Angeles** - West Coast hub

---

## 🚀 Quick Start

### For Developers

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# Get them from: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy/settings/api

# Start development server
npm start

# Run on specific platform
npm run start -- --ios
npm run start -- --android
```

### For Production Deployment

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Set production secrets
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://qhgmukwoennurwuvmbhy.supabase.co --type string
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --type string

# Build for app stores
eas build --platform all --profile production

# Submit to stores
eas submit --platform all --latest
```

**Full deployment guide**: See [PRODUCTION_READY.md](PRODUCTION_READY.md)

---

## 📱 Features

### Admin Portal
- **Live Dashboard**: Real-time metrics across all brands and locations
- **Alert Center**: Automated incident detection and resolution
- **KPI Tracking**: Revenue, growth, performance analytics
- **User Management**: Role assignments and permissions
- **System Control**: Multi-brand, multi-location oversight

### Employee Portal
- **Shift Management**: Clock in/out, schedule viewing
- **Task Assignments**: Daily operations and checklists
- **Training Resources**: SOPs and onboarding materials
- **Internal Messaging**: Team communication
- **Performance Metrics**: Individual and team analytics

### Partner Portal
- **Brand Analytics**: Revenue and sales insights
- **Menu Management**: Item updates and pricing
- **Marketing Tools**: Campaign materials and assets
- **Support Center**: Ticket system for partner needs
- **Reporting**: Customized data exports

---

## 🏗️ Architecture

### Frontend
- **React Native**: Cross-platform mobile apps
- **Expo Router**: File-based navigation
- **Zustand**: Lightweight state management
- **React Query**: Server state and caching
- **TypeScript**: Full type safety

### Backend
- **Supabase**: PostgreSQL database + Auth + Realtime
- **Row Level Security**: Granular access control
- **JWT Authentication**: Secure user sessions
- **Real-time Subscriptions**: Live data updates

### Design System
- **Dark Theme**: Cinematic black backgrounds
- **Gold Accents**: Premium brand aesthetic
- **Linear Gradients**: Depth and hierarchy
- **Lucide Icons**: Consistent iconography
- **Responsive Layouts**: Mobile-first approach

---

## 🔐 Security

- **Environment Variables**: All secrets in `.env` or EAS Secrets
- **Supabase RLS**: Database-level access control
- **JWT Tokens**: Secure authentication
- **No Hardcoded Keys**: Production keys managed externally
- **Role Validation**: Server-side permission checks

---

## 📦 Project Structure

```
casper-boh/
├── app/                  # Expo Router screens
│   ├── (brands)/        # Brand-specific pages
│   ├── (tabs)/          # Bottom tab navigation
│   ├── admin/           # Admin portal
│   ├── auth/            # Authentication flows
│   ├── employee.tsx     # Employee portal
│   ├── partner.tsx      # Partner portal
│   └── index.tsx        # Entry point
├── components/          # Reusable UI components
├── constants/           # Configuration & theme
│   ├── brands.ts        # Brand definitions
│   ├── locations.ts     # City configurations
│   ├── colors.ts        # Design system colors
│   └── theme.ts         # Theme tokens
├── lib/                 # Utilities & clients
│   ├── supabase.ts      # Supabase client
│   ├── api.ts           # API utilities
│   └── trpc.ts          # tRPC client
├── providers/           # React Context providers
│   ├── AuthProvider.tsx # Authentication state
│   ├── AdminProvider.tsx # Admin data & actions
│   └── CasperProvider.tsx # Brand context
├── types/               # TypeScript definitions
└── assets/              # Images & static files
```

---

## 🧪 Testing

```bash
# Run type checking
npx tsc --noEmit

# Test on device
npm start
# Scan QR code with Expo Go app

# Build preview for testing
eas build --platform all --profile preview
```

---

## 📊 Performance

- **Bundle Size**: ~8MB (minified)
- **Load Time**: <2 seconds
- **API Response**: <500ms average
- **Real-time Updates**: 30-second polling
- **Offline Support**: Basic navigation only

---

## 🔄 CI/CD

### Automated via EAS
- **Builds**: Triggered on git push (optional)
- **Testing**: Pre-build checks
- **Distribution**: TestFlight / Internal Testing
- **Production**: Manual approval required

### Environment Branches
- `main`: Production (app stores)
- `staging`: Internal testing
- `dev`: Active development

---

## 📝 Documentation

- **[PRODUCTION_READY.md](PRODUCTION_READY.md)**: Complete deployment guide
- **[.env.example](.env.example)**: Environment configuration template
- **[app.json](app.json)**: Expo configuration
- **[eas.json](eas.json)**: Build profiles

---

## 🤝 Support

- **Technical Issues**: Open GitHub issue
- **Feature Requests**: Submit via GitHub Discussions
- **Emergency**: Contact Dr. Dorsey directly
- **Documentation**: This repo + [Expo Docs](https://docs.expo.dev)

---

## 📜 License

Proprietary - Kollective Hospitality Group  
© 2026 CASPER GROUP. All rights reserved.

---

## 🎯 Quick Commands

| Task | Command |
|------|---------|
| Start dev server | `npm start` |
| Type check | `npx tsc --noEmit` |
| Build iOS (prod) | `eas build --platform ios --profile production` |
| Build Android (prod) | `eas build --platform android --profile production` |
| Submit to stores | `eas submit --platform all --latest` |
| View logs | `npx expo start --clear` |

---

**Built for**: Dr. Dorsey • Kollective Hospitality Group  
**Maintained by**: The Automation Office  
**Last Updated**: January 19, 2026  
**Status**: ✅ **PRODUCTION READY**
