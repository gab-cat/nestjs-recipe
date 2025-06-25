# Deployment Workflow Documentation

This document explains how to use the GitHub Actions deployment workflow for the NestJS Recipe microservices project.

## Overview

The deployment workflow supports three main scenarios:
- **Option 1**: Rebuild specific services with matrix selection
- **Option 2**: Deploy to staging and production environments with versioning
- **Option 3**: Version tagging with semantic versioning (x.x.x format)

## Available Services

The workflow can build and deploy the following microservices:
- `auth` - Authentication service
- `recipe` - Recipe management service
- `users` - User management service
- `nestjs-recipe` - Main application service

## Deployment Types

### 1. Manual Deployment (workflow_dispatch)

#### Staging Deployment
```yaml
Deployment Type: staging
Services: all (or comma-separated list: auth,recipe,users)
```
**Result**: Pushes to `gabcat/recipe-app:<service>-staging`

#### Production Deployment
```yaml
Deployment Type: production
Services: all (or specific services)
Version: 1.2.3 (required, format: x.x.x)
Environment: prod
```
**Result**: 
- Pushes to `gabcat/recipe-app:<service>-1.2.3`
- Pushes to `gabcat/recipe-app:<service>-latest`

#### Rebuild Services
```yaml
Deployment Type: rebuild
Services: auth,recipe (specify which services to rebuild)
```
**Result**: Rebuilds and pushes to staging tags

### 2. Automatic Deployments

#### Push to main/master branches
- **Trigger**: Push to `main`, `master`, or `develop` branches
- **Action**: Automatically deploys all services to staging
- **Tags**: `gabcat/recipe-app:<service>-staging`

#### Version Tag Push
- **Trigger**: Push tags matching `v*.*.*` (e.g., `v1.2.3`)
- **Action**: Automatically deploys all services to production
- **Tags**: 
  - `gabcat/recipe-app:<service>-1.2.3`
  - `gabcat/recipe-app:<service>-latest`

## Usage Examples

### Example 1: Deploy specific services to staging
```bash
# Via GitHub UI - Go to Actions > Deploy Recipe App Services > Run workflow
Deployment Type: staging
Services: auth,users
```

### Example 2: Production deployment with version
```bash
# Via GitHub UI
Deployment Type: production
Services: all
Version: 1.0.0
Environment: prod
```

### Example 3: Create a production release via git tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

### Example 4: Rebuild only the auth service
```bash
# Via GitHub UI
Deployment Type: rebuild
Services: auth
```

## Required Secrets

Add these secrets to your GitHub repository:

```
DOCKER_USERNAME - Docker Hub username
DOCKER_PASSWORD - Docker Hub password/token
```

## Workflow Features

### Matrix Build Strategy
- Builds multiple services in parallel
- Supports selective service deployment
- Efficient caching with GitHub Actions cache

### Multi-platform Support
- Builds for `linux/amd64` and `linux/arm64`
- Uses Docker Buildx for cross-platform builds

### Validation
- Validates version format (x.x.x) for production deployments
- Ensures proper service names are provided

### Notifications
- Success/failure notifications in workflow logs
- Ready for integration with Slack/Discord (commented examples provided)

### Automatic Release Creation
- Creates GitHub releases for version tag pushes
- Includes deployment information and Docker image references

## Monitoring

The workflow provides comprehensive logging:
- Service deployment status
- Docker image tags created
- Version information
- Environment details

## Troubleshooting

### Common Issues

1. **Version format error**
   - Ensure version follows x.x.x format (e.g., 1.0.0, not v1.0.0)

2. **Docker authentication failure**
   - Check DOCKER_USERNAME and DOCKER_PASSWORD secrets
   - Ensure Docker Hub account has push permissions

3. **Service not found**
   - Verify service name matches directory in `apps/`
   - Check for typos in service names

4. **Build failure**
   - Check Dockerfile exists in service directory
   - Verify build context and dependencies

### Support
For issues with the deployment workflow, check:
- GitHub Actions logs for detailed error messages
- Docker Hub repository for image status
- Service-specific Dockerfiles for build issues 