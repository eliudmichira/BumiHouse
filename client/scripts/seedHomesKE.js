// Seed script for HomesKE Firebase project
import { initializeApp } from 'firebase/app';
import {
    getFirestore,
    collection,
    addDoc,
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    setPersistence,
    inMemoryPersistence
} from 'firebase/auth';

// Firebase configuration for HomesKE project
const firebaseConfig = {
    apiKey: "REDACTED",
    authDomain: "homeske.firebaseapp.com",
    projectId: "homeske",
    storageBucket: "homeske.firebasestorage.app",
    messagingSenderId: "1020344751483",
    appId: "1:1020344751483:web:69b0ad87673613d75699de",
    measurementId: "G-VQNF1ZPH1K"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Initialize persistence (required for Node.js environment)
// We need to wrap this in an async function call or just call it and hope it sets before usage
// But top level await is available in modules.
// However, creating a setup function is cleaner.
async function setupAuth() {
    await setPersistence(auth, inMemoryPersistence);
}
// We call setupAuth in seedHomesKE before anything else.


// Sample properties data
const sampleProperties = [
    {
        title: "Modern Apartment in Nairobi",
        description: "Beautiful 2-bedroom apartment in the heart of Nairobi with modern amenities and great views.",
        price: 4500000,
        type: "apartment",
        bedrooms: 2,
        bathrooms: 2,
        area: 85,
        location: {
            city: "Nairobi",
            area: "Westlands",
            address: "Westlands, Nairobi"
        },
        features: ["Balcony", "Parking", "Security", "Elevator"],
        amenities: ["Swimming Pool", "Gym", "24/7 Security", "Parking"],
        images: [
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop"
        ],
        featured: true,
        status: "available",
        userId: "admin_user_id", // Placeholder, will be updated after user creation
        agent: {
            name: "HomesKE Admin",
            phone: "+254 700 123 456",
            email: "support@homeske.com",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop"
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    },
    {
        title: "Luxury Villa in Mombasa",
        description: "Stunning 4-bedroom villa with ocean views and private beach access.",
        price: 12000000,
        type: "house",
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        location: {
            city: "Mombasa",
            area: "Nyali",
            address: "Nyali, Mombasa"
        },
        features: ["Ocean View", "Private Beach", "Garden", "Swimming Pool"],
        amenities: ["Private Beach", "Swimming Pool", "Garden", "Security"],
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
        ],
        featured: true,
        status: "available",
        userId: "admin_user_id",
        agent: {
            name: "HomesKE Admin",
            phone: "+254 700 789 012",
            email: "support@homeske.com",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    },
    {
        title: "Cozy Studio in Kisumu",
        description: "Perfect studio apartment for young professionals in Kisumu city center.",
        price: 1800000,
        type: "studio",
        bedrooms: 1,
        bathrooms: 1,
        area: 35,
        location: {
            city: "Kisumu",
            area: "City Center",
            address: "Kisumu City Center"
        },
        features: ["Furnished", "Balcony", "Security"],
        amenities: ["24/7 Security", "Parking", "Near Transport"],
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop"
        ],
        featured: false,
        status: "available",
        userId: "admin_user_id",
        agent: {
            name: "HomesKE Admin",
            phone: "+254 700 345 678",
            email: "support@homeske.com",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
    }
];

// Sample agents data
const sampleAgents = [
    {
        name: "HomesKE Admin",
        email: "support@homeske.com",
        phone: "+254 700 123 456",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop",
        bio: "Official HomesKE Support Agent.",
        specialties: ["Support", "General Inquiries"],
        verified: true,
        rating: 5.0,
        propertiesSold: 100,
        joinedAt: serverTimestamp()
    }
];

// Function to seed properties
async function seedProperties(adminUserId) {
    console.log('🌱 Seeding properties...');

    for (const property of sampleProperties) {
        try {
            // Set the correct userId
            property.userId = adminUserId;
            const docRef = await addDoc(collection(db, 'properties'), property);
            console.log(`✅ Property added with ID: ${docRef.id}`);
        } catch (error) {
            console.error('❌ Error adding property:', error);
        }
    }
}

// Function to seed agents
async function seedAgents(uid) {
    console.log('🌱 Seeding agents...');

    // We only have one admin agent in sampleAgents, assign it to the uid
    if (sampleAgents.length > 0 && uid) {
        const agent = sampleAgents[0];
        try {
            // Use the Auth UID as the document ID, matching security rules
            await setDoc(doc(db, 'agents', uid), agent);
            console.log(`✅ Agent added with ID: ${uid}`);
        } catch (error) {
            console.error('❌ Error adding agent:', error);
        }
    }
}

// Function to create test users
async function createTestUsers() {
    console.log('🌱 Creating test users...');

    const testUsers = [
        { email: 'user@homeske.com', password: 'REDACTED', role: 'user' },
        { email: 'support@homeske.com', password: 'REDACTED', role: 'admin' } // Create admin LAST to stay signed in
    ];

    let adminUserId = null;

    for (const user of testUsers) {
        try {
            // Sign out first to ensure clean slate
            await signOut(auth);

            let userCredential;
            try {
                // Try to create user
                userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
                console.log(`✅ User created: ${user.email}`);
            } catch (authError) {
                if (authError.code === 'auth/email-already-in-use') {
                    console.log(`ℹ️ User already exists, signing in: ${user.email}`);
                    userCredential = await signInWithEmailAndPassword(auth, user.email, user.password);
                } else {
                    throw authError;
                }
            }

            if (user.role === 'admin') {
                adminUserId = userCredential.user.uid;
            }

            // Add user data to Firestore
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                email: user.email,
                role: user.role,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error(`❌ Error handling user ${user.email}:`, error);
        }
    }
    return adminUserId;
}

// Function to create sample page views
async function seedPageViews() {
    console.log('🌱 Seeding page views...');

    const pages = ['/', '/properties', '/agents', '/about', '/contact'];
    const today = new Date().toISOString().split('T')[0];

    for (const page of pages) {
        try {
            const sanitizedPageName = page.replace(/[\/\\]/g, '_');
            const pageViewId = `${sanitizedPageName}_${today}`;

            await setDoc(doc(db, 'pageViews', pageViewId), {
                pageName: page,
                date: today,
                count: Math.floor(Math.random() * 100) + 10,
                createdAt: serverTimestamp(),
                lastUpdated: serverTimestamp()
            }, { merge: true });

            console.log(`✅ Page view added for: ${page}`);
        } catch (error) {
            console.error(`❌ Error adding page view for ${page}:`, error);
        }
    }
}

// Main seeding function
async function seedHomesKE() {
    console.log('🚀 Starting Firebase seeding for HomesKE project...');
    await setupAuth();

    try {
        // Seed all data
        const adminUserId = await createTestUsers();

        if (adminUserId) {
            // We are currently signed in as admin (created last)
            await seedProperties(adminUserId);
            await seedAgents(adminUserId);
        } else {
            console.error("❌ Failed to get admin user ID, skipping property/agent seeding.");
        }

        await seedPageViews();

        console.log('🎉 Firebase seeding completed successfully!');
        console.log('\n📊 Summary:');
        console.log(`- ${sampleProperties.length} properties added`);
        console.log(`- ${sampleAgents.length} agents added`);
        console.log('- Test users created/updated');
        console.log('- Page views added');

        console.log('\n🔑 Test User Credentials:');
        console.log('Admin: support@homeske.com / REDACTED');
        console.log('User: user@homeske.com / REDACTED');

    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        // Sign out after seeding
        await signOut(auth);
        console.log('👋 Signed out from Firebase');
        // Force exit to ensure script terminates
        process.exit(0);
    }
}

export { seedHomesKE };

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    seedHomesKE();
}
