#!/bin/bash
# BANK SCALPER EA - Command Reference & Automation Script

# ============================================
# SETUP & INSTALLATION
# ============================================

# Install dependencies
npm install

# Install desktop-specific packages
npm install --save-dev electron electron-builder electron-updater electron-is-dev concurrently wait-on

# Install type definitions
npm install --save-dev @types/electron @types/node


# ============================================
# DEVELOPMENT
# ============================================

# Dev mode - Web only
npm run dev

# Dev mode - Desktop with Web (Electron window)
npm run dev:electron

# Test TypeScript
npx tsc --noEmit

# Run tests
npm test
npm run test:watch

# Lint code
npm run lint


# ============================================
# BUILDING
# ============================================

# Build web app for production
npm run build

# Build web app in development mode
npm run build:dev

# Build desktop installers (ALL PLATFORMS)
npm run build:all

# Build Windows installer + portable
npm run build:electron:win

# Build macOS installer
npm run build:electron:mac

# Build Linux installer
npm run build:electron:linux


# ============================================
# DEPLOYMENT - WEB
# ============================================

# Deploy to Vercel (Recommended)
npm i -g vercel
vercel login
vercel --prod

# Deploy to Netlify
npm i -g netlify-cli
netlify deploy --prod --dir=dist

# Deploy to GitHub Pages
npm i -g gh-pages
npm run build
gh-pages -d dist


# ============================================
# DEPLOYMENT - DESKTOP
# ============================================

# Upload to GitHub Releases manually
# OR use GitHub Actions (automatic on git tag push)

# Version bump and release
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.0 → 1.1.0
npm version major    # 1.0.0 → 2.0.0

# Push version tag to trigger CI/CD
git push origin v1.0.0

# After CI builds, create release with:
# - BANK_SCALPER_EA_Setup.exe
# - BANK SCALPER EA.exe
# - BANK SCALPER EA.dmg
# - BANK SCALPER EA-x86_64.AppImage


# ============================================
# MOBILE APP SETUP
# ============================================

# Create React Native project
npx create-expo-app BankScalperEA
cd BankScalperEA

# Install required packages
npm install @react-navigation/native @react-navigation/bottom-tabs
npm install --save-dev expo

# Build APK for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios


# ============================================
# DISTRIBUTION VERIFICATION
# ============================================

# Test Windows installer locally
./dist_electron/BANK_SCALPER_EA_Setup.exe

# Test portable executable
./dist_electron/BANK\ SCALPER\ EA.exe

# Test macOS app
open dist_electron/BANK\ SCALPER\ EA.app

# Test Linux AppImage
./dist_electron/BANK\ SCALPER\ EA.AppImage

# Verify web build
npm run preview


# ============================================
# CLEAN & REBUILD
# ============================================

# Clean all generated files
rm -rf dist dist_electron node_modules

# Full rebuild
npm install
npm run build
npm run build:all


# ============================================
# GIT & VERSION CONTROL
# ============================================

# Create git repository
git init

# Add remote
git remote add origin https://github.com/your-username/bank-scalper-ea.git

# Initial commit
git add .
git commit -m "Initial commit - Bank Scalper EA"

# Create version tag for release
git tag v1.0.0
git push origin main --tags

# Check tags
git tag -l
git show v1.0.0


# ============================================
# QUICK COMMANDS
# ============================================

# What to run right now
npm run build              # Build web
npm run build:electron:win # Build Windows

# One-liner for full build
npm install && npm run build && npm run build:electron:win && npm run build:electron:mac && npm run build:electron:linux

# Deploy web app immediately
npm run build && vercel --prod

# Check what will be released
npm run build
ls -lah dist_electron/

# Package info
npm list --depth=0


# ============================================
# AUTOMATION EXAMPLES
# ============================================

# Build and upload to GitHub (example)
npm run build:all
gh release create v1.0.0 dist_electron/*

# Build desktop only
npm run build:electron:win && npm run build:electron:mac && npm run build:electron:linux

# Update and commit version
npm version minor
git push origin main

# Complete publish workflow (example)
git pull origin main
npm install
npm test
npm run build
npm run build:all
npm version minor
git push origin main --tags


# ============================================
# TROUBLESHOOTING COMMANDS
# ============================================

# Clear npm cache
npm cache clean --force

# Verify installation
npm list electron
npm list electron-builder

# Check Node version
node --version
npm --version

# Clear Webpack/Vite cache
rm -rf .next dist .vite

# Force reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check for security vulnerabilities
npm audit

# Fix security issues automatically
npm audit fix

# Update all dependencies
npm update

# Check outdated packages
npm outdated


# ============================================
# MONITORING & TESTING
# ============================================

# Start development and keep running
npm run dev &

# Monitor file changes
npm run dev:electron &

# Check app version
npm list | grep version

# Test in production mode locally
npm run preview

# Build size analysis
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer dist/stats.json


# ============================================
# CI/CD (GitHub Actions)
# ============================================

# GitHub Actions will automatically:
# 1. Build on pushed code
# 2. Run tests
# 3. Build desktop apps (Windows, Mac, Linux)
# 4. Create releases
# 5. Update version info

# To trigger: Push tag
git tag v1.0.0
git push origin v1.0.0

# Check workflow status
# Visit: https://github.com/your-repo/actions


# ============================================
# FILES & LOCATIONS
# ============================================

# Web app files
# - Source: ./src/
# - Built: ./dist/
# - Deploy: ./dist/ to Vercel/Netlify

# Desktop app files
# - Electron main: ./electron/main.ts
# - Preload: ./electron/preload.ts
# - Installers: ./dist_electron/

# Config files
# - Vite: vite.config.ts
# - Tailwind: tailwind.config.ts
# - TypeScript: tsconfig.json
# - Git Actions: .github/workflows/build-release.yml


# ============================================
# PERFORMANCE OPTIMIZATION
# ============================================

# Analyze bundle size
npm run build
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'

# Tree shake unused code
# (Already done automatically by Vite)

# Minify and compress
# (Done automatically in production builds)

# Check loading time
npm run preview
# Open DevTools Network tab


# ============================================
# SUCCESS INDICATORS
# ============================================

# ✅ All passed when:
echo "✅ npm install completes without errors"
echo "✅ npm run build creates dist/ folder"
echo "✅ npm run build:electron:win creates .exe files"
echo "✅ npm run preview loads web app"
echo "✅ vercel --prod shows deployment URL"
echo "✅ GitHub release contains installer files"
echo "✅ Users can download and run app"

# 🚀 YOU'RE READY TO PUBLISH!

