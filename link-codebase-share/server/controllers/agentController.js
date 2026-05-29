import asyncHandler from "express-async-handler";
import { prisma } from '../config/prismaConfig.js';

// Get all agents with filtering and pagination
export const getAllAgents = asyncHandler(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      location,
      specialty,
      rating,
      experience,
      sortBy = 'rating',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object for properties (since agents are embedded in properties)
    const where = {};
    
    if (location) {
      where.city = { contains: location, mode: 'insensitive' };
    }
    
    if (specialty) {
      where.property_type = specialty;
    }

    // Get properties with agent info
    const properties = await prisma.property.findMany({
      where,
      select: {
        agent: true,
        city: true,
        property_type: true,
        price: true,
        createdAt: true
      },
      distinct: ['agent.name'] // Get unique agents
    });

    // Process and group agent data
    const agentMap = new Map();
    
    properties.forEach(property => {
      const agentName = property.agent.name;
      
      if (!agentMap.has(agentName)) {
        agentMap.set(agentName, {
          ...property.agent,
          properties: [],
          totalValue: 0,
          averagePrice: 0,
          specialties: new Set(),
          cities: new Set()
        });
      }
      
      const agent = agentMap.get(agentName);
      agent.properties.push(property);
      agent.totalValue += property.price;
      agent.specialties.add(property.property_type);
      agent.cities.add(property.city);
    });

    // Convert to array and calculate metrics
    let agents = Array.from(agentMap.values()).map(agent => ({
      ...agent,
      properties: agent.properties.length,
      totalValue: agent.totalValue,
      averagePrice: Math.round(agent.totalValue / agent.properties.length),
      specialties: Array.from(agent.specialties),
      cities: Array.from(agent.cities),
      experience: agent.experience || '5+ years',
      available: Math.random() > 0.3 // Mock availability
    }));

    // Apply filters
    if (rating) {
      agents = agents.filter(agent => agent.rating >= parseFloat(rating));
    }
    
    if (experience) {
      agents = agents.filter(agent => 
        parseInt(agent.experience) >= parseInt(experience)
      );
    }

    // Apply sorting
    agents.sort((a, b) => {
      if (sortOrder === 'desc') {
        return b[sortBy] - a[sortBy];
      }
      return a[sortBy] - b[sortBy];
    });

    // Apply pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedAgents = agents.slice(skip, skip + parseInt(limit));

    res.json({
      agents: paginatedAgents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(agents.length / parseInt(limit)),
        total: agents.length,
        hasNext: parseInt(page) < Math.ceil(agents.length / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent by ID/name with detailed profile
export const getAgentById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    // Find agent by name (since agents are embedded in properties)
    const properties = await prisma.property.findMany({
      where: {
        'agent.name': { contains: id, mode: 'insensitive' }
      },
      include: {
        neighborhood: true,
        schools: true
      }
    });

    if (properties.length === 0) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const agentData = properties[0].agent;
    
    // Calculate agent metrics
    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = Math.round(totalValue / totalProperties);
    
    const specialties = [...new Set(properties.map(p => p.property_type))];
    const cities = [...new Set(properties.map(p => p.city))];
    
    const recentListings = properties
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    const agentProfile = {
      ...agentData,
      totalProperties,
      totalValue,
      averagePrice,
      specialties,
      cities,
      recentListings,
      achievements: [
        'Top 10% Agent in Nairobi',
        'Certified Luxury Property Specialist',
        '5+ Years of Experience',
        '100+ Properties Sold'
      ],
      reviews: [
        {
          id: 1,
          user: 'John Doe',
          rating: 5,
          comment: 'Excellent service and very professional',
          date: '2024-01-15'
        },
        {
          id: 2,
          user: 'Jane Smith',
          rating: 5,
          comment: 'Found my dream home quickly',
          date: '2024-01-10'
        }
      ]
    };

    res.json({ agent: agentProfile });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent's properties
export const getAgentProperties = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { page = 1, limit = 12 } = req.query;
  
  try {
    const properties = await prisma.property.findMany({
      where: {
        'agent.name': { contains: agentId, mode: 'insensitive' }
      },
      include: {
        neighborhood: true,
        schools: true
      },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.property.count({
      where: {
        'agent.name': { contains: agentId, mode: 'insensitive' }
      }
    });

    res.json({
      properties,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search agents
export const searchAgents = asyncHandler(async (req, res) => {
  try {
    const { query, location, specialty, rating } = req.body;
    
    const where = {};
    
    if (query) {
      where.OR = [
        { 'agent.name': { contains: query, mode: 'insensitive' } },
        { 'agent.email': { contains: query, mode: 'insensitive' } }
      ];
    }
    
    if (location) {
      where.city = { contains: location, mode: 'insensitive' };
    }
    
    if (specialty) {
      where.property_type = specialty;
    }

    const properties = await prisma.property.findMany({
      where,
      select: {
        agent: true,
        city: true,
        property_type: true
      },
      distinct: ['agent.name']
    });

    let agents = properties.map(p => p.agent);
    
    if (rating) {
      agents = agents.filter(agent => agent.rating >= parseFloat(rating));
    }

    res.json({ agents });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent statistics
export const getAgentStats = asyncHandler(async (req, res) => {
  try {
    const totalAgents = await prisma.property.groupBy({
      by: ['agent.name'],
      _count: { agent: true }
    });

    const agentsByCity = await prisma.property.groupBy({
      by: ['city'],
      _count: { agent: true }
    });

    const topAgents = await prisma.property.groupBy({
      by: ['agent.name'],
      _count: { id: true },
      _avg: { price: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    });

    res.json({
      totalAgents: totalAgents.length,
      agentsByCity,
      topAgents
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Contact agent
export const contactAgent = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  const { name, email, phone, message, propertyId } = req.body;
  
  try {
    // In a real application, this would save to a messages/inquiries table
    // For now, we'll just return a success response
    
    const inquiry = {
      id: Date.now(),
      agentId,
      name,
      email,
      phone,
      message,
      propertyId,
      createdAt: new Date(),
      status: 'pending'
    };

    res.json({
      message: 'Inquiry sent successfully',
      inquiry
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get agent performance metrics
export const getAgentPerformance = asyncHandler(async (req, res) => {
  const { agentId } = req.params;
  
  try {
    const properties = await prisma.property.findMany({
      where: {
        'agent.name': { contains: agentId, mode: 'insensitive' }
      },
      select: {
        price: true,
        createdAt: true,
        property_type: true,
        city: true
      }
    });

    const totalProperties = properties.length;
    const totalValue = properties.reduce((sum, p) => sum + p.price, 0);
    const averagePrice = Math.round(totalValue / totalProperties);
    
    const monthlyData = properties.reduce((acc, property) => {
      const month = new Date(property.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = { count: 0, value: 0 };
      }
      acc[month].count++;
      acc[month].value += property.price;
      return acc;
    }, {});

    const performance = {
      totalProperties,
      totalValue,
      averagePrice,
      monthlyData: Object.entries(monthlyData).map(([month, data]) => ({
        month,
        properties: data.count,
        value: data.value
      })),
      topCities: Object.entries(
        properties.reduce((acc, p) => {
          acc[p.city] = (acc[p.city] || 0) + 1;
          return acc;
        }, {})
      ).sort((a, b) => b[1] - a[1]).slice(0, 5),
      propertyTypes: Object.entries(
        properties.reduce((acc, p) => {
          acc[p.property_type] = (acc[p.property_type] || 0) + 1;
          return acc;
        }, {})
      )
    };

    res.json({ performance });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
