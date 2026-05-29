# 🚀 Production Deployment Guide

## 📋 Prerequisites

1. **Firebase CLI** installed globally:
   ```bash
   npm install -g firebase-tools
   ```

2. **Firebase Project** set up and configured
3. **Environment Variables** configured for production

## 🔧 Environment Setup

### 1. Create Production Environment File

Create a `.env.production` file in the root directory:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_production_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Production API URL
VITE_API_URL=https://your-production-api-url.com

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your_production_google_maps_api_key_here

# Environment
NODE_ENV=production
```

### 2. Update Firebase Configuration

Ensure your `firebase.json` is properly configured for hosting:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

## 🏗️ Build Process

### 1. Install Dependencies
```bash
npm install
```

### 2. Build for Production
```bash
npm run build:prod
```

### 3. Test Build Locally
```bash
npm run preview
```

## 🚀 Deployment Options

### Option 1: Deploy to Firebase Hosting (Recommended)

```bash
# Deploy everything
npm run deploy

# Deploy only hosting
npm run deploy:hosting

# Deploy only functions (if you have them)
npm run deploy:functions
```

### Option 2: Manual Deployment

```bash
# Build the project
npm run build:prod

# Deploy to Firebase
firebase deploy
```

### Option 3: Deploy to Other Platforms

#### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## 🔍 Post-Deployment Checklist

- [ ] ✅ Environment variables are set correctly
- [ ] ✅ Firebase project is configured
- [ ] ✅ Google Maps API key is valid
- [ ] ✅ All routes work correctly
- [ ] ✅ Authentication flows work
- [ ] ✅ Images and assets load properly
- [ ] ✅ Mobile responsiveness works
- [ ] ✅ Performance is optimized
- [ ] ✅ SSL certificate is active
- [ ] ✅ Analytics are tracking (if applicable)

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Errors**
   ```bash
   npm run clean
   npm install
   npm run build:prod
   ```

2. **Environment Variables Not Loading**
   - Ensure all VITE_ variables are set
   - Check for typos in variable names
   - Restart the build process

3. **Firebase Deploy Errors**
   ```bash
   firebase logout
   firebase login
   firebase use your-project-id
   firebase deploy
   ```

4. **Routing Issues**
   - Ensure Firebase hosting has proper rewrite rules
   - Check that all routes are handled by React Router

## 📊 Performance Optimization

### Build Optimizations:
- ✅ Code splitting implemented
- ✅ Tree shaking enabled
- ✅ Minification enabled
- ✅ Gzip compression
- ✅ Cache headers configured

### Runtime Optimizations:
- ✅ Lazy loading for routes
- ✅ Image optimization
- ✅ Bundle size monitoring
- ✅ CDN usage

## 🔒 Security Checklist

- [ ] ✅ Environment variables are not exposed in client code
- [ ] ✅ API keys are properly secured
- [ ] ✅ HTTPS is enforced
- [ ] ✅ CORS is configured correctly
- [ ] ✅ Input validation is implemented
- [ ] ✅ XSS protection is enabled

## 📈 Monitoring

### Recommended Tools:
- Firebase Analytics
- Google PageSpeed Insights
- Lighthouse CI
- Bundle Analyzer

### Performance Targets:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Cumulative Layout Shift: < 0.1
- First Input Delay: < 100ms

## 🎯 Next Steps

1. Set up monitoring and analytics
2. Configure error tracking (Sentry, LogRocket)
3. Set up CI/CD pipeline
4. Implement automated testing
5. Configure backup strategies
6. Set up staging environment

---

## 🆘 Support

If you encounter issues during deployment:

1. Check the Firebase console for error logs
2. Verify all environment variables are set
3. Test locally with `npm run preview`
4. Check the browser console for errors
5. Review the deployment logs

**Happy Deploying! 🚀** 