import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ClientProxy, ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from './../src/users.module';
import { CreateUserDto, UpdateUserDto, USERS_PATTERNS } from '@app/shared';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let client: ClientProxy;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        UsersModule,
        ClientsModule.register([
          {
            name: 'USERS_SERVICE',
            transport: Transport.TCP,
            options: {
              port: 3003,
            },
          },
        ]),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    client = app.get('USERS_SERVICE');
    await app.init();
  });

  afterEach(async () => {
    await app.close();
    await client.close();
  });

  describe('User CRUD Operations', () => {
    it('should create a user successfully', (done) => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'e2e-user@example.com',
        username: 'e2euser',
        password: '', // No password for direct user creation
        firstName: 'E2E',
        lastName: 'Test',
        bio: 'E2E test user',
        avatar: 'e2e-avatar.jpg',
      };

      // Act & Assert
      client.send(USERS_PATTERNS.CREATE_USER, inputCreateUserDto).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              email: 'e2e-user@example.com',
              username: 'e2euser',
              firstName: 'E2E',
              lastName: 'Test',
              bio: 'E2E test user',
              avatar: 'e2e-avatar.jpg',
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should reject user creation with password', (done) => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'password-user@example.com',
        username: 'passworduser',
        password: 'should-not-be-allowed',
      };

      // Act & Assert
      client.send(USERS_PATTERNS.CREATE_USER, inputCreateUserDto).subscribe({
        next: () => {
          done(new Error('Should have thrown BadRequestException'));
        },
        error: (error) => {
          expect(error.message).toContain('Password should not be provided');
          done();
        },
      });
    });

    it('should find user by ID', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'findby-id@example.com',
        username: 'findbyid',
        password: '',
        firstName: 'FindBy',
        lastName: 'Id',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: (createdUser) => {
          // Now find by ID
          client
            .send(USERS_PATTERNS.FIND_USER_BY_ID, { id: createdUser.id })
            .subscribe({
              next: (foundUser) => {
                expect(foundUser).toEqual(
                  expect.objectContaining({
                    id: createdUser.id,
                    email: 'findby-id@example.com',
                    username: 'findbyid',
                    firstName: 'FindBy',
                    lastName: 'Id',
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

    it('should find user by email', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'findby-email@example.com',
        username: 'findbyemail',
        password: '',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: () => {
          // Now find by email
          client
            .send(USERS_PATTERNS.FIND_USER_BY_EMAIL, {
              email: 'findby-email@example.com',
            })
            .subscribe({
              next: (foundUser) => {
                expect(foundUser).toEqual(
                  expect.objectContaining({
                    email: 'findby-email@example.com',
                    username: 'findbyemail',
                    isActive: true,
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

    it('should find user by username', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'findby-username@example.com',
        username: 'findbyusername',
        password: '',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: () => {
          // Now find by username
          client
            .send(USERS_PATTERNS.FIND_USER_BY_USERNAME, {
              username: 'findbyusername',
            })
            .subscribe({
              next: (foundUser) => {
                expect(foundUser).toEqual(
                  expect.objectContaining({
                    email: 'findby-username@example.com',
                    username: 'findbyusername',
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

    it('should update user successfully', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'update-test@example.com',
        username: 'updatetest',
        password: '',
        firstName: 'Original',
        lastName: 'Name',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: (createdUser) => {
          // Now update the user
          const updateData = {
            id: createdUser.id,
            updateUserDto: {
              firstName: 'Updated',
              lastName: 'Name',
              bio: 'Updated bio',
            } as UpdateUserDto,
          };

          client.send(USERS_PATTERNS.UPDATE_USER, updateData).subscribe({
            next: (updatedUser) => {
              expect(updatedUser).toEqual(
                expect.objectContaining({
                  id: createdUser.id,
                  firstName: 'Updated',
                  lastName: 'Name',
                  bio: 'Updated bio',
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

    it('should deactivate user successfully', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'deactivate-test@example.com',
        username: 'deactivatetest',
        password: '',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: (createdUser) => {
          // Now deactivate the user
          client
            .send(USERS_PATTERNS.DEACTIVATE_USER, { id: createdUser.id })
            .subscribe({
              next: (response) => {
                expect(response).toBeUndefined(); // Deactivate returns void
                done();
              },
              error: done,
            });
        },
        error: done,
      });
    });
  });

  describe('User Search and Listing', () => {
    beforeEach((done) => {
      // Create test users for search
      const testUsers = [
        {
          email: 'john.doe@example.com',
          username: 'johndoe',
          password: '',
          firstName: 'John',
          lastName: 'Doe',
        },
        {
          email: 'jane.smith@example.com',
          username: 'janesmith',
          password: '',
          firstName: 'Jane',
          lastName: 'Smith',
        },
        {
          email: 'bob.johnson@example.com',
          username: 'bobjohnson',
          password: '',
          firstName: 'Bob',
          lastName: 'Johnson',
        },
      ];

      let usersCreated = 0;
      testUsers.forEach((user) => {
        client.send(USERS_PATTERNS.CREATE_USER, user).subscribe({
          next: () => {
            usersCreated++;
            if (usersCreated === testUsers.length) {
              done();
            }
          },
          error: done,
        });
      });
    });

    it('should find all users with pagination', (done) => {
      // Arrange
      const paginationData = { page: 1, limit: 10 };

      // Act & Assert
      client.send(USERS_PATTERNS.FIND_ALL_USERS, paginationData).subscribe({
        next: (users) => {
          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBeGreaterThan(0);
          expect(users[0]).toEqual(
            expect.objectContaining({
              id: expect.any(String),
              email: expect.any(String),
              username: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should search users by query', (done) => {
      // Arrange
      const searchData = {
        query: 'john',
        page: 1,
        limit: 10,
      };

      // Act & Assert
      client.send(USERS_PATTERNS.SEARCH_USERS, searchData).subscribe({
        next: (users) => {
          expect(Array.isArray(users)).toBe(true);
          expect(users.length).toBeGreaterThan(0);
          const hasJohn = users.some(
            (user) =>
              user.firstName?.toLowerCase().includes('john') ||
              user.lastName?.toLowerCase().includes('john') ||
              user.username?.toLowerCase().includes('john'),
          );
          expect(hasJohn).toBe(true);
          done();
        },
        error: done,
      });
    });

    it('should get user profile with recipes', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'profile-test@example.com',
        username: 'profiletest',
        password: '',
        firstName: 'Profile',
        lastName: 'Test',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: (createdUser) => {
          // Get user profile
          client
            .send(USERS_PATTERNS.GET_USER_PROFILE, { id: createdUser.id })
            .subscribe({
              next: (userProfile) => {
                expect(userProfile).toEqual(
                  expect.objectContaining({
                    id: createdUser.id,
                    email: 'profile-test@example.com',
                    username: 'profiletest',
                    firstName: 'Profile',
                    lastName: 'Test',
                    recipes: expect.any(Array),
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
  });

  describe('Error Handling', () => {
    it('should handle user not found by ID', (done) => {
      // Arrange
      const findData = { id: 'nonexistent-user-id' };

      // Act & Assert
      client.send(USERS_PATTERNS.FIND_USER_BY_ID, findData).subscribe({
        next: () => {
          done(new Error('Should have thrown NotFoundException'));
        },
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        },
      });
    });

    it('should handle user not found by username', (done) => {
      // Arrange
      const findData = { username: 'nonexistentuser' };

      // Act & Assert
      client.send(USERS_PATTERNS.FIND_USER_BY_USERNAME, findData).subscribe({
        next: () => {
          done(new Error('Should have thrown NotFoundException'));
        },
        error: (error) => {
          expect(error.message).toContain('not found');
          done();
        },
      });
    });

    it('should handle duplicate email registration', (done) => {
      // First create a user
      const createUserDto: CreateUserDto = {
        email: 'duplicate@example.com',
        username: 'firstuser',
        password: '',
      };

      client.send(USERS_PATTERNS.CREATE_USER, createUserDto).subscribe({
        next: () => {
          // Try to create another user with same email
          const duplicateUserDto: CreateUserDto = {
            email: 'duplicate@example.com',
            username: 'seconduser',
            password: '',
          };

          client.send(USERS_PATTERNS.CREATE_USER, duplicateUserDto).subscribe({
            next: () => {
              done(new Error('Should have thrown ConflictException'));
            },
            error: (error) => {
              expect(error.message).toContain('Email already exists');
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
      client.send(USERS_PATTERNS.TEST, {}).subscribe({
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
