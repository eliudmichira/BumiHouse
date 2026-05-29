# RentaKenya - Complete Codebase Setup Guide

This is a complete real estate platform with React frontend, Node.js backend, and Firebase integration.

## 📁 Project Structure

```
link-codebase-share/
├── client/                 # React/Vite frontend application
├── server/                 # Node.js/Express backend API
├── functions/              # Firebase Cloud Functions
├── .env.example files      # Environment variable templates
└── Configuration files     # Firebase, deployment configs
```

## 🚀 Quick Setup

### 1. Install Dependencies

```bash
# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install

# Install functions dependencies
cd ../functions
npm install
```

### 2. Environment Configuration

Copy the `.env.example` files and fill in your credentials:

```bash
# Client environment
cp client/.env.example client/.env

# Server environment
cp server/.env.example server/.env

# Functions environment
cp functions/.env.example functions/.env
```

### 3. Firebase Setup

1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication, Firestore, Storage, and Functions
3. Download your Firebase config and service account key
4. Update the environment variables with your Firebase credentials

### 4. Database Setup

```bash
# Generate Prisma client
cd server
npx prisma generate

# Run database migrations (if needed)
npx prisma db push
```

### 5. Start Development Servers

```bash
# Terminal 1: Start the backend server
cd server
npm run dev

# Terminal 2: Start the frontend client
cd client
npm run dev

# Terminal 3: Start Firebase emulators (optional)
firebase emulators:start
```

## 🔧 Required API Keys

### Google Maps API
- Get API key from Google Cloud Console
- Enable Maps JavaScript API, Places API, Geocoding API

### Firebase
- Project ID, API Key, Auth Domain
- Service Account credentials for backend

### Email Service (Optional)
- SMTP credentials for email notifications

## 📱 Features Included

- **Property Listings**: Search, filter, and view properties
- **User Authentication**: Login, registration, profile management
- **Real-time Chat**: Property inquiry messaging
- **Mobile Responsive**: PWA support with mobile optimization
- **Admin Dashboard**: Property and user management
- **Maps Integration**: Google Maps with property markers
- **Payment Integration**: M-Pesa integration for Kenya
- **AI Features**: Property recommendations and insights

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy dist/ folder
```

### Backend (Railway/Heroku)
```bash
cd server
# Deploy with Procfile configuration
```

### Firebase Functions
```bash
cd functions
firebase deploy --only functions
```

## 📚 Documentation

- `DEPLOYMENT.md` - Detailed deployment instructions
- `FIREBASE-SETUP.md` - Firebase configuration guide
- `client/README.md` - Frontend specific documentation
- `server/README.md` - Backend API documentation

## 🛠️ Development

### Available Scripts

**Client:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Server:**
- `npm run dev` - Start with nodemon
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

**Functions:**
- `npm run serve` - Start local emulator
- `npm run deploy` - Deploy to Firebase

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use strong JWT secrets in production
- Configure CORS properly for your domains
- Set up proper Firebase security rules

## 📞 Support

For setup issues or questions, refer to the documentation files in each directory or check the deployment guides.

---

**Note**: This codebase is configured for the Kenyan real estate market with M-Pesa integration and local property data sources.
