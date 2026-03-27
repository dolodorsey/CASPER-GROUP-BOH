# 🏆 Rork Casper Control Center

> **A production-grade mobile and web application for The Casper Group hospitality operations**

[![Deployment Status](https://img.shields.io/badge/deployment-90%25%20complete-success)](https://github.com/dolodorsey/rork-casper-control-center)
[![Backend](https://img.shields.io/badge/backend-operational-success)](https://rork.com/p/pw5968wd6du8xw0c3gnuo)
[![Database](https://img.shields.io/badge/supabase-connected-success)](https://supabase.com)

**Built with**: React Native • Expo • TypeScript • Supabase • Replit

---

## ✨ Features

### 🔐 Role-Based Access Control (RBAC)
- **Admin**: Full system access and management
- **Operator**: Operations and reporting capabilities  
- **Guest**: Limited read-only access

### 🏢 Brand Dashboards
- **Sole Exchange**: Premium dining operations
- **Pinky Promise ATL**: Bar and lounge management
- **Blueprint Architecture**: Design and development tracking

### 🎨 2026 Design System
- GoldFrame component for premium aesthetic
- Comprehensive theme constants
- High-contrast visual design
- Responsive mobile-first layout

### 🔄 Integrations
- **Supabase**: Real-time database and authentication
- **n8n**: Workflow automation (Kollective Brain)
- **Airtable**: Data store and CRM
- **Replit**: Backend API server

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18 or higher
- npm or yarn package manager
- Expo Go app (for mobile testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/dolodorsey/rork-casper-control-center.git

# Navigate to project directory
cd rork-casper-control-center

# Install dependencies
npm install

# Start development server
npm start
```

### Testing on Device

1. Install **Expo Go** on your iOS or Android device
2. Run `npm start` in your terminal
3. Scan the QR code with your device camera (iOS) or Expo Go app (Android)

---

## 📱 Mobile App Deployment

For complete mobile deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for production
eas build --platform android --profile production
eas build --platform ios --profile production
```

---

## 🏗️ Project Structure

```
rork-casper-control-center/
├── app/                      # Application screens and navigation
│   ├── (brands)/            # Brand-specific dashboards
│   ├── _layout.tsx          # Root layout with RBAC
│   └── index.tsx            # Home screen
├── components/              # Reusable UI components
│   └── GoldFrame.tsx        # Premium frame component
├── constants/               # App-wide constants and theme
│   ├── Colors.ts            # Color palette
│   └── Theme.ts             # Design system
├── lib/                     # Utility functions and API clients
│   └── kollective-brain.ts  # n8n integration
├── providers/               # React context providers
│   └── AuthProvider.tsx     # Authentication state
├── types/                   # TypeScript type definitions
├── .env.example             # Environment variables template
├── eas.json                 # Expo build configuration
├── package.json             # Dependencies and scripts
└── DEPLOYMENT.md            # Complete deployment guide
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Environment
EXPO_PUBLIC_ENV=development

# Optional Integrations
EXPO_PUBLIC_N8N_BASE_URL=your_n8n_url
EXPO_PUBLIC_AIRTABLE_API_KEY=your_airtable_key
```

See [`.env.example`](./.env.example) for all available options.

---

## 🌐 Deployment Status

### ✅ Completed (90%)

- [x] **Supabase Backend**: Production database configured
- [x] **Replit API Server**: Backend deployed and operational
- [x] **Repository Structure**: Clean and organized
- [x] **RBAC Implementation**: Three-tier access control
- [x] **Brand Dashboards**: All three brands configured
- [x] **EAS Configuration**: Mobile build setup complete
- [x] **Documentation**: Comprehensive guides created

### ⏳ Pending (10%)

- [ ] **Android Build**: Production AAB generation
- [ ] **iOS Build**: Production IPA generation  
- [ ] **Play Store**: App submission
- [ ] **App Store**: App submission

---

## 🔐 Security

- **Authentication**: JWT-based with Supabase
- **Environment Secrets**: Stored in Replit & EAS
- **API Keys**: Never committed to version control
- **Row Level Security**: Configured on Supabase tables
- **HTTPS Only**: All API communications encrypted

---

## 📚 Tech Stack

### Frontend
- **React Native**: Cross-platform mobile framework
- **Expo**: Development and build tooling
- **TypeScript**: Type-safe development
- **Expo Router**: File-based navigation

### Backend
- **Supabase**: PostgreSQL database + Auth
- **Replit**: Node.js API server
- **n8n**: Workflow automation
- **Airtable**: Data management

### Development Tools
- **EAS Build**: Cloud-based builds
- **Git**: Version control
- **ESLint**: Code linting
- **Prettier**: Code formatting (via ESLint)

---

## 📖 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Complete deployment guide
- **[.env.example](./.env.example)**: Environment configuration
- **[eas.json](./eas.json)**: Build profiles

---

## 🤝 Contributing

This is a private production application for The Casper Group. For internal team contributions:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request
5. Request review from team lead

---

## 📞 Support

### Live Application
- **Web/Mobile Preview**: https://rork.com/p/pw5968wd6du8xw0c3gnuo
- **Backend API**: Operational 24/7

### Resources
- **Expo Documentation**: https://docs.expo.dev/
- **Supabase Docs**: https://supabase.com/docs
- **React Native**: https://reactnative.dev/

---

## 📄 License

Private and Confidential - The Casper Group © 2026

---

## 🎯 Project Status

**Current Phase**: Production Deployment (90% Complete)

**Last Updated**: January 4, 2026, 5:00 AM EST

**Next Milestone**: Mobile app store submissions
