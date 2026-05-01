# euantix Virtual MCU Bridge Launcher

Write-Host "🚀 Starting euantix Virtual MCU Bridge..." -ForegroundColor Cyan

# 1. Check for node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 First run detected. Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies. Please ensure Node.js is installed." -ForegroundColor Red
        Pause
        exit
    }
}

# 2. Run the Bridge
Write-Host "🟢 Launching Bridge Client..." -ForegroundColor Green
node index.js

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Bridge stopped unexpectedly." -ForegroundColor Red
    Pause
}
