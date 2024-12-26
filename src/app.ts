import express,  { Application } from 'express';
import authRoutes from './routes/authRoutes';
import caseRoutes from './routes/caseRoutes';

import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';

import morgan from 'morgan';
import logger from './utils/logger';

const app: Application = express();

app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api', caseRoutes);

app.use(errorHandler);

export default app;
