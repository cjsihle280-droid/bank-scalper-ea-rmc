# BANK SCALPER EA - Deployment Guide

This guide covers how to build, package, and distribute BANK SCALPER EA as desktop, web, and mobile applications.

## Table of Contents
1. [Desktop App (Electron)](#desktop-app-electron)
2. [Web App Deployment](#web-app-deployment)
3. [Mobile App (React Native)](#mobile-app-react-native)
4. [Auto-Update System](#auto-update-system)
5. [Release Process](#release-process)

---

## Desktop App (Electron)

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Development

```bash
# Start development server with Electron window
npm run dev:electron

# OR manually in two terminals:
# Terminal 1: Start React dev server
npm run dev

# Terminal 2: Start Electron (after React is ready)
npx electron .
```

### Building for Distribution

#### Windows (.exe installer + portable)
```bash
npm run build:electron:win
# Output: dist_electron/BANK_SCALPER_EA_Setup.exe
# Output: dist_electron/BANK SCALPER EA.exe (portable)
```

#### macOS (.dmg + .zip)
```bash
npm run build:electron:mac
# Output: dist_electron/BANK SCALPER EA.dmg
# Output: dist_electron/BANK SCALPER EA.zip
```

#### Linux (.AppImage + .deb)
```bash
npm run build:electron:linux
# Output: dist_electron/BANK SCALPER EA.AppImage
# Output: dist_electron/BANK SCALPER EA.deb
```

#### Build All Platforms (requires all OS environments)
```bash
npm run build:all
```

### Installer Features
- **Windows**: NSIS installer with custom dialogs, desktop shortcut, Start Menu entry
- **macOS**: DMG with drag-to-install, code signing ready
- **Linux**: AppImage (no installation needed) and DEB package

---

## Web App Deployment

### Option 1: Vercel (Recommended for React)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set production domain
vercel --prod
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

### Option 3: AWS S3 + CloudFront
```bash
# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Option 4: Self-Hosted (Node.js)
```bash
# Build the app
npm run build

# Deploy dist folder to your server
# Use nginx/Apache to serve static files
# Or use a Node.js static server like serve

npm install -g serve
serve -s dist -l 3000
```

### Environment Variables for Web
Create `.env.production`:
```
VITE_API_URL=https://your-api.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_KEY=your_supabase_key
```

---

## Mobile App (React Native)

### Setup React Native Project

```bash
# Create a new React Native project
npx create-expo-app BankScalperEA
cd BankScalperEA

# Install required packages
npm install react-native-web react-dom \
  @react-navigation/native \
  react-native-screens \
  react-native-gesture-handler
```

### Build for iOS
```bash
# Requires macOS and Xcode
npm run ios

# Build for App Store
eas build --platform ios --auto-submit
```

### Build for Android
```bash
# Build for testing
npm run android

# Build AAB for Play Store
eas build --platform android
```

### Publish to App Stores

#### Google Play Store
```bash
# Create keystore
keytool -genkey -v -keystore ~/my-app-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias my-key

# Build and upload
eas build --platform android --auto-submit
```

#### Apple App Store
```bash
# Requires Apple Developer account
eas build --platform ios --auto-submit
```

---

## Auto-Update System

### How It Works
1. App checks for updates on startup
2. If new version available, downloads and shows notification
3. User can install update immediately or later
4. Auto-restart after installation

### Configuring Updates

#### 1. Set Up Release Server
Use GitHub Releases (configured in electron-updater):

```typescript
// In electron/main.ts
autoUpdater.checkForUpdatesAndNotify();
// Automatically checks your GitHub releases
```

#### 2. Create Release

```bash
# Tag your commit
git tag v1.1.0

# Push tag
git push origin v1.1.0

# Create GitHub release with binaries
# electron-builder CI/CD will do this automatically
```

#### 3. Custom Update Server
If not using GitHub:

```typescript
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();
autoUpdater.setFeedURL({
  provider: 'generic',
  url: 'https://your-server.com/updates/'
});
```

---

## Release Process

### Version Bumping
```bash
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0
```

### Automated Release (GitHub Actions)
1. Push version tag: `git push origin vX.X.X`
2. GitHub Actions automatically:
   - Builds for Windows, macOS, Linux
   - Creates installers
   - Uploads to GitHub Releases
   - Updates latest version info

### Manual Release
```bash
# Build for all platforms
npm run build:all

# Create GitHub release manually
# Upload dist_electron/* files

# OR upload to your server
scp dist_electron/* user@server:/var/www/releases/
```

---

## Distribution Channels

### Desktop App
- **Direct Download**: https://github.com/your-repo/releases
- **Installers**: NSIS (.exe), DMG (.dmg), AppImage (.AppImage)
- **Auto-updates**: Built-in for all platforms

### Web App
- **URLs**:
  - Vercel: `https://your-app.vercel.app`
  - Netlify: `https://your-app.netlify.app`
  - AWS: `https://your-cloudfront-url.cloudfront.net`

### Mobile Apps
- **iOS**: Apple App Store
- **Android**: Google Play Store
- **Alternative**: Direct APK/IPA distribution for testing

---

## Security Checklist

- [ ] Code signing enabled for macOS/Windows
- [ ] Update signatures verified
- [ ] API keys in environment variables (not hardcoded)
- [ ] HTTPS only for web deployment
- [ ] Content Security Policy headers set
- [ ] CORS properly configured
- [ ] License key validation on startup
- [ ] User data encrypted locally
- [ ] No sensitive data in logs

---

## Troubleshooting

### Electron Build Issues
```bash
# Clear cache and rebuild
rm -rf dist dist_electron node_modules
npm install
npm run build:electron:win
```

### Auto-Update Not Working
- Check GitHub releases page has proper assets
- Verify app version in package.json matches release tag
- Check electron-updater logs in DevTools

### Web Deployment Issues
- Verify environment variables are set
- Check CORS headers from API
- Ensure dist/ folder has index.html
- Check routing for SPA mode

### Mobile Build Issues
- Update Expo CLI: `npm install -g expo@latest`
- Clear build cache: `eas build --platform ios --clear-cache`
- Check provisioning profiles for iOS

---

## Support & Updates

For issues or feature requests:
- GitHub Issues: https://github.com/your-repo/issues
- Email: support@bankscalper.com
- Discord: [Your Discord Server]

