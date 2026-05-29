import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Kenyan cities and neighborhoods
const kenyanCities = [
  { name: 'Nairobi', neighborhoods: ['Westlands', 'Karen', 'Lavington', 'Kilimani', 'Parklands', 'Upperhill', 'South B', 'South C', 'Donholm', 'Buruburu'] },
  { name: 'Mombasa', neighborhoods: ['Nyali', 'Bamburi', 'Shanzu', 'Mtwapa', 'Diani', 'Ukunda', 'Likoni', 'Mikindani'] },
  { name: 'Kisumu', neighborhoods: ['Milimani', 'Kisian', 'Mamboleo', 'Kondele', 'Nyalenda', 'Manyatta'] },
  { name: 'Nakuru', neighborhoods: ['Milimani', 'Section 58', 'Ponda Mali', 'Free Area', 'Kiamunyi', 'Menengai'] },
  { name: 'Eldoret', neighborhoods: ['West Indies', 'Huruma', 'Langas', 'Kipkaren', 'Kapsoya', 'Mwanzo'] }
];

// Property types and features
const propertyTypes = ['Apartment', 'House', 'Villa', 'Townhouse', 'Penthouse', 'Studio', 'Duplex'];
const listingTypes = ['For Sale', 'For Rent'];
const features = [
  'WiFi', 'Air Conditioning', 'Heating', 'Kitchen', 'Washer', 'Dryer', 
  'Parking', 'Gym', 'Pool', 'Garden', 'Balcony', 'Elevator', 'Security System',
  'Furnished', 'Pet Friendly', 'Balcony', 'Storage', 'Fireplace', 'Hardwood Floors'
];

