# Firebase Setup Guide

This guide will help you set up Firebase for authentication and hosting while keeping your backend for storage.

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name (e.g., "estate-ui")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable the following providers:
   - **Email/Password**: Enable and configure
   - **Google**: Enable and configure (add your domain to authorized domains)

## 3. Get Firebase Configuration

1. In your Firebase project, click the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>)
5. Register your app with a nickname (e.g., "estate-ui-web")
6. Copy the Firebase configuration object

## 4. Update Firebase Configuration

Replace the placeholder configuration in `src/firebase.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

## 5. Install Firebase CLI

```bash
npm install -g firebase-tools
```

## 6. Login to Firebase

```bash
firebase login
```

## 7. Initialize Firebase Hosting

```bash
firebase init hosting
```

When prompted:
- Select your project
- Use `dist` as your public directory
- Configure as a single-page app: **Yes**
- Don't overwrite `index.html`: **No**

## 8. Deploy to Firebase

```bash
npm run deploy
```

This will:
1. Build your React app (`npm run build`)
2. Deploy to Firebase hosting (`firebase deploy`)

## 9. Environment Variables (Optional)

For production, you might want to use environment variables:

1. Create a `.env` file in your project root:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

2. Update `src/firebase.js`:
```javascript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

## 10. Backend Integration

Your backend will handle:
- User preferences storage
- Favorites management
- Saved searches
- Property data
- Real-time features via Socket.IO

Firebase will handle:
- User authentication
- Hosting
- Security rules (if using Firestore later)

## 11. Testing

1. Start your backend: `cd api && npm start`
2. Start your frontend: `npm run dev`
3. Test authentication flow
4. Verify data is saved to your backend

## 12. Production Deployment

1. Deploy your backend to your preferred hosting service
2. Update the backend URL in your frontend code
3. Deploy your frontend: `npm run deploy`

## Security Notes

- Never commit your Firebase config with real API keys to version control
- Use environment variables for production
- Set up proper Firebase security rules if you add Firestore later
- Configure authorized domains in Firebase Authentication

## Troubleshooting

- **Authentication errors**: Check your Firebase config and authorized domains
- **CORS errors**: Ensure your backend CORS settings include your Firebase hosting domain
- **Deployment issues**: Make sure you're logged into Firebase CLI and have the correct project selected 