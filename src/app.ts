import express,  { Application } from 'express';
import routes from './routes';
import { generalLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';
import { metricsMiddleware, metricsEndpoint } from './middlewares/metricsMiddleware';

import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig';

import morgan from 'morgan';
import logger from './utils/logger';

const app: Application = express();

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
