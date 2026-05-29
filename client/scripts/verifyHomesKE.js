// Verify Firestore data
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "REDACTED",
    authDomain: "homeske.firebaseapp.com",
    projectId: "homeske",
    storageBucket: "homeske.firebasestorage.app",
    messagingSenderId: "1020344751483",
    appId: "1:1020344751483:web:69b0ad87673613d75699de",
    measurementId: "G-VQNF1ZPH1K"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function verifyData() {
    console.log('🔍 Verifying Firestore data...');

    try {
        await signInWithEmailAndPassword(auth, "support@homeske.com", "REDACTED");
        console.log("✅ Authenticated as Admin for verification.");
    } catch (e) {
        console.warn("⚠️ Could not sign in as admin. Some collections might be unreadable/empty.");
    }


    const collections = [
        'properties',
        'agents',
        'users',
        'pageViews',
        'admin',
        'inquiries',
        'conversations',
        'reviews',
        'comments'
    ];

    for (const colName of collections) {
        try {
            const snap = await getDocs(collection(db, colName));
            console.log(`✅ ${colName}: ${snap.size} documents found.`);
            if (snap.size === 0) console.warn(`⚠️ ${colName} is empty!`);
        } catch (e) {
            console.error(`❌ Error checking ${colName}:`, e.message);
        }
    }
    process.exit(0);
}

verifyData();
