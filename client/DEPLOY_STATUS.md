# Deploy Status

## Client (Firebase)

- **Hosting URL**: https://dwellmate-285e8.web.app
- **Last deploy**: Production build + Firebase Hosting + Firestore rules
- **Commands used**:
  - `npm run build`
  - `npx firebase deploy --only "hosting,firestore"`

## Server (your backend)

Deploy the server separately to your host (Railway, Render, VPS, etc.):

1. Set **production** environment variables (no localhost):
   - `NODE_ENV=production`
   - `DATABASE_URL` (e.g. MongoDB Atlas URI)
   - `CLIENT_URL=https://dwellmate-285e8.web.app`
   - `JWT_SECRET_KEY` (32+ character random secret)
   - `PORT` (if required by host)
   - `EMAIL_USER` / `EMAIL_PASS` if using email
   - `GOOGLE_APPLICATION_CREDENTIALS` path and service account file on server

2. Ensure the server **JWT_SECRET_KEY** is set; the app will refuse to start in production with the placeholder.

3. Point the **client** to your live API by setting `VITE_API_URL` and `VITE_SOCKET_URL` in your client build env (e.g. in Firebase Hosting build step or CI), then rebuild and redeploy the client.

## Re-deploy client only

```bash
cd client
npm run build
npx firebase deploy --only "hosting,firestore"
```
