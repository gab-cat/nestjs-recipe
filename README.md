# Recipe Sharing App - Microservices Architecture

A NestJS-based microservices application for sharing recipes, built with TypeScript, Prisma, and PostgreSQL.

## 🏗️ Architecture

This application is built using a microservices architecture with an API Gateway pattern:

### API Gateway

- **Gateway** (Port 3000): HTTP API Gateway that routes requests to microservices

### Microservices (TCP Transport)

- **Auth Service** (Port 4001): User authentication and authorization
- **Recipe Service** (Port 4002): Recipe management and operations
- **Users Service** (Port 4003): User profile and management

### Communication

- **Client to Gateway**: HTTP/REST
- **Gateway to Services**: TCP with Message Patterns
- **Inter-service Events**: Event Patterns for loose coupling

## 🚀 Features

### Recipe Management

- Create, read, update, and delete recipes
- Search recipes by name, description, or ingredients
- Recipe categorization and tagging
- Recipe reviews and ratings
- Image support for recipes
- Slug-based recipe URLs for SEO-friendly access
- Recipe management by both ID and slug

### User Management

- User registration and profile management
- User search functionality
- User deactivation
- Profile with recent recipes
- User lookup by email and username
- Comprehensive user profile management

### Authentication

- JWT-based authentication
- Refresh token support
- Password change functionality
- Token validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn or bun

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd nestjs-recipe
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/recipe_sharing?schema=public"

   # JWT Secrets
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   JWT_REFRESH_SECRET="your-super-secret-refresh-jwt-key-change-this-in-production"

   # App Configuration
   NODE_ENV="development"

   # Microservices Ports
   AUTH_PORT=4001
   RECIPE_PORT=4002
   USERS_PORT=4003
   MAIN_PORT=3000
   ```

4. **Set up the database:**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database (for development)
   npm run db:push

   # Or run migrations (for production)
   npm run db:migrate
   ```

## 🏃‍♂️ Running the Application

### Development Mode

**Option 1: Run all services at once (Recommended):**

```bash
# Start all microservices and API Gateway
npm run start:all
```

**Option 2: Run services individually:**

```bash
# Terminal 1 - All Microservices
npm run start:microservices

# Terminal 2 - API Gateway
npm run start:gateway
```

**Option 3: Run each service separately:**

```bash
# Terminal 1 - Auth Service
npm run start:auth

# Terminal 2 - Recipe Service
npm run start:recipe

# Terminal 3 - Users Service
npm run start:users

# Terminal 4 - API Gateway
npm run start:gateway
```

### Production Mode

1. **Build all services:**

   ```bash
   npm run build:auth
   npm run build:recipe
   npm run build:users
   ```

2. **Run services:**
   ```bash
   # Run each in separate terminals or use process manager
   npm run start:auth:prod
   npm run start:recipe:prod
   npm run start:users:prod
   ```

## 📡 API Documentation

All endpoints are accessible through the API Gateway at `http://localhost:3000`.

### 🔑 Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### 🔐 Authentication Endpoints

| Method | Endpoint                       | Auth Required | Request Body                                                          | Query Params | Response                  |
| ------ | ------------------------------ | ------------- | --------------------------------------------------------------------- | ------------ | ------------------------- |
| `POST` | `/api/v1/auth/register`        | ❌            | `{ email, username, password, firstName?, lastName?, bio?, avatar? }` | -            | `{ user, tokens }`        |
| `POST` | `/api/v1/auth/login`           | ❌            | `{ email, password }`                                                 | -            | `{ user, tokens }`        |
| `POST` | `/api/v1/auth/refresh`         | ❌            | `{ refreshToken }`                                                    | -            | `{ user, tokens }`        |
| `POST` | `/api/v1/auth/logout`          | ✅            | `{ refreshToken }`                                                    | -            | `{ message }`             |
| `POST` | `/api/v1/auth/change-password` | ✅            | `{ currentPassword, newPassword }`                                    | -            | `{ message }`             |
| `POST` | `/api/v1/auth/validate`        | ❌            | `{ token }`                                                           | -            | `{ id, email, username }` |
| `GET`  | `/api/v1/auth/test`            | ❌            | -                                                                     | -            | `{ message }`             |

### 🍳 Recipe Endpoints

