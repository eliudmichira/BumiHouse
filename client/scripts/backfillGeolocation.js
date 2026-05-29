/**
 * Backfill Geolocation Data
 * This script enriches existing properties with 'county' and 'geohash' fields.
 */
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import ngeohash from 'ngeohash';

// ... (countyData remains same)
const countyData = [
    { "name": "Nairobi", "lat": -1.2864, "lng": 36.8172 },
    { "name": "Kiambu", "lat": -1.1668, "lng": 36.8198 },
    { "name": "Mombasa", "lat": -4.0500, "lng": 39.6667 },
    { "name": "Machakos", "lat": -1.5200, "lng": 37.2667 },
    { "name": "Nakuru", "lat": -0.3000, "lng": 36.0667 },
    { "name": "Uasin Gishu", "lat": 0.5167, "lng": 35.2833 },
    { "name": "Kisumu", "lat": -0.0833, "lng": 34.7667 }
];

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

// Simple distance calculation (same)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getCountyFromCoords(lat, lng) {
    let nearestCounty = null;
    let minDistance = Infinity;
    countyData.forEach(county => {
        const dist = calculateDistance(lat, lng, county.lat, county.lng);
        if (dist < minDistance) {
            minDistance = dist;
            nearestCounty = county;
        }
    });
    return nearestCounty?.name || null;
}

async function backfill() {
    console.log('🚀 Starting Geolocation Backfill (Authenticated)...');
    try {
        await signInWithEmailAndPassword(auth, "support@homeske.com", "REDACTED");
        console.log("✅ Authenticated as Admin.");

        const snap = await getDocs(collection(db, 'properties'));
        console.log(`Found ${snap.size} properties to process.`);

        let updatedCount = 0;
        for (const propertyDoc of snap.docs) {
            const data = propertyDoc.data();
            const coords = data.location?.coordinates || data.coordinates || data.location;

            if (coords && coords.lat && coords.lng) {
                const lat = parseFloat(coords.lat);
                const lng = parseFloat(coords.lng);

                const county = getCountyFromCoords(lat, lng);
                const geohash = ngeohash.encode(lat, lng, 9);

                console.log(`Updating [${data.title}]: County=${county}, Geohash=${geohash.substring(0, 5)}...`);

                await updateDoc(doc(db, 'properties', propertyDoc.id), {
                    county: county,
                    geohash: geohash
                });
                updatedCount++;
            } else {
                console.warn(`⚠️ Skipping [${data.title}]: No valid coordinates found.`);
            }
        }
        console.log(`✅ Backfill complete. Updated ${updatedCount} properties.`);
    } catch (e) {
        console.error('❌ Backfill failed:', e.message);
    }
    process.exit(0);
}

backfill();
