import asyncHandler from "express-async-handler";
import { prisma } from '../config/prismaConfig.js';

// Get vacancy data for a property
export const getVacancyData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        unitTypes: true
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Calculate vacancy metrics
    const totalUnits = property.totalUnits || 0;
    const availableUnits = property.availableUnits || 0;
    const occupancyRate = totalUnits > 0 ? ((totalUnits - availableUnits) / totalUnits) * 100 : 0;

    const vacancyData = {
      totalUnits,
      availableUnits,
      occupancyRate: Math.round(occupancyRate * 100) / 100,
      vacancyRate: Math.round((availableUnits / totalUnits) * 100 * 100) / 100,
      unitTypes: property.unitTypes || [],
      nextVacancyDate: property.nextVacancyDate,
      waitlistCount: property.waitlistCount || 0,
      averageRent: property.averageRent || 0,
      lastVacancyUpdate: property.lastVacancyUpdate,
      vacancyNotes: property.vacancyNotes
    };

    res.json(vacancyData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update vacancy data for a property
export const updateVacancyData = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    totalUnits,
    availableUnits,
    unitTypes,
    nextVacancyDate,
    waitlistCount,
    averageRent,
    vacancyNotes
  } = req.body;

  try {
    // Update property vacancy data
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        totalUnits,
        availableUnits,
        nextVacancyDate: nextVacancyDate ? new Date(nextVacancyDate) : null,
        waitlistCount,
        averageRent,
        lastVacancyUpdate: new Date(),
        vacancyNotes
      }
    });

    // Update unit types if provided
    if (unitTypes && Array.isArray(unitTypes)) {
      // Delete existing unit types
      await prisma.unitType.deleteMany({
        where: { propertyId: id }
      });

      // Create new unit types
      if (unitTypes.length > 0) {
        await prisma.unitType.createMany({
          data: unitTypes.map(unit => ({
            ...unit,
            propertyId: id
          }))
        });
      }
    }

    // Recalculate totals
    const recalculatedProperty = await prisma.property.findUnique({
      where: { id },
      include: {
        unitTypes: true
      }
    });

    res.json({
      message: 'Vacancy data updated successfully',
      property: recalculatedProperty
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add a new unit type
export const addUnitType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const unitTypeData = req.body;

  try {
    const newUnitType = await prisma.unitType.create({
      data: {
        ...unitTypeData,
        propertyId: id
      }
    });

    // Update property totals
    const property = await prisma.property.findUnique({
      where: { id },
      include: { unitTypes: true }
    });

    const totalUnits = property.unitTypes.reduce((sum, unit) => sum + unit.total, 0);
    const availableUnits = property.unitTypes.reduce((sum, unit) => sum + unit.available, 0);

    await prisma.property.update({
      where: { id },
      data: {
        totalUnits,
        availableUnits,
        lastVacancyUpdate: new Date()
      }
    });

    res.json({
      message: 'Unit type added successfully',
      unitType: newUnitType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a unit type
export const updateUnitType = asyncHandler(async (req, res) => {
  const { id, unitTypeId } = req.params;
  const updateData = req.body;

  try {
    const updatedUnitType = await prisma.unitType.update({
      where: { id: unitTypeId },
      data: updateData
    });

    // Update property totals
    const property = await prisma.property.findUnique({
      where: { id },
      include: { unitTypes: true }
    });

    const totalUnits = property.unitTypes.reduce((sum, unit) => sum + unit.total, 0);
    const availableUnits = property.unitTypes.reduce((sum, unit) => sum + unit.available, 0);

    await prisma.property.update({
      where: { id },
      data: {
        totalUnits,
        availableUnits,
        lastVacancyUpdate: new Date()
      }
    });

    res.json({
      message: 'Unit type updated successfully',
      unitType: updatedUnitType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a unit type
export const deleteUnitType = asyncHandler(async (req, res) => {
  const { id, unitTypeId } = req.params;

  try {
    await prisma.unitType.delete({
      where: { id: unitTypeId }
    });

    // Update property totals
    const property = await prisma.property.findUnique({
      where: { id },
      include: { unitTypes: true }
    });

    const totalUnits = property.unitTypes.reduce((sum, unit) => sum + unit.total, 0);
    const availableUnits = property.unitTypes.reduce((sum, unit) => sum + unit.available, 0);

    await prisma.property.update({
      where: { id },
      data: {
        totalUnits,
        availableUnits,
        lastVacancyUpdate: new Date()
      }
    });

    res.json({ message: 'Unit type deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update unit availability (occupy/vacate)
export const updateUnitAvailability = asyncHandler(async (req, res) => {
  const { id, unitTypeId } = req.params;
  const { action } = req.body;

  try {
    const unitType = await prisma.unitType.findUnique({
      where: { id: unitTypeId }
    });

    if (!unitType) {
      return res.status(404).json({ error: 'Unit type not found' });
    }

    let newAvailable;
    if (action === 'occupy') {
      newAvailable = Math.max(0, unitType.available - 1);
    } else if (action === 'vacate') {
      newAvailable = Math.min(unitType.total, unitType.available + 1);
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "occupy" or "vacate"' });
    }

    const updatedUnitType = await prisma.unitType.update({
      where: { id: unitTypeId },
      data: { available: newAvailable }
    });

    // Update property totals
    const property = await prisma.property.findUnique({
      where: { id },
      include: { unitTypes: true }
    });

    const totalUnits = property.unitTypes.reduce((sum, unit) => sum + unit.total, 0);
    const availableUnits = property.unitTypes.reduce((sum, unit) => sum + unit.available, 0);

    await prisma.property.update({
      where: { id },
      data: {
        totalUnits,
        availableUnits,
        lastVacancyUpdate: new Date()
      }
    });

    res.json({
      message: `Unit ${action === 'occupy' ? 'occupied' : 'vacated'} successfully`,
      unitType: updatedUnitType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get vacancy analytics for multiple properties
export const getVacancyAnalytics = asyncHandler(async (req, res) => {
  const { propertyIds } = req.query;

  try {
    let where = {};
    if (propertyIds) {
      const ids = propertyIds.split(',');
      where.id = { in: ids };
    }

    const properties = await prisma.property.findMany({
      where,
      include: {
        unitTypes: true
      }
    });

    // Calculate analytics
    const totalUnits = properties.reduce((sum, prop) => sum + (prop.totalUnits || 0), 0);
    const availableUnits = properties.reduce((sum, prop) => sum + (prop.availableUnits || 0), 0);
    const occupiedUnits = totalUnits - availableUnits;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;
    const vacancyRate = totalUnits > 0 ? ((availableUnits / totalUnits) * 100).toFixed(1) : 0;

    // Categorize properties by vacancy status
    const fullProperties = properties.filter(p => (p.availableUnits || 0) === 0);
    const limitedProperties = properties.filter(p => {
      const available = p.availableUnits || 0;
      const total = p.totalUnits || 0;
      return available > 0 && available <= Math.ceil(total * 0.2);
    });
    const availableProperties = properties.filter(p => {
      const available = p.availableUnits || 0;
      const total = p.totalUnits || 0;
      return available > Math.ceil(total * 0.2);
    });

    const analytics = {
      totalProperties: properties.length,
      totalUnits,
      availableUnits,
      occupiedUnits,
      occupancyRate: parseFloat(occupancyRate),
      vacancyRate: parseFloat(vacancyRate),
      fullProperties: fullProperties.length,
      limitedProperties: limitedProperties.length,
      availableProperties: availableProperties.length,
      properties: properties.map(prop => ({
        id: prop.id,
        title: prop.title,
        totalUnits: prop.totalUnits || 0,
        availableUnits: prop.availableUnits || 0,
        occupancyRate: prop.totalUnits > 0 ? ((prop.totalUnits - (prop.availableUnits || 0)) / prop.totalUnits * 100).toFixed(1) : 0
      }))
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add to waitlist
export const addToWaitlist = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, preferences } = req.body;

  try {
    // Check if property exists
    const property = await prisma.property.findUnique({
      where: { id }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment waitlist count
    await prisma.property.update({
      where: { id },
      data: {
        waitlistCount: {
          increment: 1
        }
      }
    });

    // Here you would typically save to a waitlist table
    // For now, we'll just return success
    res.json({
      message: 'Added to waitlist successfully',
      waitlistCount: (property.waitlistCount || 0) + 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get waitlist for a property
export const getWaitlist = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        waitlistCount: true
      }
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({
      waitlistCount: property.waitlistCount || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
