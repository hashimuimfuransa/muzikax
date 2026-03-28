# 🚀 MuzikaX Mobile App - Quick Start Guide

## ✅ Setup Complete!

Your MuzikaX app is now configured with **Capacitor** for native mobile functionality on Android and iOS!

## 📱 What You Get

### Native Features
- ✅ Camera access (photos & gallery)
- ✅ Push notifications
- ✅ Haptic feedback
- ✅ Status bar customization
- ✅ Splash screen
- ✅ Smart keyboard behavior
- ✅ Android back button support
- ✅ Native sharing
- ✅ Device information

### Mobile Experience
- ✅ Full-screen native app
- ✅ Offline support (PWA)
- ✅ Touch-optimized interface
- ✅ Smooth animations
- ✅ App-like experience

## 🎯 Quick Commands

### For Development (Recommended)
Live reload is already configured! Here's how to use it:

1. **Sync Capacitor (first time or when plugins change):**
   ```bash
   npx cap sync android
   ```

2. **Start dev server:**
   ```bash
   npm run dev
   ```

3. **In another terminal, run:**
   ```bash
   # No need for --livereload flag - it's automatic!
   npx cap run android
   ```

**Note:** The app will automatically load from `http://localhost:3000` when the dev server is running.

### For Production Build

#### Android
```bash
npm run mobile:android
```
This will:
- Build your Next.js app
- Sync with Capacitor
- Open Android Studio

Then in Android Studio:
- Click "Run" button (▶️) or press Shift+F10
- Select your device/emulator

#### iOS (macOS only)
```bash
npm run mobile:ios
```
This will:
- Build your Next.js app
- Sync with Capacitor
- Open Xcode

Then in Xcode:
- Select your team
- Select device/simulator
- Click Run (▶️) or press Cmd+R

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── CapacitorProvider.tsx    # Auto-initializes native features
│   └── utils/
│       └── capacitor-utils.ts        # Helper functions for native APIs
├── public/
│   └── manifest.json                  # Enhanced PWA config
├── capacitor.config.ts               # Capacitor settings
├── android/                          # Android project (auto-generated)
└── ios/                              # iOS project (auto-generated)
```

## 🔧 Using Native Features

### Import the utilities:
```typescript
import { 
  takePhoto, 
  pickImageFromGallery, 
  shareContent,
  hapticLight,
  isNative 
} from '@/utils/capacitor-utils';
```

### Example: Take a photo
```typescript
const handleTakePhoto = async () => {
  if (!isNative()) {
    alert('Camera only works in native app');
    return;
  }
  
  const photoPath = await takePhoto();
  if (photoPath) {
    console.log('Photo taken:', photoPath);
  }
};
```

### Example: Share content
```typescript
await shareContent({
  title: 'Check this out!',
  text: 'Listen to this track',
  url: 'https://www.muzikax.com/track/123'
});
```

### Example: Haptic feedback
```typescript
// Light tap
await hapticLight();

// Medium impact
await hapticMedium();

// Heavy impact
await hapticHeavy();
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run mobile:dev` | Shows dev instructions |
| `npm run mobile:build` | Build + sync for production |
| `npm run mobile:android` | Full Android build & open studio |
| `npm run mobile:ios` | Full iOS build & open Xcode |
| `npx cap sync` | Sync web assets with native |
| `npx cap open android` | Open Android Studio |
| `npx cap open ios` | Open Xcode |
| `npx cap run android` | Run on Android device |
| `npx cap run ios` | Run on iOS device |

## 📝 Important Files to Configure

### 1. capacitor.config.ts
Configure splash screen, status bar, keyboard behavior.

### 2. Android Permissions
Edit: `android/app/src/main/AndroidManifest.xml`
- Already includes camera, internet, storage permissions

### 3. iOS Permissions
Edit: `ios/App/App/Info.plist`
- Add camera/photo library usage descriptions

## 🐛 Troubleshooting

### Blank screen in app
```bash
npm run mobile:build
```

### Plugins not working
- Make sure you're running in native environment (not browser)
- Check `isNative()` returns true
- Verify permissions in native projects

### Need to update code
```bash
# After making changes:
npm run mobile:build
```

### Android build errors
```bash
cd android
./gradlew clean
cd ..
npx cap sync
```

### iOS build errors (macOS)
```bash
cd ios
pod install
cd ..
npx cap sync
```

## 📱 Testing on Real Devices

### Android
1. Enable Developer Options on device
2. Enable USB Debugging
3. Connect via USB
4. Run: `npx cap run android`

### iOS
1. Connect device to Mac
2. Trust computer on device
3. In Xcode, select your device
4. Run the app

## 🚀 Next Steps

1. **Test on devices** - Always test on real phones
2. **Customize icons** - Update app icons in `android/app/src/main/res/` and `ios/App/App/Assets.xcassets/`
3. **Add screenshots** - For app store listings
4. **Configure push notifications** - Set up backend service
5. **Prepare for stores** - Create store listings, privacy policy

## 📚 Resources

- **Full Guide**: See `CAPACITOR_MOBILE_APP_GUIDE.md`
- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Studio**: https://developer.android.com/studio
- **Xcode**: https://developer.apple.com/xcode/

## ✨ Ready to Build?

Run one of these commands:

```bash
# For Android
npm run mobile:android

# For iOS (macOS only)
npm run mobile:ios

# For development with live reload
npm run dev
# Then: npx cap run android --livereload
```

---

**Need help?** Check `CAPACITOR_MOBILE_APP_GUIDE.md` for detailed documentation.
