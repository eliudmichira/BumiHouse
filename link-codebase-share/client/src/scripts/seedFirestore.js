import { db } from '../lib/firebase.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Sample properties data
const sampleProperties = [
  {
    title: "Modern Apartment in Westlands",
    description: "Beautiful 2-bedroom apartment with stunning city views and modern amenities. Perfect for young professionals or small families.",
    price: 45000000,
    location: {
      address: "Westlands, Nairobi",
      city: "Nairobi",
      coordinates: { lat: -1.2921, lng: 36.8219 }
    },
    bedrooms: 2,
    bathrooms: 2,
    area: 120,
    type: "Apartment",
    status: "For Sale",
    featured: true, // This property will appear in Featured Properties
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop"
    ],
    amenities: ["Parking", "Gym", "Pool", "Security", "Elevator"],
    agent: {
      name: "Sarah Johnson",
      phone: "+254 700 123 456",
      email: "sarah@hamaestate.com",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop"
    },
    features: ["Balcony", "Built-in Wardrobes", "Modern Kitchen", "En-suite Bathroom"],
    pricePerSqft: 375000,
    days_on_market: 15,
    rating: 4.9,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Luxury Villa in Karen",
    description: "Spacious 4-bedroom villa with garden and pool. Perfect for families looking for luxury living in a quiet neighborhood.",
    price: 85000000,
    location: {
      address: "Karen, Nairobi",
      city: "Nairobi",
      coordinates: { lat: -1.3182, lng: 36.7172 }
    },
    bedrooms: 4,
    bathrooms: 3,
    area: 350,
    type: "Villa",
    status: "For Sale",
    featured: true, // This property will appear in Featured Properties
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop"
    ],
    amenities: ["Garden", "Pool", "Security", "Parking", "Servant Quarters"],
    agent: {
      name: "Michael Chen",
      phone: "+254 700 234 567",
      email: "michael@hamaestate.com",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
    },
    features: ["Swimming Pool", "Garden", "Security System", "Staff Quarters"],
    pricePerSqft: 242857,
    days_on_market: 8,
    rating: 4.8,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Cozy Studio in Kilimani",
    description: "Perfect starter home in a great location. Modern studio apartment with all essential amenities.",
    price: 25000000,
    location: {
      address: "Kilimani, Nairobi",
      city: "Nairobi",
      coordinates: { lat: -1.3000, lng: 36.8000 }
    },
    bedrooms: 1,
    bathrooms: 1,
    area: 45,
    type: "Studio",
    status: "For Sale",
    featured: false, // This property won't appear in Featured Properties
    images: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop"
    ],
    amenities: ["Security", "Parking", "Water", "Electricity"],
    agent: {
      name: "Lisa Wang",
      phone: "+254 700 345 678",
      email: "lisa@hamaestate.com",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
    },
    features: ["Open Plan", "Modern Bathroom", "Kitchenette"],
    pricePerSqft: 555556,
    days_on_market: 22,
    rating: 4.7,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Family Home in Lavington",
    description: "Beautiful 3-bedroom family home in a quiet neighborhood. Great for families with children.",
    price: 65000000,
    location: {
      address: "Lavington, Nairobi",
      city: "Nairobi",
      coordinates: { lat: -1.2850, lng: 36.8150 }
    },
    bedrooms: 3,
    bathrooms: 2,
    area: 200,
    type: "House",
    status: "For Sale",
    featured: true, // This property will appear in Featured Properties
    images: [
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
    ],
    amenities: ["Garden", "Security", "Parking", "Water", "Electricity"],
    agent: {
      name: "David Kimani",
      phone: "+254 700 456 789",
      email: "david@hamaestate.com",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop"
    },
    features: ["Garden", "Security System", "Spacious Kitchen"],
    pricePerSqft: 325000,
    days_on_market: 12,
    rating: 4.6,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    title: "Penthouse in Upperhill",
    description: "Luxury penthouse with panoramic city views. The ultimate in urban living.",
    price: 120000000,
    location: {
      address: "Upperhill, Nairobi",
      city: "Nairobi",
      coordinates: { lat: -1.2900, lng: 36.8100 }
    },
    bedrooms: 3,
    bathrooms: 3,
    area: 280,
    type: "Penthouse",
    status: "For Sale",
    featured: true, // This property will appear in Featured Properties
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop"
    ],
    amenities: ["Balcony", "Gym", "Pool", "Security", "Concierge"],
    agent: {
      name: "Emma Wilson",
      phone: "+254 700 567 890",
      email: "emma@hamaestate.com",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop"
    },
    features: ["Panoramic Views", "Private Balcony", "Modern Kitchen"],
    pricePerSqft: 428571,
    days_on_market: 5,
    rating: 4.9,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample agents data
const sampleAgents = [
  {
    name: "Sarah Johnson",
    email: "sarah@hamaestate.com",
    phone: "+254 700 123 456",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop",
    specialization: "Luxury Properties",
    experience: "8 years",
    propertiesSold: 45,
    rating: 4.8,
    bio: "Specialized in luxury properties and high-end real estate transactions.",
    createdAt: serverTimestamp()
  },
  {
    name: "Michael Chen",
    email: "michael@hamaestate.com",
    phone: "+254 700 234 567",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
    specialization: "Family Homes",
    experience: "12 years",
    propertiesSold: 78,
    rating: 4.9,
    bio: "Expert in family homes and residential properties across Nairobi.",
    createdAt: serverTimestamp()
  },
  {
    name: "Lisa Wang",
    email: "lisa@hamaestate.com",
    phone: "+254 700 345 678",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
    specialization: "First-time Buyers",
    experience: "5 years",
    propertiesSold: 32,
    rating: 4.7,
    bio: "Helping first-time buyers find their perfect home.",
    createdAt: serverTimestamp()
  }
];

// Function to seed Firestore
export const seedFirestore = async () => {
  try {
    console.log('🌱 Starting Firestore seeding...');

    // Seed properties
    console.log('📦 Adding properties...');
    for (const property of sampleProperties) {
      await addDoc(collection(db, 'properties'), property);
      console.log(`✅ Added property: ${property.title}`);
    }

    // Seed agents
    console.log('👥 Adding agents...');
    for (const agent of sampleAgents) {
      await addDoc(collection(db, 'agents'), agent);
      console.log(`✅ Added agent: ${agent.name}`);
    }

    console.log('🎉 Firestore seeding completed successfully!');
    console.log(`📊 Added ${sampleProperties.length} properties and ${sampleAgents.length} agents`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    throw error;
  }
};

// Export for use in other files
export default seedFirestore;
