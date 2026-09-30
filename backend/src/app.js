const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const env = require('./config/env');
const { globalRateLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');

const postRoutes = require('./routes/postRoutes');
const getRoutes = require('./routes/getRoutes');
const updateRoutes = require('./routes/updateRoutes');
const deleteRoutes = require('./routes/deleteRoutes');

const app = express();

// Security & Headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_LOCAL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        env.CORS_ORIGIN === '*' ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.pages.dev') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-action', 'x-ats-password'],
  })
);

app.options('*', cors());

// Rate Limiting
app.use(globalRateLimiter);

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Health Check Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    name: 'TrustFlow AI Backend API',
    version: '1.0.0',
    status: 'ONLINE',
    architecture: 'Four-Main-Operations API Structure (POST /post, GET /get, UPDATE /update, DELETE /delete)',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, status: 'UP', timestamp: new Date() });
});

// FOUR MAIN OPERATIONAL ROUTES (NO /api PREFIX AS MANDATED)
app.use(postRoutes);
app.use(getRoutes);
app.use(updateRoutes);
app.use(deleteRoutes);

// Fallback for 404 Route Not Found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    errorCode: 'NOT_FOUND',
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