| Method   | Endpoint                         | Auth Required | Request Body                                                                                | Query Params       | Path Params | Response      |
| -------- | -------------------------------- | ------------- | ------------------------------------------------------------------------------------------- | ------------------ | ----------- | ------------- |
| `GET`    | `/api/v1/recipes`                | ❌            | -                                                                                           | `page?, limit?`    | -           | `Recipe[]`    |
| `GET`    | `/api/v1/recipes/{id}`           | ❌            | -                                                                                           | -                  | `id`        | `Recipe`      |
| `GET`    | `/api/v1/recipes/slug/{slug}`    | ❌            | -                                                                                           | -                  | `slug`      | `Recipe`      |
| `POST`   | `/api/v1/recipes`                | ✅            | `{ name, description?, ingredients[], instructions[], cookingTime, servings, image? }`      | -                  | -           | `Recipe`      |
| `PATCH`  | `/api/v1/recipes/slug/{slug}`    | ✅            | `{ name?, description?, ingredients[]?, instructions[]?, cookingTime?, servings?, image? }` | -                  | `slug`      | `Recipe`      |
| `DELETE` | `/api/v1/recipes/slug/{slug}`    | ✅            | -                                                                                           | -                  | `slug`      | `{ message }` |
| `GET`    | `/api/v1/recipes/search`         | ❌            | -                                                                                           | `q, page?, limit?` | -           | `Recipe[]`    |
| `GET`    | `/api/v1/recipes/author/{email}` | ❌            | -                                                                                           | `page?, limit?`    | `email`     | `Recipe[]`    |
| `GET`    | `/api/v1/recipes/test`           | ❌            | -                                                                                           | -                  | -           | `{ message }` |

### 👥 User Endpoints

| Method   | Endpoint                            | Auth Required | Request Body                               | Query Params       | Path Params | Response          |
| -------- | ----------------------------------- | ------------- | ------------------------------------------ | ------------------ | ----------- | ----------------- |
| `GET`    | `/api/v1/users`                     | ✅            | -                                          | `page?, limit?`    | -           | `SafeUser[]`      |
| `GET`    | `/api/v1/users/{id}`                | ❌            | -                                          | -                  | `id`        | `SafeUser`        |
| `PATCH`  | `/api/v1/users/email/{email}`       | ✅            | `{ firstName?, lastName?, bio?, avatar? }` | -                  | `email`     | `SafeUser`        |
| `DELETE` | `/api/v1/users/email/{email}`       | ✅            | -                                          | -                  | `email`     | `{ message }`     |
| `GET`    | `/api/v1/users/search`              | ✅            | -                                          | `q, page?, limit?` | -           | `SafeUser[]`      |
| `GET`    | `/api/v1/users/username/{username}` | ❌            | -                                          | -                  | `username`  | `SafeUser`        |
| `GET`    | `/api/v1/users/profile/{id}`        | ✅            | -                                          | -                  | `id`        | `UserWithRecipes` |
| `GET`    | `/api/v1/users/email/{email}`       | ❌            | -                                          | -                  | `email`     | `User \| null`    |
| `GET`    | `/api/v1/users/test`                | ❌            | -                                          | -                  | -           | `{ message }`     |

### 📋 Request Body Schemas

#### Authentication

```typescript
// Register/Login
RegisterDto = {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}

LoginDto = {
  email: string;
  password: string;
}

// Token Management
RefreshTokenDto = {
  refreshToken: string;
}

ChangePasswordDto = {
  currentPassword: string;
  newPassword: string;
}
```

#### Recipe

```typescript
CreateRecipeDto = {
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: number;
  image?: string;
}

UpdateRecipeDto = {
  name?: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  cookingTime?: string;
  servings?: number;
  image?: string;
}
```

#### User

```typescript
UpdateUserDto = {
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
}
```

### 📊 Response Schemas

#### Authentication Response

```typescript
AuthResponse = {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

#### Recipe Response

```typescript
Recipe = {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: number;
  image?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}
