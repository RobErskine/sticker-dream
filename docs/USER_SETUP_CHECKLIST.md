# Sticker Dream - User Setup Checklist

This checklist is for your nephew's family to get the app working.

---

## What They Need

### Required
- [ ] iPhone or iPad running iOS 15 or later
- [ ] WiFi network
- [ ] AirPrint-compatible printer on the same WiFi network

### AirPrint Printer Info
Most modern home printers support AirPrint, including:
- HP (most models from 2010+)
- Canon PIXMA
- Epson Expression/WorkForce
- Brother (most inkjet and laser models)

**To check if their printer supports AirPrint:**
1. Go to iPhone Settings → General → AirPlay & Handoff
2. Or try printing anything from Photos app - if the printer appears, it works!

---

## Installation Steps

### Step 1: Install TestFlight
1. Open App Store on iPhone/iPad
2. Search for "TestFlight"
3. Install the TestFlight app (it's free, made by Apple)

### Step 2: Accept TestFlight Invitation
1. Open the email invitation you sent them
2. Tap "View in TestFlight"
3. Tap "Accept" in TestFlight
4. Tap "Install" to download Sticker Dream

### Step 3: First Launch Setup
1. Open Sticker Dream
2. **Grant Permissions** when prompted:
   - Microphone: Tap "Allow" ← Required to hear voice
   - Speech Recognition: Tap "Allow" ← Required to understand speech
3. Tap "Settings" at the bottom
4. Enter the Gemini API key you provided
5. Tap "Save API Key"

---

## How to Use the App

### Creating a Sticker
1. Open Sticker Dream
2. **Press and hold** the big green "Sticker Dream" button
3. While holding, **say what you want to draw**
   - Example: "A dinosaur eating pizza"
   - Example: "A unicorn flying over a rainbow"
   - Example: "A robot playing soccer"
4. **Let go** of the button when done speaking (max 15 seconds)
5. Wait for the magic... (5-15 seconds)
6. The print dialog will appear
7. **Tap "Print"** to send to printer

### Canceling
If they made a mistake while speaking, they can say:
- "Cancel"
- "Start over"
- "No sticker"

### Viewing Past Stickers
1. Tap "My Stickers" at the bottom
2. See all stickers from the last 7 days
3. Tap **Print** to reprint any sticker
4. Tap **Share** to send via Messages, email, etc.

### Changing the API Key
1. Tap "Settings" at the bottom
2. Enter a new API key
3. Tap "Update API Key"

---

## Troubleshooting

### "Please add your API key in Settings"
The API key wasn't saved. Go to Settings and enter it again.

### "Invalid API key"
The key was typed incorrectly. Double-check for:
- Extra spaces at beginning/end
- Missing characters
- Wrong key entirely

### Button says "Listening..." but nothing happens
- Make sure microphone permission is granted
- Settings → Sticker Dream → Microphone → Allow
- Try speaking louder/clearer

### "No speech detected"
- Spoke too quietly
- Released button too quickly
- Background noise interference
- Try again in a quieter room

### Print dialog doesn't show printer
- Printer isn't on the same WiFi network
- Printer doesn't support AirPrint
- Printer is turned off or in sleep mode
- Try restarting the printer

### Image looks weird/wrong
- Try being more specific ("a happy cartoon dog" vs just "dog")
- Some prompts work better than others
- Try again - each generation is unique!

### App crashes
- Force close and reopen
- Make sure iOS is updated
- Reinstall via TestFlight

---

## Tips for a 5-Year-Old

1. **Start simple**: "A cat" works better than "A cat wearing a hat sitting on a mat near a bat"

2. **Speak clearly**: The app works best with clear speech

3. **Be patient**: It takes a few seconds for the magic to happen

4. **Have fun**: There's no wrong answer - every sticker is unique!

---

## API Usage & Costs

The Gemini API has a free tier, but heavy usage may incur costs.

**Approximate costs:**
- Imagen 4 costs ~$0.04 per image
- 25 stickers = ~$1
- 100 stickers = ~$4

Monitor usage at: https://console.cloud.google.com/billing

If they're using it a lot, they can get their own API key at https://ai.google.dev