// Generate realistic property data
const generateProperty = (city, neighborhood) => {
  const propertyType = faker.helpers.arrayElement(propertyTypes);
  const listingType = faker.helpers.arrayElement(listingTypes);
  const bedrooms = faker.number.int({ min: 1, max: 6 });
  const bathrooms = faker.number.int({ min: 1, max: 4 });
  const area = faker.number.int({ min: 500, max: 5000 });
  
  // Generate realistic pricing based on property type and location
  let basePrice;
  if (city === 'Nairobi') {
    basePrice = faker.number.int({ min: 8000000, max: 50000000 }); // 8M - 50M KES
  } else if (city === 'Mombasa') {
    basePrice = faker.number.int({ min: 6000000, max: 40000000 }); // 6M - 40M KES
  } else {
    basePrice = faker.number.int({ min: 3000000, max: 25000000 }); // 3M - 25M KES
  }
  
  const price = listingType === 'For Rent' 
    ? faker.number.int({ min: 30000, max: 300000 }) // 30K - 300K KES/month
    : basePrice;
  
  const pricePerSqft = Math.round(price / area);

  return {
    title: faker.helpers.arrayElement([
      `Beautiful ${propertyType} in ${neighborhood}`,
      `Modern ${propertyType} with Amazing Views`,
      `Luxury ${propertyType} in Prime Location`,
      `Spacious ${propertyType} with Garden`,
      `Newly Built ${propertyType} in ${neighborhood}`,
      `Premium ${propertyType} with Pool`,
      `Family ${propertyType} in Quiet Neighborhood`,
      `Contemporary ${propertyType} with Balcony`
    ]),
    price,
    pricePerSqft,
    description: faker.lorem.paragraphs(3),
    bedrooms,
    bathrooms,
    area,
    address: `${faker.location.streetAddress()}, ${neighborhood}`,
    city,
    state: 'Kenya',
    zipCode: faker.location.zipCode(),
    latitude: faker.location.latitude({ min: -4.0, max: 1.0 }), // Kenya latitude range
    longitude: faker.location.longitude({ min: 33.0, max: 42.0 }), // Kenya longitude range
    images: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => 
      faker.image.urlLoremFlickr({ category: 'house', width: 800, height: 600 })
    ),
    listing_type: listingType,
    property_type: propertyType,
    days_on_market: faker.number.int({ min: 1, max: 90 }),
    agent: {
      name: faker.person.fullName(),
      phone: faker.helpers.fromRegExp(/\+254 7\d{2} \d{3} \d{3}/),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      rating: faker.number.float({ min: 3.5, max: 5.0, multipleOf: 0.1 }),
      reviews: faker.number.int({ min: 10, max: 200 }),
      experience: `${faker.number.int({ min: 2, max: 15 })} years`
    },
    listing_agent: {
      name: faker.person.fullName(),
      phone: faker.helpers.fromRegExp(/\+254 7\d{2} \d{3} \d{3}/),
      email: faker.internet.email(),
      photo: faker.image.avatar()
    },
    favorite: faker.datatype.boolean(),
    open_house: faker.datatype.boolean() ? faker.date.future().toISOString() : null,
    year_built: faker.number.int({ min: 1990, max: 2024 }),
    lot_size: `${faker.number.int({ min: 1000, max: 10000 })} sqft`,
    garage: faker.number.int({ min: 0, max: 3 }),
    features: faker.helpers.arrayElements(features, { min: 5, max: 12 }),
    schools: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
      name: faker.company.name(),
      distance: `${faker.number.int({ min: 0.5, max: 5 })} km`,
      rating: faker.number.float({ min: 3.0, max: 5.0, multipleOf: 0.1 }),
      type: faker.helpers.arrayElement(['Primary', 'Secondary', 'International']),
      grades: faker.helpers.arrayElement(['K-8', 'K-12', '9-12'])
    })),
    neighborhood: {
      name: neighborhood,
      walkScore: faker.number.int({ min: 20, max: 100 }),
      transitScore: faker.number.int({ min: 20, max: 100 }),
      bikeScore: faker.number.int({ min: 20, max: 100 }),
      crimeRate: faker.helpers.arrayElement(['Low', 'Medium', 'High']),
      population: faker.number.int({ min: 20000, max: 100000 }).toLocaleString(),
      medianAge: faker.number.int({ min: 25, max: 55 }),
      medianIncome: `KES ${faker.number.int({ min: 50000, max: 200000 }).toLocaleString()}`
    },
    schoolsInfo: {
      elementary: faker.company.name(),
      middle: faker.company.name(),
      high: faker.company.name()
    },
    similar_properties: Array.from({ length: faker.number.int({ min: 3, max: 6 }) }, (_, i) => ({
      id: i + 1,
      title: faker.helpers.arrayElement(['Modern Apartment', 'Luxury Villa', 'Family Home', 'Townhouse']),
      price: faker.number.int({ min: 5000000, max: 30000000 }),
      bedrooms: faker.number.int({ min: 1, max: 5 }),
      bathrooms: faker.number.float({ min: 1, max: 4, multipleOf: 0.1 }),
      area: faker.number.int({ min: 500, max: 3000 }),
      address: faker.location.streetAddress(),
      image: faker.image.urlLoremFlickr({ category: 'house', width: 400, height: 300 })
    })),
    property_history: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
      date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
      event: faker.helpers.arrayElement(['Listed', 'Under Contract', 'Sold', 'Price Reduced', 'Open House']),
      price: faker.number.int({ min: 5000000, max: 30000000 })
    })),
    walk_score: faker.number.int({ min: 20, max: 100 }),
    transit_score: faker.number.int({ min: 20, max: 100 }),
    price_history: Array.from({ length: faker.number.int({ min: 3, max: 8 }) }, () => ({
      date: faker.date.past({ years: 1 }).toISOString().split('T')[0],
      price: faker.number.int({ min: 5000000, max: 30000000 }),
      event: faker.helpers.arrayElement(['Listed', 'Price Increased', 'Price Reduced', 'Under Contract'])
    })),
    virtual_tour: faker.datatype.boolean(),
    is_new: faker.datatype.boolean(),
    is_foreclosure: faker.datatype.boolean(0.1), // 10% chance
    is_price_reduced: faker.datatype.boolean(0.3), // 30% chance
    petFriendly: faker.datatype.boolean(),
    hasParking: faker.datatype.boolean()
  };
};

// Generate user data
const generateUser = () => ({
  id: faker.string.uuid(),
  firebaseId: faker.string.uuid(),
  email: faker.internet.email(),
  username: faker.internet.userName(),
  name: faker.person.fullName(),
  phone: faker.helpers.fromRegExp(/\+254 7\d{2} \d{3} \d{3}/),
  avatar: faker.image.avatar(),
  provider: faker.helpers.arrayElement(['email', 'google']),
  role: faker.helpers.arrayElement(['user', 'agent', 'admin']),
  favorites: []
});

