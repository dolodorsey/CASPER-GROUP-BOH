# 🚀 QUICK START - 5 MINUTES TO DEPLOYMENT

## Prerequisites Check
```bash
# 1. Install EAS CLI (if not installed)
npm install -g eas-cli

# 2. Login to Expo
eas login
```

## Get Supabase Key (2 minutes)
1. Go to: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy/settings/api
2. Copy "anon public" key
3. Save it temporarily

## Set EAS Secrets (2 minutes)
```bash
# Set Supabase URL
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://qhgmukwoennurwuvmbhy.supabase.co --type string

# Set Supabase anon key (replace YOUR_ANON_KEY with actual key)
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value YOUR_ANON_KEY --type string
```

## Deploy (1 minute to start)
```bash
# Option 1: Automated (recommended)
./deploy.sh

# Option 2: Manual
eas build --platform all --profile production
```

## Done!
Build takes 15-30 minutes. You'll get a notification when complete.

---

## Files You Need
- **README.md** - Full documentation
- **PRODUCTION_READY.md** - Complete deployment guide  
- **COMPLETION_SUMMARY.md** - What was done + next steps
- **deploy.sh** - Automated deployment script
- **.env.example** - Environment variable template

## Important Links
- **Supabase**: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy
- **EAS Dashboard**: https://expo.dev
- **This Repo**: https://github.com/dolodorsey/rork-casper-control-center

## Support
Questions? Check **PRODUCTION_READY.md** for detailed instructions.
