@echo off
echo ========================================
echo   FIX PROPERTY UPLOAD - CORS ISSUE
echo ========================================
echo.

echo The issue: Properties aren't being added because image uploads
echo are failing due to CORS policy blocking requests.
echo.

echo Step 1: Enable Firebase Storage
echo ================================
echo.
echo Please follow these steps:
echo 1. A browser window will open to Firebase Console
echo 2. Click "Get Started" for Firebase Storage
echo 3. Choose "Start in test mode"
echo 4. Select a location (choose closest to your users)
echo 5. Click "Done"
echo.
echo Press any key to open Firebase Console...
pause >nul

start https://console.firebase.google.com/project/dwellmate-285e8/storage

echo.
echo After enabling Storage in the console, press any key to continue...
pause >nul

echo.
echo Step 2: Install Google Cloud SDK (if not installed)
echo ====================================================
echo.
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo Google Cloud SDK is not installed.
    echo.
    echo Please install it now:
    echo 1. A browser window will open to download page
    echo 2. Download and install Google Cloud SDK
    echo 3. Restart your terminal
    echo 4. Run this script again
    echo.
    echo Press any key to open download page...
    pause >nul
    start https://cloud.google.com/sdk/docs/install
    exit /b 1
) else (
    echo ✅ Google Cloud SDK is already installed
)

echo.
echo Step 3: Apply CORS Configuration
echo ================================
echo.
echo Authenticating with Google Cloud...
gcloud auth login

echo.
echo Setting Firebase project...
gcloud config set project dwellmate-285e8

echo.
echo Applying CORS configuration...
gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app

if %errorlevel% equ 0 (
    echo.
    echo ✅ CORS configuration applied successfully!
    echo.
    echo Step 4: Deploy Storage Rules
    echo ============================
    firebase deploy --only storage
    echo.
    echo 🎉 COMPLETE! Your property upload should now work.
    echo.
    echo Next steps:
    echo 1. Clear your browser cache (Ctrl+Shift+Delete)
    echo 2. Refresh your application
    echo 3. Try adding a property again
) else (
    echo.
    echo ❌ Failed to apply CORS configuration
    echo Please check your authentication and try again
)

echo.
pause
