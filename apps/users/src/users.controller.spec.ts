/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MicroserviceAuthGuard } from '@app/shared';
import {
  CreateUserDto,
  UpdateUserDto,
  SafeUser,
  UserWithRecipes,
} from '@app/shared';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    createUser: jest.fn(),
    findAllUsers: jest.fn(),
    searchUsers: jest.fn(),
    findUserById: jest.fn(),
    findUserByEmail: jest.fn(),
    findUserByUsername: jest.fn(),
    getUserProfile: jest.fn(),
    updateUser: jest.fn(),
    deactivateUser: jest.fn(),
    getUserTest: jest.fn(),
  };

  const mockMicroserviceAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    })
      .overrideGuard(MicroserviceAuthGuard)
      .useValue(mockMicroserviceAuthGuard)
      .compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
      };

      const expectedSafeUser: SafeUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.createUser.mockResolvedValue(expectedSafeUser);

      // Act
      const actualResult = await controller.createUser(inputCreateUserDto);

      // Assert
      expect(usersService.createUser).toHaveBeenCalledWith(inputCreateUserDto);
      expect(usersService.createUser).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedSafeUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
      };

      mockUsersService.createUser.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      // Act & Assert
      await expect(controller.createUser(inputCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(usersService.createUser).toHaveBeenCalledWith(inputCreateUserDto);
    });

    it('should throw BadRequestException when password is provided', async () => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      mockUsersService.createUser.mockRejectedValue(
        new BadRequestException(
          'Password should not be provided when creating user directly. Use auth service for registration.',
        ),
      );

      // Act & Assert
      await expect(controller.createUser(inputCreateUserDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return paginated users with default pagination', async () => {
      // Arrange
      const inputData = {};
      const expectedUsers: SafeUser[] = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          username: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          username: 'user2',
          firstName: 'Jane',
          lastName: 'Smith',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.findAllUsers.mockResolvedValue(expectedUsers);

      // Act
      const actualResult = await controller.findAllUsers(inputData);

      // Assert
      expect(usersService.findAllUsers).toHaveBeenCalledWith(1, 10);
      expect(usersService.findAllUsers).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUsers);
    });

    it('should return paginated users with custom pagination', async () => {
      // Arrange
      const inputData = { page: 2, limit: 5 };
      const expectedUsers: SafeUser[] = [];

      mockUsersService.findAllUsers.mockResolvedValue(expectedUsers);

      // Act
      const actualResult = await controller.findAllUsers(inputData);

      // Assert
      expect(usersService.findAllUsers).toHaveBeenCalledWith(2, 5);
      expect(actualResult).toEqual(expectedUsers);
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      // Arrange
      const inputData = {
        query: 'john',
        page: 1,
        limit: 10,
      };
      const expectedUsers: SafeUser[] = [
        {
          id: 'user-1',
          email: 'john@example.com',
          username: 'johnsmith',
          firstName: 'John',
          lastName: 'Smith',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUsersService.searchUsers.mockResolvedValue(expectedUsers);

      // Act
      const actualResult = await controller.searchUsers(inputData);

      // Assert
      expect(usersService.searchUsers).toHaveBeenCalledWith('john', 1, 10);
      expect(usersService.searchUsers).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUsers);
    });
  });

  describe('findUserById', () => {
    it('should find user by ID successfully', async () => {
      // Arrange
      const inputData = { id: 'user-123' };
      const expectedUser: SafeUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserById.mockResolvedValue(expectedUser);

      // Act
      const actualResult = await controller.findUserById(inputData);

      // Assert
      expect(usersService.findUserById).toHaveBeenCalledWith('user-123');
      expect(usersService.findUserById).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const inputData = { id: 'nonexistent-user' };

      mockUsersService.findUserById.mockRejectedValue(
        new NotFoundException('User with ID nonexistent-user not found'),
      );

      // Act & Assert
      await expect(controller.findUserById(inputData)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findUserById).toHaveBeenCalledWith(
        'nonexistent-user',
      );
    });
  });

  describe('findUserByEmail', () => {
    it('should find user by email successfully', async () => {
      // Arrange
      const inputData = { email: 'test@example.com' };
      const expectedUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserByEmail.mockResolvedValue(expectedUser);

      // Act
      const actualResult = await controller.findUserByEmail(inputData);

      // Assert
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(usersService.findUserByEmail).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      const inputData = { email: 'nonexistent@example.com' };

      mockUsersService.findUserByEmail.mockResolvedValue(null);

      // Act
      const actualResult = await controller.findUserByEmail(inputData);

      // Assert
      expect(usersService.findUserByEmail).toHaveBeenCalledWith(
        'nonexistent@example.com',
      );
      expect(actualResult).toBeNull();
    });
  });

  describe('findUserByUsername', () => {
    it('should find user by username successfully', async () => {
      // Arrange
      const inputData = { username: 'testuser' };
      const expectedUser: SafeUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.findUserByUsername.mockResolvedValue(expectedUser);

      // Act
      const actualResult = await controller.findUserByUsername(inputData);

      // Assert
      expect(usersService.findUserByUsername).toHaveBeenCalledWith('testuser');
      expect(usersService.findUserByUsername).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const inputData = { username: 'nonexistentuser' };

      mockUsersService.findUserByUsername.mockRejectedValue(
        new NotFoundException('User with username nonexistentuser not found'),
      );

      // Act & Assert
      await expect(controller.findUserByUsername(inputData)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.findUserByUsername).toHaveBeenCalledWith(
        'nonexistentuser',
      );
    });
  });

  describe('getUserProfile', () => {
    it('should get user profile successfully', async () => {
      // Arrange
      const inputData = { id: 'user-123' };
      const expectedUserProfile: UserWithRecipes = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        createdAt: new Date(),
        updatedAt: new Date(),
        recipes: [
          {
            id: 'recipe-1',
            name: 'Test Recipe',
            image: 'recipe.jpg',
            createdAt: new Date(),
          },
        ],
      };

      mockUsersService.getUserProfile.mockResolvedValue(expectedUserProfile);

      // Act
      const actualResult = await controller.getUserProfile(inputData);

      // Assert
      expect(usersService.getUserProfile).toHaveBeenCalledWith('user-123');
      expect(usersService.getUserProfile).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUserProfile);
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const inputData = {
        id: 'user-123',
        updateUserDto: {
          firstName: 'Updated John',
          lastName: 'Updated Doe',
          bio: 'Updated bio',
        } as UpdateUserDto,
      };

      const expectedUpdatedUser: SafeUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        bio: 'Updated bio',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.updateUser.mockResolvedValue(expectedUpdatedUser);

      // Act
      const actualResult = await controller.updateUser(inputData);

      // Assert
      expect(usersService.updateUser).toHaveBeenCalledWith(
        'user-123',
        inputData.updateUserDto,
      );
      expect(usersService.updateUser).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedUpdatedUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const inputData = {
        id: 'nonexistent-user',
        updateUserDto: {
          firstName: 'Updated Name',
        } as UpdateUserDto,
      };

      mockUsersService.updateUser.mockRejectedValue(
        new NotFoundException('User with ID nonexistent-user not found'),
      );

      // Act & Assert
      await expect(controller.updateUser(inputData)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.updateUser).toHaveBeenCalledWith(
        'nonexistent-user',
        inputData.updateUserDto,
      );
    });
  });

  describe('deactivateUser', () => {
    it('should deactivate user successfully', async () => {
      // Arrange
      const inputData = { id: 'user-123' };

      mockUsersService.deactivateUser.mockResolvedValue(undefined);

      // Act
      const actualResult = await controller.deactivateUser(inputData);

      // Assert
      expect(usersService.deactivateUser).toHaveBeenCalledWith('user-123');
      expect(usersService.deactivateUser).toHaveBeenCalledTimes(1);
      expect(actualResult).toBeUndefined();
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const inputData = { id: 'nonexistent-user' };

      mockUsersService.deactivateUser.mockRejectedValue(
        new NotFoundException('User with ID nonexistent-user not found'),
      );

      // Act & Assert
      await expect(controller.deactivateUser(inputData)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.deactivateUser).toHaveBeenCalledWith(
        'nonexistent-user',
      );
    });
  });

  describe('getUserTest', () => {
    it('should return test message', () => {
      // Arrange
      const expectedMessage = { message: 'Users service is working' };
      mockUsersService.getUserTest.mockReturnValue(expectedMessage);

      // Act
      const actualResult = controller.getUserTest();

      // Assert
      expect(usersService.getUserTest).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedMessage);
    });
  });

  describe('Event Handlers', () => {
    it('should handle user created event', () => {
      // Arrange
      const inputEventData = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleUserCreated(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User created event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });

    it('should handle user updated event', () => {
      // Arrange
      const inputEventData = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleUserUpdated(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User updated event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });

    it('should handle user deactivated event', () => {
      // Arrange
      const inputEventData = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleUserDeactivated(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User deactivated event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });
  });
});
