# Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Environment Variables
- [ ] Set all required environment variables in your hosting platform:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_FIREBASE_MEASUREMENT_ID`
  - `VITE_GOOGLE_MAPS_API_KEY`
  - `VITE_GEMINI_API_KEY` (optional - for AI features)

### 2. Firebase Configuration
- [ ] Verify Firebase security rules are set correctly
- [ ] Enable Firebase App Check (recommended)
- [ ] Verify CORS settings for production domain
- [ ] Test Firebase authentication in production

### 3. Build & Test
- [ ] Run `npm run build` successfully
- [ ] Test production build locally: `npm run preview`
- [ ] Verify no console errors in production build
- [ ] Test all critical user flows

### 4. Security
- [ ] Verify no API keys in source code
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Review Firebase security rules
- [ ] Enable rate limiting (if applicable)

### 5. Performance
- [ ] Check bundle size (should be reasonable)
- [ ] Test page load times
- [ ] Verify images are optimized
- [ ] Test on mobile devices

### 6. Monitoring
- [ ] Set up error tracking (Sentry, LogRocket, etc.)
- [ ] Set up analytics (Firebase Analytics)
- [ ] Configure uptime monitoring
- [ ] Set up alerts for critical errors

---

## 🚀 Deployment Steps

### Firebase Hosting
```bash
# 1. Build for production
npm run build

# 2. Deploy to Firebase
firebase deploy --only hosting

# 3. Verify deployment
# Check Firebase Console → Hosting
```

### Vercel
```bash
# 1. Install Vercel CLI (if not installed)
npm i -g vercel

# 2. Deploy
vercel --prod

# 3. Set environment variables in Vercel Dashboard
# Project Settings → Environment Variables
```

### Netlify
```bash
# 1. Build command
npm run build

# 2. Publish directory
dist

# 3. Set environment variables in Netlify Dashboard
# Site Settings → Environment Variables
```

---

## 🔍 Post-Deployment Verification

### 1. Functionality Tests
- [ ] Home page loads correctly
- [ ] Property search works
- [ ] Map displays with markers
- [ ] User authentication works
- [ ] Property details page loads
- [ ] Messages/conversations work
- [ ] Profile page loads

### 2. Performance Tests
- [ ] Page load time < 3 seconds
- [ ] No console errors
- [ ] Images load correctly
- [ ] Maps load correctly

### 3. Security Tests
- [ ] No API keys visible in source
- [ ] Firebase rules working correctly
- [ ] Authentication required where needed
- [ ] CORS configured correctly

### 4. Mobile Tests
- [ ] Responsive design works
- [ ] Touch interactions work
- [ ] Navigation works
- [ ] Forms work correctly

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Working
- **Symptom**: App shows "Missing environment variables" error
- **Solution**: 
  - Verify all variables are set in hosting platform
  - Rebuild and redeploy
  - Check variable names (must start with `VITE_`)

#### 2. Firebase Connection Issues
- **Symptom**: Firebase services not working
- **Solution**:
  - Check Firebase security rules
  - Verify API keys are correct
  - Check CORS settings

#### 3. Maps Not Loading
- **Symptom**: Google Maps not displaying
- **Solution**:
  - Verify `VITE_GOOGLE_MAPS_API_KEY` is set
  - Check API key restrictions in Google Cloud Console
  - Verify billing is enabled for Maps API

#### 4. Build Errors
- **Symptom**: Build fails
- **Solution**:
  - Check for TypeScript errors
  - Verify all dependencies are installed
  - Check for missing imports

---

## 📊 Monitoring

### Key Metrics to Monitor
1. **Error Rate**: Should be < 1%
2. **Page Load Time**: Should be < 3 seconds
3. **API Response Time**: Should be < 500ms
4. **User Engagement**: Track active users
5. **Conversion Rate**: Track key actions

### Alerts to Set Up
- [ ] High error rate (> 5%)
- [ ] Slow page load times (> 5 seconds)
- [ ] Firebase quota exceeded
- [ ] API rate limit exceeded
- [ ] Critical feature failures

---

## 🔄 Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**
   - Revert to previous deployment
   - Check error logs
   - Identify root cause

2. **Hot Fix**
   - Fix critical issues
   - Deploy hot fix
   - Monitor closely

3. **Post-Mortem**
   - Document what went wrong
   - Update deployment process
   - Prevent future issues

---

## ✅ Final Checklist

Before going live:
- [ ] All environment variables set
- [ ] Firebase rules configured
- [ ] Build successful
- [ ] All tests passing
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team notified

---

**Status**: Ready for Production ✅
