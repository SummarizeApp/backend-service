# Backend-Service Docs

A robust backend API service for managing legal documents with AI-powered summarization capabilities.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Email verification with OTP
  - Token refresh mechanism
  - Rate limiting

- **Document Management**
  - PDF document upload and processing
  - S3 storage integration
  - AI-powered document summarization
  - Case management system

- **Monitoring & Logging**
  - Prometheus metrics integration
  - Grafana dashboards
  - Winston logging
  - Morgan HTTP request logging

- **Infrastructure**
  - Docker containerization
  - Docker Compose for local development
  - CI/CD with GitHub Actions
  - Multi-platform Docker builds (amd64/arm64)

## 🛠️ Tech Stack

- Node.js (v22.11.0)
- TypeScript
- Express.js
- MongoDB
- Redis
- Docker
- AWS S3
- Jest (Testing)
- Prometheus & Grafana
- NVIDIA DCGM for GPU monitoring

## 📋 Prerequisites

- Node.js v22.11.0
- Docker and Docker Compose
- MongoDB
- AWS Account (for S3)
- NVIDIA GPU (optional, for AI service)

## 📦 Project Structure

```
backend/
├── .github/
│   └── workflows/
│       └── ci.yaml
├── monitoring/
│   └── prometheus/
│       └── prometheus.yml
├── src/
│   ├── config/
│   │   ├── appConfig.ts
│   │   ├── awsConfig.ts
│   │   ├── dbConfig.ts
│   │   └── swaggerConfig.ts
│   ├── controllers/
│   │   ├── __test__/
│   │   │   └── authController.test.ts
│   │   ├── authController.ts
│   │   ├── caseController.ts
│   │   ├── otpController.ts
│   │   └── userController.ts
│   ├── loaders/
│   │   ├── mongooseLoader.ts
│   │   └── serverLoader.ts
│   ├── middlewares/
│   │   ├── authMiddleware.ts
│   │   ├── errorHandler.ts
│   │   ├── metricsMiddleware.ts
│   │   └── rateLimiter.ts
│   ├── models/
│   │   ├── userModel.ts
│   │   └── otpModel.ts
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   ├── caseRoutes.ts
│   │   └── userRoutes.ts
│   ├── services/
│   │   ├── authService.ts
│   │   ├── caseService.ts
│   │   ├── otpService.ts
│   │   ├── summarizeClient.ts
│   │   └── userService.ts
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   └── logger.ts
│   ├── app.ts
│   └── server.ts
├── .env.sample
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── jest.config.js
├── nodemon.json
├── package.json
└── README.md
```

The project follows a modular architecture with clear separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data processing
- **Models**: Define database schemas and models
- **Routes**: Define API endpoints and their handlers
- **Middlewares**: Handle cross-cutting concerns like authentication and error handling
- **Config**: Store application configurations
- **Utils**: Contain shared utility functions
- **Loaders**: Handle application bootstrapping and initialization

## 🔧 Environment Variables

Create a `.env` file in the root directory:

    ```
    MONGO_URI=your_mongodb_uri
    PORT=3000
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_email
    EMAIL_PASS=your_email_password
    AWS_ACCESS_KEY_ID=your_aws_key
    AWS_SECRET_ACCESS_KEY=your_aws_secret
    AWS_REGION=your_aws_region
    AWS_S3_BUCKET_NAME=your_bucket_name
    AI_SERVICE=localhost
    ```

## 🚀 Getting Started

1. **Clone the repository**
    ```bash
    git clone <repository-url>
    cd backend
    ```
2. **Install dependencies**
    ```bash
    npm install
    ```
3. **Start the development server**  
    You can start the development server using one of the following methods:

   - **Using npm**  
     Run the development server locally:
     ```bash
     npm run dev
     ```

   - **Using Docker Compose**  
     Run the server with Docker Compose:
     ```bash
     docker-compose up
     ```
## 📚 API Documentation

### Authentication Routes

#### NEXT SOON...

## 🔍 Monitoring

- Prometheus metrics: `http://localhost:9090`
- Grafana dashboards: `http://localhost:3001`
- Node exporter metrics: `http://localhost:9100`
- Redis exporter metrics: `http://localhost:9121`
- DCGM exporter (GPU metrics): `http://localhost:9400`

## 🛡️ Security Features

- Rate limiting
- JWT authentication
- Email verification
- Secure password hashing
- Environment variable protection


## 📦 Deployment

This project uses GitHub Actions for automated deployment. The CI/CD pipeline is triggered on every push to the main branch.

### Pipeline Overview

```yaml
# Triggered on push to main branch
on:
  push:
    branches:
      - main
```

The pipeline performs the following steps:
1. Builds and tests the application
2. Creates multi-platform Docker images (amd64/arm64)
3. Pushes images to Docker Hub with commit hash tags

You can find the complete workflow configuration in `.github/workflows/ci.yaml`.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details
