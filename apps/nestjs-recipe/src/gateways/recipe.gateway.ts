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
  CreateRecipeDto,
  UpdateRecipeDto,
  Recipe,
  RecipeWithAuthor,
  RECIPE_PATTERNS,
  HttpJwtAuthGuard,
} from '@app/shared';
import { Gateway } from './base.gateway';

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

@Controller('api/v1/recipes')
export class RecipeGateway extends Gateway {
  constructor(
    @Inject('RECIPE_SERVICE') private readonly recipeClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  @UseGuards(HttpJwtAuthGuard)
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
      this.recipeClient.send<Recipe>(RECIPE_PATTERNS.CREATE_RECIPE, {
        authorId,
        createRecipeDto,
        token,
      }),
    );
  }

  @Get()
  async findAllRecipes(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RecipeWithAuthor[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;

    return firstValueFrom(
      this.recipeClient.send<RecipeWithAuthor[]>(
        RECIPE_PATTERNS.FIND_ALL_RECIPES,
        {
          page: pageNum,
          limit: limitNum,
        },
      ),
    );
  }

  @Get('search')
  async searchRecipes(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<RecipeWithAuthor[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return firstValueFrom(
      this.recipeClient.send<RecipeWithAuthor[]>(
        RECIPE_PATTERNS.SEARCH_RECIPES,
        {
          query,
          page: pageNum,
          limit: limitNum,
        },
      ),
    );
  }

  @Get('author/:authorId')
  @UseGuards(HttpJwtAuthGuard)
  async findRecipesByAuthor(
    @Headers() headers: HeadersObject,
    @Param('authorId') authorId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<Recipe[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const token = this.requireToken(headers);

    return firstValueFrom(
      this.recipeClient.send<Recipe[]>(RECIPE_PATTERNS.FIND_RECIPES_BY_AUTHOR, {
        authorId,
        page: pageNum,
        limit: limitNum,
        token,
      }),
    );
  }

  @Get('test')
  async getRecipeTest(): Promise<{ message: string }> {
    return firstValueFrom(
      this.recipeClient.send<{ message: string }>(RECIPE_PATTERNS.TEST, {}),
    );
  }

  @Get(':id')
  async findRecipeById(@Param('id') id: string): Promise<RecipeWithAuthor> {
    return firstValueFrom(
      this.recipeClient.send<RecipeWithAuthor>(
        RECIPE_PATTERNS.FIND_RECIPE_BY_ID,
        { id },
      ),
    );
  }

  @Patch(':id')
  @UseGuards(HttpJwtAuthGuard)
  async updateRecipe(
    @Param('id') id: string,
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
      this.recipeClient.send<Recipe>(RECIPE_PATTERNS.UPDATE_RECIPE, {
        id,
        authorId,
        updateRecipeDto,
        token,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(HttpJwtAuthGuard)
  async deleteRecipe(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Headers() headers: HeadersObject,
  ): Promise<void> {
    const authorId = req.user?.id;
    if (!authorId) {
      throw new UnauthorizedException('User not authenticated');
    }

    const token = this.requireToken(headers);
    return firstValueFrom(
      this.recipeClient.send<void>(RECIPE_PATTERNS.DELETE_RECIPE, {
        id,
        authorId,
        token,
      }),
    );
  }
}
