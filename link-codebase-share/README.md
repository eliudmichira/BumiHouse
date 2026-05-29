# 🏠 Hama Estate - Real Estate Platform

A modern, full-stack real estate platform built for the Kenyan market. Features advanced property search, agent management, user profiles, and a comprehensive dashboard.

## 🚀 Features

### 🏘️ Property Management
- **Advanced Property Search** with filters (price, location, bedrooms, bathrooms, features)
- **Property Details** with comprehensive information (photos, amenities, neighborhood data)
- **Property Statistics** and market insights
- **Featured Properties** highlighting premium listings
- **Similar Properties** recommendations
- **Property History** and price tracking
- **Virtual Tours** and 360° views

### 👥 User Management
- **User Profiles** with personalized dashboards
- **Favorites System** to save preferred properties
- **Saved Searches** with email alerts
- **User Preferences** and notification settings
- **Activity Tracking** and search history
- **Dashboard Analytics** with personalized insights

### 🏢 Agent Management
- **Agent Profiles** with ratings and reviews
- **Agent Performance** metrics and analytics
- **Agent Search** by location, specialty, and rating
- **Contact Agents** directly through the platform
- **Agent Properties** portfolio management
- **Agent Statistics** and market performance

### 🎨 Modern UI/UX
- **Responsive Design** for all devices
- **Dark/Light Theme** toggle
- **Modern Animations** and transitions
- **Interactive Maps** with property locations
- **Photo Galleries** with fullscreen view
- **Real-time Search** with autocomplete

### 🔧 Technical Features
- **Real-time Updates** with WebSocket integration
- **Advanced Filtering** and sorting options
- **Pagination** for large datasets
- **Image Optimization** and lazy loading
- **SEO Optimized** pages and meta tags
- **Performance Monitoring** and analytics

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Axios** - HTTP client

### Backend
- **Node.js** - Server runtime
- **Express.js** - Web framework
- **Prisma** - Database ORM
- **MongoDB** - Primary database
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing

### Authentication
- **Firebase Auth** - User authentication
- **JWT Tokens** - Session management
- **Role-based Access** - User permissions

### Maps & Location
- **Google Maps API** - Interactive maps
- **Geolocation** - Property coordinates
- **Location Services** - Address validation

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- Google Maps API key
- Firebase project

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hama-estate
```

### 2. Install Dependencies
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Configuration

#### Server Environment (.env)
```env
# Database
DATABASE_URL="mongodb://localhost:27017/hama-estate"

# Server
PORT=3000
NODE_ENV=development

# Client URL
CLIENT_URL=http://localhost:5173

# JWT Secret
JWT_SECRET=your-jwt-secret-here
```

#### Client Environment (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

### 4. Database Setup
```bash
# Navigate to server directory
cd server

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed the database with sample data
npm run seed
```

### 5. Start Development Servers
```bash
# Start server (from server directory)
npm start

# Start client (from client directory)
npm run dev
```

Or use the provided batch script:
```bash
# Windows
start-dev.bat

# Linux/Mac
./start-dev.sh
```

## 🗄️ Database Schema

### Core Models

#### Property
```prisma
model Property {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  title             String
  price             Int
  description       String
  bedrooms          Int
  bathrooms         Float
  area              Int
  address           String
  city              String?
  state             String?
  zipCode           String?
  latitude          Float
  longitude         Float
  images            String[]
  listing_type      String
  property_type     String?
  days_on_market    Int
  agent             Agent
  listing_agent     ListingAgent?
  features          String[]
  schools           School[]
  neighborhood      Neighborhood?
  price_history     PriceHistory[]
  property_history  PropertyHistory[]
  similar_properties SimilarProperty[]
  // ... additional fields
}
```

#### User
```prisma
model User {
  id             String        @id @map("_id") @db.String
  firebaseId     String?
  email          String        @unique
  username       String?
  name           String?
  phone          String?
  avatar         String?
  role           String?       @default("user")
  favorites      String[]
  savedSearches  SavedSearch[] @relation("UserSavedSearches")
  preferences    Preferences?  @relation("UserPreferences")
  createdAt      DateTime      @default(now())
}
```

## 🔌 API Endpoints

### Properties
- `GET /api/properties/all` - Get all properties with filters
- `GET /api/properties/featured` - Get featured properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties/create` - Create new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property
- `POST /api/properties/search` - Search properties
- `GET /api/properties/stats` - Get property statistics

### Agents
- `GET /api/agents/all` - Get all agents with filters
- `GET /api/agents/:id` - Get agent by ID
- `GET /api/agents/:agentId/properties` - Get agent's properties
- `POST /api/agents/search` - Search agents
- `GET /api/agents/stats` - Get agent statistics
- `POST /api/agents/:agentId/contact` - Contact agent

### Users
- `POST /api/user/register` - Create user
- `GET /api/user/:userId/profile` - Get user profile
- `PUT /api/user/:userId/profile` - Update user profile
- `POST /api/user/:userId/favorites` - Add to favorites
- `GET /api/user/:userId/favorites` - Get user favorites
- `POST /api/user/:userId/searches` - Save search
- `GET /api/user/:userId/searches` - Get saved searches

## 🎯 Key Features Implementation

### Advanced Property Search
- **Multi-criteria filtering** (price, location, bedrooms, bathrooms, features)
- **Real-time search** with autocomplete
- **Saved searches** with email notifications
- **Search history** and analytics

### User Dashboard
- **Personalized recommendations** based on preferences
- **Favorite properties** management
- **Search activity** tracking
- **Market insights** and trends

### Agent Management
- **Agent profiles** with ratings and reviews
- **Performance metrics** and analytics
- **Property portfolio** management
- **Contact management** system

### Real Estate Analytics
- **Market trends** and price analysis
- **Property statistics** by location and type
- **Agent performance** metrics
- **User behavior** analytics

## 🚀 Deployment

### Production Build
```bash
# Build client
cd client
npm run build

# Build server
cd ../server
npm run build
```

### Environment Variables
Set production environment variables:
- Database connection string
- API keys and secrets
- Domain configurations
- SSL certificates

### Deployment Platforms
- **Vercel** - Frontend deployment
- **Railway** - Backend deployment
- **MongoDB Atlas** - Database hosting
- **Firebase** - Authentication and hosting

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Basic property listing and search
- ✅ User authentication and profiles
- ✅ Agent management system
- ✅ Responsive design and themes

### Phase 2 (Next)
- 🔄 Advanced analytics dashboard
- 🔄 Real-time notifications
- 🔄 Mobile app development
- 🔄 Payment integration

### Phase 3 (Future)
- 📋 AI-powered property recommendations
- 📋 Virtual reality property tours
- 📋 Blockchain-based property verification
- 📋 Multi-language support

---

**Built with ❤️ for the Kenyan real estate market**
