# TestFlight Deployment Guide

This guide walks you through deploying Sticker Dream to TestFlight for your nephew's family.

## Prerequisites

Before you begin, you'll need:

- [ ] An Apple Developer account ($99/year) - https://developer.apple.com
- [ ] Xcode installed on your Mac (for code signing)
- [ ] EAS CLI installed: `npm install -g eas-cli`

## Step 1: Configure Your Apple Developer Account

1. Log into https://developer.apple.com
2. Go to **Certificates, Identifiers & Profiles**
3. Create an **App ID**:
   - Platform: iOS
   - Bundle ID: `com.stickerdream.app` (explicit)
   - Enable capabilities: None needed for this app

## Step 2: Set Up EAS Build

From the `/mobile` directory:

```bash
# Login to your Expo account
npx eas login

# Configure the project for EAS Build
npx eas build:configure
```

This will prompt you for your Apple Developer credentials.

## Step 3: Update eas.json

Edit `mobile/eas.json` and fill in your Apple credentials:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

To find these values:
- **appleId**: Your Apple ID email
- **appleTeamId**: Found in Apple Developer portal under Membership
- **ascAppId**: Created when you add the app in App Store Connect (step 4)

## Step 4: Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+** → **New App**
3. Fill in:
   - Platform: iOS
   - Name: Sticker Dream
   - Primary Language: English
   - Bundle ID: Select `com.stickerdream.app`
   - SKU: `sticker-dream-001`
4. Note the **Apple ID** (this is your `ascAppId`)

## Step 5: Build for TestFlight

```bash
cd mobile

# Build for internal testing (preview profile)
npm run build:ios:preview

# Or build for App Store / TestFlight (production profile)
npm run build:ios
```

The build will take 15-30 minutes. You'll get a link to monitor progress.

## Step 6: Submit to TestFlight

Once the build completes:

```bash
# Submit the latest build to App Store Connect
npx eas submit --platform ios --latest
```

Or manually:
1. Download the .ipa file from the EAS build page
2. Upload via Transporter app (Mac) or App Store Connect website

## Step 7: Configure TestFlight

1. Go to App Store Connect → Your App → TestFlight
2. The build will appear after processing (5-10 minutes)
3. Click the build and fill in:
   - What to Test: "Press the button and say what you want to draw!"
   - Test Information (optional)
4. Add external testers:
   - Go to **External Testing** → **+** → **Create Group**
   - Name it "Family"
   - Add testers by email
5. Add the build to the group and **Submit for Review**

External testing requires a brief Apple review (~24-48 hours first time).

## Step 8: Share with Family

Once approved, testers will receive an email with:
1. A link to download TestFlight from App Store
2. A redemption code for your app

They'll install TestFlight, then tap the link to install Sticker Dream.

---

## Updating the App

When you make changes:

1. Update version in `app.json`:
   ```json
   "version": "1.0.1"
   ```

2. Build and submit:
   ```bash
   npm run build:ios
   npx eas submit --platform ios --latest
   ```

3. New builds auto-appear in TestFlight for existing testers.

---

## Troubleshooting

### Build fails with code signing error
- Run `npx eas credentials` and regenerate credentials
- Make sure your Apple Developer membership is active

### App crashes on launch
- Check EAS build logs for errors
- Ensure all native modules are compatible with Expo SDK version

### TestFlight says "processing"
- Normal - takes 5-30 minutes
- If stuck, try uploading a new build with bumped version

### External testing review rejected
- Usually just needs better test notes
- Add clear description of what the app does
