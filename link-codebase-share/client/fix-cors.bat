@echo off
echo 🔧 Fixing Firebase Storage CORS Configuration...

REM Check if gcloud is installed
gcloud version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Google Cloud SDK not found. Please install it first:
    echo    Download from: https://cloud.google.com/sdk/docs/install
    echo    Or run: winget install Google.CloudSDK
    pause
    exit /b 1
)

echo ✅ Google Cloud SDK found

REM Authenticate with Google Cloud
echo 🔐 Authenticating with Google Cloud...
gcloud auth login --no-launch-browser
if %errorlevel% neq 0 (
    echo ❌ Authentication failed. Please try again.
    pause
    exit /b 1
)

echo ✅ Authentication successful

REM Set the Firebase project
echo 🎯 Setting Firebase project to dwellmate-285e8...
gcloud config set project dwellmate-285e8
if %errorlevel% neq 0 (
    echo ❌ Failed to set project. Please check your permissions.
    pause
    exit /b 1
)

echo ✅ Project set successfully

REM Apply CORS configuration
echo 🚀 Applying CORS configuration to Firebase Storage...
gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app
if %errorlevel% neq 0 (
    echo ❌ Failed to apply CORS configuration.
    pause
    exit /b 1
)

echo ✅ CORS configuration applied successfully!

REM Verify the configuration
echo 🔍 Verifying CORS configuration...
gsutil cors get gs://dwellmate-285e8.firebasestorage.app
if %errorlevel% neq 0 (
    echo ❌ Failed to verify CORS configuration.
    pause
    exit /b 1
)

echo ✅ CORS configuration verified!

echo.
echo 🎉 CORS configuration completed successfully!
echo 📝 Your Firebase Storage bucket now allows requests from:
echo    • https://dwellmate-285e8.web.app (production)
echo    • http://localhost:3000 (local development)
echo    • http://localhost:5173 (Vite dev server)
echo    • http://127.0.0.1:3000 (alternative local)
echo    • http://127.0.0.1:5173 (alternative Vite)
echo.
echo 🔄 Please clear your browser cache and try uploading images again.
pause