# 🔥 Firebase Setup for Kwangu Project

This guide will help you set up your Firebase project (kwangu-2beb1) with all the necessary configurations, rules, and sample data.

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase CLI
- Access to the kwangu Firebase project

## 🚀 Quick Setup (Automated)

### Option 1: Run the Setup Script (Recommended)

**For Windows (PowerShell):**
```powershell
.\setup-kwangu-firebase.ps1
```

**For Windows (Command Prompt):**
```cmd
setup-kwangu-firebase.bat
```

### Option 2: Manual Setup

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase:**
   ```bash
   firebase login
   ```

3. **Set the Firebase project:**
   ```bash
   firebase use kwangu-2beb1
   ```

4. **Deploy Firestore rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```

5. **Deploy Storage rules:**
   ```bash
   firebase deploy --only storage
   ```

6. **Deploy Firestore indexes:**
   ```bash
   firebase deploy --only firestore:indexes
   ```

7. **Seed the database:**
   ```bash
   npm run seed-kwangu
   ```

## 📊 What Gets Set Up

### 🔐 Security Rules

**Firestore Rules:**
- Public read access to properties
- Authenticated write access for properties
- User data protection
- Conversation and messaging rules
- Agent verification rules

**Storage Rules:**
- Public read access to property images
- Authenticated upload access
- User profile image management

### 🌱 Sample Data

**Properties (3 sample properties):**
- Modern Apartment in Nairobi
- Luxury Villa in Mombasa
- Cozy Studio in Kisumu

**Agents (3 sample agents):**
- Sarah Johnson (Nairobi specialist)
- Michael Kimani (Luxury properties)
- Grace Wanjiku (Kisumu specialist)

**Test Users:**
- Admin: `admin@kwangu.com` / `admin123`
- Agent: `agent@kwangu.com` / `agent123`
- User: `user@kwangu.com` / `user123`

**Page Views:**
- Sample analytics data for main pages

## 🔧 Available Scripts

```bash
# Seed the database with sample data
npm run seed-kwangu

# Deploy Firebase configuration
npm run deploy-kwangu

# Setup everything (deploy + seed)
npm run setup-firebase
```

## 🎯 Firebase Project Details

- **Project ID:** `kwangu-2beb1`
- **Project Name:** `kwangu`
- **Billing Plan:** Spark (Free)
- **Console:** https://console.firebase.google.com/project/kwangu-2beb1

## 🔍 Verification

After setup, you can verify everything is working:

1. **Check Firebase Console:**
   - Go to https://console.firebase.google.com/project/kwangu-2beb1
   - Verify Firestore Database is created
   - Check Storage is enabled
   - Review security rules

2. **Test your app:**
   ```bash
   npm run dev
   ```
   - Open http://localhost:5173
   - Check browser console for Firebase connection messages
   - Test Firebase connection at http://localhost:5173/firebase-test.html

## 🚨 Troubleshooting

### Common Issues:

1. **Firebase CLI not found:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Not logged in:**
   ```bash
   firebase login
   ```

3. **Wrong project:**
   ```bash
   firebase use kwangu-2beb1
   ```

4. **Permission denied:**
   - Make sure you have access to the kwangu project
   - Check if you're logged in with the correct Google account

5. **Firestore not enabled:**
   - Go to Firebase Console
   - Enable Firestore Database
   - Create database in test mode

## 📝 Configuration Files

- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `storage.rules` - Storage security rules
- `firestore.indexes.json` - Firestore indexes
- `scripts/seedKwanguFirebase.js` - Database seeding script

## 🔄 Updating Data

To update or re-seed the database:

```bash
npm run seed-kwangu
```

To update security rules:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 🎉 Success!

Once setup is complete, your Firebase project will be fully configured with:

- ✅ Firestore Database with sample data
- ✅ Storage with proper rules
- ✅ Authentication ready
- ✅ Security rules deployed
- ✅ Test users created
- ✅ Sample properties and agents

Your app should now work without any Firebase connection errors!
