# Docker Setup for NestJS Recipe Microservices

This project consists of a microservices architecture with the following services:

- **API Gateway** (`nestjs-recipe`) - Main entry point running on port 3000
- **Auth Service** - Authentication microservice running on port 4001
- **Recipe Service** - Recipe management microservice running on port 4002
- **Users Service** - User management microservice running on port 4003
- **PostgreSQL Database** - Database service running on port 5432

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Build and start all services:**
   ```bash
   docker-compose up --build
   ```

2. **Start services in detached mode:**
   ```bash
   docker-compose up -d --build
   ```

3. **View logs:**
   ```bash
   # All services
   docker-compose logs -f
   
   # Specific service
   docker-compose logs -f api-gateway
   docker-compose logs -f auth-service
   docker-compose logs -f recipe-service
   docker-compose logs -f users-service
   ```

4. **Stop all services:**
   ```bash
   docker-compose down
   ```

5. **Stop and remove volumes:**
   ```bash
   docker-compose down -v
   ```

## Service URLs

- **API Gateway:** http://localhost:3000
  - Auth routes: http://localhost:3000/api/v1/auth
  - Recipe routes: http://localhost:3000/api/v1/recipes
  - User routes: http://localhost:3000/api/v1/users
- **PostgreSQL:** localhost:5432
  - Database: `nestjs_recipe`
  - Username: `postgres`
  - Password: `postgres`

## Development

### Building Individual Services

```bash
# Build specific service
docker-compose build auth-service
docker-compose build recipe-service
docker-compose build users-service
docker-compose build api-gateway

# Rebuild without cache
docker-compose build --no-cache auth-service
```

### Running Individual Services

```bash
# Start only database
docker-compose up postgres

# Start specific services
docker-compose up postgres auth-service
docker-compose up postgres recipe-service users-service
```

### Database Operations

```bash
# Run Prisma migrations
docker-compose exec api-gateway npx prisma migrate dev

# Generate Prisma client
docker-compose exec api-gateway npx prisma generate

# Seed database
docker-compose exec api-gateway npm run db:seed
```

## Environment Variables

The following environment variables are available for configuration:

### API Gateway
- `MAIN_PORT` - Gateway port (default: 3000)
- `AUTH_SERVICE_HOST` - Auth service hostname (default: auth-service)
- `AUTH_SERVICE_PORT` - Auth service port (default: 4001)
- `RECIPE_SERVICE_HOST` - Recipe service hostname (default: recipe-service)
- `RECIPE_SERVICE_PORT` - Recipe service port (default: 4002)
- `USERS_SERVICE_HOST` - Users service hostname (default: users-service)
- `USERS_SERVICE_PORT` - Users service port (default: 4003)

### Database
- `DATABASE_URL` - PostgreSQL connection string

### PostgreSQL
- `POSTGRES_DB` - Database name (default: nestjs_recipe)
- `POSTGRES_USER` - Database user (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)

## Troubleshooting

### Common Issues

1. **Port conflicts:**
   ```bash
   # Check what's using the ports
   lsof -i :3000
   lsof -i :4001
   lsof -i :4002
   lsof -i :4003
   lsof -i :5432
   ```

2. **Database connection issues:**
   ```bash
   # Check database logs
   docker-compose logs postgres
   
   # Restart database
   docker-compose restart postgres
   ```

3. **Service not starting:**
   ```bash
   # Check service logs
   docker-compose logs [service-name]
   
   # Rebuild service
   docker-compose build --no-cache [service-name]
   ```

### Cleanup

```bash
# Remove all containers and networks
docker-compose down --remove-orphans

# Remove all containers, networks, and volumes
docker-compose down --remove-orphans -v

# Remove all Docker images for this project
docker rmi $(docker images "nestjs-recipe*" -q)

# Full cleanup (use with caution)
docker system prune -af
```

## Health Checks

All services include health checks that verify the service is running and accessible:

- **API Gateway:** HTTP check on port 3000
- **Microservices:** TCP check on respective ports
- **PostgreSQL:** pg_isready check

You can check the health status:

```bash
docker-compose ps
```

## Scaling Services

```bash
# Scale microservices (not recommended for development)
docker-compose up --scale auth-service=2 --scale recipe-service=2
```

Note: Scaling requires load balancing configuration which is not included in this basic setup.

## Production Considerations

For production deployment, consider:

1. **Environment Variables:** Use proper environment variable management
2. **Secrets:** Use Docker secrets or external secret management
3. **Networking:** Configure proper network security
4. **Monitoring:** Add monitoring and logging solutions
5. **Load Balancing:** Add load balancers for high availability
6. **Database:** Use managed database services
7. **Security:** Review and harden Docker configurations 