import express,  { Application } from 'express';
import authRoutes from './routes/authRoutes';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

export default app;
