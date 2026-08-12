/**
 * Backfill `listing_type` on existing jiji properties so the desktop filter works.
 * Derives 'rent' | 'sale' from existing `status` field.
 *   node scripts/backfillJijiListingType.js           # dry-run
 *   CONFIRM=1 node scripts/backfillJijiListingType.js # write
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
console.log(`Found ${snap.size} jiji properties`);

const confirm = process.env.CONFIRM === '1';
let rent = 0, sale = 0, skipped = 0;
let batch = db.batch();
let pending = 0;

for (const d of snap.docs) {
  const data = d.data();
  if (data.listing_type) { skipped++; continue; }
  const status = String(data.status || '').toLowerCase();
  const lt = status.includes('rent') ? 'rent' : status.includes('sale') ? 'sale' : null;
  if (!lt) { skipped++; continue; }
  if (lt === 'rent') rent++; else sale++;
  if (confirm) {
    batch.update(d.ref, { listing_type: lt });
    pending++;
    if (pending >= 400) { await batch.commit(); batch = db.batch(); pending = 0; }
  }
}
if (confirm && pending > 0) await batch.commit();

console.log(`rent=${rent} sale=${sale} skipped=${skipped}`);
console.log(confirm ? '✅ written' : 'Dry-run. Re-run with CONFIRM=1 to write.');
process.exit(0);
