import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import { RpcException } from '@nestjs/microservices';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  Recipe,
  RecipeWithAuthor,
} from './models/recipe.dto';
import { generateSlug, createUniqueSlug } from './utils/slug.util';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  async createRecipe(
    authorId: string,
    createRecipeDto: CreateRecipeDto,
  ): Promise<Recipe> {
    // Generate a unique slug
    const baseSlug = generateSlug(createRecipeDto.name);
    const existingSlugs = await this.getExistingSlugs(baseSlug);
    const uniqueSlug = createUniqueSlug(baseSlug, existingSlugs);

    const recipe = await this.prisma.recipe.create({
      data: {
        ...createRecipeDto,
        slug: uniqueSlug,
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
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Recipe with ID ${id} not found`,
      });
    }

    return this.mapToRecipeWithAuthorType(recipe as RecipeWithAuthor);
  }

  async findRecipeBySlug(slug: string): Promise<RecipeWithAuthor> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { slug },
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
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Recipe with slug ${slug} not found`,
      });
    }

    return this.mapToRecipeWithAuthorType(recipe as RecipeWithAuthor);
  }

  async findRecipesByAuthor(
    email: string,
    page = 1,
    limit = 10,
  ): Promise<Recipe[]> {
    const skip = (page - 1) * limit;

    const recipes = await this.prisma.recipe.findMany({
      where: {
        author: {
          email: {
            equals: email,
            mode: 'insensitive',
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return recipes.map((recipe) => this.mapToRecipeType(recipe as Recipe));
  }

  async updateRecipe(
    slug: string,
    authorId: string,
    updateRecipeDto: UpdateRecipeDto,
  ): Promise<Recipe> {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { slug },
    });

    if (!existingRecipe) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Recipe with slug ${slug} not found`,
      });
    }

    if (existingRecipe.authorId !== authorId) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You can only update your own recipes',
      });
    }

    // Generate new slug if name is being updated
    let updateData: UpdateRecipeDto = { ...updateRecipeDto };
    if (updateRecipeDto.name && updateRecipeDto.name !== existingRecipe.name) {
      const baseSlug = generateSlug(updateRecipeDto.name);
      const existingSlugs = await this.getExistingSlugs(
        baseSlug,
        existingRecipe.id,
      );
      const uniqueSlug = createUniqueSlug(baseSlug, existingSlugs);
      updateData = { ...updateData, slug: uniqueSlug } as UpdateRecipeDto;
    }

    const updatedRecipe = await this.prisma.recipe.update({
      where: { slug },
      data: updateData,
    });

    return this.mapToRecipeType(updatedRecipe as Recipe);
  }

  async deleteRecipe(
    slug: string,
    authorId: string,
  ): Promise<{ success: boolean; message: string }> {
    const existingRecipe = await this.prisma.recipe.findUnique({
      where: { slug },
    });

    if (!existingRecipe) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `Recipe with slug ${slug} not found`,
      });
    }

    if (existingRecipe.authorId !== authorId) {
      throw new RpcException({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You can only delete your own recipes',
      });
    }

    await this.prisma.recipe.delete({
      where: { slug },
    });

    return {
      success: true,
      message: 'Recipe deleted successfully',
    };
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
    return { message: 'Recipe service is working!' };
  }

  private async getExistingSlugs(
    baseSlug: string,
    excludeId?: string,
  ): Promise<string[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: {
        slug: {
          startsWith: baseSlug,
        },
        ...(excludeId && { id: { not: excludeId } }),
      },
      select: {
        slug: true,
      },
    });

    return recipes.map((recipe: { slug: string }) => recipe.slug);
  }

  private mapToRecipeType(recipe: Recipe): Recipe {
    return {
      id: recipe.id,
      name: recipe.name,
      slug: recipe.slug,
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
      slug: recipe.slug,
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
