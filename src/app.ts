import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, World!');
});

app.get('/example', (req: Request, res: Response) => {
    res.json({ message: 'This is an example route!' });
});

export default app;
