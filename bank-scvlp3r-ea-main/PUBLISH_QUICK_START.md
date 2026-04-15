# 🚀 BANK SCALPER EA - Quick Publish Guide

Get your app to market in minutes!

## 3-Step Publishing Process

### Step 1: Build the Desktop App
```bash
cd bank-scvlp3r-ea-main

# For Windows
npm run build:electron:win

# For macOS  
npm run build:electron:mac

# For Linux
npm run build:electron:linux
```

✅ Installers created in: `dist_electron/`

### Step 2: Deploy Web Version
Choose one option:

**Fastest - Vercel (1 minute):**
```bash
npm i -g vercel
vercel --prod
```

**Or Netlify (1 minute):**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Step 3: Set Up Auto-Updates
```bash
# Create release tag
git tag v1.0.0
git push origin v1.0.0

# Create GitHub release with installers
# (Or CI/CD will do this automatically)
```

---

## Distribution Files Generated

After building, you'll have:

**Windows:**
- ✅ `BANK_SCALPER_EA_Setup.exe` - Full installer
- ✅ `BANK SCALPER EA.exe` - Portable (no install needed)

**macOS:**
- ✅ `BANK SCALPER EA.dmg` - App bundle
- ✅ `BANK SCALPER EA.zip` - Alternative

**Linux:**
- ✅ `BANK SCALPER EA.AppImage` - Single file app
- ✅ `BANK SCALPER EA.deb` - Debian package

---

## Where to Publish

### 1️⃣ Desktop Installers
- **GitHub Releases** (Free): `github.com/your-repo/releases`
- **Direct Website**: Upload to your server
- **Scoop/Chocolatey**: Package for Windows users

### 2️⃣ Web Version
- **Vercel** (Free tier): `your-app.vercel.app`
- **Netlify** (Free tier): `your-app.netlify.app`

### 3️⃣ Mobile Apps (Coming Soon)
- **Google Play Store**: Android app
- **Apple App Store**: iOS app

---

## Setting Up Auto-Updates

### Enable GitHub Auto-Updates
```bash
# Already configured in electron/main.ts
# Just create GitHub releases with installers
```

### Check Your App Version
```bash
# In package.json - increment this
"version": "1.0.0"
```

### Create Release
```bash
git tag v1.0.0
git push origin v1.0.0
# GitHub Actions automatically builds and uploads
```

---

## Key Commands

```bash
# Development
npm run dev:electron          # Test desktop app locally

# Production Builds
npm run build:electron:win    # Windows
npm run build:electron:mac    # macOS
npm run build:electron:linux  # Linux
npm run build:all             # All platforms (requires all OS)

# Web
npm run build                 # Web production build
vercel --prod                 # Deploy to Vercel
netlify deploy --prod         # Deploy to Netlify
```

---

## Pre-Launch Checklist

- [ ] Update `version` in package.json
- [ ] Test app locally: `npm run dev:electron`
- [ ] Build installers: `npm run build:electron:win`
- [ ] Test installers by running them
- [ ] Deploy web: `vercel --prod`
- [ ] Create GitHub release with installers
- [ ] Share download link
- [ ] Set up monitoring/feedback

---

## Marketing Distribution

### Download Page Template
```html
<h1>Download BANK SCALPER EA</h1>

<h2>Desktop</h2>
<a href="...">Windows (.exe)</a>
<a href="...">macOS (.dmg)</a>
<a href="...">Linux (.AppImage)</a>

<h2>Web</h2>
<a href="https://your-app.vercel.app">Open Web App</a>
```

### Social Media Post
```
🚀 BANK SCALPER EA is live!

✅ Desktop: Windows, macOS, Linux
✅ Web: Works in any browser
✅ Auto-updates: One-click installs

Download: [your-link]

#trading #EA #ForexBot
```

---

## First Launch Analytics

Track installs with:
```typescript
// In electron/main.ts
const { ipcRenderer } = require('electron');

// Track app opened
ipcRenderer.send('app-opened', { version: app.getVersion() });

// Later: Send to your analytics backend
```

---

## Troubleshooting

**App won't install?**
```bash
npm run build:electron:win -- --publish=never
# Then test the .exe manually
```

**Auto-updates not working?**
- Check GitHub releases page
- Verify version matches tag
- Check electron console (Dev Tools)

**Web deployment failed?**
```bash
npm run build
vercel logs  # Check for errors
```

---

## Next Steps

1. ✅ You've built the app
2. ⏳ Ready to publish (follow this guide)
3. 📊 Monitor usage and feedback
4. 🔄 Push updates: `git tag v1.0.1 && git push origin v1.0.1`

🎉 **That's it! You're published!**

For detailed instructions, see: [DEPLOYMENT.md](./DEPLOYMENT.md)

