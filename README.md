# FACEIT Match Alert

A Chrome/Chromium browser extension that enhances your FACEIT gaming experience with intelligent match notifications, automatic match acceptance, and comprehensive opponent analysis for Counter-Strike 2.

## Features

### Match Management
- **Audio Alert Notifications**: Get instant audio alerts when a match is found
- **Auto-Accept Matches**: Automatically accepts match invitations so you never miss a game

### Opponent Intelligence
- **Match History vs Opponents**: See how many times you've played against each opponent in your current match, including:
  - Total matches played against each player
  - Win/Loss record against specific opponents
  - Win percentage calculations
  - Direct links to previous match rooms

- **Player Analysis Tools**:
  - **Max Skill Level**: Displays the highest FACEIT level each opponent has achieved
  - **Steam Profile Analysis**: Automatically scans opponent Steam profiles for suspicious comments
    - Detects keywords like "-rep", "wall", "hack", "cheat"
    - Flags potentially problematic players before the match starts

### Enhanced Player Information
When you click on a player in the match room, the extension displays:
- Complete match history against that specific player
- Win/Loss indicators for each match
- Win percentage statistics
- Clickable links to review past matches

## Installation

1. Download or clone this repository
2. Open Chrome/Chromium and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will now be active on FACEIT.com

## Configuration

The extension requires a FACEIT Open API key to function properly:

1. Get your API key from [FACEIT Developer Portal](https://developers.faceit.com/)
2. Open [content.js](content.js) and locate line 3
3. Replace the placeholder with your API key:
   ```javascript
   const apiKey = 'YOUR_API_KEY_HERE';
   ```

## How It Works

### Architecture
The extension consists of three main components:

1. **Content Script** ([content.js](content.js)): Runs on FACEIT pages and handles:
   - DOM manipulation and data injection
   - Match detection and auto-acceptance
   - Player data fetching and analysis
   - UI enhancements

2. **Background Service Worker** ([background.js](background.js)): Manages:
   - Audio playback via offscreen documents
   - Steam profile comment fetching (CORS handling)
   - Message passing between components

3. **Audio System** ([audio.js](audio.js), [audio.html](audio.html)):
   - Plays alert sounds when matches are found
   - Uses Chrome's Offscreen Document API (Manifest V3 compliant)

### Data Flow
```
FACEIT Match Room
    ↓
Detect Players → Fetch User Session → Get Match History (up to 1000 matches)
    ↓
For Each Opponent:
    ├─ Calculate head-to-head statistics
    ├─ Fetch max skill level
    └─ Scan Steam profile comments
    ↓
Inject Data into UI
```

## API Dependencies

The extension integrates with several services:

- **FACEIT APIs**: Player stats, match history, session data
- **Steam Community**: Profile comments for suspicious player detection

## Technical Details

- **Manifest Version**: 3 (latest Chrome extension standard)
- **Permissions**:
  - `tabs`: For extension functionality
  - `offscreen`: For audio playback
  - Host permissions for Steam Community access
- **Supported Sites**: `https://www.faceit.com/*`
- **Performance**: Fetches up to 1000 matches per analysis to balance data completeness with API performance

## Project Structure

```
faceit-match-alert/
├── manifest.json      # Extension configuration
├── content.js         # Main content script (core logic)
├── background.js      # Service worker
├── audio.js          # Audio handler
├── audio.html        # Offscreen audio document
├── alert.mp3         # Alert sound file
└── README.md         # Documentation
```

## Privacy & Data Usage

- All data processing happens locally in your browser
- API calls are made directly to FACEIT, Steam, and CSWatch services
- No personal data is collected or transmitted to third parties
- Match history is fetched only when viewing a match room

## Limitations

- Requires a valid FACEIT Open API key
- Steam profile analysis depends on profile privacy settings
- Match history limited to most recent 1000 matches for performance
- Only works on FACEIT website (www.faceit.com)

## Contributing

Contributions are welcome! Feel free to:
- Report bugs or issues
- Suggest new features
- Submit pull requests

## License

This project is provided as-is for personal use.

## Disclaimer

This extension is not officially affiliated with FACEIT. Use at your own discretion and in accordance with FACEIT's terms of service.

---

**Note**: Make sure to keep your FACEIT API key private and never commit it to public repositories.
