import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@app/shared';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  Recipe,
  RecipeWithAuthor,
} from '@app/shared';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecipe(
    authorId: string,
    createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    const recipe = await this.prisma.recipe.create({
      data: {
        ...createRecipeDto,
        authorId,
        isPublished: createRecipeDto.isPublished ?? true,
      },
    });

    return this.mapToRecipeType(recipe as Recipe);
  }

  async findAllRecipes(page = 1, limit = 10): Promise<RecipeWithAuthor[]> {
    const skip = (page - 1) * limit;

    const recipes = await this.prisma.recipe.findMany({
      skip,
      take: limit,
      where: {
        isPublished: true,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map((recipe) =>
      this.mapToRecipeWithAuthorType(recipe as RecipeWithAuthor),
    );
  }

  async findRecipeById(id: string): Promise<RecipeWithAuthor> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    return this.mapToRecipeWithAuthorType(recipe as RecipeWithAuthor);
  }

  async findRecipesByAuthor(
    authorId: string,
    page = 1,
    limit = 10,
  ): Promise<Recipe[]> {
    const skip = (page - 1) * limit;

    const recipes = await this.prisma.recipe.findMany({
      where: { authorId },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map((recipe) => this.mapToRecipeType(recipe as Recipe));
  }

  async updateRecipe(
    id: string,
    authorId: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    if (existingRecipe.authorId !== authorId) {
      throw new ForbiddenException('You can only update your own recipes');
    }

    const updatedRecipe = await this.prisma.recipe.update({
      where: { id },
      data: updateRecipeDto,
    });

    return this.mapToRecipeType(updatedRecipe as Recipe);
  }

  async deleteRecipe(id: string, authorId: string): Promise<void> {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { id },
    });

    if (!existingRecipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found`);
    }

    if (existingRecipe.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own recipes');
    }

    await this.prisma.recipe.delete({
      where: { id },
    });
  }

  async searchRecipes(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<RecipeWithAuthor[]> {
    const skip = (page - 1) * limit;

    const recipes = await this.prisma.recipe.findMany({
      where: {
        AND: [
          { isPublished: true },
          {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { ingredients: { hasSome: [query] } },
            ],
          },
        ],
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map((recipe) =>
      this.mapToRecipeWithAuthorType(recipe as RecipeWithAuthor),
    );
  }

  getRecipeTest(): { message: string } {
    return { message: 'Recipe service is working' };
  }

  private mapToRecipeType(recipe: Recipe): Recipe {
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      image: recipe.image,
      isPublished: recipe.isPublished,
      authorId: recipe.authorId,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
    };
  }

  private mapToRecipeWithAuthorType(
    recipe: RecipeWithAuthor,
  ): RecipeWithAuthor {
    return {
      id: recipe.id,
      name: recipe.name,
      description: recipe.description,
      ingredients: recipe.ingredients,
      instructions: recipe.instructions,
      cookingTime: recipe.cookingTime,
      servings: recipe.servings,
      image: recipe.image,
      isPublished: recipe.isPublished,
      authorId: recipe.authorId,
      createdAt: recipe.createdAt,
      updatedAt: recipe.updatedAt,
      author: recipe.author,
    };
  }
}
