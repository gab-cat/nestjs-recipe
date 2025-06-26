#!/bin/bash

set -e

echo "🚀 Starting NestJS Recipe Dev Mode..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

IMAGE_NAME="nestjs-recipe"

# Cleanup function to run on exit
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up on exit...${NC}"
    echo -e "${BLUE}📦 Stopping containers...${NC}"
    docker-compose down --remove-orphans || true
    echo -e "${YELLOW}🗑️ Removing Docker image...${NC}"
    docker rmi $IMAGE_NAME || echo "No image to remove"
    echo -e "${GREEN}✅ Cleanup completed!${NC}"
}

# Set trap to run cleanup on script exit or interruption
trap cleanup EXIT INT TERM

echo -e "${BLUE}📦 Stopping and removing existing containers...${NC}"
docker-compose down --remove-orphans || true

echo -e "${YELLOW}🗑️ Removing old image to free up space...${NC}"
docker rmi $IMAGE_NAME || echo "No existing image to remove"

echo -e "${BLUE}🔨 Building new Docker image...${NC}"
docker build -t $IMAGE_NAME .

echo -e "${GREEN}🚢 Starting services with Docker Compose...${NC}"

echo -e "${GREEN}✅ Dev mode started successfully!${NC}" 
docker-compose up --remove-orphans

