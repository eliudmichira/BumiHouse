# PowerShell script to fix Firebase Storage CORS configuration
# This script applies CORS settings to allow image uploads from your web app

Write-Host "🔧 Fixing Firebase Storage CORS Configuration..." -ForegroundColor Green

# Check if gcloud is installed
try {
    $gcloudVersion = gcloud version --format="value(Google Cloud SDK)" 2>$null
    if ($gcloudVersion) {
        Write-Host "✅ Google Cloud SDK found: $gcloudVersion" -ForegroundColor Green
    } else {
        throw "gcloud not found"
    }
} catch {
    Write-Host "❌ Google Cloud SDK not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Download from: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "   Or run: winget install Google.CloudSDK" -ForegroundColor Yellow
    exit 1
}

# Authenticate with Google Cloud
Write-Host "🔐 Authenticating with Google Cloud..." -ForegroundColor Yellow
try {
    gcloud auth login --no-launch-browser
    Write-Host "✅ Authentication successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication failed. Please try again." -ForegroundColor Red
    exit 1
}

# Set the Firebase project
Write-Host "🎯 Setting Firebase project to dwellmate-285e8..." -ForegroundColor Yellow
try {
    gcloud config set project dwellmate-285e8
    Write-Host "✅ Project set successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to set project. Please check your permissions." -ForegroundColor Red
    exit 1
}

# Apply CORS configuration
Write-Host "🚀 Applying CORS configuration to Firebase Storage..." -ForegroundColor Yellow
try {
    gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app
    Write-Host "✅ CORS configuration applied successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to apply CORS configuration. Error: $_" -ForegroundColor Red
    exit 1
}

# Verify the configuration
Write-Host "🔍 Verifying CORS configuration..." -ForegroundColor Yellow
try {
    gsutil cors get gs://dwellmate-285e8.firebasestorage.app
    Write-Host "✅ CORS configuration verified!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to verify CORS configuration." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 CORS configuration completed successfully!" -ForegroundColor Green
Write-Host "📝 Your Firebase Storage bucket now allows requests from:" -ForegroundColor Cyan
Write-Host "   • https://dwellmate-285e8.web.app (production)" -ForegroundColor White
Write-Host "   • http://localhost:3000 (local development)" -ForegroundColor White
Write-Host "   • http://localhost:5173 (Vite dev server)" -ForegroundColor White
Write-Host "   • http://127.0.0.1:3000 (alternative local)" -ForegroundColor White
Write-Host "   • http://127.0.0.1:5173 (alternative Vite)" -ForegroundColor White
Write-Host ""
Write-Host "🔄 Please clear your browser cache and try uploading images again." -ForegroundColor Yellow