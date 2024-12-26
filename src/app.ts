import express,  { Application } from 'express';
import authRoutes from './routes/authRoutes';
import { apiLimiter } from './middlewares/rateLimiter';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);

app.use('/api/auth', authRoutes);

app.use(errorHandler);

export default app;