// Generate preferences data
const generatePreferences = (userId) => ({
  id: faker.string.hexadecimal({ length: 24 }).replace('0x', ''), // MongoDB ObjectId is 24 hex characters
  userId,
  notifications: faker.datatype.boolean(),
  emailAlerts: faker.datatype.boolean(),
  priceRange: {
    min: faker.number.int({ min: 1000000, max: 10000000 }),
    max: faker.number.int({ min: 20000000, max: 100000000 })
  },
  preferredAreas: faker.helpers.arrayElements(
    ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
    { min: 1, max: 3 }
  ),
  homeTypes: faker.helpers.arrayElements(
    ['Apartment', 'House', 'Villa', 'Townhouse'],
    { min: 1, max: 3 }
  )
});

// Generate saved search data
const generateSavedSearch = (userId) => ({
  id: faker.string.hexadecimal({ length: 24 }).replace('0x', ''), // MongoDB ObjectId is 24 hex characters
  userId,
  query: {
    location: faker.helpers.arrayElement(['Nairobi', 'Mombasa', 'Kisumu']),
    minPrice: faker.number.int({ min: 1000000, max: 10000000 }),
    maxPrice: faker.number.int({ min: 20000000, max: 100000000 }),
    bedrooms: faker.number.int({ min: 1, max: 4 }),
    propertyType: faker.helpers.arrayElement(['Apartment', 'House', 'Villa'])
  }
});

// Main seeding function
async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.savedSearch.deleteMany();
    await prisma.preferences.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    // Generate users
    console.log('👥 Generating users...');
    const users = Array.from({ length: 50 }, generateUser);
    
    const createdUsers = await prisma.user.createMany({
      data: users
    });
    console.log(`✅ Created ${createdUsers.count} users`);

    // Generate properties
    console.log('🏠 Generating properties...');
    const properties = [];
    
    kenyanCities.forEach(city => {
      city.neighborhoods.forEach(neighborhood => {
        const cityProperties = Array.from(
          { length: faker.number.int({ min: 5, max: 15 }) },
          () => generateProperty(city.name, neighborhood)
        );
        properties.push(...cityProperties);
      });
    });

    // Create properties one by one (due to nested objects)
    for (let i = 0; i < properties.length; i++) {
      await prisma.property.create({
        data: properties[i]
      });
      if ((i + 1) % 10 === 0) {
        console.log(`✅ Created ${i + 1}/${properties.length} properties`);
      }
    }

    console.log(`✅ Created ${properties.length} properties`);

    // Generate preferences for some users
    console.log('⚙️ Generating user preferences...');
    const createdUsersList = await prisma.user.findMany();
    const preferences = createdUsersList
      .slice(0, 30) // Only 30 users have preferences
      .map(user => generatePreferences(user.id));

    for (const preference of preferences) {
      await prisma.preferences.create({
        data: preference
      });
    }
    console.log(`✅ Created ${preferences.length} user preferences`);

    // Generate saved searches for some users
    console.log('🔍 Generating saved searches...');
    const savedSearches = createdUsersList
      .slice(0, 20) // Only 20 users have saved searches
      .flatMap(user => 
        Array.from(
          { length: faker.number.int({ min: 1, max: 5 }) },
          () => generateSavedSearch(user.id)
        )
      );

    await prisma.savedSearch.createMany({
      data: savedSearches
    });
    console.log(`✅ Created ${savedSearches.length} saved searches`);

    // Add some favorites to users
    console.log('❤️ Adding favorites to users...');
    const allProperties = await prisma.property.findMany();
    
    for (const user of createdUsersList.slice(0, 25)) { // Only 25 users have favorites
      const favoriteIds = faker.helpers.arrayElements(
        allProperties.map(p => p.id),
        { min: 1, max: 8 }
      );
      
      await prisma.user.update({
        where: { id: user.id },
        data: { favorites: favoriteIds }
      });
    }
    console.log('✅ Added favorites to users');

    console.log('🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${createdUsers.count}`);
    console.log(`   - Properties: ${properties.length}`);
    console.log(`   - Preferences: ${preferences.length}`);
    console.log(`   - Saved Searches: ${savedSearches.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run seeding if this file is executed directly
seedDatabase()
  .then(() => {
    console.log('✅ Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });

export { seedDatabase };
