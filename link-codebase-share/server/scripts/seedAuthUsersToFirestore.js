/*
 Usage:
 1) Create a Firebase service account JSON in server/.secrets/serviceAccount.json
    - Firebase Console → Project Settings → Service accounts → Generate new private key
 2) Run: node scripts/seedAuthUsersToFirestore.js
*/

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import admin from 'firebase-admin';

// Allow specifying service account via env var or default path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envKeyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
// Default relative to repo root if run from server/ or root
const defaultKeyPath = fs.existsSync(path.resolve(process.cwd(), '.secrets/dwellmate-serviceAccount.json'))
  ? path.resolve(process.cwd(), '.secrets/dwellmate-serviceAccount.json')
  : path.resolve(__dirname, '../.secrets/dwellmate-serviceAccount.json');
const keyPath = envKeyPath && fs.existsSync(envKeyPath) ? envKeyPath : defaultKeyPath;

if (!fs.existsSync(keyPath)) {
  console.error('Missing service account JSON. Provide one of:');
  console.error(` - Env GOOGLE_APPLICATION_CREDENTIALS pointing to an existing file`);
  console.error(` - File at ${defaultKeyPath}`);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const toTimestamp = (date) => admin.firestore.Timestamp.fromDate(date);

async function upsertUserDoc(userRecord) {
  const uid = userRecord.uid;
  const docRef = db.collection('users').doc(uid);
  const existing = await docRef.get();

  const created = userRecord.metadata.creationTime ? new Date(userRecord.metadata.creationTime) : new Date();
  const lastSignIn = userRecord.metadata.lastSignInTime ? new Date(userRecord.metadata.lastSignInTime) : created;

  const isAdmin = userRecord.uid === '5AMgkzuy36cA75gYTkQJSbvDC3n2' || (userRecord.email || '').toLowerCase() === 'eliudmichira7@gmail.com';

  const payload = {
    email: userRecord.email || '',
    username: userRecord.displayName || (userRecord.email ? userRecord.email.split('@')[0] : 'User'),
    name: userRecord.displayName || '',
    phone: userRecord.phoneNumber || '',
    avatar: userRecord.photoURL || '',
    role: isAdmin ? 'admin' : 'user',
    isActive: true,
    propertiesCount: existing.exists ? (existing.data().propertiesCount || 0) : 0,
    createdAt: toTimestamp(created),
    lastLogin: toTimestamp(lastSignIn)
  };

  await docRef.set(payload, { merge: true });
}

async function main() {
  console.log('Fetching auth users...');
  let nextPageToken;
  let count = 0;
  do {
    const res = await auth.listUsers(1000, nextPageToken);
    for (const user of res.users) {
      await upsertUserDoc(user);
      count++;
    }
    nextPageToken = res.pageToken;
  } while (nextPageToken);
  console.log(`Upserted ${count} users into Firestore/users`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


