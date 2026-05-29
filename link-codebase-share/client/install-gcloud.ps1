# PowerShell script to install Google Cloud SDK
Write-Host "🔧 Installing Google Cloud SDK..." -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ This script needs to be run as Administrator" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

# Download Google Cloud SDK
$downloadUrl = "https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe"
$installerPath = "$env:TEMP\GoogleCloudSDKInstaller.exe"

Write-Host "📥 Downloading Google Cloud SDK installer..." -ForegroundColor Blue
try {
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Download completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download Google Cloud SDK" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Install Google Cloud SDK
Write-Host "🔧 Installing Google Cloud SDK..." -ForegroundColor Blue
try {
    Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait
    Write-Host "✅ Google Cloud SDK installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Google Cloud SDK" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Clean up installer
Remove-Item $installerPath -Force

Write-Host "🎉 Google Cloud SDK installation complete!" -ForegroundColor Green
Write-Host "Please restart your terminal and run the CORS fix script." -ForegroundColor Yellow
pause
