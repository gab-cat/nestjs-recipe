import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { RecipeService } from './recipe.service';
import { RECIPE_PATTERNS, RECIPE_EVENTS } from '@app/shared';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  Recipe,
  RecipeWithAuthor,
} from './models/recipe.dto';

@Controller()
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @MessagePattern(RECIPE_PATTERNS.CREATE_RECIPE)
  async createRecipe(
    @Payload() data: { authorId: string; createRecipeDto: CreateRecipeDto },
  ): Promise<Recipe> {
    return this.recipeService.createRecipe(data.authorId, data.createRecipeDto);
  }

  @MessagePattern(RECIPE_PATTERNS.FIND_ALL_RECIPES)
  async findAllRecipes(
    @Payload() data: { page?: number; limit?: number },
  ): Promise<RecipeWithAuthor[]> {
    const { page = 1, limit = 10 } = data;
    return this.recipeService.findAllRecipes(page, limit);
  }

  @MessagePattern(RECIPE_PATTERNS.SEARCH_RECIPES)
  async searchRecipes(
    @Payload() data: { query: string; page?: number; limit?: number },
  ): Promise<RecipeWithAuthor[]> {
    const { query, page = 1, limit = 10 } = data;
    return this.recipeService.searchRecipes(query, page, limit);
  }

  @MessagePattern(RECIPE_PATTERNS.FIND_RECIPES_BY_AUTHOR)
  async findRecipesByAuthor(
    @Payload() data: { email: string; page?: number; limit?: number },
  ): Promise<Recipe[]> {
    const { email, page = 1, limit = 10 } = data;
    return this.recipeService.findRecipesByAuthor(email, page, limit);
  }

  @MessagePattern(RECIPE_PATTERNS.FIND_RECIPE_BY_ID)
  async findRecipeById(
    @Payload() data: { id: string },
  ): Promise<RecipeWithAuthor> {
    return this.recipeService.findRecipeById(data.id);
  }

  @MessagePattern(RECIPE_PATTERNS.FIND_RECIPE_BY_SLUG)
  async findRecipeBySlug(
    @Payload() data: { slug: string },
  ): Promise<RecipeWithAuthor> {
    return this.recipeService.findRecipeBySlug(data.slug);
  }

  @MessagePattern(RECIPE_PATTERNS.UPDATE_RECIPE)
  async updateRecipe(
    @Payload()
    data: {
      slug: string;
      authorId: string;
      updateRecipeDto: UpdateRecipeDto;
    },
  ): Promise<Recipe> {
    return this.recipeService.updateRecipe(
      data.slug,
      data.authorId,
      data.updateRecipeDto,
    );
  }

  @MessagePattern(RECIPE_PATTERNS.DELETE_RECIPE)
  async deleteRecipe(
    @Payload() data: { slug: string; authorId: string },
  ): Promise<{ success: boolean; message: string }> {
    return this.recipeService.deleteRecipe(data.slug, data.authorId);
  }

  @MessagePattern(RECIPE_PATTERNS.TEST)
  getRecipeTest(): { message: string } {
    return this.recipeService.getRecipeTest();
  }

  // Event handlers (if needed)
  @EventPattern(RECIPE_EVENTS.RECIPE_CREATED)
  handleRecipeCreated(@Payload() data: any): void {
    // Handle recipe creation event
    console.log('Recipe created event received:', data);
  }

  @EventPattern(RECIPE_EVENTS.RECIPE_UPDATED)
  handleRecipeUpdated(@Payload() data: any): void {
    // Handle recipe update event
    console.log('Recipe updated event received:', data);
  }

  @EventPattern(RECIPE_EVENTS.RECIPE_DELETED)
  handleRecipeDeleted(@Payload() data: any): void {
    // Handle recipe deletion event
    console.log('Recipe deleted event received:', data);
  }
}
