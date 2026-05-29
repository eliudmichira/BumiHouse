@echo off
echo ========================================
echo    FIREBASE STORAGE CORS FIX
echo ========================================
echo.

echo Step 1: Checking if gcloud is installed...
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Google Cloud SDK is not installed!
    echo.
    echo Please install it first:
    echo 1. Go to: https://cloud.google.com/sdk/docs/install
    echo 2. Download and install Google Cloud SDK
    echo 3. Restart your terminal
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo ✅ Google Cloud SDK is installed
echo.

echo Step 2: Authenticating with Google Cloud...
echo Please follow the browser authentication...
gcloud auth login

echo.
echo Step 3: Setting Firebase project...
gcloud config set project dwellmate-285e8

echo.
echo Step 4: Applying CORS configuration...
gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app

if %errorlevel% equ 0 (
    echo.
    echo ✅ CORS configuration applied successfully!
    echo.
    echo Step 5: Verifying configuration...
    gsutil cors get gs://dwellmate-285e8.firebasestorage.app
    echo.
    echo 🎉 CORS fix complete! Your property upload should now work.
    echo Please refresh your browser and try uploading again.
) else (
    echo.
    echo ❌ Failed to apply CORS configuration
    echo Please check your authentication and try again
)

echo.
pause
