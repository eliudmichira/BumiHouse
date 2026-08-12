// Seed script for kwangu Firebase project
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
  signOut 
} from 'firebase/auth';

// Firebase configuration for kwangu project
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "YOUR_FIREBASE_API_KEY",
  authDomain: "kwangu-2beb1.firebaseapp.com",
  projectId: "kwangu-2beb1",
  storageBucket: "kwangu-2beb1.appspot.com",
  messagingSenderId: "535990884441",
  appId: "1:535990884441:android:25309a9ad2fcd6d5013948"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

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
    agent: {
      name: "Sarah Johnson",
      phone: "+254 700 123 456",
      email: "sarah@kwangu.com",
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
    agent: {
      name: "Michael Kimani",
      phone: "+254 700 789 012",
      email: "michael@kwangu.com",
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
    agent: {
      name: "Grace Wanjiku",
      phone: "+254 700 345 678",
      email: "grace@kwangu.com",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample agents data
const sampleAgents = [
  {
    name: "Sarah Johnson",
    email: "sarah@kwangu.com",
    phone: "+254 700 123 456",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop",
    bio: "Experienced real estate agent with 5+ years in the Nairobi market.",
    specialties: ["Apartments", "Commercial Properties"],
    verified: true,
    rating: 4.8,
    propertiesSold: 45,
    joinedAt: serverTimestamp()
  },
  {
    name: "Michael Kimani",
    email: "michael@kwangu.com",
    phone: "+254 700 789 012",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
    bio: "Luxury property specialist with expertise in coastal properties.",
    specialties: ["Luxury Villas", "Beach Properties"],
    verified: true,
    rating: 4.9,
    propertiesSold: 32,
    joinedAt: serverTimestamp()
  },
  {
    name: "Grace Wanjiku",
    email: "grace@kwangu.com",
    phone: "+254 700 345 678",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    bio: "Young professional properties specialist in Kisumu region.",
    specialties: ["Studio Apartments", "Student Housing"],
    verified: true,
    rating: 4.7,
    propertiesSold: 28,
    joinedAt: serverTimestamp()
  }
];

// Function to seed properties
async function seedProperties() {
  console.log('🌱 Seeding properties...');
  
  for (const property of sampleProperties) {
    try {
      const docRef = await addDoc(collection(db, 'properties'), property);
      console.log(`✅ Property added with ID: ${docRef.id}`);
    } catch (error) {
      console.error('❌ Error adding property:', error);
    }
  }
}

// Function to seed agents
async function seedAgents() {
  console.log('🌱 Seeding agents...');
  
  for (const agent of sampleAgents) {
    try {
      // Create a document with a specific ID (using email as ID)
      const agentId = agent.email.split('@')[0];
      await setDoc(doc(db, 'agents', agentId), agent);
      console.log(`✅ Agent added with ID: ${agentId}`);
    } catch (error) {
      console.error('❌ Error adding agent:', error);
    }
  }
}

// Function to create test users
async function createTestUsers() {
  console.log('🌱 Creating test users...');
  
  const testUsers = [
    { email: process.env.SEED_ADMIN_EMAIL || 'admin@kwangu.com', password: process.env.SEED_ADMIN_PASSWORD || 'YOUR_ADMIN_PASSWORD', role: 'admin' },
    { email: process.env.SEED_AGENT_EMAIL || 'agent@kwangu.com', password: process.env.SEED_AGENT_PASSWORD || 'YOUR_AGENT_PASSWORD', role: 'agent' },
    { email: process.env.SEED_USER_EMAIL || 'user@kwangu.com', password: process.env.SEED_USER_PASSWORD || 'YOUR_USER_PASSWORD', role: 'user' }
  ];
  
  for (const user of testUsers) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, user.email, user.password);
      console.log(`✅ User created: ${user.email}`);
      
      // Add user data to Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: user.email,
        role: user.role,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️ User already exists: ${user.email}`);
      } else {
        console.error(`❌ Error creating user ${user.email}:`, error);
      }
    }
  }
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
      });
      
      console.log(`✅ Page view added for: ${page}`);
    } catch (error) {
      console.error(`❌ Error adding page view for ${page}:`, error);
    }
  }
}

// Main seeding function
async function seedKwanguFirebase() {
  console.log('🚀 Starting Firebase seeding for kwangu project...');
  
  try {
    // Seed all data
    await seedProperties();
    await seedAgents();
    await createTestUsers();
    await seedPageViews();
    
    console.log('🎉 Firebase seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${sampleProperties.length} properties added`);
    console.log(`- ${sampleAgents.length} agents added`);
    console.log('- 3 test users created');
    console.log('- 5 page views added');
    
    console.log('\n🔑 Test User Credentials:');
    console.log('Admin: admin@kwangu.com / admin123');
    console.log('Agent: agent@kwangu.com / agent123');
    console.log('User: user@kwangu.com / user123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    // Sign out after seeding
    await signOut(auth);
    console.log('👋 Signed out from Firebase');
  }
}

// Export the seeding function
export { seedKwanguFirebase };

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedKwanguFirebase();
}
