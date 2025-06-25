/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RecipeController } from './recipe.controller';
import { RecipeService } from './recipe.service';
import { MicroserviceAuthGuard } from '@app/shared';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
  Recipe,
  RecipeWithAuthor,
} from '@app/shared';

describe('RecipeController', () => {
  let controller: RecipeController;
  let recipeService: RecipeService;

  const mockRecipeService = {
    createRecipe: jest.fn(),
    findAllRecipes: jest.fn(),
    searchRecipes: jest.fn(),
    findRecipesByAuthor: jest.fn(),
    findRecipeById: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
    getRecipeTest: jest.fn(),
  };

  const mockMicroserviceAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipeController],
      providers: [
        {
          provide: RecipeService,
          useValue: mockRecipeService,
        },
      ],
    })
      .overrideGuard(MicroserviceAuthGuard)
      .useValue(mockMicroserviceAuthGuard)
      .compile();

    controller = module.get<RecipeController>(RecipeController);
    recipeService = module.get<RecipeService>(RecipeService);

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

      const expectedRecipe: Recipe = {
        id: 'recipe-123',
        ...inputCreateRecipeDto,
        isPublished: true,
        authorId: inputAuthorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRecipeService.createRecipe.mockResolvedValue(expectedRecipe);

      // Act
      const actualResult = await controller.createRecipe({
        authorId: inputAuthorId,
        createRecipeDto: inputCreateRecipeDto,
      });

      // Assert
      expect(recipeService.createRecipe).toHaveBeenCalledWith(
        inputAuthorId,
        inputCreateRecipeDto,
      );
      expect(recipeService.createRecipe).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedRecipe);
    });
  });

  describe('findAllRecipes', () => {
    it('should return paginated recipes with default pagination', async () => {
      // Arrange
      const inputData = {};
      const expectedRecipes: RecipeWithAuthor[] = [
        {
          id: 'recipe-1',
          name: 'Recipe 1',
          description: 'Description 1',
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          cookingTime: '10 minutes',
          servings: 2,
          image: 'recipe1.jpg',
          isPublished: true,
          authorId: 'author-1',
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

      mockRecipeService.findAllRecipes.mockResolvedValue(expectedRecipes);

      // Act
      const actualResult = await controller.findAllRecipes(inputData);

      // Assert
      expect(recipeService.findAllRecipes).toHaveBeenCalledWith(1, 10);
      expect(recipeService.findAllRecipes).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedRecipes);
    });

    it('should return paginated recipes with custom pagination', async () => {
      // Arrange
      const inputData = { page: 2, limit: 5 };
      const expectedRecipes: RecipeWithAuthor[] = [];

      mockRecipeService.findAllRecipes.mockResolvedValue(expectedRecipes);

      // Act
      const actualResult = await controller.findAllRecipes(inputData);

      // Assert
      expect(recipeService.findAllRecipes).toHaveBeenCalledWith(2, 5);
      expect(actualResult).toEqual(expectedRecipes);
    });
  });

  describe('searchRecipes', () => {
    it('should search recipes successfully', async () => {
      // Arrange
      const inputData = {
        query: 'pasta',
        page: 1,
        limit: 10,
      };
      const expectedRecipes: RecipeWithAuthor[] = [
        {
          id: 'recipe-1',
          name: 'Pasta Recipe',
          description: 'Delicious pasta',
          ingredients: ['pasta'],
          instructions: ['cook pasta'],
          cookingTime: '15 minutes',
          servings: 2,
          image: 'pasta.jpg',
          isPublished: true,
          authorId: 'author-1',
          author: {
            id: 'author-1',
            username: 'chef1',
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecipeService.searchRecipes.mockResolvedValue(expectedRecipes);

      // Act
      const actualResult = await controller.searchRecipes(inputData);

      // Assert
      expect(recipeService.searchRecipes).toHaveBeenCalledWith('pasta', 1, 10);
      expect(recipeService.searchRecipes).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedRecipes);
    });
  });

  describe('findRecipesByAuthor', () => {
    it('should find recipes by author successfully', async () => {
      // Arrange
      const inputData = {
        authorId: 'author-123',
        page: 1,
        limit: 10,
      };
      const expectedRecipes: Recipe[] = [
        {
          id: 'recipe-1',
          name: 'Author Recipe',
          description: 'Recipe by author',
          ingredients: ['ingredient1'],
          instructions: ['step1'],
          cookingTime: '20 minutes',
          servings: 4,
          image: 'recipe.jpg',
          isPublished: true,
          authorId: 'author-123',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockRecipeService.findRecipesByAuthor.mockResolvedValue(expectedRecipes);

      // Act
      const actualResult = await controller.findRecipesByAuthor(inputData);

      // Assert
      expect(recipeService.findRecipesByAuthor).toHaveBeenCalledWith(
        'author-123',
        1,
        10,
      );
      expect(recipeService.findRecipesByAuthor).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedRecipes);
    });
  });

  describe('findRecipeById', () => {
    it('should find recipe by ID successfully', async () => {
      // Arrange
      const inputData = { id: 'recipe-123' };
      const expectedRecipe: RecipeWithAuthor = {
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
        isPublished: true,
        authorId: 'author-1',
      };

      mockRecipeService.findRecipeById.mockResolvedValue(expectedRecipe);

      // Act
      const actualResult = await controller.findRecipeById(inputData);

      // Assert
      expect(recipeService.findRecipeById).toHaveBeenCalledWith('recipe-123');
      expect(recipeService.findRecipeById).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedRecipe);
    });

    it('should throw NotFoundException when recipe not found', async () => {
      // Arrange
      const inputData = { id: 'nonexistent-recipe' };

      mockRecipeService.findRecipeById.mockRejectedValue(
        new NotFoundException('Recipe with ID nonexistent-recipe not found'),
      );

      // Act & Assert
      await expect(controller.findRecipeById(inputData)).rejects.toThrow(
        NotFoundException,
      );
      expect(recipeService.findRecipeById).toHaveBeenCalledWith(
        'nonexistent-recipe',
      );
    });
  });

  describe('updateRecipe', () => {
    it('should update recipe successfully', async () => {
      // Arrange
      const inputData = {
        id: 'recipe-123',
        authorId: 'author-123',
        updateRecipeDto: {
          name: 'Updated Recipe Name',
          description: 'Updated description',
        } as UpdateRecipeDto,
      };

      const expectedUpdatedRecipe: Recipe = {
        id: 'recipe-123',
        name: 'Updated Recipe Name',
        description: 'Updated description',
        ingredients: ['ingredient1'],
        instructions: ['step1'],
        cookingTime: '15 minutes',
        servings: 2,
        image: 'test.jpg',
        isPublished: true,
        authorId: 'author-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRecipeService.updateRecipe.mockResolvedValue(expectedUpdatedRecipe);

      // Act
      const actualResult = await controller.updateRecipe(inputData);

      // Assert
      expect(recipeService.updateRecipe).toHaveBeenCalledWith(
        'recipe-123',
        'author-123',
        inputData.updateRecipeDto,
      );
      expect(recipeService.updateRecipe).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUpdatedRecipe);
    });

    it('should throw ForbiddenException when user is not recipe author', async () => {
      // Arrange
      const inputData = {
        id: 'recipe-123',
        authorId: 'different-author',
        updateRecipeDto: {
          name: 'Updated Recipe Name',
        } as UpdateRecipeDto,
      };

      mockRecipeService.updateRecipe.mockRejectedValue(
        new ForbiddenException('You can only update your own recipes'),
      );

      // Act & Assert
      await expect(controller.updateRecipe(inputData)).rejects.toThrow(
        ForbiddenException,
      );
      expect(recipeService.updateRecipe).toHaveBeenCalledWith(
        'recipe-123',
        'different-author',
        inputData.updateRecipeDto,
      );
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe successfully', async () => {
      // Arrange
      const inputData = {
        id: 'recipe-123',
        authorId: 'author-123',
      };

      mockRecipeService.deleteRecipe.mockResolvedValue(undefined);

      // Act
      const actualResult = await controller.deleteRecipe(inputData);

      // Assert
      expect(recipeService.deleteRecipe).toHaveBeenCalledWith(
        'recipe-123',
        'author-123',
      );
      expect(recipeService.deleteRecipe).toHaveBeenCalledTimes(1);
      expect(actualResult).toBeUndefined();
    });

    it('should throw ForbiddenException when user is not recipe author', async () => {
      // Arrange
      const inputData = {
        id: 'recipe-123',
        authorId: 'different-author',
      };

      mockRecipeService.deleteRecipe.mockRejectedValue(
        new ForbiddenException('You can only delete your own recipes'),
      );

      // Act & Assert
      await expect(controller.deleteRecipe(inputData)).rejects.toThrow(
        ForbiddenException,
      );
      expect(recipeService.deleteRecipe).toHaveBeenCalledWith(
        'recipe-123',
        'different-author',
      );
    });
  });

  describe('getRecipeTest', () => {
    it('should return test message', () => {
      // Arrange
      const expectedMessage = { message: 'Recipe service is working' };
      mockRecipeService.getRecipeTest.mockReturnValue(expectedMessage);

      // Act
      const actualResult = controller.getRecipeTest();

      // Assert
      expect(recipeService.getRecipeTest).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedMessage);
    });
  });

  describe('Event Handlers', () => {
    it('should handle recipe created event', () => {
      // Arrange
      const inputEventData = {
        recipeId: 'recipe-123',
        authorId: 'author-123',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleRecipeCreated(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Recipe created event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });

    it('should handle recipe updated event', () => {
      // Arrange
      const inputEventData = {
        recipeId: 'recipe-123',
        authorId: 'author-123',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleRecipeUpdated(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Recipe updated event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });

    it('should handle recipe deleted event', () => {
      // Arrange
      const inputEventData = {
        recipeId: 'recipe-123',
        authorId: 'author-123',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleRecipeDeleted(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'Recipe deleted event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });
  });
});
