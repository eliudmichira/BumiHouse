# 🔥 Complete Firebase Setup - Hama Estate

This guide shows you how to use Firebase for everything in your real estate application.

## 🎯 **Why Firebase for Everything?**

### **Advantages:**
- ✅ **Single Platform**: Everything in one place
- ✅ **No Server Management**: Serverless architecture
- ✅ **Real-time Updates**: Live data synchronization
- ✅ **Scalable**: Automatic scaling
- ✅ **Cost-effective**: Pay only for what you use
- ✅ **Easy Setup**: Minimal configuration required

### **Firebase Services We'll Use:**
- 🔥 **Hosting** - Your website (already deployed)
- 🗄️ **Firestore** - Database (replaces MongoDB)
- 🔐 **Authentication** - User management
- 📁 **Storage** - Image uploads
- ⚡ **Functions** - Serverless backend (optional)
- 📊 **Analytics** - User tracking

## 🚀 **Step 1: Enable Firebase Services**

### **1. Go to Firebase Console**
Visit: https://console.firebase.google.com/project/makao-648bd

### **2. Enable Firestore Database**
1. Click "Firestore Database" in the left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location (choose closest to your users)
5. Click "Done"

### **3. Enable Authentication**
1. Click "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password"
5. Enable "Google" (optional)
6. Click "Save"

### **4. Enable Storage**
1. Click "Storage" in the left sidebar
2. Click "Get started"
3. Choose "Start in test mode"
4. Select a location
5. Click "Done"

## 📊 **Step 2: Set Up Firestore Security Rules**

### **Update Firestore Rules**
Go to Firestore Database → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to properties
    match /properties/{propertyId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email_verified == true;
    }
    
    // Allow authenticated users to manage their favorites
    match /users/{userId}/favorites/{favoriteId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to manage their profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow public read access to agents
    match /agents/{agentId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Allow authenticated users to manage their messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (resource.data.senderId == request.auth.uid || resource.data.receiverId == request.auth.uid);
    }
  }
}
```

### **Update Storage Rules**
Go to Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow public read access to property images
    match /properties/{propertyId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.email_verified == true;
    }
    
    // Allow users to upload their profile images
    match /users/{userId}/profile/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default rule - deny all
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## 🌱 **Step 3: Seed Your Database**

### **Option 1: Use the Seeding Script**
```bash
cd client
npm run seed-firestore
```

### **Option 2: Manual Seeding**
1. Go to Firestore Database → Data
2. Click "Start collection"
3. Collection ID: `properties`
4. Add documents manually with the sample data

### **Sample Property Document:**
```json
{
  "title": "Modern Apartment in Westlands",
  "description": "Beautiful 2-bedroom apartment with stunning city views",
  "price": 45000000,
  "location": {
    "address": "Westlands, Nairobi",
    "city": "Nairobi",
    "coordinates": {
      "lat": -1.2921,
      "lng": 36.8219
    }
  },
  "bedrooms": 2,
  "bathrooms": 2,
  "area": 120,
  "type": "Apartment",
  "status": "For Sale",
  "images": [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
  ],
  "amenities": ["Parking", "Gym", "Pool", "Security"],
  "agent": {
    "name": "Sarah Johnson",
    "phone": "+254 700 123 456",
    "email": "sarah@hamaestate.com"
  },
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

## 🔧 **Step 4: Update Your Application**

### **1. Install Firebase Dependencies**
```bash
cd client
npm install firebase
```

### **2. Update API Calls**
Your application is already configured to use Firebase! The files are:
- `src/lib/firebase.js` - Firebase configuration
- `src/lib/firebaseAPI.js` - Firebase API functions
- `src/hooks/useProperties.jsx` - Updated to use Firebase

### **3. Test Your Application**
```bash
npm run dev
```

## 📱 **Step 5: Add Authentication (Optional)**

### **Create Auth Context**
```javascript
// src/contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

## 🚀 **Step 6: Deploy Everything**

### **1. Build and Deploy Frontend**
```bash
cd client
npm run build
npx firebase deploy --only hosting
```

### **2. Deploy Security Rules**
```bash
npx firebase deploy --only firestore:rules
npx firebase deploy --only storage
```

## 📊 **Step 7: Monitor Your Application**

### **Firebase Console Features:**
- **Analytics**: User behavior tracking
- **Performance**: App performance monitoring
- **Crashlytics**: Error reporting
- **Remote Config**: Feature flags

### **View Your Data:**
- **Firestore**: Database data
- **Storage**: Uploaded images
- **Authentication**: User accounts
- **Hosting**: Website analytics

## 🔒 **Security Best Practices**

### **1. Environment Variables**
Never commit API keys to Git:
```bash
# Add to .gitignore
.env
.env.local
.env.production
```

### **2. Security Rules**
Always restrict access appropriately:
```javascript
// Example: Only allow users to read their own data
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### **3. API Key Restrictions**
In Firebase Console:
1. Go to Project Settings
2. Add your domain to authorized domains
3. Restrict API key usage

## 💰 **Cost Optimization**

### **Firebase Pricing (Free Tier):**
- **Hosting**: 10GB storage, 360MB/day transfer
- **Firestore**: 1GB storage, 50K reads/day, 20K writes/day
- **Storage**: 5GB storage, 1GB/day transfer
- **Authentication**: 10K users/month

### **Monitor Usage:**
1. Go to Firebase Console
2. Click "Usage and billing"
3. Set up billing alerts

## 🎉 **Benefits of Firebase-Only Solution**

### **For Development:**
- ✅ No server setup required
- ✅ Real-time data updates
- ✅ Built-in authentication
- ✅ Automatic scaling
- ✅ Easy deployment

### **For Production:**
- ✅ Global CDN
- ✅ Automatic backups
- ✅ Built-in security
- ✅ Analytics and monitoring
- ✅ Cost-effective scaling

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **CORS Errors**
   - Check Firebase security rules
   - Verify domain is authorized

2. **Authentication Issues**
   - Check if Authentication is enabled
   - Verify sign-in methods are configured

3. **Database Connection**
   - Check Firestore rules
   - Verify collection names

4. **Storage Upload Failures**
   - Check Storage rules
   - Verify file size limits

### **Debug Commands:**
```bash
# Check Firebase status
firebase projects:list

# View logs
firebase functions:log

# Test locally
firebase emulators:start
```

## 📞 **Support**

### **Firebase Documentation:**
- [Firestore](https://firebase.google.com/docs/firestore)
- [Authentication](https://firebase.google.com/docs/auth)
- [Storage](https://firebase.google.com/docs/storage)
- [Hosting](https://firebase.google.com/docs/hosting)

### **Community:**
- [Firebase Community](https://firebase.google.com/community)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/firebase)

## 🎯 **Next Steps**

1. **Test all features** with Firebase
2. **Add more properties** to your database
3. **Implement user authentication**
4. **Add image upload functionality**
5. **Set up analytics tracking**
6. **Monitor performance and costs**

Your real estate application is now fully powered by Firebase! 🏠✨
