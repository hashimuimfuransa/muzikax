# ADB Device Authorization Fix

## Problem
```
adb.exe: device still authorizing
```

This means the Android emulator/device hasn't authorized your computer's ADB connection yet.

---

## Solutions (Try in Order)

### Solution 1: Check Emulator for Authorization Dialog

1. **Look at your emulator screen** - there should be a popup asking:
   - "Allow USB debugging?"
   - "Always allow from this computer?"

2. **Check the box** "Always allow from this computer"

3. **Click OK or Allow**

4. **Try running again:**
   ```bash
   npx cap run android
   ```

---

### Solution 2: Restart ADB Server (If Dialog Doesn't Appear)

Sometimes the authorization dialog doesn't appear. Try this:

```powershell
# Kill ADB server
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe kill-server

# Start fresh
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe start-server

# Check devices
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

**Expected output:**
```
List of devices attached
emulator-5554   unauthorized  <-- Will show unauthorized initially
```

Wait 10-30 seconds, then check again. It should change to `device`.

---

### Solution 3: Cold Boot the Emulator

The emulator might have stale ADB state.

#### Via Android Studio:
1. Open **Device Manager** in Android Studio
2. Find your emulator (Pixel 9 Pro Fold)
3. Click the **⋮** (three dots) menu
4. Select **Cold Boot Now**

#### Via Command Line:
```powershell
# Kill emulator
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe emu kill

# Then restart from Android Studio or:
cd C:\Users\Lenovo\AppData\Local\Android\Sdk\emulator
.\emulator.exe -avd Pixel_9_Pro_Fold
```

After it boots, try:
```bash
npx cap run android
```

---

### Solution 4: Revoke USB Debugging Authorizations

If previous authorizations are corrupted:

#### On the Emulator:
1. Open **Settings** app
2. Go to **System > Developer options**
3. Scroll down to **Debugging** section
4. Tap **Revoke USB debugging authorizations**
5. Confirm

#### Then on your computer:
```powershell
# Kill and restart ADB
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe kill-server
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe start-server

# Check devices
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe devices
```

Now when you run `npx cap run android`, the authorization dialog should appear on the emulator.

---

### Solution 5: Use Android Studio to Deploy (Most Reliable)

If command line continues to fail, use Android Studio directly:

```bash
# Open Android Studio
npx cap open android
```

Then in Android Studio:
1. Wait for Gradle sync to complete
2. Click the **Run** button (▶️ green triangle)
3. Select your emulator from the list
4. Android Studio will handle ADB authorization properly

**Why this works better:**
- Android Studio has better integration with ADB
- Shows authorization dialogs more reliably
- Better error messages if something fails

---

### Solution 6: Disable/Enable Developer Options

As a last resort:

#### On Emulator:
1. **Settings > System > Developer options**
2. Toggle **OFF** at the top
3. Wait 5 seconds
4. Toggle **ON** again
5. Make sure **USB debugging** is enabled
6. Try Solution 4 again (revoke authorizations)

---

## Quick Fix Script

Run this PowerShell script to automate ADB restart:

```powershell
Write-Host "Restarting ADB server..." -ForegroundColor Cyan
& "C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe" kill-server
Start-Sleep -Seconds 2
& "C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe" start-server
Start-Sleep -Seconds 3
Write-Host "Checking devices..." -ForegroundColor Cyan
& "C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools\adb.exe" devices

Write-Host "`nIf device shows 'unauthorized', check emulator for authorization dialog!" -ForegroundColor Yellow
```

---

## Prevention Tips

### Keep These Running:
- ✅ **Android Studio** (helps manage ADB)
- ✅ **Emulator from Android Studio** (not standalone)
- ✅ **ADB server** (automatically started)

### Before Running App:
1. Make sure emulator is fully booted (see home screen)
2. Wait 30 seconds after boot before deploying
3. Check `adb devices` shows `device` not `unauthorized`

### Common Issues:

#### "No devices found"
- Emulator not fully booted
- ADB server not running
- Emulator needs cold boot

#### "Device unauthorized"  
- Check emulator for popup dialog
- Revoke authorizations and retry
- Cold boot emulator

#### "Device still authorizing" (forever)
- Emulator ADB state is stuck
- Kill emulator completely
- Cold boot from Android Studio

---

## Recommended Workflow

### For Development:

1. **Start Android Studio**
   ```bash
   npx cap open android
   ```

2. **Start Emulator from Android Studio**
   - Device Manager → Launch your emulator
   - Wait for full boot (30-60 seconds)

3. **Check ADB Connection**
   ```bash
   adb devices
   # Should show: emulator-5554   device
   ```

4. **Authorize if prompted** (on emulator screen)
   - Check "Always allow"
   - Click OK

5. **Deploy from Android Studio**
   - Click Run button (▶️)
   - More reliable than command line

### Or Use Command Line (Once Authorized):

```bash
# Make sure ADB sees device
adb devices

# Run Capacitor app
npx cap run android
```

---

## Verify Success

When working correctly, you'll see:

```
√ Running Gradle build in XX.XXs
√ Deploying app-debug.apk to emulator-5554 - success!
Application launched on device
```

The app should appear on your emulator within 10-30 seconds.

---

## Still Not Working?

### Nuclear Option - Complete Reset:

```powershell
# 1. Kill everything
taskkill /F /IM *emulator*
taskkill /F /IM *adb*

# 2. Clean Capacitor
npx cap sync android

# 3. Clean Gradle
cd android
./gradlew clean
cd ..

# 4. Restart ADB
adb kill-server
adb start-server

# 5. Cold boot emulator from Android Studio

# 6. Try deploy again
npx cap run android
```

### Last Resort - Use Physical Device:

If emulators continue to fail, test on a real Android phone:

1. Enable **Developer Options** on phone
2. Enable **USB Debugging**
3. Connect via USB
4. Authorize on phone when prompted
5. Run: `npx cap run android`

Physical devices often work more reliably than emulators for ADB.

---

## Additional Resources

- ADB Documentation: https://developer.android.com/studio/command-line/adb
- Capacitor Android Guide: https://capacitorjs.com/docs/android/configuration
- Android Studio: https://developer.android.com/studio/intro

---

**TL;DR:** 
1. Look for authorization popup on emulator and click OK
2. If no popup, cold boot emulator from Android Studio
3. Or just use `npx cap open android` and deploy from Android Studio (most reliable!)
