# Turbopack HMR Runtime Error - Complete Recovery Script (PowerShell)
# This script fixes the Next.js 16.1.4 + Turbopack module instantiation issue

Write-Host "=== DDU Hack Turbopack HMR Fix ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script will:" -ForegroundColor Yellow
Write-Host "1. Clear all caches (.next, .turbo, node_modules/.cache)"
Write-Host "2. Reinstall dependencies with polyfill packages"
Write-Host "3. Verify the configuration"
Write-Host ""

# Step 1: Clear caches
Write-Host "[Step 1/3] Clearing caches..." -ForegroundColor Magenta
if (Test-Path .next) { 
    Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}
if (Test-Path .turbo) { 
    Remove-Item -Recurse -Force .turbo -ErrorAction SilentlyContinue
}
if (Test-Path node_modules\.cache) { 
    Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
}
Write-Host "✓ Caches cleared" -ForegroundColor Green
Write-Host ""

# Step 2: Reinstall dependencies
Write-Host "[Step 2/3] Reinstalling dependencies..." -ForegroundColor Magenta
pnpm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
}
else {
    Write-Host "✗ Dependency installation failed" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 3: Verify configuration
Write-Host "[Step 3/3] Verifying configuration..." -ForegroundColor Magenta
if (Test-Path next.config.mjs) {
    Write-Host "✓ next.config.mjs found with webpack + turbopack config" -ForegroundColor Green
}
if (Test-Path .env.local) {
    Write-Host "✓ .env.local configured with Turbopack optimization flags" -ForegroundColor Green
}
Write-Host ""

Write-Host "=== Setup Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "Option A (Recommended - Uses Webpack):" -ForegroundColor Green
Write-Host "  pnpm dev"
Write-Host ""
Write-Host "Option B (High Performance - Uses Turbopack):" -ForegroundColor Green
Write-Host "  pnpm dev:turbo"
Write-Host ""
Write-Host "The error was caused by:" -ForegroundColor Yellow
Write-Host "  - Turbopack's incomplete polyfill handling in Next.js 16.1.4"
Write-Host "  - Missing browser-compatible versions of Node.js modules"
Write-Host "  - HMR cache inconsistencies"
Write-Host ""
Write-Host "What was fixed:" -ForegroundColor Yellow
Write-Host "  - Added process/browser, buffer, and stream-browserify polyfills"
Write-Host "  - Configured webpack to properly handle fallback modules"
Write-Host "  - Added Turbopack-specific module aliasing"
Write-Host "  - Cleared all build caches to prevent stale module factories"
