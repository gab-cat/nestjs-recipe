import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_CONFIG = {
  title: 'NestJS Recipe API',
  description: `
    A comprehensive Recipe Management API built with NestJS microservices architecture.
    
    ## 🚀 Features
    - 🔐 User authentication and authorization
    - 📝 Recipe creation, editing, and sharing
    - 👥 User management and profiles
    - 🔍 Search and discovery
    
    ## 🔑 Authentication
    This API uses JWT tokens for authentication. Include the token in the Authorization header:
    \`Authorization: Bearer <your-token>\`
    
    ## 🏗️ Microservices Architecture
    This gateway aggregates the following services:
    - **Auth Service**: User authentication and authorization
    - **Recipe Service**: Recipe management and operations
    - **Users Service**: User profiles and management
  `,
  version: '1.0.0',
  contact: {
    name: 'Recipe API Team',
    url: 'https://github.com/your-org/nestjs-recipe',
    email: 'api@recipe.com',
  },
  license: {
    name: 'MIT',
    url: 'https://opensource.org/licenses/MIT',
  },
  bearerAuth: {
    type: 'http' as const,
    scheme: 'bearer',
    bearerFormat: 'JWT',
    name: 'Authorization',
    description: 'Enter JWT token',
    in: 'header' as const,
  },
  tags: [
    {
      name: 'Authentication',
      description: '🔐 User authentication and token management',
    },
    {
      name: 'Recipes',
      description: '🍳 Recipe creation, management, and discovery',
    },
    {
      name: 'Users',
      description: '👥 User management and profiles',
    },
    {
      name: 'Health',
      description: '💚 Service health checks and monitoring',
    },
  ],
  servers: [
    { url: 'http://localhost:3000', description: '🔧 Development server' },
    { url: 'https://api.recipe.com', description: '🌐 Production server' },
  ],
} as const;

export const SWAGGER_UI_CONFIG = {
  customSiteTitle: 'Recipe API Documentation',
  customfavIcon: 'https://nestjs.com/img/logo_text.svg',
  customCss: `
    /* Main theme improvements */
    .swagger-ui {
      font-family: 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
    }
    
    /* Header styling */
    .swagger-ui .topbar {
      padding: 15px 0;
      background: linear-gradient(135deg, #ea2845 0%, #ff4757 100%);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-bottom: none;
    }
    
    .swagger-ui .topbar .topbar-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }
    
    .swagger-ui .topbar .topbar-wrapper img {
      height: 35px;
      width: auto;
      filter: brightness(0) invert(1);
    }
    
    /* Info section improvements */
    .swagger-ui .info {
      margin: 30px 0;
      padding: 25px;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 12px;
      border: 1px solid #e9ecef;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    
    .swagger-ui .info .title {
      color: #2c3e50;
      font-size: 2.2em;
      font-weight: 700;
      margin-bottom: 15px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.1);
    }
    
    .swagger-ui .info .description {
      color: #34495e;
      font-size: 1.1em;
      line-height: 1.6;
    }
    
    /* Operation cards */
    .swagger-ui .opblock {
      border-radius: 8px;
      border: 1px solid #e9ecef;
      margin-bottom: 15px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }
    
    .swagger-ui .opblock:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    
    /* HTTP method colors */
    .swagger-ui .opblock.opblock-get {
      border-left: 4px solid #27ae60;
    }
    
    .swagger-ui .opblock.opblock-post {
      border-left: 4px solid #3498db;
    }
    
    .swagger-ui .opblock.opblock-put {
      border-left: 4px solid #f39c12;
    }
    
    .swagger-ui .opblock.opblock-delete {
      border-left: 4px solid #e74c3c;
    }
    
    .swagger-ui .opblock.opblock-patch {
      border-left: 4px solid #9b59b6;
    }
    
    /* Tag sections */
    .swagger-ui .opblock-tag {
      padding: 15px 20px;
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #e9ecef;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    .swagger-ui .opblock-tag h3 {
      color: #2c3e50;
      font-size: 1.4em;
      font-weight: 600;
      margin: 0;
    }
    
    /* Buttons */
    .swagger-ui .btn {
      border-radius: 6px;
      font-weight: 600;
      transition: all 0.3s ease;
      text-transform: uppercase;
      font-size: 0.85em;
      letter-spacing: 0.5px;
    }
    
    .swagger-ui .btn.authorize {
      background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
      border: none;
      color: white;
      padding: 10px 20px;
    }
    
    .swagger-ui .btn.authorize:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
    }
    
    .swagger-ui .btn.execute {
      background: linear-gradient(135deg, #3498db 0%, #5dade2 100%);
      border: none;
      color: white;
    }
    
    .swagger-ui .btn.execute:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
    }
    
    /* Parameter sections */
    .swagger-ui .parameters-col_description {
      font-size: 0.9em;
      color: #5a6c7d;
    }
    
    /* Response sections */
    .swagger-ui .responses-inner {
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }
    
    /* Schema sections */
    .swagger-ui .model-box {
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e9ecef;
    }
    
    /* Try it out improvements */
    .swagger-ui .try-out__btn {
      background: linear-gradient(135deg, #9b59b6 0%, #bb7ac7 100%);
      border: none;
      color: white;
    }
    
    .swagger-ui .try-out__btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(155, 89, 182, 0.3);
    }
    
    /* Mobile responsiveness */
    @media (max-width: 768px) {
      .swagger-ui .info {
        margin: 15px;
        padding: 20px;
      }
      
      .swagger-ui .info .title {
        font-size: 1.8em;
      }
    }
  `,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none' as const,
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    syntaxHighlight: {
      activated: true,
      theme: 'agate',
    },
    tryItOutEnabled: true,
    requestSnippetsEnabled: true,
    requestSnippets: {
      generators: {
        curl_bash: {
          title: 'cURL (bash)',
          syntax: 'bash',
        },
        curl_powershell: {
          title: 'cURL (PowerShell)',
          syntax: 'powershell',
        },
        curl_cmd: {
          title: 'cURL (CMD)',
          syntax: 'bash',
        },
      },
    },
  },
} as const;

export function createSwaggerConfig(): any {
  const config = new DocumentBuilder()
    .setTitle(SWAGGER_CONFIG.title)
    .setDescription(SWAGGER_CONFIG.description)
    .setVersion(SWAGGER_CONFIG.version)
    .setContact(
      SWAGGER_CONFIG.contact.name,
      SWAGGER_CONFIG.contact.url,
      SWAGGER_CONFIG.contact.email,
    )
    .setLicense(SWAGGER_CONFIG.license.name, SWAGGER_CONFIG.license.url)
    .addBearerAuth(SWAGGER_CONFIG.bearerAuth, 'JWT-auth');

  // Add tags
  SWAGGER_CONFIG.tags.forEach((tag) => {
    config.addTag(tag.name, tag.description);
  });

  // Add servers
  SWAGGER_CONFIG.servers.forEach((server) => {
    config.addServer(server.url, server.description);
  });

  return config.build();
}

export const SWAGGER_ROUTE = 'api/docs';

export function isSwaggerEnabled(): boolean {
  const nodeEnv = process.env.NODE_ENV || 'development';
  return nodeEnv === 'development';
}
