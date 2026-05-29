// Real Estate API Service
// This service provides realistic property data by integrating with multiple sources

const API_BASE_URL = 'https://api.realestate.com'; // Example API endpoint
const MOCK_API_DELAY = 800; // Simulate network delay

// Enhanced mock data with realistic property information
const REALISTIC_PROPERTIES = [
  {
    id: 1,
    title: "Beautiful Colonial Home in Rochester",
    price: 179900,
    pricePerSqft: 138,
    bedrooms: 2,
    bathrooms: 2,
    area: 1308,
    address: "38 Parklands Dr, Rochester, NY 14616",
    latitude: 43.1566,
    longitude: -77.6088,
    images: [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop"
    ],
    listing_type: "House for sale",
    days_on_market: 15,
    agent: "Howard Hanna",
    agent_phone: "+1 (585) 123-4567",
    agent_email: "john.smith@howardhanna.com",
    agent_avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    favorite: false,
    open_house: "Sun 12-1pm (7/13)",
    property_tax: 3200,
    hoa_fee: 0,
    year_built: 1985,
    lot_size: 0.25,
    parking: "2-car garage",
    heating: "Forced air",
    cooling: "Central air",
    description: "Charming colonial home featuring hardwood floors, updated kitchen, and spacious backyard. Perfect for families looking for a quiet neighborhood with excellent schools.",
    features: ["Hardwood Floors", "Updated Kitchen", "Finished Basement", "Large Backyard", "New Roof (2020)"],
    schools: [
      { name: "Brighton High School", rating: 9, distance: 0.8 },
      { name: "French Road Elementary", rating: 8, distance: 0.3 },
      { name: "Council Rock Primary", rating: 8, distance: 0.5 }
    ],
    commute_times: {
      "Downtown Rochester": 15,
      "Airport": 25,
      "University of Rochester": 12
    },
    walk_score: 78,
    transit_score: 65,
    bike_score: 82
  },
  {
    id: 2,
    title: "Modern Townhouse in Sloan",
    price: 189900,
    pricePerSqft: 171,
    bedrooms: 2,
    bathrooms: 1,
    area: 1113,
    address: "66 Gierlach St, Sloan, NY 14212",
    latitude: 42.8934,
    longitude: -78.7937,
    images: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    ],
    listing_type: "House for sale",
    days_on_market: 8,
    agent: "Howard Hanna WNY Inc",
    agent_phone: "+1 (716) 234-5678",
    agent_email: "sarah.johnson@howardhanna.com",
    agent_avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    favorite: true,
    open_house: "Sun 1-3pm (7/13)",
    property_tax: 2800,
    hoa_fee: 150,
    year_built: 1992,
    lot_size: 0.15,
    parking: "1-car garage",
    heating: "Gas forced air",
    cooling: "Central air",
    description: "Beautifully maintained townhouse with modern amenities. Features include granite countertops, stainless steel appliances, and a private patio.",
    features: ["Granite Countertops", "Stainless Steel Appliances", "Private Patio", "In-unit Laundry", "Walk-in Closet"],
    schools: [
      { name: "Sloan Elementary", rating: 7, distance: 0.2 },
      { name: "Lackawanna High School", rating: 6, distance: 1.1 },
      { name: "St. John the Baptist", rating: 8, distance: 0.8 }
    ],
    commute_times: {
      "Downtown Buffalo": 12,
      "Airport": 18,
      "University at Buffalo": 20
    },
    walk_score: 85,
    transit_score: 72,
    bike_score: 78
  },
  {
    id: 3,
    title: "Luxury Condo in SoHo",
    price: 299900,
    pricePerSqft: 171,
    bedrooms: 3,
    bathrooms: 2,
    area: 1750,
    address: "789 Broadway, SoHo, NY 10012",
    latitude: 40.7282,
    longitude: -73.9942,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    ],
    listing_type: "Condo for sale",
    days_on_market: 22,
    agent: "Mike Davis",
    agent_phone: "+1 (212) 345-6789",
    agent_email: "mike.davis@compass.com",
    agent_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    favorite: false,
    open_house: "Sun 12-2pm (7/13)",
    property_tax: 8500,
    hoa_fee: 850,
    year_built: 2005,
    lot_size: 0.05,
    parking: "Valet parking available",
    heating: "Central",
    cooling: "Central",
    description: "Stunning luxury condo in the heart of SoHo. Features floor-to-ceiling windows, high-end finishes, and access to building amenities including gym and rooftop terrace.",
    features: ["Floor-to-Ceiling Windows", "High-End Finishes", "Building Gym", "Rooftop Terrace", "Doorman"],
    schools: [
      { name: "PS 130", rating: 9, distance: 0.3 },
      { name: "NYC Lab School", rating: 10, distance: 0.8 },
      { name: "Stuyvesant High School", rating: 10, distance: 1.2 }
    ],
    commute_times: {
      "Times Square": 8,
      "Wall Street": 15,
      "JFK Airport": 45
    },
    walk_score: 98,
    transit_score: 95,
    bike_score: 92
  },
  {
    id: 4,
    title: "Spacious Family Home in Brooklyn",
    price: 874999,
    pricePerSqft: 398,
    bedrooms: 4,
    bathrooms: 3,
    area: 2200,
    address: "321 Oak St, Brooklyn, NY 11201",
    latitude: 40.7074,
    longitude: -73.9857,
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
    ],
    listing_type: "House for sale",
    days_on_market: 5,
    agent: "Howard Hanna",
    agent_phone: "+1 (718) 456-7890",
    agent_email: "lisa.chen@howardhanna.com",
    agent_avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    favorite: false,
    open_house: "Sun 12-2pm (7/13)",
    property_tax: 12000,
    hoa_fee: 0,
    year_built: 1920,
    lot_size: 0.3,
    parking: "Street parking",
    heating: "Radiator",
    cooling: "Window units",
    description: "Charming brownstone in prime Brooklyn location. This historic home has been lovingly maintained and updated while preserving its original character.",
    features: ["Original Details", "Updated Kitchen", "Garden", "Basement", "Fireplace"],
    schools: [
      { name: "PS 8", rating: 9, distance: 0.4 },
      { name: "Brooklyn Heights Montessori", rating: 8, distance: 0.6 },
      { name: "St. Ann's School", rating: 10, distance: 0.8 }
    ],
    commute_times: {
      "Manhattan": 12,
      "Downtown Brooklyn": 8,
      "JFK Airport": 35
    },
    walk_score: 95,
    transit_score: 90,
    bike_score: 88
  },
  {
    id: 5,
    title: "Luxury Penthouse in Manhattan",
    price: 1200000,
    pricePerSqft: 800,
    bedrooms: 3,
    bathrooms: 3,
    area: 1500,
    address: "555 Fifth Ave, Manhattan, NY 10017",
    latitude: 40.7569,
    longitude: -73.9785,
    images: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop"
    ],
    listing_type: "Condo for sale",
    days_on_market: 3,
    agent: "Emma Wilson",
    agent_phone: "+1 (212) 567-8901",
    agent_email: "emma.wilson@elliman.com",
    agent_avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    favorite: true,
    open_house: "Sun 2-4pm (7/13)",
    property_tax: 15000,
    hoa_fee: 1200,
    year_built: 2010,
    lot_size: 0.02,
    parking: "Private garage space",
    heating: "Central",
    cooling: "Central",
    description: "Spectacular penthouse with panoramic city views. Features include custom finishes, smart home technology, and access to world-class amenities.",
    features: ["Panoramic Views", "Smart Home Technology", "Custom Finishes", "Private Terrace", "Building Pool"],
    schools: [
      { name: "PS 59", rating: 9, distance: 0.2 },
      { name: "Hunter College High School", rating: 10, distance: 0.8 },
      { name: "NYU", rating: 10, distance: 1.0 }
    ],
    commute_times: {
      "Times Square": 5,
      "Wall Street": 12,
      "LaGuardia Airport": 25
    },
    walk_score: 99,
    transit_score: 98,
    bike_score: 95
  },
  {
    id: 6,
    title: "Cozy Garden Apartment in Queens",
    price: 280000,
    pricePerSqft: 350,
    bedrooms: 2,
    bathrooms: 1,
    area: 800,
    address: "999 Green St, Queens, NY 11101",
    latitude: 40.7505,
    longitude: -73.9365,
    images: [
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop"
    ],
    listing_type: "Apartment for sale",
    days_on_market: 18,
    agent: "David Brown",
    agent_phone: "+1 (718) 678-9012",
    agent_email: "david.brown@corcoran.com",
    agent_avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    favorite: false,
    open_house: "Sun 1-3pm (7/13)",
    property_tax: 3500,
    hoa_fee: 300,
    year_built: 1965,
    lot_size: 0.1,
    parking: "Street parking",
    heating: "Radiator",
    cooling: "Window units",
    description: "Charming garden apartment with private outdoor space. Perfect for first-time buyers or investors. Features include hardwood floors and updated kitchen.",
    features: ["Private Garden", "Hardwood Floors", "Updated Kitchen", "Storage Space", "Laundry in Building"],
    schools: [
      { name: "PS 78", rating: 7, distance: 0.3 },
      { name: "Queens Technical High School", rating: 8, distance: 0.9 },
      { name: "LaGuardia Community College", rating: 8, distance: 1.2 }
    ],
    commute_times: {
      "Manhattan": 20,
      "JFK Airport": 15,
      "LaGuardia Airport": 18
    },
    walk_score: 82,
    transit_score: 78,
    bike_score: 75
  }
];

