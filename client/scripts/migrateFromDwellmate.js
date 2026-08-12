// Migration script from Dwellmate to HomesKE
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    getDocs,
    setDoc,
    doc,
    writeBatch
} from 'firebase/firestore';
import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    setPersistence,
    inMemoryPersistence
} from 'firebase/auth';

// --- CONFIGURATION ---

// Source: Dwellmate
const sourceConfig = {
    apiKey: process.env.DWELLMATE_API_KEY || "YOUR_SOURCE_FIREBASE_API_KEY",
    authDomain: "dwellmate-285e8.firebaseapp.com",
    projectId: "dwellmate-285e8",
    storageBucket: "dwellmate-285e8.firebasestorage.app",
    messagingSenderId: "951413621891",
    appId: "1:951413621891:web:ab7a731b8db0e1a28687b6"
};

// Destination: HomesKE
const destConfig = {
    apiKey: process.env.HOMESKE_API_KEY || "YOUR_DEST_FIREBASE_API_KEY",
    authDomain: "homeske.firebaseapp.com",
    projectId: "homeske",
    storageBucket: "homeske.firebasestorage.app",
    messagingSenderId: "1020344751483",
    appId: "1:1020344751483:web:69b0ad87673613d75699de",
    measurementId: "G-VQNF1ZPH1K"
};

// --- INITIALIZATION ---

console.log("🔌 Initializing configurations...");
const sourceApp = initializeApp(sourceConfig, "sourceApp");
const destApp = initializeApp(destConfig, "destApp");

const sourceDb = getFirestore(sourceApp);
const destDb = getFirestore(destApp);
const destAuth = getAuth(destApp);

// --- MIGRATION UTILS ---

async function migrateCollection(collectionName) {
    console.log(`\n📦 Migrating collection: ${collectionName}`);
    try {
        const snapshot = await getDocs(collection(sourceDb, collectionName));
        console.log(`   Found ${snapshot.size} documents in source.`);

        if (snapshot.empty) return;

        let batch = writeBatch(destDb);
        let count = 0;
        let total = 0;

        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const ref = doc(destDb, collectionName, docSnap.id);

            // Handle subcollections if necessary?
            // For now, flat migration.

            batch.set(ref, data);
            count++;
            total++;

            if (count >= 400) { // Batch limit is 500
                await batch.commit();
                console.log(`   Saved ${total} documents...`);
                batch = writeBatch(destDb);
                count = 0;
            }
        }

        if (count > 0) {
            await batch.commit();
        }
        console.log(`✅ Completed ${collectionName}: ${total} total migrated.`);

    } catch (error) {
        console.error(`❌ Error migrating ${collectionName}:`, error.message);
    }
}

async function runMigration() {
    console.log("🚀 Starting Dwellmate -> HomesKE Migration");

    // Authenticate Destination
    console.log("🔐 Authenticating to Destination...");
    try {
        await setPersistence(destAuth, inMemoryPersistence);

        try {
            // Try to create the admin user first
            await createUserWithEmailAndPassword(destAuth, process.env.FIREBASE_ADMIN_EMAIL || "YOUR_ADMIN_EMAIL", process.env.FIREBASE_ADMIN_PASSWORD || "YOUR_ADMIN_PASSWORD");
            console.log("✅ Created and authenticated as Admin.");
        } catch (createError) {
            if (createError.code === 'auth/email-already-in-use') {
                console.log("ℹ️ Admin exists, signing in...");
                await signInWithEmailAndPassword(destAuth, process.env.FIREBASE_ADMIN_EMAIL || "YOUR_ADMIN_EMAIL", process.env.FIREBASE_ADMIN_PASSWORD || "YOUR_ADMIN_PASSWORD");
                console.log("✅ Authenticated as Admin.");
            } else {
                throw createError;
            }
        }
    } catch (e) {
        console.error("❌ Auth failed. Ensure Email/Password provider is enabled in Firebase Console.");
        console.error(e.message);
        // Continue anyway? No, writes will fail.
        process.exit(1);
    }

    const collectionsToMigrate = [
        'users',
        'agents',
        'inquiries',
        'conversations',
        'comments'
    ];

    for (const col of collectionsToMigrate) {
        await migrateCollection(col);
    }

    // Admin Settings is a document in 'admin' collection, so 'admin' collection loop covers it.

    console.log("\n🎉 Migration Complete!");
    // Force exit
    setTimeout(() => process.exit(0), 1000);
}

runMigration();
