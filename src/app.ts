import express,  { Application } from 'express';
import authRoutes from './routes/authRoutes';
import caseRoutes from './routes/caseRoutes';

import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api', caseRoutes);

app.use(errorHandler);

export default app;
