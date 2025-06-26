import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/shared';
import {
  UpdateUserDto,
  User,
  SafeUserDto,
  UserWithRecipesDto,
} from './models/user.dto';
import { Recipe } from 'generated/prisma';
import { RpcException } from '@nestjs/microservices';
import { RecipeDto } from 'apps/recipe/src/models/recipe.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllUsers(page = 1, limit = 10): Promise<SafeUserDto[]> {
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => this.mapToSafeUserDto(user as User));
  }

  async findUserById(id: string): Promise<SafeUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with ID ${id} not found`,
      });
    }

    return this.mapToSafeUserDto(user as User);
  }

  async findUserByEmail(email: string): Promise<UserWithRecipesDto> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        recipes: true,
      },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with email ${email} not found`,
      });
    }

    return {
      ...this.mapToSafeUserDto(user as User),
      recipes: user.recipes.map((recipe) => this.mapToRecipeDto(recipe)),
    };
  }

  async findUserByUsername(username: string): Promise<SafeUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with username ${username} not found`,
      });
    }

    return this.mapToSafeUserDto(user as User);
  }

  async updateUser(
    email: string,
    updateUserDto: UpdateUserDto,
  ): Promise<SafeUserDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with email ${email} not found`,
      });
    }

    const updatedUser = await this.prisma.user.update({
      where: { email },
      data: updateUserDto,
    });

    return this.mapToSafeUserDto(updatedUser as User);
  }

  async deleteUser(email: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with email ${email} not found`,
      });
    }

    await this.prisma.user.delete({
      where: { email },
    });
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<SafeUserDto[]> {
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      skip,
      take: limit,
      orderBy: {
        username: 'asc',
      },
    });

    return users.map((user) => this.mapToSafeUserDto(user as User));
  }

  async getUserProfile(id: string): Promise<UserWithRecipesDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        recipes: true,
      },
    });

    if (!user) {
      throw new RpcException({
        statusCode: HttpStatus.NOT_FOUND,
        message: `User with ID ${id} not found`,
      });
    }

    return {
      ...this.mapToSafeUserDto(user as User),
      recipes: user.recipes.map((recipe) => this.mapToRecipeDto(recipe)),
    };
  }

  getUserTest(): { message: string } {
    return { message: 'Users service is working' };
  }

  private mapToSafeUserDto(user: User): SafeUserDto {
    return {
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    };
  }

  private mapToRecipeDto(recipe: Recipe): RecipeDto {
    return {
      id: recipe.id,
      slug: recipe.slug,
      name: recipe.name,
      description: recipe.description || '',
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

  private mapToUser(user: User): User {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      bio: user.bio || undefined,
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
