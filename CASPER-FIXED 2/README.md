# CASPER GROUP BOH
**Back of House Operations Platform**

Enterprise command center for multi-brand restaurant operations across 10 brands and 8 cities.

---

## 🚀 QUICK START

### Deploy to Rork (Recommended)

1. **Add Environment Variable**
   ```
   Rork Dashboard → Settings → Environment Variables
   
   Name: EXPO_PUBLIC_SUPABASE_ANON_KEY
   Value: [get from https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy/settings/api]
   ```

2. **Restart Deployment**
   ```
   Click "Restart" in Rork dashboard
   ```

3. **Access App**
   ```
   Web: https://casper-boh.rork.app
   Mobile: Scan QR code in Rork dashboard
   ```

**📖 Full deployment guide:** See `RORK_DEPLOYMENT.md`

---

## 📱 FEATURES

### Portal Access
- **Admin Command** - Full network control
- **Employee Hub** - Operations & training
- **Partner Intelligence** - Revenue & analytics
- **Command Center** - Live operations dashboard

### Core Functionality
- ✅ Multi-brand operations management
- ✅ Real-time metrics and analytics
- ✅ Location-based access control
- ✅ Role-based permissions (Admin, Employee, Partner)
- ✅ Live alerts and notifications
- ✅ Cinematic UI with smooth animations

---

## 🏗️ TECH STACK

### Frontend
- **Expo 54** - Cross-platform framework
- **React Native** - Mobile & web UI
- **Expo Router** - File-based navigation
- **TypeScript** - Type safety
- **Lucide Icons** - Icon system

### Backend
- **Supabase** - Database & auth
- **TRPC** - Type-safe API
- **React Query** - Data fetching
- **Zustand** - State management

### Development
- **Rork** - Deployment platform
- **Bun** - Package manager
- **ESLint** - Code quality

---

## 📂 PROJECT STRUCTURE

```
CASPER-GROUP-BOH/
├── app/                    # Expo Router screens
│   ├── (brands)/          # Brand-specific screens
│   ├── (tabs)/            # Tab navigation
│   ├── admin/             # Admin portal
│   ├── auth/              # Auth screens
│   ├── index.tsx          # Homescreen
│   ├── command.tsx        # Command center
│   ├── employee.tsx       # Employee portal
│   └── partner.tsx        # Partner portal
├── components/            # Reusable UI components
├── providers/             # Context providers
├── lib/                   # Core libraries
├── constants/             # App constants
├── assets/                # Images & media
└── backend/               # TRPC API routes
```

---

## 🔧 LOCAL DEVELOPMENT

### Prerequisites
```bash
Node.js 18+
Bun (npm install -g bun)
Expo CLI
```

### Setup
```bash
# Install dependencies
bun install

# Start development server
bun run start

# Start web only
bun run start-web
```

### Environment Variables
```bash
# Copy template
cp .env.example .env

# Add your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://qhgmukwoennurwuvmbhy.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 🎯 DEPLOYMENT

### Production Deployment (Rork)
See `RORK_DEPLOYMENT.md` for complete guide.

Quick version:
1. Add `EXPO_PUBLIC_SUPABASE_ANON_KEY` to Rork
2. Deploy from GitHub or upload zip
3. Access at https://casper-boh.rork.app

### Mobile Build (EAS)
```bash
# Install EAS CLI
npm install -g eas-cli

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android
```

---

## 🔐 SECURITY

### Environment Variables
- ✅ Safe to expose: `EXPO_PUBLIC_*` variables
- ❌ Never expose: Service role keys, secrets

### Database Security
- Row Level Security (RLS) enabled
- Role-based access control
- Secure auth flow via Supabase

---

## 🏢 BRAND UNIVERSE

### CASPER GROUP (Food Brands)
1. Angel Wings
2. Pasta Bish
3. Taco Yaki
4. Patty Daddy
5. Espresso Co.
6. Morning After
7. Toss'd
8. Sweet Tooth
9. Mojo Juice
10. Mr. Oyster

### Operating Cities
- Atlanta
- Houston
- Las Vegas
- Washington DC
- Charlotte
- Miami
- New York
- Los Angeles

---

## 📊 STATUS

- **Version:** 1.0.0
- **Status:** ✅ Production Ready
- **Last Updated:** January 2026
- **Deployment:** Rork Platform

---

## 📖 DOCUMENTATION

- `FIX_REPORT.md` - Latest fixes and improvements
- `RORK_DEPLOYMENT.md` - Complete deployment guide
- `IMPLEMENTATION_GUIDE.md` - Technical implementation
- `DEPLOYMENT.md` - General deployment info
- `PROJECT_STATUS.md` - Project status

---

## 🛠️ TROUBLESHOOTING

### App Won't Load
1. Check browser console for errors
2. Verify environment variables in Rork
3. Hard refresh (Cmd+Shift+R)
4. Check Rork deployment logs

### Supabase Connection Issues
1. Verify anon key is correct
2. Check Supabase project is active
3. Confirm RLS policies are set
4. Test Supabase URL directly

**Full troubleshooting guide:** See `RORK_DEPLOYMENT.md`

---

## 🎯 NEXT STEPS

1. ✅ Deploy to production (Rork)
2. ⏳ Configure user roles in Supabase
3. ⏳ Set up real-time metrics
4. ⏳ Add n8n workflow integrations
5. ⏳ Scale to additional locations

---

## 📞 SUPPORT

**Owner:** Dr. Dorsey  
**Organization:** Kollective Hospitality Group  
**Platform:** Rork  
**Database:** Supabase  

---

## ⚡ DEMO MODE

App works perfectly without backend connection:
- All UI functional
- Navigation works
- Mock data displays
- No errors or crashes

Add `EXPO_PUBLIC_SUPABASE_ANON_KEY` for full production features.

---

**Made with 🔥 by Dr. Dorsey's team**
