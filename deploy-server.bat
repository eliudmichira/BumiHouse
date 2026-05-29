@echo off
echo 🚀 Starting Server Deployment to Railway
echo ========================================

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

REM Check if Railway CLI is available
railway --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Railway CLI not found. Installing...
    npm install -g @railway/cli
)
echo ✅ Railway CLI is available

echo.
echo 🔧 Server Setup:
echo ----------------

REM Navigate to server directory
cd server

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Check if .env file exists
if not exist .env (
    echo ⚠️ No .env file found. Creating template...
    echo # Production Environment Variables > .env
    echo DATABASE_URL="your_mongodb_atlas_connection_string" >> .env
    echo JWT_SECRET="your_super_secret_jwt_key" >> .env
    echo CLIENT_URL="https://makao-648bd.web.app" >> .env
    echo NODE_ENV=production >> .env
    echo PORT=3000 >> .env
    echo.
    echo 📝 Please update the .env file with your actual values before continuing.
    echo.
    pause
)

echo.
echo 🚂 Railway Deployment:
echo ---------------------

REM Check if user is logged in to Railway
railway whoami >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️ Not logged in to Railway. Please login first:
    echo railway login
    echo.
    echo After logging in, run this script again.
    pause
    exit /b 1
)

echo ✅ Railway authentication verified

REM Initialize Railway project if not already done
if not exist .railway (
    echo 🔧 Initializing Railway project...
    railway init
)

REM Deploy to Railway
echo 🚀 Deploying to Railway...
railway up

if %errorlevel% neq 0 (
    echo ❌ Deployment failed!
    pause
    exit /b 1
)

echo ✅ Deployment completed successfully!

REM Get the API URL
echo.
echo 📊 Getting API URL...
for /f "tokens=*" %%i in ('railway domain') do set API_URL=%%i

echo.
echo 🎉 Deployment Summary:
echo =====================
echo ✅ Server deployed successfully
echo ✅ Railway project configured
echo.
echo 🌐 Your API URL: %API_URL%
echo.
echo 📋 Next Steps:
echo 1. Update your frontend with the new API URL
echo 2. Set environment variables in Railway dashboard
echo 3. Test your API endpoints
echo 4. Redeploy your frontend
echo.
echo 🔧 To set environment variables:
echo railway variables set DATABASE_URL="your_mongodb_atlas_connection_string"
echo railway variables set JWT_SECRET="your_secret_key"
echo railway variables set CLIENT_URL="https://makao-648bd.web.app"
echo.
echo 📖 For more information, see SERVER-DEPLOYMENT.md
echo.

pause
