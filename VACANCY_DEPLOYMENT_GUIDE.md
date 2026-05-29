# Quick Deployment Guide - Vacancy Tracking System

## 🚀 Quick Start

### 1. Database Setup
```bash
# Navigate to server directory
cd server

# Update Prisma schema (already done)
# The schema.prisma file has been updated with vacancy fields

# Push changes to database
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 2. Backend Setup
```bash
# Install dependencies (if not already installed)
npm install

# The vacancy routes are already added to server/index.js
# The vacancyController.js and vacancyRoute.js files are created

# Start the server
npm start
```

### 3. Frontend Setup
```bash
# Navigate to client directory
cd client

# The components are already created:
# - ApartmentVacancyDisplay.jsx
# - VacancyDemo.jsx
# - vacancyService.js

# The property details page is already updated
# The App.jsx routing is already configured

# Start the frontend
npm run dev
```

## 📁 Files Created/Modified

### New Files
- `client/src/components/ApartmentVacancyDisplay.jsx` - Main vacancy display component
- `client/src/components/VacancyDemo.jsx` - Demo page for testing
- `client/src/services/vacancyService.js` - Frontend service for API calls
- `server/controllers/vacancyController.js` - Backend controller
- `server/routes/vacancyRoute.js` - API routes
- `VACANCY_SYSTEM_README.md` - Comprehensive documentation
- `VACANCY_DEPLOYMENT_GUIDE.md` - This file

### Modified Files
- `server/prisma/schema.prisma` - Added vacancy fields and UnitType model
- `server/index.js` - Added vacancy routes
- `client/src/routes/propertyDetails/propertyDetails.jsx` - Integrated vacancy display

## 🧪 Testing

### 1. Demo Page
Visit `/vacancy-demo` to see the vacancy system in action:
- Interactive vacancy display
- Edit mode functionality
- Unit type management
- Real-time updates

### 2. Property Details
For any property with `listing_type: 'apartment'`, the vacancy display will automatically appear.

### 3. API Testing
Test the endpoints using Postman or curl:
```bash
# Get vacancy data
GET /api/vacancy/{propertyId}

# Update vacancy data (requires auth)
PUT /api/vacancy/{propertyId}

# Get analytics
GET /api/vacancy/analytics
```

## 🔧 Configuration

### Enable for Properties
To enable vacancy tracking for a property, ensure:
1. `listing_type` is set to "apartment"
2. `totalUnits` is greater than 0
3. `unitTypes` array contains unit configurations

### Example Property Data
```json
{
  "listing_type": "apartment",
  "totalUnits": 24,
  "availableUnits": 8,
  "unitTypes": [
    {
      "type": "Studio",
      "bedrooms": 0,
      "bathrooms": 1,
      "area": 450,
      "price": 1200,
      "available": 3,
      "total": 8
    }
  ]
}
```

## 🚨 Common Issues & Solutions

### Issue: Component not displaying
**Solution:** Check if property has `listing_type: 'apartment'` and `totalUnits > 0`

### Issue: Edit mode not working
**Solution:** Ensure user is authenticated with agent/admin role

### Issue: Database errors
**Solution:** Run `npx prisma db push` and restart the server

### Issue: API endpoints not found
**Solution:** Verify vacancy routes are added to `server/index.js`

## 📱 Usage Examples

### For Agents
1. Navigate to property details page
2. Click "Edit" button on vacancy display
3. Modify unit types, availability, or add notes
4. Click "Save" to update

### For Tenants
1. View property details page
2. See real-time availability
3. Check unit types and pricing
4. Join waitlist if no units available

## 🔒 Security Notes

- Vacancy updates require authentication
- Only agents/admins can edit vacancy data
- Public read access for vacancy information
- Input validation on all fields

## 📊 Monitoring

### Check Logs
```bash
# Backend logs
tail -f server/logs/app.log

# Database queries
npx prisma studio
```

### Health Check
```bash
# API health
curl http://localhost:3000/health

# Vacancy endpoint test
curl http://localhost:3000/api/vacancy/analytics
```

## 🎯 Next Steps

1. **Test thoroughly** with sample data
2. **Customize styling** to match your brand
3. **Add notifications** for vacancy updates
4. **Integrate with** existing property management systems
5. **Deploy to production** following your deployment process

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section in `VACANCY_SYSTEM_README.md`
2. Review the console logs for errors
3. Verify database schema is updated
4. Test API endpoints individually

---

**Ready to deploy!** 🚀

The vacancy tracking system is now fully integrated and ready for use. Agents can manage apartment availability in real-time, and tenants get clear visibility into what units are available.
