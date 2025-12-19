# Your Next Steps

The React Native app is built! Here's what you need to do to get it running on your nephew's phone.

---

## Immediate Steps (Your Machine)

### 1. Test Locally (Optional but Recommended)

```bash
cd mobile
npm start
```

This will start the Expo development server. You can:
- Press `i` to open in iOS Simulator (but speech recognition won't work there)
- Scan the QR code with your iPhone using Expo Go app to test on device

### 2. Install EAS CLI

```bash
npm install -g eas-cli
```

### 3. Login to Expo

```bash
eas login
```

Create an Expo account at https://expo.dev if you don't have one.

### 4. Configure EAS Build

```bash
cd mobile
eas build:configure
```

This will link your project to your Expo account.

---

## Apple Developer Setup (One-Time)

### 5. Apple Developer Account

If you don't have one:
1. Go to https://developer.apple.com
2. Enroll in the Apple Developer Program ($99/year)
3. Wait for approval (usually instant for individuals)

### 6. Register App ID (Do This First!)

Go to https://developer.apple.com → **Certificates, Identifiers & Profiles** → **Identifiers**

1. Click **+** (plus button) to add new identifier
2. Select **App IDs** → Continue
3. Select **App** (not App Clip) → Continue
4. Fill in:
   - **Description**: `Sticker Dream`
   - **Bundle ID**: Select **Explicit**, enter `com.stickerdream.app`
5. **Capabilities**: Leave ALL unchecked (none required!)
   - Speech recognition uses on-device only (no capability needed)
   - AirPrint uses system dialog (no capability needed)
   - Network access is enabled by default
6. Click **Continue** → **Register**

### 7. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: `Sticker Dream`
   - Primary Language: English
   - Bundle ID: Select `com.stickerdream.app` (now visible from step 6!)
   - SKU: `sticker-dream-001`
4. Note the **Apple ID** number shown after creation (you'll need it for eas.json)

### 8. Update eas.json

Edit `mobile/eas.json` and add your Apple credentials:
- Your Apple ID email
- Your Team ID (from developer.apple.com → Membership)
- Your App ID from App Store Connect

---

## Build & Deploy

### 9. Build for iOS

```bash
cd mobile
npm run build:ios
```

This takes 15-30 minutes. EAS will handle code signing automatically.

### 10. Submit to TestFlight

```bash
eas submit --platform ios --latest
```

### 11. Configure TestFlight

1. Go to App Store Connect → Your App → TestFlight
2. Wait for the build to finish processing (5-10 min)
3. Click **External Testing** → **+** → Create a group called "Family"
4. Add your nephew's family's email addresses
5. Submit for review (takes 24-48 hours first time)

### 12. Share with Family

Once approved, they'll get an email with:
1. Link to install TestFlight from App Store
2. Redemption code for Sticker Dream

---

## What to Give Your Nephew's Family

1. **TestFlight invitation email** (automatic from Apple)
2. **Your Gemini API key** (or help them get their own at https://ai.google.dev)
3. **The USER_SETUP_CHECKLIST.md** (printed or sent via email)

---

## Printer Requirements

They need an **AirPrint-compatible printer** on their home WiFi. Most modern printers work:
- HP (most from 2010+)
- Canon PIXMA
- Epson Expression/WorkForce
- Brother inkjet/laser

If their printer doesn't support AirPrint, they can buy a cheap one ($50-100) that does.

---

## Estimated Costs

| Item | Cost |
|------|------|
| Apple Developer Account | $99/year |
| Gemini API (per 25 images) | ~$1 |
| Cheap AirPrint printer (if needed) | $50-100 |

---

## Quick Reference

| Command | What it does |
|---------|--------------|
| `cd mobile && npm start` | Run dev server |
| `npm run build:ios` | Build for iOS |
| `eas submit --platform ios --latest` | Submit to TestFlight |
| `npx tsc --noEmit` | Check for TypeScript errors |

---

## Troubleshooting

**"Build failed"**
- Run `eas credentials` to check/regenerate signing credentials
- Make sure Apple Developer membership is active

**"App crashes on launch"**
- Check the build logs on expo.dev
- Ensure all dependencies are compatible

**"TestFlight stuck on processing"**
- Wait up to 30 minutes
- If stuck, try uploading a new build

---

## Files Created

```
mobile/
├── app/                    # Screen components
│   ├── _layout.tsx         # Navigation setup
│   ├── index.tsx           # Main screen
│   ├── archive.tsx         # Image history
│   └── settings.tsx        # API key config
├── components/
│   ├── DreamButton.tsx     # The big button
│   └── ImageCard.tsx       # Archive card
├── hooks/
│   ├── useSpeechRecognition.ts
│   └── useImageArchive.ts
├── services/
│   ├── imageGeneration.ts  # Gemini API
│   ├── printing.ts         # AirPrint
│   ├── sounds.ts           # Audio
│   └── storage.ts          # Secure storage
├── assets/sounds/          # Sound files
├── app.json                # Expo config
├── eas.json                # Build config
└── package.json

docs/
├── REACT_NATIVE_SETUP.md      # Technical documentation
├── TESTFLIGHT_DEPLOYMENT.md   # Deployment guide
├── USER_SETUP_CHECKLIST.md    # For your nephew's family
└── YOUR_NEXT_STEPS.md         # This file
```

Good luck! Your nephew is going to love it!
