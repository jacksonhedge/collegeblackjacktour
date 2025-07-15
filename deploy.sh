#!/bin/bash

echo "🚀 Starting CollegeBlackjackTour deployment..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf dist

# Build the project
echo "🏗️  Building production bundle..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Deploy to Firebase
echo "🚢 Deploying to Firebase Hosting..."
firebase deploy --only hosting

# Check deployment status
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is live at: https://collegeblackjacktour.firebaseapp.com"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi