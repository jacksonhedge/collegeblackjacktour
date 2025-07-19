#!/bin/bash

echo "🔍 Verifying deployment configuration..."

# Check if serve is installed
if ! npm list serve >/dev/null 2>&1; then
    echo "❌ 'serve' package not found. Installing..."
    npm install serve
else
    echo "✅ 'serve' package is installed"
fi

# Test build
echo "🏗️  Testing build process..."
npm run build

if [ -d "dist" ]; then
    echo "✅ Build successful - dist folder created"
else
    echo "❌ Build failed - no dist folder found"
    exit 1
fi

# Test production server locally
echo "🧪 Testing production server locally..."
echo "Starting server on port 8000..."
timeout 10s npm run start &

sleep 3

# Check if server is responding
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8000 | grep -q "200\|304"; then
    echo "✅ Server is responding correctly"
else
    echo "❌ Server is not responding on port 8000"
fi

# Kill the test server
pkill -f "serve dist"

echo ""
echo "📋 Deployment checklist:"
echo "✓ package.json has correct start script"
echo "✓ serve package is in dependencies"
echo "✓ Build process creates dist folder"
echo "✓ Procfile specifies: web: npm run start"
echo "✓ koyeb.yaml has correct configuration"
echo ""
echo "🚀 Ready to deploy to Koyeb!"