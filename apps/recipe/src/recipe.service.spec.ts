import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { PrismaService } from '@app/shared';
import { CreateRecipeDto, UpdateRecipeDto } from '@app/shared';

describe('RecipeService', () => {
  let service: RecipeService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    recipe: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipeService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RecipeService>(RecipeService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createRecipe', () => {
    it('should create a recipe successfully', async () => {
      // Arrange
      const inputAuthorId = 'author-123';
      const inputCreateRecipeDto: CreateRecipeDto = {
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish',
        ingredients: ['spaghetti', 'eggs', 'pancetta', 'parmesan'],
        instructions: ['Cook pasta', 'Mix eggs', 'Combine everything'],
        cookingTime: '20 minutes',
        servings: 4,
        image: 'carbonara.jpg',
      };

      const mockCreatedRecipe = {
        id: 'recipe-123',
        ...inputCreateRecipeDto,
        authorId: inputAuthorId,
      };

      mockPrismaService.recipe.create.mockResolvedValue(mockCreatedRecipe);

      // Act
      const actualResult = await service.createRecipe(
        inputAuthorId,
        inputCreateRecipeDto,
      );

      // Assert
      expect(mockPrismaService.recipe.create).toHaveBeenCalledWith({
        data: {
          ...inputCreateRecipeDto,
          authorId: inputAuthorId,
          isPublished: true,
        },
      });
      expect(actualResult).toEqual({
        id: 'recipe-123',
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta dish',
        ingredients: ['spaghetti', 'eggs', 'pancetta', 'parmesan'],
        instructions: ['Cook pasta', 'Mix eggs', 'Combine everything'],
        cookingTime: '20 minutes',
        servings: 4,
        image: 'carbonara.jpg',
        isPublished: undefined,
        authorId: 'author-123',
        createdAt: undefined,
        updatedAt: undefined,
      });
    });
  });

  describe('findAllRecipes', () => {
    it('should return paginated recipes with default pagination', async () => {
      // Arrange
      const mockRecipes = [
        {
          id: 'recipe-1',
          name: 'Recipe 1',
          description: 'Description 1',
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          cookingTime: '10 minutes',
          servings: 2,
          image: 'recipe1.jpg',
          author: {
            id: 'author-1',
            username: 'chef1',
            firstName: 'John',
            lastName: 'Doe',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.recipe.findMany.mockResolvedValue(mockRecipes);

      // Act
      const actualResult = await service.findAllRecipes();

      // Assert
      expect(mockPrismaService.recipe.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
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
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0]).toEqual(
        expect.objectContaining({
          id: 'recipe-1',
          name: 'Recipe 1',
        }),
      );
    });

    it('should return paginated recipes with custom pagination', async () => {
      // Arrange
      const mockRecipes = [];
      mockPrismaService.recipe.findMany.mockResolvedValue(mockRecipes);

      // Act
      const actualResult = await service.findAllRecipes(2, 5);

      // Assert
      expect(mockPrismaService.recipe.findMany).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
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
      expect(actualResult).toEqual([]);
    });
  });

  describe('findRecipeById', () => {
    it('should find recipe by ID successfully', async () => {
      // Arrange
      const inputId = 'recipe-123';
      const mockRecipe = {
        id: 'recipe-123',
        name: 'Test Recipe',
        description: 'Test description',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        cookingTime: '15 minutes',
        servings: 2,
        image: 'test.jpg',
        author: {
          id: 'author-1',
          username: 'testchef',
          firstName: 'Test',
          lastName: 'Chef',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.recipe.findUnique.mockResolvedValue(mockRecipe);

      // Act
      const actualResult = await service.findRecipeById(inputId);

      // Assert
      expect(mockPrismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
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
      expect(actualResult).toEqual(
        expect.objectContaining({
          id: 'recipe-123',
          name: 'Test Recipe',
        }),
      );
    });

    it('should throw NotFoundException when recipe not found', async () => {
      // Arrange
      const inputId = 'nonexistent-recipe';
      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findRecipeById(inputId)).rejects.toThrow(
        new NotFoundException('Recipe with ID nonexistent-recipe not found'),
      );
    });
  });

  describe('findRecipesByAuthor', () => {
    it('should find recipes by author successfully', async () => {
      // Arrange
      const inputAuthorId = 'author-123';
      const mockRecipes = [
        {
          id: 'recipe-1',
          name: 'Author Recipe',
          description: 'Recipe by author',
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          cookingTime: '20 minutes',
          servings: 4,
          image: 'recipe.jpg',
          authorId: 'author-123',
        },
      ];

      mockPrismaService.recipe.findMany.mockResolvedValue(mockRecipes);

      // Act
      const actualResult = await service.findRecipesByAuthor(inputAuthorId);

      // Assert
      expect(mockPrismaService.recipe.findMany).toHaveBeenCalledWith({
        where: { authorId: 'author-123' },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(actualResult).toHaveLength(1);
      expect(actualResult[0]).toEqual(
        expect.objectContaining({
          id: 'recipe-1',
          name: 'Author Recipe',
        }),
      );
    });
  });

  describe('updateRecipe', () => {
    it('should update recipe successfully', async () => {
      // Arrange
      const inputId = 'recipe-123';
      const inputAuthorId = 'author-123';
      const inputUpdateRecipeDto: UpdateRecipeDto = {
        name: 'Updated Recipe Name',
        description: 'Updated description',
      };

      const mockExistingRecipe = {
        id: 'recipe-123',
        authorId: 'author-123',
        name: 'Original Name',
      };

      const mockUpdatedRecipe = {
        id: 'recipe-123',
        name: 'Updated Recipe Name',
        description: 'Updated description',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        cookingTime: '15 minutes',
        servings: 2,
        image: 'test.jpg',
        authorId: 'author-123',
      };

      mockPrismaService.recipe.findUnique.mockResolvedValue(mockExistingRecipe);
      mockPrismaService.recipe.update.mockResolvedValue(mockUpdatedRecipe);

      // Act
      const actualResult = await service.updateRecipe(
        inputId,
        inputAuthorId,
        inputUpdateRecipeDto,
      );

      // Assert
      expect(mockPrismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
      });
      expect(mockPrismaService.recipe.update).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
        data: inputUpdateRecipeDto,
      });
      expect(actualResult).toEqual(
        expect.objectContaining({
          id: 'recipe-123',
          name: 'Updated Recipe Name',
          description: 'Updated description',
        }),
      );
    });

    it('should throw NotFoundException when recipe not found', async () => {
      // Arrange
      const inputId = 'nonexistent-recipe';
      const inputAuthorId = 'author-123';
      const inputUpdateRecipeDto: UpdateRecipeDto = {
        name: 'Updated Name',
      };

      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.updateRecipe(inputId, inputAuthorId, inputUpdateRecipeDto),
      ).rejects.toThrow(
        new NotFoundException('Recipe with ID nonexistent-recipe not found'),
      );
    });

    it('should throw ForbiddenException when user is not recipe author', async () => {
      // Arrange
      const inputId = 'recipe-123';
      const inputAuthorId = 'different-author';
      const inputUpdateRecipeDto: UpdateRecipeDto = {
        name: 'Updated Name',
      };

      const mockExistingRecipe = {
        id: 'recipe-123',
        authorId: 'original-author',
      };

      mockPrismaService.recipe.findUnique.mockResolvedValue(mockExistingRecipe);

      // Act & Assert
      await expect(
        service.updateRecipe(inputId, inputAuthorId, inputUpdateRecipeDto),
      ).rejects.toThrow(
        new ForbiddenException('You can only update your own recipes'),
      );
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe successfully', async () => {
      // Arrange
      const inputId = 'recipe-123';
      const inputAuthorId = 'author-123';

      const mockExistingRecipe = {
        id: 'recipe-123',
        authorId: 'author-123',
      };

      mockPrismaService.recipe.findUnique.mockResolvedValue(mockExistingRecipe);
      mockPrismaService.recipe.delete.mockResolvedValue({});

      // Act
      await service.deleteRecipe(inputId, inputAuthorId);

      // Assert
      expect(mockPrismaService.recipe.findUnique).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
      });
      expect(mockPrismaService.recipe.delete).toHaveBeenCalledWith({
        where: { id: 'recipe-123' },
      });
    });

    it('should throw NotFoundException when recipe not found', async () => {
      // Arrange
      const inputId = 'nonexistent-recipe';
      const inputAuthorId = 'author-123';

      mockPrismaService.recipe.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.deleteRecipe(inputId, inputAuthorId),
      ).rejects.toThrow(
        new NotFoundException('Recipe with ID nonexistent-recipe not found'),
      );
    });

    it('should throw ForbiddenException when user is not recipe author', async () => {
      // Arrange
      const inputId = 'recipe-123';
      const inputAuthorId = 'different-author';

      const mockExistingRecipe = {
        id: 'recipe-123',
        authorId: 'original-author',
      };

      mockPrismaService.recipe.findUnique.mockResolvedValue(mockExistingRecipe);

      // Act & Assert
      await expect(
        service.deleteRecipe(inputId, inputAuthorId),
      ).rejects.toThrow(
        new ForbiddenException('You can only delete your own recipes'),
      );
    });
  });

  describe('searchRecipes', () => {
    it('should search recipes successfully', async () => {
      // Arrange
      const inputQuery = 'pasta';
      const mockRecipes = [
        {
          id: 'recipe-1',
          name: 'Pasta Recipe',
          description: 'Delicious pasta',
          ingredients: ['pasta'],
          instructions: ['cook pasta'],
          cookingTime: '15 minutes',
          servings: 2,
          image: 'pasta.jpg',
          author: {
            id: 'author-1',
            username: 'chef1',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.recipe.findMany.mockResolvedValue(mockRecipes);

      // Act
      const actualResult = await service.searchRecipes(inputQuery);

      // Assert
      expect(mockPrismaService.recipe.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { isPublished: true },
            {
              OR: [
                { name: { contains: 'pasta', mode: 'insensitive' } },
                { description: { contains: 'pasta', mode: 'insensitive' } },
                { ingredients: { hasSome: ['pasta'] } },
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
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(actualResult).toHaveLength(1);
    });
  });

  describe('getRecipeTest', () => {
    it('should return test message', () => {
      // Act
      const actualResult = service.getRecipeTest();

      // Assert
      expect(actualResult).toEqual({ message: 'Recipe service is working' });
    });
  });
});
