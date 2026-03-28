# Fix: Android SDK Location Not Found

## Problem
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable
or by setting the sdk.dir path in your project's local.properties file.
```

## Solution (Choose ONE method)

### Method 1: Create local.properties File (Easiest - Recommended)

Create a file at `C:\Users\Lenovo\muzikax\frontend\android\local.properties` with:

```properties
sdk.dir=C\:\\Users\\Lenovo\\AppData\\Local\\Android\\Sdk
```

**Note:** Adjust the path if your Android SDK is installed elsewhere. Common locations:
- `C:\\Users\\[YourName]\\AppData\\Local\\Android\\Sdk`
- `C:\\Program Files\\Android\\Android Studio\\Sdk`

---

### Method 2: Set ANDROID_HOME Environment Variable (System-wide)

#### Windows PowerShell (Temporary - Current Session):
```powershell
$env:ANDROID_HOME="C:\Users\Lenovo\AppData\Local\Android\Sdk"
npx cap run android
```

#### Windows System Properties (Permanent):

1. **Open System Properties:**
   - Press `Win + R`
   - Type: `sysdm.cpl`
   - Press Enter

2. **Go to Advanced tab:**
   - Click "Environment Variables"

3. **Add New Variable:**
   - Under "User variables" or "System variables"
   - Click "New"
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Users\Lenovo\AppData\Local\Android\Sdk`
   - Click OK

4. **Restart your terminal** and run:
   ```bash
   npx cap run android
   ```

---

## How to Find Your Android SDK Location

### If you have Android Studio installed:
1. Open Android Studio
2. Go to **File > Settings** (or **Android Studio > Preferences** on Mac)
3. Navigate to **Appearance & Behavior > System Settings > Android SDK**
4. Look for "Android SDK Location" at the top

### Common Windows locations:
```
C:\Users\[YourUsername]\AppData\Local\Android\Sdk
C:\Program Files\Android\Android Studio\Sdk
```

### Check if SDK exists:
```powershell
# Replace with your actual path
Test-Path "C:\Users\Lenovo\AppData\Local\Android\Sdk"
```

If it returns `False`, you need to install Android SDK first.

---

## Installing Android SDK (If Not Installed)

### Option A: Install via Android Studio (Recommended)
1. Download from: https://developer.android.com/studio
2. Install Android Studio
3. During installation, it will install the SDK automatically

### Option B: Command Line Tools Only
1. Download from: https://developer.android.com/studio#command-tools
2. Extract to: `C:\Users\Lenovo\AppData\Local\Android\Sdk`
3. Install required components:
   ```powershell
   cd C:\Users\Lenovo\AppData\Local\Android\Sdk\cmdline-tools
   .\bin\sdkmanager.bat "platform-tools" "platforms;android-35" "build-tools;35.0.0"
   ```

---

## After Setting SDK Path

Run these commands:

```powershell
# Navigate to your project
cd C:\Users\Lenovo\muzikax\frontend

# Sync Capacitor
npx cap sync android

# Run on emulator/device
npx cap run android
```

---

## Verify Installation

Check that SDK is properly configured:

```powershell
# Test ANDROID_HOME (if set as env variable)
echo $env:ANDROID_HOME

# Or check local.properties exists
Test-Path android\local.properties
```

---

## Additional Configuration

### Add platform-tools to PATH (Optional but helpful)

Add to your system PATH:
```
C:\Users\Lenovo\AppData\Local\Android\Sdk\platform-tools
C:\Users\Lenovo\AppData\Local\Android\Sdk\tools
```

This allows you to use `adb` and other tools from anywhere.

---

## Troubleshooting

### Still getting SDK not found error?

1. **Verify the path is correct:**
   ```powershell
   # Check if SDK directory exists
   Get-ChildItem "C:\Users\Lenovo\AppData\Local\Android\Sdk"
   ```

2. **Make sure local.properties uses double backslashes:**
   ```properties
   sdk.dir=C\\:\\Users\\Lenovo\\AppData\\Local\\Android\\Sdk
   ```

3. **Try both methods together:**
   - Set ANDROID_HOME environment variable
   - AND create local.properties file

4. **Check Android Studio installation:**
   - Make sure Android Studio is installed and updated
   - Open Android Studio once to complete setup

---

## Quick Fix Script

Run this PowerShell script to automatically create local.properties:

```powershell
# Find common SDK locations
$possiblePaths = @(
    "C:\Users\$env:USERNAME\AppData\Local\Android\Sdk",
    "C:\Program Files\Android\Android Studio\Sdk"
)

foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
        $escapedPath = $path.Replace('\', '\\')
        $content = "sdk.dir=$escapedPath"
        Set-Content -Path "android\local.properties" -Value $content
        Write-Host "✓ Created local.properties with path: $path"
        break
    }
}

if (-not (Test-Path "android\local.properties")) {
    Write-Host "✗ Could not find Android SDK. Please install Android Studio or set SDK path manually." -ForegroundColor Red
}
```

---

## Next Steps After Fix

Once SDK is configured:

```bash
# First time setup
npx cap sync android
npx cap open android

# Or directly run
npx cap run android
```

**Expected output:**
- Gradle build should start successfully
- Emulator will launch
- App will install and run with live reload from dev server

---

## Pro Tips

1. **Use Android Studio** for easier device/emulator management
2. **Keep SDK updated** via Android Studio's SDK Manager
3. **Install multiple API levels** for testing different Android versions
4. **Use emulators** during development, test on real devices before release

---

**Need more help?** 
- Android Studio: https://developer.android.com/studio/intro
- Capacitor Android Guide: https://capacitorjs.com/docs/android/configuration
