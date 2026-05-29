import asyncHandler from "express-async-handler";
import { prisma } from '../config/prismaConfig.js';

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        savedSearches: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's favorite properties
    const favoriteProperties = await prisma.property.findMany({
      where: {
        id: { in: user.favorites }
      },
      include: {
        agent: true,
        neighborhood: true
      }
    });

    // Get user's property listings (if they're a property owner)
    const userProperties = await prisma.property.findMany({
      where: {
        // Assuming there's a userId field in Property model
        // This would need to be added to the schema
      },
      include: {
        agent: true
      }
    });

    const userProfile = {
      ...user,
      favoriteProperties,
      userProperties,
      stats: {
        favorites: user.favorites.length,
        savedSearches: user.savedSearches.length,
        properties: userProperties.length
      }
    };

    res.json({ user: userProfile });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add property to favorites
export const addToFavorites = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { propertyId } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Add to favorites if not already there
    const updatedFavorites = user.favorites.includes(propertyId)
      ? user.favorites
      : [...user.favorites, propertyId];

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { favorites: updatedFavorites }
    });

    res.json({
      message: 'Property added to favorites',
      favorites: updatedUser.favorites
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove property from favorites
export const removeFromFavorites = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { propertyId } = req.body;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedFavorites = user.favorites.filter(id => id !== propertyId);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { favorites: updatedFavorites }
    });

    res.json({
      message: 'Property removed from favorites',
      favorites: updatedUser.favorites
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user favorites
export const getUserFavorites = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 12 } = req.query;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const favoriteIds = user.favorites.slice(skip, skip + parseInt(limit));

    const favoriteProperties = await prisma.property.findMany({
      where: {
        id: { in: favoriteIds }
      },
      include: {
        agent: true,
        neighborhood: true
      }
    });

    res.json({
      properties: favoriteProperties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(user.favorites.length / parseInt(limit)),
        total: user.favorites.length,
        hasNext: parseInt(page) < Math.ceil(user.favorites.length / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save search
export const saveSearch = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const searchData = req.body;
  
  try {
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        query: searchData
      }
    });

    res.json({
      message: 'Search saved successfully',
      savedSearch
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get saved searches
export const getSavedSearches = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ savedSearches });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete saved search
export const deleteSavedSearch = asyncHandler(async (req, res) => {
  const { searchId } = req.params;
  
  try {
    await prisma.savedSearch.delete({
      where: { id: searchId }
    });

    res.json({ message: 'Search deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user preferences
export const updateUserPreferences = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const preferences = req.body;
  
  try {
    const updatedPreferences = await prisma.preferences.upsert({
      where: { userId },
      update: preferences,
      create: {
        userId,
        ...preferences
      }
    });

    res.json({
      message: 'Preferences updated successfully',
      preferences: updatedPreferences
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user preferences
export const getUserPreferences = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    const preferences = await prisma.preferences.findUnique({
      where: { userId }
    });

    res.json({ preferences });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity
export const getUserActivity = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        savedSearches: {
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get recent favorite properties
    const recentFavorites = await prisma.property.findMany({
      where: {
        id: { in: user.favorites.slice(-5) } // Last 5 favorites
      },
      include: {
        agent: true
      }
    });

    const activity = {
      recentSearches: user.savedSearches,
      recentFavorites,
      totalFavorites: user.favorites.length,
      totalSearches: user.savedSearches.length,
      memberSince: user.createdAt
    };

    res.json({ activity });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user dashboard stats
export const getUserDashboardStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true,
        savedSearches: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get favorite properties with details
    const favoriteProperties = await prisma.property.findMany({
      where: {
        id: { in: user.favorites }
      },
      select: {
        price: true,
        property_type: true,
        city: true,
        createdAt: true
      }
    });

    // Calculate stats
    const totalValue = favoriteProperties.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = favoriteProperties.length > 0 
      ? Math.round(totalValue / favoriteProperties.length) 
      : 0;

    const propertyTypes = favoriteProperties.reduce((acc, p) => {
      acc[p.property_type] = (acc[p.property_type] || 0) + 1;
      return acc;
    }, {});

    const topCities = Object.entries(
      favoriteProperties.reduce((acc, p) => {
        acc[p.city] = (acc[p.city] || 0) + 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1]).slice(0, 5);

    const stats = {
      totalFavorites: user.favorites.length,
      totalSearches: user.savedSearches.length,
      totalValue,
      averagePrice,
      propertyTypes,
      topCities,
      preferences: user.preferences
    };

    res.json({ stats });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new user
export const createUser = asyncHandler(async (req, res) => {
  try {
    const userData = req.body;
    
    // Validate required fields
    if (!userData.email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const user = await prisma.user.create({
      data: {
        ...userData,
        favorites: [],
        role: userData.role || 'user'
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  try {
    // Delete user preferences and saved searches first
    await prisma.preferences.deleteMany({
      where: { userId }
    });

    await prisma.savedSearch.deleteMany({
      where: { userId }
    });

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
