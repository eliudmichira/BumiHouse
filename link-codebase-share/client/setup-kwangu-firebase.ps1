# PowerShell script to set up kwangu Firebase project
Write-Host "🚀 Setting up kwangu Firebase project..." -ForegroundColor Green
Write-Host ""

Write-Host "📋 Prerequisites check:" -ForegroundColor Yellow
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm is installed: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "🔧 Installing Firebase CLI..." -ForegroundColor Yellow
npm install -g firebase-tools

Write-Host ""
Write-Host "🔐 Please login to Firebase (this will open a browser window)..." -ForegroundColor Yellow
firebase login

Write-Host ""
Write-Host "🎯 Setting Firebase project to kwangu-2beb1..." -ForegroundColor Yellow
firebase use kwangu-2beb1

Write-Host ""
Write-Host "📝 Deploying Firestore rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules

Write-Host ""
Write-Host "📝 Deploying Storage rules..." -ForegroundColor Yellow
firebase deploy --only storage

Write-Host ""
Write-Host "📝 Deploying Firestore indexes..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes

Write-Host ""
Write-Host "🌱 Seeding database..." -ForegroundColor Yellow
node scripts/seedKwanguFirebase.js

Write-Host ""
Write-Host "🎉 Firebase setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Your kwangu Firebase project is now ready:" -ForegroundColor Cyan
Write-Host "Project ID: kwangu-2beb1" -ForegroundColor White
Write-Host "Console: https://console.firebase.google.com/project/kwangu-2beb1" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Test Credentials:" -ForegroundColor Cyan
Write-Host "Admin: admin@kwangu.com / admin123" -ForegroundColor White
Write-Host "Agent: agent@kwangu.com / agent123" -ForegroundColor White
Write-Host "User: user@kwangu.com / user123" -ForegroundColor White
Write-Host ""
Write-Host "🚀 You can now run your app with: npm run dev" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
