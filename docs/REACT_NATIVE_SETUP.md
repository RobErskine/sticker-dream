# Sticker Dream - React Native App

## Overview

This document tracks the conversion of Sticker Dream from a web app to a React Native (Expo) app for iOS deployment via TestFlight.

## Architecture

### Tech Stack
- **Framework**: Expo (managed workflow) with Expo Router
- **Speech-to-Text**: `expo-speech-recognition` (native iOS recognition, works offline)
- **Image Generation**: `@google/genai` (direct Gemini API calls)
- **Printing**: `expo-print` (AirPrint via system dialog)
- **Audio**: `expo-av` (sound effects)
- **Storage**: `expo-secure-store` (API key) + `expo-file-system` (images)
- **Sharing**: `expo-sharing` (native share sheet)

### App Structure
```
/mobile
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with navigation
│   ├── index.tsx           # Main recording screen
│   ├── archive.tsx         # Image history
│   └── settings.tsx        # API key configuration
├── components/
│   ├── DreamButton.tsx     # Press-and-hold recording button
│   └── ImageCard.tsx       # Archive image with actions
├── hooks/
│   ├── useSpeechRecognition.ts
│   └── useImageArchive.ts
├── services/
│   ├── imageGeneration.ts  # Gemini API
│   ├── printing.ts         # expo-print wrapper
│   ├── sounds.ts           # Sound effects
│   └── storage.ts          # Secure storage + file system
├── assets/
│   └── sounds/
│       ├── press.mp3
│       ├── loading.mp3
│       └── finished.wav
├── app.json                # Expo config
├── eas.json                # EAS Build config
└── package.json
```

## Features

### Core Features
1. **Voice Recording**: Press and hold button, speak for up to 15 seconds
2. **Speech-to-Text**: Native iOS speech recognition (Siri engine, works offline)
3. **Image Generation**: Gemini Imagen 4 generates coloring page
4. **Printing**: AirPrint dialog for any compatible printer

### Additional Features
1. **Image Archive**: Last 7 days of generated images stored locally
2. **Share Images**: Native iOS share sheet for any archived image
3. **Reprint**: Tap any archived image to print again
4. **Settings**: User can enter their own Gemini API key
5. **Sound Effects**: Audio feedback for press, loading, and completion
6. **Haptic Feedback**: Vibration on button press

## Development Progress

- [x] Documentation created
- [x] Expo project initialized
- [x] Dependencies installed
- [x] Navigation setup (Expo Router)
- [x] Storage services (SecureStore + FileSystem)
- [x] Image generation service (Gemini API)
- [x] Printing service (expo-print)
- [x] Speech recognition hook
- [x] Main screen with DreamButton
- [x] Archive screen with share/reprint
- [x] Settings screen for API key
- [x] Sound effects
- [x] Documentation complete

## Running Locally

```bash
cd mobile
npm install
npm start
```

Then scan the QR code with Expo Go (iOS) or press `i` for iOS simulator.

**Note**: Speech recognition requires a physical device - it won't work in the simulator.

## Building for TestFlight

See [TESTFLIGHT_DEPLOYMENT.md](./TESTFLIGHT_DEPLOYMENT.md) for complete instructions.

Quick start:
```bash
cd mobile
npm install -g eas-cli
eas login
eas build:configure
npm run build:ios
```

## User Setup

See [USER_SETUP_CHECKLIST.md](./USER_SETUP_CHECKLIST.md) for the checklist to share with your nephew's family.

## Key Differences from Web App

| Feature | Web App | React Native App |
|---------|---------|------------------|
| Speech-to-text | Client-side Whisper (slow, large) | Native iOS Siri (fast, built-in) |
| Image generation | Backend server call | Direct API call from app |
| Printing | CUPS commands (auto-print) | AirPrint dialog (1 tap) |
| Button interaction | pointerdown/up | Pressable with onPressIn/Out |
| Storage | Browser localStorage | SecureStore + FileSystem |
| API key | Server-side .env | User enters in Settings |
