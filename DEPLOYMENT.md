# 🚀 Deployment Guide - Hama Estate

This guide covers deploying your real estate application to various platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- Firebase account (for Firebase deployment)
- Domain name (optional)

## 🔥 Firebase Deployment (Recommended)

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Initialize Firebase Project

```bash
cd client
npm run firebase:init
```

### 4. Update Project Configuration

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID.

### 5. Deploy to Firebase

```bash
# Quick deployment
npm run deploy

# Full deployment with build optimization
npm run deploy:full

# Deploy only hosting
npm run deploy:hosting
```

## 🌐 Netlify Deployment

### 1. Connect Repository

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build settings:
   - **Build command**: `cd client && npm run build`
   - **Publish directory**: `client/dist`

### 2. Environment Variables

Set these in Netlify dashboard:
- `VITE_API_URL`: Your API endpoint
- `VITE_GOOGLE_MAPS_API_KEY`: Google Maps API key

### 3. Deploy

Netlify will automatically deploy on every push to main branch.

## ⚡ Vercel Deployment

### 1. Install Vercel CLI

```bash
npm install -g vercel
```

### 2. Deploy

```bash
vercel
```

### 3. Environment Variables

Set in Vercel dashboard:
- `VITE_API_URL`
- `VITE_GOOGLE_MAPS_API_KEY`

## 🐳 Docker Deployment

### 1. Build Docker Image

```bash
docker build -t hama-estate .
```

### 2. Run Container

```bash
docker run -p 3000:3000 hama-estate
```

## 📦 Build Optimization

### Production Build

```bash
cd client
npm run build:prod
```

### Analyze Bundle

```bash
npm run analyze
```

## 🔧 Environment Configuration

### Development

Create `.env.development`:
```env
VITE_API_URL=http://localhost:8000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### Production

Create `.env.production`:
```env
VITE_API_URL=https://your-api-domain.com/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 🚀 Deployment Scripts

### Available Scripts

```bash
# Build for production
npm run build:prod

# Deploy to Firebase
npm run deploy

# Deploy with full optimization
npm run deploy:full

# Deploy specific services
npm run deploy:hosting
npm run deploy:firestore
npm run deploy:storage

# Firebase management
npm run firebase:login
npm run firebase:projects
```

## 📊 Performance Optimization

### Build Optimizations

- Code splitting with manual chunks
- Tree shaking enabled
- Minification with Terser
- Console logs removed in production
- Source maps disabled in production

### Caching Strategy

- Static assets cached for 1 year
- API responses cached appropriately
- Service worker for offline support

## 🔒 Security Considerations

### Firebase Security Rules

- Firestore rules configured for user-based access
- Storage rules for secure file uploads
- Authentication required for sensitive operations

### Environment Variables

- API keys stored securely
- No sensitive data in client bundle
- Environment-specific configurations

## 📱 PWA Features

### Service Worker

- Offline support
- Background sync
- Push notifications (optional)

### Manifest

- App icons configured
- Theme colors set
- Display mode optimized

## 🔍 Monitoring & Analytics

### Firebase Analytics

- User behavior tracking
- Performance monitoring
- Error reporting

### Performance Monitoring

- Core Web Vitals tracking
- Bundle size monitoring
- Load time optimization

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Verify environment variables

2. **Deployment Errors**
   - Check Firebase project configuration
   - Verify authentication
   - Review build logs

3. **Runtime Errors**
   - Check browser console
   - Verify API endpoints
   - Test environment variables

### Debug Commands

```bash
# Check Firebase status
firebase projects:list

# Test build locally
npm run preview

# Analyze bundle
npm run analyze

# Check environment
echo $NODE_ENV
```

## 📞 Support

For deployment issues:
1. Check Firebase console logs
2. Review build output
3. Verify environment configuration
4. Test locally before deploying

## 🔄 CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd client && npm install
      - run: cd client && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          projectId: your-project-id
```

## 🎯 Next Steps

1. Set up custom domain
2. Configure SSL certificates
3. Set up monitoring and alerts
4. Implement CDN for global performance
5. Add automated testing to deployment pipeline