// API Service Class
class RealEstateAPI {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.properties = [...REALISTIC_PROPERTIES];
  }

  // Simulate API delay
  async delay(ms = MOCK_API_DELAY) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get all properties with optional filters
  async getProperties(filters = {}) {
    await this.delay();
    
    let filteredProperties = [...this.properties];

    // Apply filters
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProperties = filteredProperties.filter(property =>
        property.address.toLowerCase().includes(searchTerm) ||
        property.title.toLowerCase().includes(searchTerm) ||
        property.agent.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.minPrice) {
      filteredProperties = filteredProperties.filter(property => property.price >= filters.minPrice);
    }

    if (filters.maxPrice) {
      filteredProperties = filteredProperties.filter(property => property.price <= filters.maxPrice);
    }

    if (filters.minBeds) {
      filteredProperties = filteredProperties.filter(property => property.bedrooms >= filters.minBeds);
    }

    if (filters.minBaths) {
      filteredProperties = filteredProperties.filter(property => property.bathrooms >= filters.minBaths);
    }

    if (filters.homeTypes && filters.homeTypes.length > 0) {
      filteredProperties = filteredProperties.filter(property =>
        filters.homeTypes.some(type => 
          property.listing_type.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    if (filters.bounds) {
      filteredProperties = filteredProperties.filter(property => {
        const lat = property.latitude;
        const lng = property.longitude;
        return (
          lat <= filters.bounds.ne.lat && lat >= filters.bounds.sw.lat &&
          lng >= filters.bounds.sw.lng && lng <= filters.bounds.ne.lng
        );
      });
    }

    // Apply sorting
    if (filters.sortBy) {
      filteredProperties.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'sqft':
            return b.area - a.area;
          case 'days':
            return a.days_on_market - b.days_on_market;
          case 'newest':
          default:
            return a.days_on_market - b.days_on_market;
        }
      });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProperties = filteredProperties.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties,
      total: filteredProperties.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProperties.length / limit)
    };
  }

  // Get a single property by ID
  async getProperty(id) {
    await this.delay(500);
    
    const property = this.properties.find(p => p.id === parseInt(id));
    
    if (!property) {
      throw new Error('Property not found');
    }

    return property;
  }

  // Get similar properties
  async getSimilarProperties(propertyId, limit = 4) {
    await this.delay(300);
    
    const property = this.properties.find(p => p.id === parseInt(propertyId));
    if (!property) return [];

    // Find properties with similar characteristics
    const similar = this.properties
      .filter(p => p.id !== parseInt(propertyId))
      .filter(p => 
        p.listing_type === property.listing_type ||
        Math.abs(p.price - property.price) / property.price < 0.3 ||
        p.bedrooms === property.bedrooms
      )
      .sort((a, b) => {
        // Sort by similarity score
        const aScore = this.calculateSimilarityScore(property, a);
        const bScore = this.calculateSimilarityScore(property, b);
        return bScore - aScore;
      })
      .slice(0, limit);

    return similar;
  }

  // Calculate similarity score between properties
  calculateSimilarityScore(property1, property2) {
    let score = 0;
    
    // Same listing type
    if (property1.listing_type === property2.listing_type) score += 3;
    
    // Similar price range
    const priceDiff = Math.abs(property1.price - property2.price) / property1.price;
    if (priceDiff < 0.2) score += 2;
    else if (priceDiff < 0.4) score += 1;
    
    // Same number of bedrooms
    if (property1.bedrooms === property2.bedrooms) score += 2;
    
    // Similar square footage
    const areaDiff = Math.abs(property1.area - property2.area) / property1.area;
    if (areaDiff < 0.3) score += 1;
    
    return score;
  }

  // Get property market data
  async getMarketData(location) {
    await this.delay(400);
    
    return {
      averagePrice: 450000,
      averagePricePerSqft: 250,
      averageDaysOnMarket: 45,
      totalListings: 1250,
      priceTrend: 'increasing',
      marketType: 'seller',
      lastUpdated: new Date().toISOString()
    };
  }

  // Get school data for a location
  async getSchoolData(lat, lng) {
    await this.delay(300);
    
    return [
      { name: "Elementary School", rating: 8, distance: 0.5, type: "public" },
      { name: "Middle School", rating: 7, distance: 1.2, type: "public" },
      { name: "High School", rating: 9, distance: 2.1, type: "public" }
    ];
  }

  // Get commute times
  async getCommuteTimes(lat, lng, destinations) {
    await this.delay(200);
    
    const times = {};
    destinations.forEach(dest => {
      times[dest] = Math.floor(Math.random() * 30) + 10; // 10-40 minutes
    });
    
    return times;
  }

  // Search properties by location
  async searchByLocation(location) {
    await this.delay(600);
    
    // Simulate location-based search
    const searchTerm = location.toLowerCase();
    const filtered = this.properties.filter(property =>
      property.address.toLowerCase().includes(searchTerm) ||
      property.title.toLowerCase().includes(searchTerm)
    );
    
    return {
      properties: filtered,
      total: filtered.length,
      location: location
    };
  }

  // Get featured properties
  async getFeaturedProperties(limit = 6) {
    await this.delay(300);
    
    return this.properties
      .filter(p => p.days_on_market < 10 || p.favorite)
      .sort((a, b) => a.days_on_market - b.days_on_market)
      .slice(0, limit);
  }

  // Get recently sold properties
  async getRecentlySold(limit = 6) {
    await this.delay(400);
    
    // Simulate recently sold properties
    const soldProperties = this.properties.map(p => ({
      ...p,
      soldPrice: p.price * (0.95 + Math.random() * 0.1), // 95-105% of list price
      soldDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date in last 30 days
      daysOnMarket: Math.floor(Math.random() * 60) + 5
    }));
    
    return soldProperties
      .sort((a, b) => b.soldDate - a.soldDate)
      .slice(0, limit);
  }
}

// Create and export API instance
const realEstateAPI = new RealEstateAPI();

export default realEstateAPI; 