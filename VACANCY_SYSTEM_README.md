# Apartment Vacancy Tracking System

## Overview

The Apartment Vacancy Tracking System is a comprehensive solution for managing and displaying vacancy information for apartment complexes. It provides agents with real-time tools to update availability, manage unit types, and track occupancy rates, while offering tenants clear visibility into what units are available.

## Features

### 🏢 **Vacancy Management**
- Real-time vacancy tracking
- Unit type configuration
- Availability updates
- Occupancy rate calculations
- Next vacancy scheduling

### 👨‍💼 **Agent Tools**
- Edit vacancy information
- Add/remove unit types
- Update unit availability
- Manage waitlists
- Add vacancy notes

### 👥 **Tenant Experience**
- Clear availability status
- Unit type details
- Pricing information
- Waitlist signup
- Contact options

## Components

### 1. ApartmentVacancyDisplay
The main component that displays vacancy information for apartment complexes.

**Props:**
- `property`: Property object with vacancy data
- `onVacancyUpdate`: Callback function for updates
- `isEditable`: Boolean to enable editing mode

**Features:**
- Vacancy overview with metrics
- Unit type breakdown
- Progress bars and status indicators
- Edit mode for agents
- Responsive design

### 2. VacancyTracker (Existing)
Enhanced version of the existing component for individual properties.

### 3. VacancyAnalytics
Dashboard component for viewing vacancy statistics across multiple properties.

## Database Schema

### Property Model Updates
```prisma
model Property {
  // ... existing fields ...
  
  // Vacancy tracking for apartment complexes
  totalUnits         Int?
  availableUnits     Int?
  unitTypes          UnitType[]
  nextVacancyDate    DateTime?
  waitlistCount      Int?
  averageRent        Int?
  lastVacancyUpdate  DateTime?
  vacancyNotes       String?
}
```

### UnitType Model
```prisma
model UnitType {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  type        String   // e.g., "Studio", "1BR", "2BR"
  bedrooms    Int      @default(1)
  bathrooms   Float    @default(1)
  area        Int      // square footage
  price       Int      // monthly rent
  available   Int      @default(0) // number of available units
  total       Int      @default(0) // total number of units
  propertyId  String   @db.ObjectId
  property    Property @relation(fields: [propertyId], references: [id])
  
  @@map("unit_types")
}
```

## API Endpoints

### Vacancy Management
- `GET /api/vacancy/:id` - Get vacancy data for a property
- `PUT /api/vacancy/:id` - Update vacancy data (requires auth)

### Unit Type Management
- `POST /api/vacancy/:id/unit-types` - Add new unit type
- `PUT /api/vacancy/:id/unit-types/:unitTypeId` - Update unit type
- `DELETE /api/vacancy/:id/unit-types/:unitTypeId` - Delete unit type

### Unit Availability
- `PATCH /api/vacancy/:id/unit-types/:unitTypeId/availability` - Update unit availability

### Analytics & Waitlist
- `GET /api/vacancy/analytics` - Get vacancy analytics
- `POST /api/vacancy/:id/waitlist` - Add to waitlist
- `GET /api/vacancy/:id/waitlist` - Get waitlist info

## Usage Examples

### Basic Implementation
```jsx
import ApartmentVacancyDisplay from './components/ApartmentVacancyDisplay';

function PropertyDetails({ property }) {
  const handleVacancyUpdate = async (propertyId, vacancyData) => {
    try {
      await vacancyService.updateVacancyData(propertyId, vacancyData);
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {property.listing_type === 'apartment' && (
        <ApartmentVacancyDisplay 
          property={property}
          onVacancyUpdate={handleVacancyUpdate}
          isEditable={true}
        />
      )}
    </div>
  );
}
```

### Service Usage
```javascript
import { vacancyService } from './services/vacancyService';

// Update vacancy data
const updateVacancy = async () => {
  const vacancyData = {
    totalUnits: 24,
    availableUnits: 8,
    unitTypes: [
      {
        type: 'Studio',
        bedrooms: 0,
        bathrooms: 1,
        area: 450,
        price: 1200,
        available: 3,
        total: 8
      }
    ]
  };
  
  await vacancyService.updateVacancyData(propertyId, vacancyData);
};
```

## Installation & Setup

### 1. Database Migration
```bash
# Update your Prisma schema
npx prisma db push

# Or if using migrations
npx prisma migrate dev --name add-vacancy-tracking
```

### 2. Backend Setup
```bash
# Install dependencies
npm install

# Add vacancy routes to your server
import vacancyRoute from './routes/vacancyRoute.js';
app.use('/api/vacancy', vacancyRoute);
```

### 3. Frontend Integration
```bash
# Copy components to your project
cp -r components/ src/components/
cp -r services/ src/services/

# Import and use components
import ApartmentVacancyDisplay from './components/ApartmentVacancyDisplay';
```

## Configuration

### Environment Variables
```env
# Database
DATABASE_URL="your-database-url"

# Authentication (if using custom auth)
JWT_SECRET="your-jwt-secret"
```

### Property Configuration
To enable vacancy tracking for a property:

1. Set `listing_type` to "apartment"
2. Add vacancy data:
   ```javascript
   {
     totalUnits: 24,
     availableUnits: 8,
     unitTypes: [...],
     nextVacancyDate: new Date(),
     waitlistCount: 0,
     averageRent: 1600
   }
   ```

## Styling & Theming

The components use Tailwind CSS and support both light and dark themes. The design follows the existing Makao Homes design system with:

- Primary colors: `#51faaa`, `#dbd5a4`
- Dark theme: `#0a0c19`, `#10121e`
- Responsive grid layouts
- Consistent spacing and typography

## Security

### Authentication
- Vacancy updates require agent/admin role
- Public read access for vacancy information
- Protected routes for management operations

### Data Validation
- Input sanitization for all fields
- Type checking for numeric values
- Required field validation

## Performance Considerations

### Database Optimization
- Indexed fields for quick queries
- Efficient aggregation queries
- Pagination for large datasets

### Frontend Optimization
- Lazy loading of components
- Debounced updates
- Optimistic UI updates

## Troubleshooting

### Common Issues

1. **Component not displaying**
   - Check if `listing_type` is set to "apartment"
   - Verify `totalUnits` is greater than 0

2. **Edit mode not working**
   - Ensure user has agent/admin role
   - Check authentication status

3. **Database errors**
   - Verify Prisma schema is updated
   - Check database connection
   - Run database migrations

### Debug Mode
Enable debug logging:
```javascript
// In your service
console.log('Vacancy update:', { propertyId, vacancyData });

// In your component
console.log('Property data:', property);
```

## Future Enhancements

### Planned Features
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Integration with property management systems
- [ ] Mobile app support
- [ ] Multi-language support

### API Extensions
- [ ] Bulk vacancy updates
- [ ] Export functionality
- [ ] Webhook support
- [ ] Rate limiting

## Support

For questions or issues:

1. Check the troubleshooting section
2. Review the API documentation
3. Check the demo component
4. Review the code examples

## License

This system is part of the Makao Homes project and follows the same licensing terms.
