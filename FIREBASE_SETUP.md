# Firebase Setup Instructions

Follow these steps to deploy your Firebase configurations and enable the necessary services.

## 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

## 2. Login to Firebase

```bash
firebase login
```

This will open a browser window for you to authenticate with your Google account.

## 3. Initialize Firebase in the Project (if not already done)

```bash
cd ccl-app
firebase init
```

Select the following options when prompted:
- Choose "Firestore", "Storage", and "Hosting"
- Select your project (collegeblackjacktour)
- Accept the default file names for rules and indexes
- For hosting:
  - Use "dist" as your public directory
  - Configure as a single-page app: Yes
  - Set up automatic builds and deploys: No

## 4. Set up Firebase Hosting Targets

```bash
# Create the hosting targets
firebase target:apply hosting main collegeblackjacktour
firebase target:apply hosting admin admin-collegeblackjacktour

# Create the admin site in Firebase Console
firebase hosting:sites:create admin-collegeblackjacktour
```

## 4. Enable Firebase Services

1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project (collegeblackjacktour)
3. Enable Firestore Database:
   - Click "Firestore Database" in the sidebar and click "Create Database"
   - Choose "Start in production mode"
   - Select a location closest to your users
   - Click "Enable"

4. Enable Firebase Storage:
   - Click "Storage" in the sidebar
   - Click "Get Started"
   - Choose "Start in production mode"
   - Select the same location as your Firestore Database
   - Click "Enable"
   - Wait for Storage to be provisioned (this may take a few minutes)

## 5. Deploy Firebase Configurations

```bash
firebase deploy --only firestore:rules,storage:rules,firestore:indexes
```

This will deploy:
- Firestore security rules
- Storage security rules
- Firestore indexes

## 6. Build and Deploy the Web Apps

```bash
# Build both apps
npm run build

# Deploy to Firebase Hosting (both main and admin sites)
firebase deploy --only hosting:main
firebase deploy --only hosting:admin
```

The apps will be available at:
- Main site: https://collegeblackjacktour.web.app
- Admin site: https://admin-collegeblackjacktour.web.app

## Verifying the Setup

1. Visit your Firebase Console
2. Check that Firestore Database is enabled and rules are deployed
3. Check that Storage is enabled and rules are deployed
4. Visit your deployed app URL (shown after deployment)
5. Try accessing the admin interface at `/admin/tournaments`

## Troubleshooting

If you encounter any issues:

1. Check the Firebase Console for any error messages
2. Verify that all services are enabled
3. Check that your Firebase config in `src/firebase/config.js` matches your project settings
4. Make sure you're logged into the correct Firebase account
5. Try running `firebase init` again if configurations seem incorrect

## Security Note

The current security rules allow unrestricted read/write access. This is fine for development but should be updated with proper authentication before going to production.

To add authentication later:
1. Enable Authentication in Firebase Console
2. Choose authentication providers (Google, Email, etc.)
3. Update security rules to check for authenticated users
4. Add authentication flow to the admin interface

## Next Steps

1. Add proper authentication for the admin interface
2. Upload tournament images to test Storage
3. Create test tournaments to verify Firestore
4. Set up proper security rules for production
