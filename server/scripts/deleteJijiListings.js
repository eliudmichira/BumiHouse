/**
 * Delete all properties with source === 'jiji' from homeske.
 *   node scripts/deleteJijiListings.js          # dry-run (shows count, doesn't delete)
 *   CONFIRM=1 node scripts/deleteJijiListings.js  # actually delete
 */
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const sa = JSON.parse(readFileSync(join(__dirname, '..', 'serviceAccountKey.json'), 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(sa), projectId: sa.project_id });
const db = admin.firestore();

const snap = await db.collection('properties').where('source', '==', 'jiji').get();
console.log(`Found ${snap.size} jiji properties.`);

if (process.env.CONFIRM !== '1') {
  console.log('Dry-run. Re-run with CONFIRM=1 to delete.');
  process.exit(0);
}

let batch = db.batch();
let n = 0;
for (const d of snap.docs) {
  batch.delete(d.ref);
  n++;
  if (n % 400 === 0) { await batch.commit(); batch = db.batch(); }
}
if (n % 400 !== 0) await batch.commit();
console.log(`Deleted ${n}.`);
process.exit(0);
