import asyncHandler from "express-async-handler";
import { prisma } from '../config/prismaConfig.js';

// Get all properties with advanced filtering
export const getAllProperties = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      minPrice,
      maxPrice,
      bedrooms,
      bathrooms,
      propertyType,
      listingType,
      city,
      state,
      features,
      sortBy = 'id',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const where = {};
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseInt(minPrice);
      if (maxPrice) where.price.lte = parseInt(maxPrice);
    }
    
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: parseFloat(bathrooms) };
    if (propertyType) where.property_type = propertyType;
    if (listingType) where.listing_type = listingType;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (state) where.state = { contains: state, mode: 'insensitive' };
    
    if (features) {
      const featureArray = features.split(',');
      where.features = { hasSome: featureArray };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const properties = await prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: parseInt(limit),
      include: {
        agent: true,
        listing_agent: true,
        neighborhood: true,
        schools: true
      }
    });

    // Get total count for pagination
    const total = await prisma.property.count({ where });
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        total,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property by ID with full details
export const getPropertyById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        agent: true,
        listing_agent: true,
        neighborhood: true,
        schools: true,
        property_history: true,
        price_history: true,
        similar_properties: true
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Get similar properties
    const similarProperties = await prisma.property.findMany({
      where: {
        AND: [
          { id: { not: id } },
          { city: property.city },
          { property_type: property.property_type },
          { price: { 
            gte: property.price * 0.8,
            lte: property.price * 1.2
          }}
        ]
      },
      take: 6,
      include: {
        agent: true
      }
    });

    res.json({
      property,
      similarProperties
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new property
export const createProperty = asyncHandler(async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Validate required fields
    const requiredFields = ['title', 'price', 'description', 'address', 'city'];
    for (const field of requiredFields) {
      if (!propertyData[field]) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }

    // Set default values
    const property = await prisma.property.create({
      data: {
        ...propertyData,
        days_on_market: 0,
        favorite: false,
        is_new: true,
        is_price_reduced: false,
        petFriendly: propertyData.petFriendly || false,
        hasParking: propertyData.hasParking || false,
        virtual_tour: propertyData.virtual_tour || false,
        createdAt: new Date()
      }
    });

    res.status(201).json({
      message: 'Property created successfully',
      property
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update property
export const updateProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const property = await prisma.property.update({
      where: { id },
      data: req.body
    });

    res.json({
      message: 'Property updated successfully',
      property
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete property
export const deleteProperty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    await prisma.property.delete({
      where: { id }
    });

    res.json({ message: 'Property deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search properties
export const searchProperties = asyncHandler(async (req, res) => {
  try {
    const { query, location, priceRange, propertyType } = req.body;
    
    const where = {};
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    if (location) {
      where.OR = [
        { city: { contains: location, mode: 'insensitive' } },
        { state: { contains: location, mode: 'insensitive' } },
        { address: { contains: location, mode: 'insensitive' } }
      ];
    }
    
    if (priceRange) {
      where.price = {
        gte: priceRange.min,
        lte: priceRange.max
      };
    }
    
    if (propertyType) {
      where.property_type = propertyType;
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        agent: true,
        neighborhood: true
      },
      take: 20
    });

    res.json({ properties });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get property statistics
export const getPropertyStats = asyncHandler(async (req, res) => {
  try {
    const totalProperties = await prisma.property.count();
    const avgPrice = await prisma.property.aggregate({
      _avg: { price: true }
    });
    
    const propertiesByType = await prisma.property.groupBy({
      by: ['property_type'],
      _count: { property_type: true }
    });
    
    const propertiesByCity = await prisma.property.groupBy({
      by: ['city'],
      _count: { city: true },
      _avg: { price: true }
    });

    res.json({
      totalProperties,
      averagePrice: avgPrice._avg.price,
      propertiesByType,
      propertiesByCity
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get featured properties
export const getFeaturedProperties = asyncHandler(async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { is_new: true },
          { is_price_reduced: true },
          { favorite: true }
        ]
      },
      include: {
        agent: true
      },
      take: 8
    });

    res.json({ properties });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Toggle property favorite status
export const toggleFavorite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  
  try {
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const updatedProperty = await prisma.property.update({
      where: { id },
      data: { favorite: !property.favorite }
    });

    res.json({
      message: 'Favorite status updated',
      property: updatedProperty
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
