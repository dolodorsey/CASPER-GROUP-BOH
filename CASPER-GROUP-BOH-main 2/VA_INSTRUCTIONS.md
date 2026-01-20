# 📋 VA INSTRUCTIONS - DEPLOY CASPER BOH APP

**For**: Virtual Assistant  
**From**: Dr. Dorsey  
**Task**: Deploy CASPER GROUP BOH to Apple App Store  
**Time**: 5 minutes of work, 30 minutes waiting for build

---

## ⚡ ULTRA-SIMPLE: 3 STEPS TOTAL

### Step 1: Unzip the App (30 seconds)
1. Download `CASPER-BOH-PRODUCTION-COMPLETE.zip`
2. Double-click to unzip
3. Open the folder `CASPER-GROUP-BOH-main`

### Step 2: Open Terminal in That Folder (30 seconds)
**Mac**: Right-click the folder → "New Terminal at Folder"  
**Windows**: Shift + Right-click → "Open PowerShell here"

### Step 3: Run ONE Command (30 seconds + 30 min wait)
Copy this ENTIRE line and paste into Terminal, then press Enter:

```bash
npm install -g eas-cli && eas login && ./deploy-complete.sh
```

**That's it.** The script does everything else automatically.

---

## 🔑 When It Asks to Login

1. It will open a browser
2. Login with **Dr. Dorsey's Expo account**:
   - Email: (Dr. Dorsey will provide)
   - Password: (Dr. Dorsey will provide)
3. Browser will say "Success" - close it
4. Terminal will continue automatically

---

## ⏱️ What Happens Next

1. **Immediate** (2-3 minutes):
   - Script installs tools
   - Configures credentials
   - Starts build process
   - Terminal shows "BUILD STARTED"

2. **15-30 Minutes Later**:
   - Dr. Dorsey gets email: "Your build is complete"
   - Email has download link to .ipa file

3. **After Email Arrives**:
   - Run this command in same Terminal:
   ```bash
   eas submit --platform ios --latest
   ```
   - Answer a few questions (Apple account details)
   - App submits to App Store

4. **1-3 Days Later**:
   - Apple approves app
   - App goes live in App Store

---

## 🆘 IF SOMETHING GOES WRONG

### Error: "command not found: eas"
**Fix**: Terminal needs to restart. Close it, open new Terminal in folder, run command again.

### Error: "Not logged in"
**Fix**: Run `eas login` separately first, then run the deploy script.

### Error: "Build failed"
**Fix**: Send Dr. Dorsey the error message. Usually fixed in 5 minutes.

### Script Asks Questions
Just press Enter to accept defaults. The script has everything configured.

---

## ✅ HOW TO KNOW IT WORKED

**Success looks like this in Terminal:**
```
✅ EAS CLI installed
✅ Credentials configured
🏗️  Building iOS production app...
✅ BUILD STARTED!
📧 You will receive an email when the build completes
```

**Then wait for email.** That's the signal it's done.

---

## 📧 WHAT TO TELL DR. DORSEY

### Immediately After Running Command:
"Build started. You'll get an email in 15-30 minutes when it's ready."

### After Email Arrives:
"Build complete. Running app store submission now."

### After Submission Complete:
"App submitted to Apple. Should be live in 1-3 days."

---

## 🎯 ALTERNATIVE: MANUAL COMMANDS

If the one-liner doesn't work, run these **three separate commands**:

```bash
# Command 1: Install EAS CLI
npm install -g eas-cli

# Command 2: Login (browser will open)
eas login

# Command 3: Deploy
./deploy-complete.sh
```

---

## 📱 AFTER APP IS LIVE

App will be available at:
- App Store → Search "CASPER GROUP BOH"
- Or direct link (Apple provides after approval)

---

## ⚙️ TECHNICAL DETAILS (If Dr. Dorsey Asks)

**What the script does:**
1. Installs Expo Application Services (EAS) CLI
2. Logs into Dr. Dorsey's Expo account
3. Sets Supabase credentials as build secrets
4. Initiates iOS production build on Expo servers
5. Queues app for App Store submission

**What you're building:**
- App Name: CASPER GROUP BOH
- Bundle ID: app.rork.casper-boh
- Platform: iOS (iPhone + iPad)
- Backend: Supabase
- Version: 1.0.0

**Where the build happens:**
- On Expo's servers (not your computer)
- You just trigger it
- Email notification when complete

---

## 🔐 CREDENTIALS USED

All credentials are embedded in the script:
- Supabase URL: ✅ Configured
- Supabase Key: ✅ Configured
- Apple Developer: ✅ Dr. Dorsey's account
- Bundle Identifier: ✅ Pre-configured

**You don't need to enter anything.**

---

## ⏱️ TIME BREAKDOWN

| Step | Time |
|------|------|
| Unzip folder | 30 sec |
| Open Terminal | 30 sec |
| Run command | 30 sec |
| **WAITING FOR EMAIL** | **15-30 min** |
| Submit to store | 2 min |
| **WAITING FOR APPLE** | **1-3 days** |
| **APP GOES LIVE** | ✅ |

**Your active work: 2 minutes**  
**Total time: 1-3 days to app store**

---

## 🎉 COMPLETION CHECKLIST

- [ ] Downloaded and unzipped folder
- [ ] Opened Terminal in folder
- [ ] Ran the one-line command
- [ ] Logged into Expo (browser)
- [ ] Saw "BUILD STARTED" message
- [ ] Informed Dr. Dorsey build is running
- [ ] (Later) Got email "Build complete"
- [ ] (Later) Ran submission command
- [ ] (Later) App submitted to Apple
- [ ] (Later) App approved and live

---

**That's it. One command, everything else is automatic.**

**Questions?** Send screenshot of Terminal to Dr. Dorsey.
