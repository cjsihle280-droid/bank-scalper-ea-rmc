# Mobile App Setup - React Native + Expo

## Quick Start: Android & iOS

### Prerequisites
- Node.js 18+
- npm or yarn
- Android Studio (for Android)
- Xcode (for macOS/iOS development)

### Step 1: Create React Native Project

```bash
# Create new Expo project
npx create-expo-app BankScalperEA
cd BankScalperEA

# Install required packages
npm install \
  @react-navigation/native \
  react-native-screens \
  react-native-gesture-handler \
  react-native-reanimated \
  @supabase/supabase-js \
  expo-notifications

# Start development
npm start
```

### Step 2: Set Up Navigation

```bash
npm install @react-navigation/bottom-tabs @react-navigation/native-stack
```

Create `app.tsx`:
```typescript
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Signals" component={SignalsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### Step 3: Build for Android

```bash
# Test on Android emulator/device
npm run android

# Build APK for distribution
eas build --platform android

# Build AAB for Google Play Store
eas build --platform android --auto-submit
```

### Step 4: Build for iOS

```bash
# Test on iOS simulator/device
npm run ios

# Build for App Store
eas build --platform ios --auto-submit
```

---

## Publishing to App Stores

### Google Play Store

#### 1. Create Developer Account
- Go to https://play.google.com/console
- Sign up ($25 one-time fee)
- Create app

#### 2. Generate Signing Key
```bash
# Generate keystore
keytool -genkey -v -keystore ~/my-release-key.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 -alias my-key

# Store credentials securely
# KEEP THIS FILE SAFE - don't lose it!
```

#### 3. Configure EAS
```bash
npm install -g eas-cli
eas login

# Create eas.json
eas build:configure
```

Edit `eas.json`:
```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccount": "path/to/service-account.json",
        "track": "internal"
      }
    }
  }
}
```

#### 4. Build & Release
```bash
# Build
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --profile production
```

### Apple App Store

#### 1. Create Developer Account
- Go to https://developer.apple.com
- Enroll ($99/year)
- Create app in App Store Connect

#### 2. Set Up Provisioning
```bash
# Generate certificates
eas credentials
```

#### 3. Build for App Store
```bash
eas build --platform ios --profile production
```

#### 4. Submit
```bash
eas submit --platform ios --profile production
```

---

## App Features for Mobile

### Push Notifications
```typescript
import * as Notifications from 'expo-notifications';

// Request notification permission
const notificationPermission = 
  await Notifications.requestPermissionsAsync();

// Send local notification
await Notifications.scheduleNotificationAsync({
  content: {
    title: '🚀 BANK SCALPER EA',
    body: 'BUY Signal - EURUSD',
  },
  trigger: { seconds: 2 },
});
```

### Background Location Updates
```typescript
import * as Location from 'expo-location';

// Get current location
const location = await Location.getCurrentPositionAsync({});
```

### Local Storage
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Save settings
await AsyncStorage.setItem('signal_config', JSON.stringify(config));

// Load settings
const saved = await AsyncStorage.getItem('signal_config');
```

---

## Mobile App Distribution

### Alternative: Direct Distribution

#### Android APK
```bash
# Build APK without Play Store
eas build --platform android --no-submit

# Download APK
# Share link with users
```

Users install with:
- Click link on phone
- Allow unknown sources
- Install

#### iOS TestFlight
```bash
# Build for TestFlight
eas build --platform ios

# Invite testers in App Store Connect
# Send TestFlight link
# Testers can install from email link
```

---

## Performance Tips

1. **Code Splitting**: Lazy load screens
2. **Asset Optimization**: Compress images
3. **Bundle Size**: Tree-shake unused code
4. **Caching**: Use React Query

---

## Common Issues

### Build Fails
```bash
# Clear cache and rebuild
eas build --platform android --clear-cache
```

### Notification Permissions
```bash
# iOS: Check Info.plist
# Android: Check AndroidManifest.xml
```

### Large Bundle
```bash
# Analyze bundle size
npm install -g source-map-explorer
source-map-explorer dist/**/*.js
```

---

## Getting Started Commands

```bash
# Development
npm start                           # Start Expo
npm run android                     # Test on Android
npm run ios                         # Test on iOS

# Build & Release
eas build --platform android        # Build for Play Store
eas build --platform ios            # Build for App Store
eas submit --platform android       # Release to Play Store
eas submit --platform ios           # Release to App Store

# Testing
npm test                            # Jest tests
npm run test:watch                  # Watch mode
```

---

## Revenue Models

1. **Free with Ads**: Use AdMob
2. **Free + In-App Purchase**: Premium signals
3. **Subscription**: $4.99/month
4. **Freemium**: Basic free, Pro paid

---

## Monitoring

- **Crashes**: Firebase Crashlytics
- **Analytics**: Firebase Analytics
- **Performance**: Performance Monitor
- **User Feedback**: In-app reviews

```bash
npm install firebase
```

---

## Next Steps

1. ✅ Set up React Native project
2. ⏳ Build APK/IPA files
3. 📦 Submit to app stores
4. 🎉 Launch mobile app!

For help: `eas help` or https://docs.expo.dev

