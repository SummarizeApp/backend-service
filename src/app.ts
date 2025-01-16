import express,  { Application } from 'express';
import routes from './routes';
import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { metricsMiddleware, metricsEndpoint } from './middlewares/metricsMiddleware';
import cors from 'cors';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';

import morgan from 'morgan';
import logger from './utils/logger';

const app: Application = express();

app.use(cors({
  origin: ['http://localhost:8080', 'http://admin-dashboard:8080', 'https://*.amazonaws.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'Access-Control-Allow-Origin'],
  exposedHeaders: ['Content-Disposition', 'Content-Type'],
  credentials: true,
  maxAge: 86400 // 24 saat
}));

app.use(morgan('combined', {
    stream: {
        write: (message) => {
            if (!message.includes('GET /metrics')) {
                logger.info(message.trim());
            }
        }
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use(metricsMiddleware);
// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', routes);

app.get('/metrics', metricsEndpoint);

app.use(errorHandler);

export default app;
