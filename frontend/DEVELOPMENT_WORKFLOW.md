# Development Workflow for Capacitor

## 🔄 Recommended Development Approach

For the **best development experience**, use **Live Reload** with the dev server:

### Step 1: Configure Live Reload

The `capacitor.config.ts` already has live reload enabled by default:

```typescript
server: {
  url: 'http://localhost:3000',  // Already enabled
  cleartext: true
},
```

### Step 2: Create Minimal Build Output (One-time setup)

Capacitor needs the `out` directory to exist for syncing (even with live reload):

```bash
# The out directory with index.html already exists
# If you need to recreate it, just ensure it has an index.html
```

### Step 3: Start Development Server

```bash
npm run dev
```

### Step 4: Sync Capacitor (First Time or When Plugins Change)

```bash
npx cap sync android
```

### Step 5: Run on Device/Emulator

In a new terminal (while dev server is running):

```bash
npx cap run android
```

**Note:** With `server.url` configured, the app will automatically load from `http://localhost:3000` - no need for `--live-reload` flag!

**Benefits:**
- ✅ Instant code changes (no rebuild needed)
- ✅ Fastest development workflow
- ✅ Debug in real-time
- ✅ See changes immediately
- ✅ All Capacitor plugins work normally

---

## 🏗️ Production Build Workflow

When you're ready to build for production:

### Option A: Use Dev Server Config (Recommended)

Keep using the default `next.config.js` (not the capacitor one) and:

```bash
npm run dev
# Then run with livereload
npx cap run android --livereload
```

This loads from your dev server but packages as a native app.

### Option B: Static Export (Requires Fixes)

To create a true standalone APK/IPA, you need to:

1. **Fix dynamic routes** - Add `generateStaticParams()` to:
   - `/album/[id]`
   - `/artists/[id]`
   - `/tracks/[id]`
   - `/edit-album/[id]`
   - All other dynamic routes

2. **Build with capacitor config:**
   ```bash
   npm run build:capacitor
   npx cap sync
   npx cap open android
   ```

**Note:** This requires updating all dynamic pages to support static generation.

---

## 🎯 Current Recommended Approach

### For Development & Testing:
```bash
# 1. Edit capacitor.config.ts
# Uncomment: url: 'http://localhost:3000'

# 2. Start dev server
npm run dev

# 3. In another terminal
npx cap run android --livereload
```

### For Quick Testing (Without Live Reload):
```bash
# Just run the dev server and test in browser
npm run dev

# Open http://localhost:3000 on mobile device
# (if on same network)
```

### For Production Builds:
Choose one:
1. **Backend API approach**: Point to production API instead of localhost
2. **Static export**: Fix dynamic routes first (see above)

---

## 📱 Testing Checklist

Before publishing:

- [ ] Test on Android device
- [ ] Test on iOS device (if applicable)
- [ ] Test camera functionality
- [ ] Test push notifications
- [ ] Test haptic feedback
- [ ] Test offline mode
- [ ] Test sharing features
- [ ] Test back button (Android)
- [ ] Test keyboard behavior
- [ ] Test status bar appearance
- [ ] Test splash screen

---

## 🔧 Troubleshooting

### "Could not find web assets directory"
The `out` directory now exists with a minimal index.html. If you still get this error:

```bash
# Make sure out/index.html exists
# Then sync Capacitor:
npx cap sync android

# Start dev server and run:
npm run dev
npx cap run android
```

### Want to Build Without Dev Server?
You'll need to fix dynamic routes first by adding `generateStaticParams()` to all `[slug]` pages.

Example for `/album/[id]/page.tsx`:
```typescript
export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }] // Or fetch from API
}
```

### App Shows Blank Screen
Make sure you either:
- Are running `npm run dev` with live reload enabled, OR
- Have built the project and synced with `npx cap sync`

---

## 🚀 Quick Commands Reference

| Goal | Command |
|------|---------|
| Dev with live reload | `npm run dev` + `npx cap run android --livereload` |
| Test in browser | `npm run dev` |
| Open Android Studio | `npx cap open android` |
| Open Xcode | `npx cap open ios` |
| Sync changes | `npx cap sync` |
| Full Android build | `npm run mobile:android` |
| Full iOS build | `npm run mobile:ios` |

---

## 💡 Pro Tips

1. **Use live reload** for 99% of development - it's fastest
2. **Test on real devices** regularly, not just emulators
3. **Check console logs** in Android Studio/Xcode for errors
4. **Update native projects** periodically with `npx cap sync`
5. **Keep capacitor.config.ts** ready for switching between dev/prod

---

## 📞 Need Help?

- See `MOBILE_APP_QUICK_START.md` for basics
- See `CAPACITOR_MOBILE_APP_GUIDE.md` for full documentation
- Check Capacitor docs: https://capacitorjs.com/docs

---

**TL;DR:** Use `npm run dev` + `npx cap run android --livereload` for development!
