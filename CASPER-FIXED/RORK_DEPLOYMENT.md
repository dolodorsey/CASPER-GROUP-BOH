# CASPER BOH - RORK DEPLOYMENT GUIDE
**Production-Ready Mobile App Deployment**

---

## ⚡ QUICK START (5 MINUTES)

### 1. GET YOUR SUPABASE ANON KEY

```bash
# Go to: https://supabase.com/dashboard/project/qhgmukwoennurwuvmbhy/settings/api
# Copy the "anon public" key
```

### 2. ADD TO RORK ENVIRONMENT

**Rork Dashboard → casper-boh project → Settings → Environment Variables**

Add this variable:
```
Name: EXPO_PUBLIC_SUPABASE_ANON_KEY
Value: [paste your anon key here]
```

### 3. RESTART YOUR RORK DEPLOYMENT

```bash
# Click "Restart" in Rork dashboard
# App will reload with full backend connectivity
```

---

## 🔧 FULL DEPLOYMENT CHECKLIST

### ✅ Prerequisites
- [ ] Rork account active
- [ ] GitHub repo access (https://github.com/dolodorsey/CASPER-GROUP-BOH)
- [ ] Supabase project (qhgmukwoennurwuvmbhy)

### ✅ Environment Variables

Add these to Rork:

| Variable | Required | Where to Get | Notes |
|----------|----------|--------------|-------|
| `EXPO_PUBLIC_SUPABASE_URL` | ✅ Yes | Hardcoded: `https://qhgmukwoennurwuvmbhy.supabase.co` | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase Dashboard → Settings → API | Public key, safe to expose |
| `EXPO_PUBLIC_RORK_API_BASE_URL` | Auto | Rork sets this | Don't touch |

**Optional Integrations:**
| Variable | Purpose |
|----------|---------|
| `EXPO_PUBLIC_N8N_BASE_URL` | n8n workflow automation |
| `EXPO_PUBLIC_N8N_WEBHOOK_TOKEN` | n8n webhook auth |

---

## 🚀 DEPLOYMENT FLOW

### OPTION A: Deploy from GitHub (Recommended)

1. **Connect GitHub Repo**
   ```
   Rork Dashboard → New Project → Import from GitHub
   Select: dolodorsey/CASPER-GROUP-BOH
   ```

2. **Configure Build**
   ```
   Framework: Expo
   Root Directory: .
   Build Command: (auto-detected)
   Start Command: bunx rork start -p pw5968wd6du8xw0c3gnuo --tunnel
   ```

3. **Set Environment Variables**
   - Add `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - Save

4. **Deploy**
   - Click "Deploy"
   - Wait for build (2-3 minutes)
   - App live at: https://casper-boh.rork.app

### OPTION B: Deploy from Local Zip

1. **Prepare Package**
   - Zip the entire CASPER-GROUP-BOH folder
   - Ensure package.json at root

2. **Upload to Rork**
   ```
   Rork Dashboard → New Project → Upload Project
   Select: CASPER-GROUP-BOH.zip
   ```

3. **Configure & Deploy**
   - Follow steps 2-4 from Option A

---

## 🎯 POST-DEPLOYMENT VERIFICATION

### Test Checklist

Access your deployed app and verify:

- [ ] **Homescreen loads** (CASPER CONTROL™ logo)
- [ ] **Cinematic intro plays** (first-time users)
- [ ] **Portal buttons work**
  - [ ] Admin Command
  - [ ] Employee Hub
  - [ ] Partner Intelligence
  - [ ] Command Dashboard
- [ ] **Metrics display** (even if mock data)
- [ ] **Navigation works** (all screens accessible)
- [ ] **No console errors** (check browser dev tools)

### Demo Mode vs Production

**Without Supabase key (Demo Mode):**
- ✅ UI works perfectly
- ✅ All screens navigate
- ✅ Mock data displays
- ❌ No real auth
- ❌ No database operations
- ❌ No live metrics

**With Supabase key (Production):**
- ✅ Everything above PLUS
- ✅ Real authentication
- ✅ Live database
- ✅ Real-time metrics
- ✅ Multi-user access

---

## 🛠️ TROUBLESHOOTING

### App Won't Load / Stuck on Homescreen

**Problem:** Blank screen or stuck loading

**Solutions:**
1. Check browser console for errors
2. Verify environment variables are set
3. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
4. Check Rork deployment logs

```bash
# Expected console logs:
[CasperProvider] Loading intro state
[Auth] Supabase not configured - running in demo mode
[LandingScreen] Render - hasSeenIntro: false
```

### Environment Variable Not Working

**Problem:** EXPO_PUBLIC_SUPABASE_ANON_KEY not loading

**Solutions:**
1. Variable name must be EXACT (case-sensitive)
2. Must start with `EXPO_PUBLIC_`
3. Requires Rork restart after adding
4. Check for trailing spaces in value

### Navigation Not Working

**Problem:** Portal buttons don't navigate

**Solutions:**
1. Check console for routing errors
2. Verify expo-router is installed
3. Ensure all screen files exist in /app
4. Restart Rork deployment

### Supabase Connection Fails

**Problem:** "Failed to fetch" errors

**Solutions:**
1. Verify anon key is correct
2. Check Supabase project is not paused
3. Confirm RLS policies are set
4. Test Supabase URL directly in browser

---

## 📱 ACCESSING YOUR APP

### Web Access (Primary)
```
Production: https://casper-boh.rork.app
```

### Mobile Access (QR Code)
1. Open Rork dashboard
2. Find your project
3. Click "Open on Mobile"
4. Scan QR code with Expo Go app

### Desktop Preview
```
Expo Go app → Enter URL → https://casper-boh.rork.app
```

---

## 🔐 SECURITY NOTES

### Safe to Expose
- ✅ `EXPO_PUBLIC_SUPABASE_URL`
- ✅ `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- ✅ All `EXPO_PUBLIC_*` variables

These are client-side and protected by RLS (Row Level Security).

### NEVER Expose
- ❌ `SUPABASE_SERVICE_ROLE_KEY`
- ❌ Database passwords
- ❌ Private API keys

---

## 📊 MONITORING

### Key Metrics to Watch

1. **App Performance**
   - Load time < 3s
   - Smooth animations
   - No memory leaks

2. **Backend Health**
   - Supabase response time < 500ms
   - Database connection stable
   - No auth errors

3. **User Analytics**
   - Portal access patterns
   - Screen navigation flow
   - Error frequency

---

## 🔄 UPDATING THE APP

### Quick Updates (No Code Changes)
```bash
# Just restart in Rork dashboard
# Pulls latest from GitHub automatically
```

### Code Changes
```bash
# Push to GitHub
git add .
git commit -m "Update: [description]"
git push origin main

# Rork auto-deploys (if enabled)
# Or manually trigger rebuild in dashboard
```

### Environment Variable Changes
```bash
# Update in Rork dashboard
# Requires restart to take effect
```

---

## 🎯 PRODUCTION READINESS

### Current Status: ✅ PRODUCTION-READY

- ✅ All core functionality working
- ✅ Error boundaries in place
- ✅ Graceful degradation (demo mode)
- ✅ Loading states implemented
- ✅ Navigation tested
- ✅ Mobile-responsive UI
- ✅ Proper auth flow

### Known Limitations

1. **Demo Mode** - Works without Supabase but shows mock data
2. **First Load** - Cinematic intro runs once (by design)
3. **Backend Dependency** - Real features require Supabase connection

---

## 📞 SUPPORT

### If Something Breaks

1. **Check Rork Deployment Logs**
   ```
   Rork Dashboard → Your Project → Logs
   ```

2. **Check Browser Console**
   ```
   F12 → Console tab
   Look for red errors
   ```

3. **Test Supabase Connection**
   ```
   https://qhgmukwoennurwuvmbhy.supabase.co
   Should show "ok" response
   ```

4. **Fallback to Demo Mode**
   ```
   Remove EXPO_PUBLIC_SUPABASE_ANON_KEY
   App still works with mock data
   ```

---

## ✅ DEPLOYMENT COMPLETE

Your CASPER BOH app is now live and operational.

**Next Steps:**
1. Test all portals
2. Add users in Supabase
3. Configure RLS policies
4. Set up real metrics
5. Monitor analytics

**Live App:** https://casper-boh.rork.app
