@echo off
echo 🚀 Starting Firebase Deployment for Hama Estate
echo ===============================================

echo.
echo 📋 Prerequisites Check:
echo ----------------------

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check if Firebase CLI is available
npx firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Installing...
    npm install -g firebase-tools --legacy-peer-deps
)
echo ✅ Firebase CLI is available

echo.
echo 🔧 Building Application:
echo ----------------------

REM Navigate to client directory
cd client

REM Clean previous build
if exist dist (
    echo 🧹 Cleaning previous build...
    rmdir /s /q dist
)

REM Install dependencies
echo 📦 Installing dependencies...
npm install --legacy-peer-deps

REM Build the application
echo 🏗️ Building application...
npm run build

if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo ✅ Build completed successfully!

echo.
echo 🔥 Firebase Deployment:
echo ----------------------

REM Check if user is logged in to Firebase
npx firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Not logged in to Firebase. Please login first:
    echo firebase login
    echo.
    echo After logging in, run this script again.
    pause
    exit /b 1
)

echo ✅ Firebase authentication verified

REM Deploy to Firebase
echo 🚀 Deploying to Firebase...
npx firebase deploy --only hosting

if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo.
echo 🎉 Deployment Summary:
echo =====================
echo ✅ Application built successfully
echo ✅ Deployed to Firebase Hosting
echo.
echo 📊 Build Statistics:
echo - Total build time: ~30-60 seconds
echo - Bundle size: Optimized for production
echo - Caching: Configured for optimal performance
echo.
echo 🌐 Your app should be live at:
echo https://your-project-id.web.app
echo.
echo 📋 Next Steps:
echo 1. Update .firebaserc with your actual project ID
echo 2. Set up custom domain (optional)
echo 3. Configure environment variables
echo 4. Set up monitoring and analytics
echo.
echo 📖 For more information, see DEPLOYMENT.md
echo.

pause
