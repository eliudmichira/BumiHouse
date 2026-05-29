// Investigate property data for Juja
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, limit } from 'firebase/firestore';

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

async function investigate() {
    console.log('🔍 Investigating properties in homeske...');
    try {
        const snap = await getDocs(query(collection(db, 'properties'), limit(10)));
        console.log(`Found ${snap.size} properties.`);

        snap.forEach(doc => {
            const data = doc.data();
            console.log('---');
            console.log(`Title: ${data.title}`);
            console.log(`County: ${data.county}`);
            console.log(`Geohash: ${data.geohash}`);
            console.log(`Location:`, JSON.stringify(data.location || data.coordinates || {}));
        });
    } catch (e) {
        console.error('❌ Error:', e.message);
    }
    process.exit(0);
}

investigate();
