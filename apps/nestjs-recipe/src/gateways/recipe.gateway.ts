import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  Inject,
  UseGuards,
  Request,
  UnauthorizedException,
  Headers,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import {
  RECIPE_PATTERNS,
  HttpJwtAuthGuard,
  MicroserviceLoggerService,
} from '@app/shared';
import { Gateway } from './base.gateway';
import {
  RecipeDto,
  CreateRecipeDto,
  RecipeWithAuthorDto,
  RecipeWithAuthor,
  UpdateRecipeDto,
} from 'apps/recipe/src/models/recipe.dto';
import { Recipe } from 'generated/prisma';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface HeadersObject {
  authorization?: string;
  Authorization?: string;
  [key: string]: string | string[] | undefined;
}

@ApiTags('Recipes')
@Controller('api/v1/recipes')
export class RecipeGateway extends Gateway {
  constructor(
    @Inject('RECIPE_SERVICE') private readonly recipeClient: ClientProxy,
    private readonly microserviceLogger: MicroserviceLoggerService,
  ) {
    super();
    this.microserviceLogger.logClientConnection(
      'RECIPE_SERVICE',
      'localhost',
      3002,
    );
  }

  @Post()
  @UseGuards(HttpJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create a new recipe',
    description:
      'Create a new recipe. Requires authentication. The authenticated user becomes the recipe author.',
  })
  @ApiCreatedResponse({
    description: 'Recipe successfully created',
    type: RecipeDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation failed',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiBody({ type: CreateRecipeDto })
  async createRecipe(
    @Body() createRecipeDto: CreateRecipeDto,
    @Request() req: AuthenticatedRequest,
    @Headers() headers: HeadersObject,
  ): Promise<Recipe> {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const token = this.extractTokenFromHeaders(headers);
    return firstValueFrom(
      this.microserviceLogger.logAndSend<Recipe>(
        this.recipeClient,
        RECIPE_PATTERNS.CREATE_RECIPE,
        {
          authorId,
          createRecipeDto,
          token,
        },
        'RecipeGateway.createRecipe',
      ),
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all published recipes',
    description:
      'Retrieve a paginated list of all published recipes with author information.',
  })
  @ApiOkResponse({
    description: 'List of recipes successfully retrieved',
    type: [RecipeWithAuthorDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recipes per page',
    example: 10,
    type: Number,
  })
  async findAllRecipes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RecipeWithAuthor[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return firstValueFrom(
      this.microserviceLogger.logAndSend<RecipeWithAuthor[]>(
        this.recipeClient,
        RECIPE_PATTERNS.FIND_ALL_RECIPES,
        {
          page: pageNum,
          limit: limitNum,
        },
        'RecipeGateway.findAllRecipes',
      ),
    );
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search recipes',
    description: 'Search for recipes by name, description, or ingredients.',
  })
  @ApiOkResponse({
    description: 'Search results successfully retrieved',
    type: [RecipeWithAuthorDto],
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query string',
    example: 'chocolate chip cookies',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recipes per page',
    example: 10,
    type: Number,
  })
  async searchRecipes(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RecipeWithAuthor[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return firstValueFrom(
      this.microserviceLogger.logAndSend<RecipeWithAuthor[]>(
        this.recipeClient,
        RECIPE_PATTERNS.SEARCH_RECIPES,
        {
          query,
          page: pageNum,
          limit: limitNum,
        },
        'RecipeGateway.searchRecipes',
      ),
    );
  }

  @Get('author/:email')
  @ApiOperation({
    summary: 'Get recipes by author email',
    description:
      'Retrieve all recipes by a specific author using their email address. Requires authentication.',
  })
  @ApiOkResponse({
    description: 'Recipes successfully retrieved',
    type: [RecipeDto],
  })
  @ApiNotFoundResponse({
    description: 'Author not found',
  })
  @ApiParam({
    name: 'email',
    description: 'Author email address',
    example: 'chef@example.com',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recipes per page',
    example: 10,
    type: Number,
  })
  async findRecipesByAuthor(
    @Param('email') email: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Recipe[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return firstValueFrom(
      this.microserviceLogger.logAndSend<Recipe[]>(
        this.recipeClient,
        RECIPE_PATTERNS.FIND_RECIPES_BY_AUTHOR,
        {
          email,
          page: pageNum,
          limit: limitNum,
        },
        'RecipeGateway.findRecipesByAuthor',
      ),
    );
  }

  @Get('test')
  @ApiOperation({
    summary: 'Recipe service health check',
    description: 'Test endpoint to verify recipe service connectivity.',
  })
  @ApiOkResponse({
    description: 'Recipe service is operational',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Recipe service is working' },
      },
    },
  })
  async getRecipeTest(): Promise<{ message: string }> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<{ message: string }>(
        this.recipeClient,
        RECIPE_PATTERNS.TEST,
        {},
        'RecipeGateway.getRecipeTest',
      ),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get recipe by ID',
    description:
      'Retrieve a specific recipe by its unique identifier, including author information.',
  })
  @ApiOkResponse({
    description: 'Recipe successfully retrieved',
    type: RecipeWithAuthorDto,
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found',
  })
  @ApiParam({
    name: 'id',
    description: 'Recipe unique identifier',
    example: 'clm987654321',
  })
  async findRecipeById(@Param('id') id: string): Promise<RecipeWithAuthor> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<RecipeWithAuthor>(
        this.recipeClient,
        RECIPE_PATTERNS.FIND_RECIPE_BY_ID,
        { id },
        'RecipeGateway.findRecipeById',
      ),
    );
  }

  @Get('slug/:slug')
  @ApiOperation({
    summary: 'Get recipe by slug',
    description:
      'Retrieve a specific recipe by its slug, including author information.',
  })
  @ApiOkResponse({
    description: 'Recipe successfully retrieved',
    type: RecipeWithAuthorDto,
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found',
  })
  @ApiParam({
    name: 'slug',
    description: 'Recipe slug',
    example: 'chocolate-chip-cookies',
  })
  async findRecipeBySlug(
    @Param('slug') slug: string,
  ): Promise<RecipeWithAuthor> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<RecipeWithAuthor>(
        this.recipeClient,
        RECIPE_PATTERNS.FIND_RECIPE_BY_SLUG,
        { slug },
        'RecipeGateway.findRecipeBySlug',
      ),
    );
  }

  @Patch('slug/:slug')
  @UseGuards(HttpJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update recipe by slug',
    description:
      'Update an existing recipe by its slug. Only the recipe author can update their own recipes.',
  })
  @ApiOkResponse({
    description: 'Recipe successfully updated',
    type: RecipeDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Only recipe author can update the recipe',
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found',
  })
  @ApiParam({
    name: 'slug',
    description: 'Recipe slug',
    example: 'chocolate-chip-cookies',
  })
  @ApiBody({ type: UpdateRecipeDto })
  async updateRecipeBySlug(
    @Param('slug') slug: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @Request() req: AuthenticatedRequest,
    @Headers() headers: HeadersObject,
  ): Promise<Recipe> {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const token = this.requireToken(headers);
    return firstValueFrom(
      this.microserviceLogger.logAndSend<Recipe>(
        this.recipeClient,
        RECIPE_PATTERNS.UPDATE_RECIPE,
        {
          slug,
          authorId,
          updateRecipeDto,
          token,
        },
        'RecipeGateway.updateRecipeBySlug',
      ),
    );
  }

  @Delete('slug/:slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpJwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete recipe by slug',
    description:
      'Delete an existing recipe by its slug. Only the recipe author can delete their own recipes.',
  })
  @ApiNoContentResponse({
    description: 'Recipe successfully deleted',
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
  })
  @ApiForbiddenResponse({
    description: 'Only recipe author can delete the recipe',
  })
  @ApiNotFoundResponse({
    description: 'Recipe not found',
  })
  @ApiParam({
    name: 'slug',
    description: 'Recipe slug',
    example: 'chocolate-chip-cookies',
  })
  async deleteRecipeBySlug(
    @Param('slug') slug: string,
    @Request() req: AuthenticatedRequest,
    @Headers() headers: HeadersObject,
  ): Promise<void> {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const token = this.requireToken(headers);
    await firstValueFrom(
      this.microserviceLogger.logAndSend<{ success: boolean; message: string }>(
        this.recipeClient,
        RECIPE_PATTERNS.DELETE_RECIPE,
        {
          slug,
          authorId,
          token,
        },
        'RecipeGateway.deleteRecipeBySlug',
      ),
    );
  }
}
