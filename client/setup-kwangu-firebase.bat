@echo off
echo 🚀 Setting up kwangu Firebase project...
echo.

echo 📋 Prerequisites check:
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)
echo ✅ Node.js is installed

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)
echo ✅ npm is installed

echo.
echo 🔧 Installing Firebase CLI...
npm install -g firebase-tools

echo.
echo 🔐 Please login to Firebase (this will open a browser window)...
firebase login

echo.
echo 🎯 Setting Firebase project to kwangu-2beb1...
firebase use kwangu-2beb1

echo.
echo 📝 Deploying Firestore rules...
firebase deploy --only firestore:rules

echo.
echo 📝 Deploying Storage rules...
firebase deploy --only storage

echo.
echo 📝 Deploying Firestore indexes...
firebase deploy --only firestore:indexes

echo.
echo 🌱 Seeding database...
node scripts/seedKwanguFirebase.js

echo.
echo 🎉 Firebase setup completed!
echo.
echo 📊 Your kwangu Firebase project is now ready:
echo Project ID: kwangu-2beb1
echo Console: https://console.firebase.google.com/project/kwangu-2beb1
echo.
echo 🔑 Test Credentials:
echo Admin: admin@kwangu.com / admin123
echo Agent: agent@kwangu.com / agent123
echo User: user@kwangu.com / user123
echo.
echo 🚀 You can now run your app with: npm run dev
echo.
pause
