import { Request, Response, NextFunction } from 'express';
import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const httpRequestDurationMicroseconds = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'code'],
    buckets: [50, 100, 200, 300, 400, 500, 1000]
});

const httpRequestCount = new client.Counter({
    name: 'http_request_count',
    help: 'Count of HTTP requests',
    labelNames: ['method', 'route', 'code']
});

const httpErrorCount = new client.Counter({
    name: 'http_error_count',
    help: 'Count of HTTP errors',
    labelNames: ['method', 'route', 'code']
});

const activeRequests = new client.Gauge({
    name: 'active_requests',
    help: 'Number of active HTTP requests',
    labelNames: ['method', 'route']
});

const requestSizeHistogram = new client.Histogram({
    name: 'http_request_size_bytes',
    help: 'Size of HTTP requests in bytes',
    labelNames: ['method', 'route'],
    buckets: [500, 1000, 5000, 10000, 50000, 100000]
});

const responseSizeHistogram = new client.Histogram({
    name: 'http_response_size_bytes',
    help: 'Size of HTTP responses in bytes',
    labelNames: ['method', 'route'],
    buckets: [500, 1000, 5000, 10000, 50000, 100000]
});

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const end = httpRequestDurationMicroseconds.startTimer();
    activeRequests.inc({ method: req.method, route: req.path });
    const requestSize = parseInt(req.headers['content-length'] || '0', 10);
    requestSizeHistogram.observe({ method: req.method, route: req.path }, requestSize);

    res.on('finish', () => {
        const labels = { method: req.method, route: req.path, code: res.statusCode };
        end(labels);
        httpRequestCount.inc(labels);
        if (res.statusCode >= 400) {
            httpErrorCount.inc(labels);
        }
        activeRequests.dec({ method: req.method, route: req.path });
        const responseSize = parseInt(res.getHeader('content-length') as string || '0', 10);
        responseSizeHistogram.observe({ method: req.method, route: req.path }, responseSize);
    });
    next();
};

export const metricsEndpoint = async (req: Request, res: Response): Promise<void> => {
    res.set('Content-Type', client.register.contentType);
    const metrics = await client.register.metrics();
    res.end(metrics);
};