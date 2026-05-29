# 🚀 Server Deployment Guide - Hama Estate API

This guide covers deploying your Node.js/Express server to various cloud platforms.

## 📋 Prerequisites

- Node.js 18+ installed
- Git repository set up
- MongoDB Atlas account (for database)
- Cloud platform account (Railway, Render, Heroku, etc.)

## 🔧 Pre-Deployment Setup

### 1. Update Environment Variables

Create a production `.env` file in the `server` directory:

```env
# Database
DATABASE_URL="your_mongodb_atlas_connection_string"

# Server
PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET="your_super_secret_jwt_key"

# CORS
CLIENT_URL="https://makao-648bd.web.app"

# Optional: Email service
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_email@gmail.com"
SMTP_PASS="your_app_password"
```

### 2. Database Setup (MongoDB Atlas)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a free cluster
3. Get your connection string
4. Update `DATABASE_URL` in your environment variables

## 🚂 Railway Deployment (Recommended)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Initialize Project
```bash
cd server
railway init
```

### Step 4: Deploy
```bash
railway up
```

### Step 5: Set Environment Variables
```bash
railway variables set DATABASE_URL="your_mongodb_atlas_connection_string"
railway variables set JWT_SECRET="your_secret_key"
railway variables set CLIENT_URL="https://makao-648bd.web.app"
```

### Step 6: Get Your API URL
```bash
railway domain
```

## 🌐 Render Deployment

### Step 1: Connect Repository
1. Go to [Render](https://render.com/)
2. Connect your GitHub repository
3. Create a new Web Service

### Step 2: Configure Service
- **Name**: hama-estate-api
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Root Directory**: `server`

### Step 3: Set Environment Variables
- `DATABASE_URL`
- `JWT_SECRET`
- `CLIENT_URL`
- `NODE_ENV=production`

## 🏗️ Heroku Deployment

### Step 1: Install Heroku CLI
```bash
npm install -g heroku
```

### Step 2: Login and Create App
```bash
heroku login
heroku create hama-estate-api
```

### Step 3: Set Environment Variables
```bash
heroku config:set DATABASE_URL="your_mongodb_atlas_connection_string"
heroku config:set JWT_SECRET="your_secret_key"
heroku config:set CLIENT_URL="https://makao-648bd.web.app"
heroku config:set NODE_ENV=production
```

### Step 4: Deploy
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

## 🐳 Docker Deployment

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Build and Deploy
```bash
docker build -t hama-estate-api .
docker run -p 3000:3000 hama-estate-api
```

## 🔧 Environment Configuration

### Required Variables
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/hama-estate
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=https://makao-648bd.web.app
NODE_ENV=production
PORT=3000
```

### Optional Variables
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

## 📊 Database Setup

### MongoDB Atlas Setup
1. **Create Cluster**: Free tier (M0)
2. **Network Access**: Allow all IPs (0.0.0.0/0)
3. **Database Access**: Create user with read/write permissions
4. **Connection String**: Use the provided connection string

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/hama-estate?retryWrites=true&w=majority
```

## 🚀 Deployment Scripts

### Railway Quick Deploy
```bash
#!/bin/bash
cd server
railway login
railway up
railway variables set DATABASE_URL="$DATABASE_URL"
railway variables set JWT_SECRET="$JWT_SECRET"
railway variables set CLIENT_URL="https://makao-648bd.web.app"
echo "Deployment complete! API URL: $(railway domain)"
```

### Heroku Quick Deploy
```bash
#!/bin/bash
cd server
heroku create hama-estate-api
heroku config:set DATABASE_URL="$DATABASE_URL"
heroku config:set JWT_SECRET="$JWT_SECRET"
heroku config:set CLIENT_URL="https://makao-648bd.web.app"
git push heroku main
echo "Deployment complete! API URL: https://hama-estate-api.herokuapp.com"
```

## 🔍 Post-Deployment

### 1. Test Your API
```bash
# Test health endpoint
curl https://your-api-url.railway.app/health

# Test properties endpoint
curl https://your-api-url.railway.app/api/properties
```

### 2. Update Frontend
Update your frontend environment variables:
```env
VITE_API_URL=https://your-api-url.railway.app/api
```

### 3. Redeploy Frontend
```bash
cd client
npm run build
npx firebase deploy --only hosting
```

## 📈 Monitoring & Logs

### Railway
```bash
railway logs
railway status
```

### Heroku
```bash
heroku logs --tail
heroku ps
```

### Render
- View logs in the Render dashboard
- Set up alerts for downtime

## 🔒 Security Considerations

### Environment Variables
- Never commit `.env` files
- Use platform-specific secret management
- Rotate JWT secrets regularly

### CORS Configuration
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://makao-648bd.web.app',
  credentials: true
}));
```

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Check connection
   railway logs
   # Verify DATABASE_URL format
   ```

2. **Port Issues**
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

3. **CORS Errors**
   ```javascript
   // Update CORS origin
   origin: process.env.CLIENT_URL
   ```

4. **Build Failures**
   ```bash
   # Check Node.js version
   node --version
   # Verify package.json scripts
   ```

### Debug Commands
```bash
# Check environment variables
railway variables

# View logs
railway logs

# Restart service
railway service restart

# Check status
railway status
```

## 📞 Support

### Before Asking for Help
1. ✅ Check deployment logs
2. ✅ Verify environment variables
3. ✅ Test database connection
4. ✅ Check CORS configuration

### Useful Links
- [Railway Documentation](https://docs.railway.app/)
- [Render Documentation](https://render.com/docs)
- [Heroku Documentation](https://devcenter.heroku.com/)
- [MongoDB Atlas](https://docs.atlas.mongodb.com/)

## 🎯 Recommended Workflow

1. **Setup MongoDB Atlas** (free tier)
2. **Deploy to Railway** (easiest option)
3. **Update frontend API URL**
4. **Redeploy frontend**
5. **Test all endpoints**
6. **Monitor performance**

## 🎉 Success Checklist

- [ ] Database connected and working
- [ ] API endpoints responding
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Frontend updated with new API URL
- [ ] All features working in production
- [ ] Monitoring and logging set up
