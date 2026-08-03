import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import logger from './utils/logger.js';
import { pool } from './config/db.js';

import helmet from 'helmet';
import compression from 'compression';
import { rateLimit } from 'express-rate-limit';

dotenv.config();

const app = express();

// Secure HTTP response headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable Gzip Compression for smaller asset delivery sizes
app.use(compression());

// Strict CORS Setup
app.use(cors());

// Limit input payload sizes (Buffer Overflow protection)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Standard security rate limiting for API endpoints
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // max 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this client, please try again after 15 minutes.'
  }
});
app.use('/api/', limiter);

// Morgan HTTP request logging streamed to Winston
const morganStream = {
  write: (message) => logger.info(message.trim())
};
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', { stream: morganStream }));

// Production Health Check Endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'ElevateX',
    uptime: process.uptime(),
    node_version: process.version
  });
});

app.get('/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    logger.error('Database readiness check failed:', err);
    res.status(503).json({
      status: 'unready',
      database: 'disconnected',
      error: err.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/live', (req, res) => {
  res.status(200).send('OK');
});

// Backward compatibility or legacy path mapping
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    platform: 'ElevateX'
  });
});

import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ElevateX REST API Documentation',
      version: '1.0.0',
      description: 'Production-ready REST API for ElevateX (Learn. Build. Get Hired.). Provides complete endpoints for user authentication, student features, instructor studio, recruiter ATS, and platform-wide administration.',
      contact: {
        name: 'ElevateX Support',
        email: 'support@elevatex.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/app.js', './src/routes/*.js']
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

// Serve OpenAPI/Swagger documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Retrieve general platform health info
 *     responses:
 *       200:
 *         description: Platform is healthy
 */

/**
 * @openapi
 * /ready:
 *   get:
 *     summary: Verify database readiness
 *     responses:
 *       200:
 *         description: Database connection is active and ready
 *       503:
 *         description: Database connection failed
 */

/**
 * @openapi
 * /live:
 *   get:
 *     summary: Probe container liveness
 *     responses:
 *       200:
 *         description: Container is alive
 */

import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import instructorRoutes from './routes/instructorRoutes.js';
import recruiterRoutes from './routes/recruiterRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import learningRoutes from './routes/learningRoutes.js';
import publicJobsRoutes from './routes/publicJobsRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/recruiter', recruiterRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/jobs', publicJobsRoutes);

app.use((err, req, res, next) => {
  logger.error('Unhandled Express App Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

export default app;
