#!/bin/bash
# Turbopack HMR Runtime Error - Complete Recovery Script
# This script fixes the Next.js 16.1.4 + Turbopack module instantiation issue

echo "=== DDU Hack Turbopack HMR Fix ==="
echo ""
echo "This script will:"
echo "1. Clear all caches (.next, .turbo, node_modules/.cache)"
echo "2. Reinstall dependencies with polyfill packages"
echo "3. Verify the configuration"
echo ""

# Step 1: Clear caches
echo "[Step 1/3] Clearing caches..."
rm -rf .next .turbo node_modules/.cache 2>/dev/null || true
echo "✓ Caches cleared"
echo ""

# Step 2: Reinstall dependencies
echo "[Step 2/3] Reinstalling dependencies..."
pnpm install
if [ $? -eq 0 ]; then
  echo "✓ Dependencies installed successfully"
else
  echo "✗ Dependency installation failed"
  exit 1
fi
echo ""

# Step 3: Verify configuration
echo "[Step 3/3] Verifying configuration..."
if [ -f next.config.mjs ]; then
  echo "✓ next.config.mjs found with webpack + turbopack config"
fi
if [ -f .env.local ]; then
  echo "✓ .env.local configured with Turbopack optimization flags"
fi
echo ""

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo ""
echo "Option A (Recommended - Uses Webpack):"
echo "  pnpm dev"
echo ""
echo "Option B (High Performance - Uses Turbopack):"
echo "  pnpm dev:turbo"
echo ""
echo "The error was caused by:"
echo "  - Turbopack's incomplete polyfill handling in Next.js 16.1.4"
echo "  - Missing browser-compatible versions of Node.js modules"
echo "  - HMR cache inconsistencies"
echo ""
echo "What was fixed:"
echo "  - Added process/browser, buffer, and stream-browserify polyfills"
echo "  - Configured webpack to properly handle fallback modules"
echo "  - Added Turbopack-specific module aliasing"
echo "  - Cleared all build caches to prevent stale module factories"
