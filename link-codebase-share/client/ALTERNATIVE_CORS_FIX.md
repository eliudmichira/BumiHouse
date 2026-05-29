# Alternative CORS Fix Methods

## Method 1: Firebase Console (If Google Cloud SDK doesn't work)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dwellmate-285e8`
3. Go to **Storage** in the left sidebar
4. Click on **Rules** tab
5. Make sure your storage rules allow authenticated users to upload:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Method 2: Temporary Workaround - Use Firebase Admin SDK

If CORS continues to be an issue, we can modify the upload to use Firebase Admin SDK through a Cloud Function.

## Method 3: Check Firebase Project Settings

1. Go to Firebase Console → Project Settings
2. Check if your domain `dwellmate-285e8.web.app` is listed in authorized domains
3. If not, add it to the authorized domains list

## Method 4: Verify Storage Bucket Name

Make sure you're using the correct bucket name. Check your Firebase config:
- Current bucket: `dwellmate-285e8.firebasestorage.app`
- Alternative bucket: `dwellmate-285e8.appspot.com`

Try both bucket names in the gsutil command if one doesn't work.
