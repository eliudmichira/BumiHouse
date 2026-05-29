# Firebase Storage CORS Fix Instructions

## Problem
You're experiencing a CORS (Cross-Origin Resource Sharing) error when trying to upload images to Firebase Storage:

```
Access to XMLHttpRequest at 'https://firebasestorage.googleapis.com/v0/b/dwellmate-285e8.firebasestorage.app/o?name=properties%2F...' from origin 'https://dwellmate-285e8.web.app' has been blocked by CORS policy
```

This happens because your Firebase Storage bucket doesn't have the proper CORS configuration to allow requests from your web application domain.

## Solution

### Option 1: Automated Fix (Recommended)

#### For PowerShell (Windows):
1. Open PowerShell as Administrator
2. Navigate to your project directory:
   ```powershell
   cd "C:\Users\User\Documents\GitHub\link\client"
   ```
3. Run the fix script:
   ```powershell
   .\fix-cors.ps1
   ```

#### For Command Prompt (Windows):
1. Open Command Prompt as Administrator
2. Navigate to your project directory:
   ```cmd
   cd "C:\Users\User\Documents\GitHub\link\client"
   ```
3. Run the fix script:
   ```cmd
   fix-cors.bat
   ```

### Option 2: Manual Fix

If the automated scripts don't work, follow these manual steps:

#### Step 1: Install Google Cloud SDK
1. Download from: https://cloud.google.com/sdk/docs/install
2. Or install via winget: `winget install Google.CloudSDK`
3. Restart your terminal after installation

#### Step 2: Authenticate with Google Cloud
```bash
gcloud auth login
```

#### Step 3: Set Your Firebase Project
```bash
gcloud config set project dwellmate-285e8
```

#### Step 4: Apply CORS Configuration
```bash
gsutil cors set cors.json gs://dwellmate-285e8.firebasestorage.app
```

#### Step 5: Verify Configuration
```bash
gsutil cors get gs://dwellmate-285e8.firebasestorage.app
```

## What This Fixes

The CORS configuration allows requests from:
- `https://dwellmate-285e8.web.app` (your production domain)
- `http://localhost:3000` (local development)
- `http://localhost:5173` (Vite dev server)
- `http://127.0.0.1:3000` (alternative local development)
- `http://127.0.0.1:5173` (alternative Vite dev server)

## After Applying the Fix

1. **Clear your browser cache** (Ctrl+Shift+Delete)
2. **Try uploading a property with images again**
3. The CORS errors should be completely resolved

## Troubleshooting

### If you get "gcloud not found":
- Make sure Google Cloud SDK is installed
- Restart your terminal after installation
- Try running `gcloud version` to verify installation

### If you get authentication errors:
- Make sure you're logged in with the correct Google account
- Try running `gcloud auth login` again
- Check that you have permissions for the dwellmate-285e8 project

### If you get permission errors:
- Make sure you're using an account that has access to the Firebase project
- Check that the project ID is correct (dwellmate-285e8)

### If the CORS configuration doesn't take effect:
- Wait a few minutes for the changes to propagate
- Clear your browser cache completely
- Try in an incognito/private browser window

## Files Created

- `cors.json` - CORS configuration file
- `fix-cors.ps1` - PowerShell script for automated fix
- `fix-cors.bat` - Batch script for Command Prompt
- `CORS_FIX_INSTRUCTIONS.md` - This instruction file

## Support

If you continue to experience issues after following these steps, the problem might be:
1. Browser cache not cleared properly
2. Service worker caching old requests
3. Network/firewall blocking the requests
4. Firebase project configuration issues

Try these additional steps:
1. Unregister service worker in browser dev tools
2. Try in a different browser
3. Check browser console for any additional error messages