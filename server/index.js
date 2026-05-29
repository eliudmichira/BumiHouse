import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { userRoute } from "./routes/userRoute.js";
import { propertyRoute } from "./routes/propertyRoute.js";
import { agentRoute } from "./routes/agentRoute.js";
import { residencyRoute } from "./routes/residencyRoute.js";
import vacancyRoute from "./routes/vacancyRoute.js";
import scrapingRoute from "./routes/scraping.js";

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'CLIENT_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Production safety: warn if JWT secret is still placeholder
const isProduction = process.env.NODE_ENV === 'production';
const jwtSecret = process.env.JWT_SECRET_KEY || '';
if (isProduction && (!jwtSecret || jwtSecret.includes('change-in-production') || jwtSecret.length < 32)) {
  console.error('❌ Production requires a strong JWT_SECRET_KEY (32+ chars). Update server .env and restart.');
  process.exit(1);
}

const app = express();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isDevelopment = NODE_ENV === 'development';

// CORS configuration with stricter validation
const allowedOrigins = isDevelopment
  ? [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://localhost', // Android Capacitor
    'capacitor://localhost', // iOS Capacitor
    process.env.CLIENT_URL
  ]
  : [
    process.env.CLIENT_URL,
    'https://localhost', // Allow Android in production if needed/safe
    'capacitor://localhost' // Allow iOS in production if needed/safe
  ];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`⚠️  CORS blocked request from origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

// Middleware - reduced body size limits for security
app.use(express.json({ limit: '10mb' })); // Reduced from 50mb
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Reduced from 50mb
app.use(cookieParser());
app.use(cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// API Routes
app.use("/api/user", userRoute);
app.use("/api/properties", propertyRoute);
app.use("/api/agents", agentRoute);
app.use("/api/residency", residencyRoute); // Keep for backward compatibility
app.use("/api/vacancy", vacancyRoute);
app.use("/api/scraping", scrapingRoute);

// Error handling middleware
app.use((err, req, res, next) => {
  // Log error details server-side
  if (isDevelopment) {
    console.error('❌ Error occurred:');
    console.error(err.stack);
  } else {
    // In production, log less verbose errors
    console.error(`❌ Error: ${err.message}`);
  }

  // Never send stack traces to client in production
  res.status(err.status || 500).json({
    error: 'Something went wrong!',
    message: isDevelopment ? err.message : 'Internal server error',
    ...(isDevelopment && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Graceful shutdown handler
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n⚠️  SIGINT signal received: closing HTTP server');
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
  console.log(`🔐 CORS enabled for: ${allowedOrigins.filter(Boolean).join(', ')}`);
});
