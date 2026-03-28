# Capacitor Mobile App Implementation Guide

## Overview
MuzikaX now uses **Capacitor** to provide native mobile app functionality for Android and iOS. This guide explains how to build, test, and deploy the mobile app.

## What is Capacitor?
Capacitor is a cross-platform API layer that allows web applications to access native device features and be deployed as native apps on iOS, Android, and desktop platforms.

## Features Implemented

### Native Device APIs
- ✅ **Camera** - Take photos and pick from gallery
- ✅ **Share** - Native share dialog for content sharing
- ✅ **Push Notifications** - Receive push notifications
- ✅ **Haptic Feedback** - Tactile feedback on user interactions
- ✅ **Status Bar** - Custom status bar styling
- ✅ **Splash Screen** - Native splash screen on app launch
- ✅ **Keyboard** - Smart keyboard behavior
- ✅ **Back Button** - Android back button handling
- ✅ **Device Info** - Access device information

### Mobile-Optimized Features
- ✅ Native app-like experience
- ✅ Offline support (via PWA)
- ✅ Full-screen mode
- ✅ Touch-optimized UI
- ✅ Smooth animations and transitions

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── CapacitorProvider.tsx    # Initializes Capacitor features
│   └── utils/
│       └── capacitor-utils.ts        # Utility functions for native APIs
├── public/
│   └── manifest.json                  # Enhanced PWA manifest
├── capacitor.config.ts               # Capacitor configuration
├── android/                          # Android native project
└── ios/                              # iOS native project
```

## Development Workflow

### 1. Build the Web App
```bash
npm run build
```
This creates a static export in the `out/` directory.

### 2. Sync with Capacitor
```bash
npx cap sync
```
This copies the web assets to native projects and updates plugins.

### 3. Open in Android Studio
```bash
npx cap open android
```
Or use the shortcut:
```bash
npm run mobile:android
```

### 4. Open in Xcode (macOS only)
```bash
npx cap open ios
```
Or use the shortcut:
```bash
npm run mobile:ios
```

## Building for Production

### Android

#### Debug Build
1. Open Android Studio: `npx cap open android`
2. Click "Run" button or press Shift+F10
3. Select your device/emulator

#### Release Build (APK)
1. In Android Studio: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
2. Find APK at: `android/app/build/outputs/apk/release/app-release.apk`

#### Release Build (AAB for Play Store)
1. In Android Studio: **Build > Generate Signed Bundle / APK**
2. Select **Android App Bundle**
3. Follow signing process
4. Upload to Google Play Console

### iOS

#### Requirements
- macOS computer
- Xcode installed
- Apple Developer account (for device testing & distribution)

#### Build Steps
1. Open Xcode: `npx cap open ios`
2. Select your team in project settings
3. Select target device/simulator
4. Click Run (▶️) or press Cmd+R

#### Archive for App Store
1. In Xcode: **Product > Archive**
2. When archive completes, Organizer window opens
3. Click **Distribute App**
4. Follow App Store Connect submission process

## Testing on Devices

### Android Device
1. Enable **Developer Options** on your device
2. Enable **USB Debugging**
3. Connect via USB
4. Run: `npx cap run android`
5. Or use Android Studio's Run button

### iOS Device
1. Connect device to Mac
2. Trust the computer on your device
3. In Xcode, select your device
4. Run the app (requires Apple Developer account)

## Using Native Features in Code

### Import Utilities
```typescript
import { 
  takePhoto, 
  pickImageFromGallery, 
  shareContent,
  hapticLight,
  hapticMedium,
  hapticHeavy,
  isNative 
} from '@/utils/capacitor-utils';
```

### Example: Take Photo
```typescript
const handleTakePhoto = async () => {
  if (!isNative()) {
    alert('Camera only works in native app');
    return;
  }
  
  const photoPath = await takePhoto();
  if (photoPath) {
    console.log('Photo taken:', photoPath);
    // Use the photo
  }
};
```

### Example: Share Content
```typescript
const handleShare = async () => {
  try {
    await shareContent({
      title: 'Check out this track!',
      text: 'Listen to this amazing beat on MuzikaX',
      url: 'https://www.muzikax.com/track/123'
    });
  } catch (error) {
    console.error('Share failed:', error);
  }
};
```

### Example: Haptic Feedback
```typescript
// Light feedback for button presses
const handleButtonClick = async () => {
  await hapticLight();
  // Handle click
};

// Medium feedback for selections
const handleSelection = async () => {
  await hapticMedium();
  // Handle selection
};

// Heavy feedback for important actions
const handleDelete = async () => {
  await hapticHeavy();
  // Confirm delete action
};
```

## Configuration Files

### capacitor.config.ts
```typescript
{
  appId: 'com.muzikax.app',
  appName: 'MuzikaX',
  webDir: 'out',
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#000000',
      showSpinner: true,
      spinnerColor: '#FF4D67'
    },
    Keyboard: {
      resize: 'body'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
}
```

### manifest.json (Enhanced)
- App shortcuts (quick actions)
- Share target integration
- Screenshots for stores
- Proper icon configurations

## Available NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Build Next.js app for production |
| `npm run cap:sync` | Sync web assets with native projects |
| `npm run mobile:build` | Build + sync in one command |
| `npm run mobile:android` | Build and open Android Studio |
| `npm run mobile:ios` | Build and open Xcode |
| `npm run cap:open:android` | Open Android Studio |
| `npm run cap:open:ios` | Open Xcode |
| `npm run cap:run:android` | Run on Android device |
| `npm run cap:run:ios` | Run on iOS device |

## Troubleshooting

### App Shows Blank Screen
1. Check that `out/` directory exists (run `npm run build`)
2. Run `npx cap sync` to copy latest build
3. Clean and rebuild native project

### Plugins Not Working
1. Ensure you're running in native environment (check `isNative()`)
2. Verify plugin permissions in native projects
3. Check console logs for errors

### Android Build Errors
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### iOS Build Errors
```bash
cd ios
pod install
cd ..
npx cap sync
```

### Hot Reload During Development
For faster development, you can load from dev server:

Edit `capacitor.config.ts`:
```typescript
server: {
  url: 'http://localhost:3000',
  cleartext: true
}
```

Then run:
```bash
npm run dev
npx cap run android --livereload
```

## Permissions Configuration

### Android (android/app/src/main/AndroidManifest.xml)
Already configured:
- Camera
- Internet
- Storage
- Notifications

### iOS (ios/App/App/Info.plist)
Configure camera and photo library usage descriptions for App Store approval.

## Next Steps

1. **Test on Real Devices**: Always test on actual phones, not just emulators
2. **Performance Testing**: Monitor battery usage and memory
3. **App Store Assets**: Create screenshots and promotional graphics
4. **Privacy Policy**: Required for app store submissions
5. **Push Notification Backend**: Set up server for sending notifications

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Studio](https://developer.android.com/studio)
- [Xcode](https://developer.apple.com/xcode/)
- [Google Play Console](https://play.google.com/console)
- [App Store Connect](https://appstoreconnect.apple.com/)

## Support

For issues or questions:
1. Check Capacitor docs: https://capacitorjs.com/docs
2. Review plugin documentation
3. Check GitHub issues for specific plugins

---

**Ready to build?** Run: `npm run mobile:android` or `npm run mobile:ios`
