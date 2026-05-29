/*
 Copies specified Firestore collections (with nested subcollections) from a source
 Firebase project to a destination project using Admin SDK service accounts.

 Usage:
   node server/scripts/copyFirestore.js \
     --srcCred=./makao-648bd-firebase-adminsdk-fbsvc-c899785576.json \
     --destCred=./dwellmate-285e8-firebase-adminsdk.json \
     --collections=admin,agents,conversations,inquiries,pageViews,properties,users

 Notes:
 - Requires 'firebase-admin' (already in server dependencies)
 - Reads recursively and writes in batches to respect write limits
*/

import fs from 'fs';
import path from 'path';
import process from 'process';
import admin from 'firebase-admin';

function parseArgs() {
  const args = process.argv.slice(2);
  const result = {};
  for (const arg of args) {
    const [k, v] = arg.split('=');
    if (k && v) {
      result[k.replace(/^--/, '')] = v;
    }
  }
  return result;
}

function requireFileExists(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

function initAppFromCred(credPath, appName) {
  const absolute = path.isAbsolute(credPath) ? credPath : path.resolve(process.cwd(), credPath);
  requireFileExists(absolute);
  const raw = fs.readFileSync(absolute, 'utf8');
  const serviceAccount = JSON.parse(raw);
  if (serviceAccount.private_key && typeof serviceAccount.private_key === 'string') {
    // Normalize escaped newlines in PEM
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  }, appName);
}

async function listAllDocumentsRecursively(firestore, docRef) {
  // Return this document and its nested subcollections recursively
  const result = [];
  const docSnap = await docRef.get();
  if (!docSnap.exists) {
    return result;
  }
  result.push({ ref: docRef, data: docSnap.data() });

  const subcollections = await docRef.listCollections();
  for (const sub of subcollections) {
    const subDocs = await sub.get();
    for (const subDoc of subDocs.docs) {
      const nested = await listAllDocumentsRecursively(firestore, sub.doc(subDoc.id));
      result.push(...nested);
    }
  }
  return result;
}

async function* walkCollectionRecursively(firestore, collectionPath) {
  const col = firestore.collection(collectionPath);
  const snapshot = await col.get();
  for (const doc of snapshot.docs) {
    yield { ref: doc.ref, data: doc.data() };
    const subcollections = await doc.ref.listCollections();
    for (const sub of subcollections) {
      const subDocs = await sub.get();
      for (const subDoc of subDocs.docs) {
        const nestedDocs = await listAllDocumentsRecursively(firestore, sub.doc(subDoc.id));
        for (const nd of nestedDocs) {
          yield nd;
        }
      }
    }
  }
}

async function copyCollections({ srcDb, destDb, collections }) {
  const BATCH_LIMIT = 400; // safety below 500
  for (const collectionName of collections) {
    const basePath = collectionName;
    console.log(`\n==> Copying collection: ${basePath}`);
    let batch = destDb.batch();
    let writesInBatch = 0;
    let copied = 0;

    for await (const { ref: srcRef, data } of walkCollectionRecursively(srcDb, basePath)) {
      const destRef = destDb.doc(srcRef.path);
      batch.set(destRef, data, { merge: true });
      writesInBatch++;
      copied++;

      if (writesInBatch >= BATCH_LIMIT) {
        await batch.commit();
        console.log(`Committed ${writesInBatch} writes (running total ${copied})...`);
        batch = destDb.batch();
        writesInBatch = 0;
      }
    }

    if (writesInBatch > 0) {
      await batch.commit();
      console.log(`Committed final ${writesInBatch} writes for ${basePath}.`);
    }
    console.log(`✅ Completed copying ${copied} documents (including nested) for '${basePath}'.`);
  }
}

(async () => {
  try {
    const args = parseArgs();
    const srcCred = args.srcCred || './makao-648bd-firebase-adminsdk-fbsvc-c899785576.json';
    const destCred = args.destCred || './dwellmate-285e8-firebase-adminsdk.json';
    const collectionsArg = args.collections || 'admin,agents,conversations,inquiries,pageViews,properties,users';
    const collections = collectionsArg.split(',').map(s => s.trim()).filter(Boolean);

    console.log('Source credential:', srcCred);
    console.log('Destination credential:', destCred);
    console.log('Collections:', collections.join(', '));

    const srcApp = initAppFromCred(srcCred, 'src-app');
    const destApp = initAppFromCred(destCred, 'dest-app');
    const srcDb = srcApp.firestore();
    const destDb = destApp.firestore();

    await copyCollections({ srcDb, destDb, collections });

    await Promise.all([
      srcApp.delete(),
      destApp.delete()
    ]);
    console.log('\n🎉 Firestore copy completed.');
  } catch (err) {
    console.error('❌ Copy failed:', err?.message || err);
    process.exitCode = 1;
  }
})();