```

#### User Response

```typescript
SafeUser = {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

UserWithRecipes = SafeUser & {
  recipes: {
    id: string;
    name: string;
    image?: string;
    createdAt: Date;
  }[];
}
```

### 📋 Query Parameters

| Parameter | Type     | Default | Description                |
| --------- | -------- | ------- | -------------------------- |
| `page`    | `number` | `1`     | Page number for pagination |
| `limit`   | `number` | `10`    | Number of items per page   |
| `q`       | `string` | -       | Search query string        |

### 🚨 HTTP Status Codes

| Code  | Status                | Description                              |
| ----- | --------------------- | ---------------------------------------- |
| `200` | OK                    | Request successful                       |
| `201` | Created               | Resource created successfully            |
| `400` | Bad Request           | Invalid request data                     |
| `401` | Unauthorized          | Authentication required or token invalid |
| `403` | Forbidden             | Access denied                            |
| `404` | Not Found             | Resource not found                       |
| `409` | Conflict              | Resource already exists                  |
| `500` | Internal Server Error | Server error                             |

### 🚨 Error Response Format

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

**Common Error Messages:**

- `"Invalid credentials"` - Wrong email/password
- `"Email already exists"` - Registration with existing email
- `"Username already exists"` - Registration with existing username
- `"User not found"` - User ID doesn't exist
- `"Invalid token"` - JWT token invalid/expired
- `"No token provided"` - Missing Authorization header

## 🗄️ Database Schema

The application uses the following main entities:

- **User**: User account information
- **Recipe**: Recipe data with ingredients and instructions
- **Category**: Recipe categories
- **Tag**: Recipe tags
- **RecipeReview**: User reviews for recipes
- **AuthToken**: JWT token management
- **UserSession**: User session tracking

## 🔧 Development Scripts

```bash
# Development
npm run start:all         # Start all services (microservices + gateway)
npm run start:microservices # Start all microservices only
npm run start:gateway     # Start API Gateway only
npm run start:auth        # Start auth service in watch mode
npm run start:recipe      # Start recipe service in watch mode
npm run start:users       # Start users service in watch mode

# Building
npm run build:auth        # Build auth service
npm run build:recipe      # Build recipe service
npm run build:users       # Build users service

# Database
npm run db:generate       # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run database migrations
npm run db:reset         # Reset database

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run test             # Run tests
npm run test:e2e         # Run e2e tests
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📂 Project Structure

```
nestjs-recipe/
├── apps/
│   ├── auth/           # Auth microservice (Port 4001)
│   ├── recipe/         # Recipe microservice (Port 4002)
│   ├── users/          # Users microservice (Port 4003)
│   └── nestjs-recipe/  # API Gateway (Port 3000)
│       └── src/
│           ├── gateways/    # HTTP controllers that proxy to microservices
│           │   ├── auth.gateway.ts    # Auth endpoints
│           │   ├── recipe.gateway.ts  # Recipe endpoints with slug support
│           │   └── users.gateway.ts   # User endpoints with email lookup
│           └── app.module.ts          # Main gateway module
├── libs/
│   └── shared/         # Shared types, services, and utilities
│       ├── config/     # Configuration modules
│       ├── guards/     # Authentication guards
│       ├── patterns/   # Microservice message patterns
│       └── services/   # Shared services
├── prisma/
│   └── schema.prisma   # Database schema
├── generated/
│   └── prisma/         # Generated Prisma client
└── ...
```

## 🔄 API Gateway Pattern

The application uses an **API Gateway pattern** where:

- **API Gateway** (`nestjs-recipe`) acts as a single entry point for all client requests
- **Gateway Controllers** in `/apps/nestjs-recipe/src/gateways/` proxy HTTP requests to microservices
- **Microservices** communicate via TCP transport using message patterns
- Each microservice handles its own domain logic and data persistence

## 🔐 Security Notes

- JWT secrets should be changed in production
- Database credentials should be secured
- CORS is currently enabled for all origins (configure for production)
- Password hashing is implemented but not fully integrated (see TODOs in code)

## 🚧 TODO / Future Improvements

- [x] ~~Implement proper JWT guards for all protected routes~~ ✅ **Completed**
- [x] ~~Add password hashing and storage in separate auth table~~ ✅ **Completed**
- [ ] Implement email verification
- [ ] Add password reset functionality
- [ ] Implement file upload for recipe images
- [ ] Add recipe rating aggregation
- [ ] Implement comprehensive logging
- [ ] Add health checks for all services
- [ ] Implement service discovery
- [x] ~~Add API documentation with detailed examples~~ ✅ **Completed**
- [ ] Add API documentation with Swagger
- [ ] Implement caching with Redis
- [ ] Add comprehensive error handling
- [ ] Implement rate limiting
- [ ] Add monitoring and metrics

## 📝 License

This project is [UNLICENSED](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the repository.
