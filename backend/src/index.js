import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import paymentRoutes from './routes/payment.js';
import { validateConfig } from './config/blockchain.js';
import { initializeRelayer } from './services/relayerService.js';

// Load environment variables
dotenv.config();

// Validate configuration before starting
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error.message);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ======================
// MIDDLEWARE CONFIGURATION
// ======================

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    // Allow all .onrender.com origins in production
    if (origin && origin.includes('.onrender.com')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting configuration
// Prevents spam and abuse of the relayer service
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // Limit each IP to 10 requests per window
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Please try again later. Rate limit exceeded.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  // Skip rate limiting for health check endpoint
  skip: (req) => req.path === '/api/payment/health'
});

// Apply rate limiting to all payment routes
app.use('/api/payment', limiter);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ======================
// ROUTES
// ======================

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Gasless Payment API',
    version: '1.0.0',
    endpoints: {
      config: 'GET /api/payment/config',
      execute: 'POST /api/payment/execute',
      status: 'GET /api/payment/status/:txHash',
      balance: 'GET /api/payment/balance/:address',
      calculate: 'GET /api/payment/calculate/:amount',
      health: 'GET /api/payment/health'
    }
  });
});

// API routes
app.use('/api/payment', paymentRoutes);

// ======================
// ERROR HANDLING
// ======================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  // CORS error
  if (err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      error: 'CORS Error',
      message: 'Access denied due to CORS policy'
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    success: false,
    error: err.name || 'Internal Server Error',
    message: err.message || 'An unexpected error occurred'
  });
});

// ======================
// INITIALIZE & START SERVER
// ======================

async function startServer() {
  try {
    console.log('=================================');
    console.log('Gasless Payment Backend Server');
    console.log('=================================');

    // Initialize the relayer service
    console.log('\nInitializing relayer service...');
    initializeRelayer();

    // Start listening
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log(`Server Status: RUNNING`);
      console.log(`Port: ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Network: ${process.env.NETWORK_NAME || 'BNB Chain'}`);
      console.log('=================================');
      console.log('\nAPI Endpoints:');
      console.log(`- GET  http://localhost:${PORT}/`);
      console.log(`- GET  http://localhost:${PORT}/api/payment/config`);
      console.log(`- POST http://localhost:${PORT}/api/payment/execute`);
      console.log(`- GET  http://localhost:${PORT}/api/payment/status/:txHash`);
      console.log(`- GET  http://localhost:${PORT}/api/payment/balance/:address`);
      console.log(`- GET  http://localhost:${PORT}/api/payment/calculate/:amount`);
      console.log(`- GET  http://localhost:${PORT}/api/payment/health`);
      console.log('\n=================================\n');
    });

  } catch (error) {
    console.error('\n=================================');
    console.error('Failed to start server:', error.message);
    console.error('=================================\n');
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('\nSIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\nSIGINT received. Shutting down gracefully...');
  process.exit(0);
});

// Catch unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  // In production, you might want to exit the process
  // process.exit(1);
});

// Start the server
startServer();
