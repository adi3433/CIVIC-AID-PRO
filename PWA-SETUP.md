# PWA Setup Guide for CivicAid

Your app is now configured as a Progressive Web App (PWA)! 🎉

## What's Been Added

### 1. Service Worker (`public/sw.js`)

- Caches app assets for offline access
- Enables faster loading on repeat visits
- Automatically updates when new version is deployed

### 2. Web App Manifest (`public/manifest.json`)

- Defines app name, colors, and icons
- Enables "Add to Home Screen" functionality
- Sets display mode to standalone (looks like native app)

### 3. PWA Meta Tags (`index.html`)

- Apple mobile web app configuration
- Theme color for browser UI
- Manifest link

### 4. Service Worker Registration (`src/main.tsx`)

- Automatically registers service worker
- Handles updates with user confirmation
- Checks for updates every minute

## Generate PWA Icons

You need to create app icons in multiple sizes. You have three options:

### Option 1: Use the PowerShell Script (Requires ImageMagick)

1. Install ImageMagick: https://imagemagick.org/script/download.php
2. Create a 512x512 PNG logo and place it in the project root
3. Run the script:
   ```powershell
   .\generate-icons.ps1
   ```

### Option 2: Use Online Tool (Recommended)

1. Visit: https://realfavicongenerator.net/
2. Upload your logo (512x512 or larger PNG)
3. Generate and download icons
4. Extract and place them in `public/icons/`

### Option 3: Use the Template SVG

1. Customize `public/icons/icon-template.svg` with your branding
2. Use an online SVG to PNG converter (e.g., https://svgtopng.com/)
3. Generate these sizes: 72, 96, 128, 144, 152, 192, 384, 512
4. Save as `icon-{size}x{size}.png` in `public/icons/`

## Required Icon Sizes

- `icon-72x72.png`
- `icon-96x96.png`
- `icon-128x128.png`
- `icon-144x144.png`
- `icon-152x152.png`
- `icon-192x192.png`
- `icon-384x384.png`
- `icon-512x512.png`

## Testing Your PWA

### On Desktop (Chrome/Edge)

1. Start your development server: `bun run dev`
2. Open the app in browser
3. Look for the install icon in the address bar
4. Click "Install" to add to desktop

### On Mobile (Android)

1. Deploy your app to a server with HTTPS
2. Open in Chrome/Edge
3. Tap the menu (three dots)
4. Select "Add to Home Screen"
5. App icon will appear on your home screen

### On Mobile (iOS)

1. Open in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Name your app and confirm

## PWA Capabilities

✅ Installable - Users can add to home screen  
✅ Offline Access - App works without internet  
✅ Fast Loading - Assets cached locally  
✅ App-like Experience - No browser UI in standalone mode  
✅ Auto-updates - Service worker manages updates  
✅ Push Notifications - Ready to implement (optional)

## Customization

### Change Theme Color

Edit `manifest.json`:

```json
"theme_color": "#10b981"  // Your brand color
```

Also update in `index.html`:

```html
<meta name="theme-color" content="#10b981" />
```

### Change App Name

Edit `manifest.json`:

```json
"name": "Your App Name",
"short_name": "Short Name"
```

### Configure Offline Behavior

Edit `public/sw.js` to customize caching strategy:

- `CACHE_NAME`: Update version when you want to force refresh
- `urlsToCache`: Add specific files to cache on install

## Production Deployment

Make sure your production server:

- Serves over HTTPS (required for PWA)
- Has proper MIME types for `.json` files
- Allows service worker registration

## Verify PWA Setup

1. Open Chrome DevTools
2. Go to "Application" tab
3. Check:
   - ✅ Manifest loads correctly
   - ✅ Service Worker is registered
   - ✅ Icons are present
   - ✅ Install banner appears

## Need Help?

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
