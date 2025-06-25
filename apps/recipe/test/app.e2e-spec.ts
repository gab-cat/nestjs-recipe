import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { RecipeModule } from './../src/recipe.module';
import { CreateRecipeDto, UpdateRecipeDto, RECIPE_PATTERNS } from '@app/shared';

describe('RecipeController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        RecipeModule,
        ClientsModule.register([
          {
            name: 'RECIPE_SERVICE',
            transport: Transport.TCP,
            options: {
              port: 3002,
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    client = app.get('RECIPE_SERVICE');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await client.close();
  });

  describe('Recipe CRUD Operations', () => {
    let createdRecipeId: string;
    const authorId = 'test-author-123';

    it('should create a recipe successfully', (done) => {
      // Arrange
      const inputCreateRecipeDto: CreateRecipeDto = {
        name: 'E2E Test Recipe',
        description: 'A recipe created during E2E testing',
        ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
        instructions: ['step1', 'step2', 'step3'],
        cookingTime: '30 minutes',
        servings: 4,
        image: 'test-recipe.jpg',
      };

      const createData = {
        authorId,
        createRecipeDto: inputCreateRecipeDto,
      };

      // Act & Assert
      client.send(RECIPE_PATTERNS.CREATE_RECIPE, createData).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: 'E2E Test Recipe',
              description: 'A recipe created during E2E testing',
              ingredients: ['ingredient1', 'ingredient2', 'ingredient3'],
              instructions: ['step1', 'step2', 'step3'],
              cookingTime: '30 minutes',
              servings: 4,
              image: 'test-recipe.jpg',
            }),
          );
          createdRecipeId = response.id;
          done();
        },
        error: done,
      });
    });

    it('should find recipe by ID', (done) => {
      // First create a recipe
      const createData = {
        authorId,
        createRecipeDto: {
          name: 'Find by ID Recipe',
          ingredients: ['test'],
          instructions: ['test'],
          cookingTime: '10 minutes',
          servings: 1,
          image: 'test.jpg',
        } as CreateRecipeDto,
      };

      client.send(RECIPE_PATTERNS.CREATE_RECIPE, createData).subscribe({
        next: (createdRecipe) => {
          // Now find it by ID
          client
            .send(RECIPE_PATTERNS.FIND_RECIPE_BY_ID, { id: createdRecipe.id })
            .subscribe({
              next: (foundRecipe) => {
                expect(foundRecipe).toEqual(
                  expect.objectContaining({
                    id: createdRecipe.id,
                    name: 'Find by ID Recipe',
                    author: expect.objectContaining({
                      id: expect.any(String),
                      username: expect.any(String),
                    }),
                  }),
                );
                done();
              },
              error: done,
            });
        },
        error: done,
      });
    });

    it('should update recipe successfully', (done) => {
      // First create a recipe
      const createData = {
        authorId,
        createRecipeDto: {
          name: 'Original Recipe Name',
          ingredients: ['original'],
          instructions: ['original'],
          cookingTime: '15 minutes',
          servings: 2,
          image: 'original.jpg',
        } as CreateRecipeDto,
      };

      client.send(RECIPE_PATTERNS.CREATE_RECIPE, createData).subscribe({
        next: (createdRecipe) => {
          // Now update it
          const updateData = {
            id: createdRecipe.id,
            authorId,
            updateRecipeDto: {
              name: 'Updated Recipe Name',
              description: 'Updated description',
            } as UpdateRecipeDto,
          };

          client.send(RECIPE_PATTERNS.UPDATE_RECIPE, updateData).subscribe({
            next: (updatedRecipe) => {
              expect(updatedRecipe).toEqual(
                expect.objectContaining({
                  id: createdRecipe.id,
                  name: 'Updated Recipe Name',
                  description: 'Updated description',
                }),
              );
              done();
            },
            error: done,
          });
        },
        error: done,
      });
    });

    it('should delete recipe successfully', (done) => {
      // First create a recipe
      const createData = {
        authorId,
        createRecipeDto: {
          name: 'Recipe to Delete',
          ingredients: ['test'],
          instructions: ['test'],
          cookingTime: '5 minutes',
          servings: 1,
          image: 'delete.jpg',
        } as CreateRecipeDto,
      };

      client.send(RECIPE_PATTERNS.CREATE_RECIPE, createData).subscribe({
        next: (createdRecipe) => {
          // Now delete it
          const deleteData = {
            id: createdRecipe.id,
            authorId,
          };

          client.send(RECIPE_PATTERNS.DELETE_RECIPE, deleteData).subscribe({
            next: (response) => {
              expect(response).toBeUndefined(); // Delete returns void
              done();
            },
            error: done,
          });
        },
        error: done,
      });
    });
  });

  describe('Recipe Search and Filtering', () => {
    const authorId = 'search-author-123';

    beforeEach((done) => {
      // Create test recipes for search
      const testRecipes = [
        {
          name: 'Pasta Carbonara',
          description: 'Classic Italian pasta',
          ingredients: ['pasta', 'eggs', 'cheese'],
          instructions: ['cook pasta', 'mix ingredients'],
          cookingTime: '20 minutes',
          servings: 4,
          image: 'carbonara.jpg',
        },
        {
          name: 'Chicken Curry',
          description: 'Spicy Indian curry',
          ingredients: ['chicken', 'curry powder', 'coconut milk'],
          instructions: ['cook chicken', 'add spices'],
          cookingTime: '45 minutes',
          servings: 6,
          image: 'curry.jpg',
        },
      ];

      let recipesCreated = 0;
      testRecipes.forEach((recipe) => {
        client
          .send(RECIPE_PATTERNS.CREATE_RECIPE, {
            authorId,
            createRecipeDto: recipe,
          })
          .subscribe({
            next: () => {
              recipesCreated++;
              if (recipesCreated === testRecipes.length) {
                done();
              }
            },
            error: done,
          });
      });
    });

    it('should find all recipes with pagination', (done) => {
      // Arrange
      const paginationData = { page: 1, limit: 10 };

      // Act & Assert
      client.send(RECIPE_PATTERNS.FIND_ALL_RECIPES, paginationData).subscribe({
        next: (recipes) => {
          expect(Array.isArray(recipes)).toBe(true);
          expect(recipes.length).toBeGreaterThan(0);
          expect(recipes[0]).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              name: expect.any(String),
              author: expect.objectContaining({
                id: expect.any(String),
                username: expect.any(String),
              }),
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should search recipes by query', (done) => {
      // Arrange
      const searchData = {
        query: 'pasta',
        page: 1,
        limit: 10,
      };

      // Act & Assert
      client.send(RECIPE_PATTERNS.SEARCH_RECIPES, searchData).subscribe({
        next: (recipes) => {
          expect(Array.isArray(recipes)).toBe(true);
          expect(recipes.length).toBeGreaterThan(0);
          expect(recipes[0].name.toLowerCase()).toContain('pasta');
          done();
        },
        error: done,
      });
    });

    it('should find recipes by author', (done) => {
      // Arrange
      const findByAuthorData = {
        authorId,
        page: 1,
        limit: 10,
      };

      // Act & Assert
      client
        .send(RECIPE_PATTERNS.FIND_RECIPES_BY_AUTHOR, findByAuthorData)
        .subscribe({
          next: (recipes) => {
            expect(Array.isArray(recipes)).toBe(true);
            expect(recipes.length).toBeGreaterThanOrEqual(2); // We created 2 recipes
            done();
          },
          error: done,
        });
    });
  });

  describe('Error Handling', () => {
    it('should handle recipe not found', (done) => {
      // Arrange
      const findData = { id: 'nonexistent-recipe-id' };

      // Act & Assert
      client.send(RECIPE_PATTERNS.FIND_RECIPE_BY_ID, findData).subscribe({
        next: () => {
          done(new Error('Should have thrown NotFoundException'));
        },
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        },
      });
    });

    it('should prevent unauthorized recipe update', (done) => {
      // First create a recipe with one author
      const createData = {
        authorId: 'original-author',
        createRecipeDto: {
          name: 'Protected Recipe',
          ingredients: ['test'],
          instructions: ['test'],
          cookingTime: '10 minutes',
          servings: 1,
          image: 'protected.jpg',
        } as CreateRecipeDto,
      };

      client.send(RECIPE_PATTERNS.CREATE_RECIPE, createData).subscribe({
        next: (createdRecipe) => {
          // Try to update with different author
          const updateData = {
            id: createdRecipe.id,
            authorId: 'different-author',
            updateRecipeDto: {
              name: 'Hacked Recipe',
            } as UpdateRecipeDto,
          };

          client.send(RECIPE_PATTERNS.UPDATE_RECIPE, updateData).subscribe({
            next: () => {
              done(new Error('Should have thrown ForbiddenException'));
            },
            error: (error) => {
              expect(error.message).toContain('own recipes');
              done();
            },
          });
        },
        error: done,
      });
    });
  });

  describe('Health Check', () => {
    it('should return test message', (done) => {
      // Act & Assert
      client.send(RECIPE_PATTERNS.TEST, {}).subscribe({
        next: (response) => {
          expect(response).toEqual(
            expect.objectContaining({
              message: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });
  });
});
