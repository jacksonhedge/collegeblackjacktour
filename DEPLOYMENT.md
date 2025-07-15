# Production Deployment Guide for CollegeBlackjackTour

## Overview
This guide provides step-by-step instructions for deploying the CollegeBlackjackTour app to production using Firebase Hosting.

## Prerequisites
- Firebase CLI installed (`npm install -g firebase-tools`)
- Firebase project configured
- All environment variables set correctly

## Pre-Deployment Checklist

### 1. Code Quality Checks
```bash
# Run linting
npm run lint

# Run type checking (if TypeScript is configured)
npm run typecheck

# Run tests (if available)
npm test
```

### 2. Environment Configuration
- Ensure `firebase.json` is properly configured
- Verify `.env` files are not committed to git
- Check that all API keys are for production

### 3. Build Optimization
```bash
# Clean previous builds
rm -rf dist

# Create production build
npm run build
```

## Deployment Commands

### Quick Deploy (Single Command)
```bash
# This command builds and deploys in one step
npm run build && firebase deploy
```

### Step-by-Step Deploy
```bash
# 1. Login to Firebase (if not already logged in)
firebase login

# 2. Build the production bundle
npm run build

# 3. Preview the deployment (optional)
firebase hosting:channel:deploy preview

# 4. Deploy to production
firebase deploy --only hosting

# 5. Deploy everything (hosting, functions, rules)
firebase deploy
```

## Slash Command for Quick Deployment

Add this to your `package.json` scripts:
```json
{
  "scripts": {
    "deploy": "npm run build && firebase deploy --only hosting",
    "deploy:all": "npm run build && firebase deploy",
    "deploy:preview": "npm run build && firebase hosting:channel:deploy preview"
  }
}
```

Then you can deploy with:
```bash
npm run deploy
```

## Post-Deployment Verification

### 1. Check Live Site
- Visit: https://collegeblackjacktour.firebaseapp.com
- Test all major features:
  - Landing page loads
  - Events dropdown works
  - Event cards display correctly
  - Request form submits successfully

### 2. Monitor Firebase Console
- Check Firebase Console for any errors
- Review Analytics (if configured)
- Monitor Firestore usage

### 3. Test Database Rules
- Ensure security rules are properly configured
- Test that unauthorized users cannot write to protected collections

## Troubleshooting Common Issues

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npx tsc --noEmit`
- Verify all imports are correct

### Deployment Failures
- Check Firebase quota limits
- Ensure you have deployment permissions
- Verify firebase.json configuration

### Missing Assets
- Ensure all images are in the `public` folder
- Check that asset paths start with `/`
- Verify build output includes all assets

## Rollback Procedure
```bash
# List previous deployments
firebase hosting:releases:list

# Rollback to a specific version
firebase hosting:rollback
```

## Environment-Specific Configurations

### Development
- Uses local Firebase emulators
- Debug logging enabled
- Source maps included

### Production
- Minified code
- No source maps
- Production Firebase project
- Analytics enabled

## Security Checklist
- [ ] Remove all console.log statements
- [ ] Ensure no sensitive data in code
- [ ] Firebase rules are restrictive
- [ ] API keys are production versions
- [ ] CORS properly configured

## Automated Deployment (GitHub Actions)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: collegeblackjacktour
```

## Quick Deploy Script

Create `deploy.sh`:
```bash
#!/bin/bash

echo "🚀 Starting deployment process..."

# Run tests
echo "📋 Running tests..."
npm test

# Lint check
echo "🔍 Running lint..."
npm run lint

# Build
echo "🏗️ Building production bundle..."
npm run build

# Deploy
echo "🚢 Deploying to Firebase..."
firebase deploy --only hosting

echo "✅ Deployment complete!"
echo "🌐 Visit: https://collegeblackjacktour.firebaseapp.com"
```

Make it executable: `chmod +x deploy.sh`
Run with: `./deploy.sh`