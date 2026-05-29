@echo off
echo ========================================
echo   FIREBASE STORAGE + CORS FIX
echo ========================================
echo.

echo Step 1: Opening Firebase Console to enable Storage...
echo Please follow these steps in the browser that opens:
echo 1. Click "Get Started" for Firebase Storage
echo 2. Choose "Start in test mode"
echo 3. Select a location (choose closest to your users)
echo 4. Click "Done"
echo.
echo Press any key to open Firebase Console...
pause >nul

start https://console.firebase.google.com/project/dwellmate-285e8/storage

echo.
echo Step 2: After enabling Storage in the console, press any key to continue...
pause >nul

echo.
echo Step 3: Checking if Google Cloud SDK is installed...
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Google Cloud SDK is not installed!
    echo.
    echo Please install it now:
    echo 1. Go to: https://cloud.google.com/sdk/docs/install
    echo 2. Download and install Google Cloud SDK
    echo 3. Restart your terminal
    echo 4. Run this script again
    echo.
    echo Press any key to open download page...
    pause >nul
    start https://cloud.google.com/sdk/docs/install
    exit /b 1
)

echo ✅ Google Cloud SDK is installed
echo.

echo Step 4: Authenticating with Google Cloud...
echo Please follow the browser authentication...
gcloud auth login

echo.
echo Step 5: Setting Firebase project...
gcloud config set project dwellmate-285e8

echo.
echo Step 6: Applying CORS configuration...
gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app

if %errorlevel% equ 0 (
    echo.
    echo ✅ CORS configuration applied successfully!
    echo.
    echo Step 7: Verifying configuration...
    gsutil cors get gs://dwellmate-285e8.firebasestorage.app
    echo.
    echo Step 8: Deploying storage rules...
    firebase deploy --only storage
    echo.
    echo 🎉 COMPLETE! Your property upload should now work.
    echo Please refresh your browser and try uploading again.
) else (
    echo.
    echo ❌ Failed to apply CORS configuration
    echo Please check your authentication and try again
)

echo.
pause
