/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaService } from '@app/shared';
import { CreateUserDto, UpdateUserDto } from '@app/shared';

describe('UsersService', () => {
  let service: UsersService;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully without password', async () => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: '',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
      };

      const mockCreatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(mockCreatedUser);

      // Act
      const actualResult = await service.createUser(inputCreateUserDto);

      // Assert
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [{ email: 'test@example.com' }, { username: 'testuser' }],
        },
      });
      expect(actualResult).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        bio: 'Test bio',
        avatar: 'avatar.jpg',
        isActive: true,
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: '',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        email: 'existing@example.com',
        username: 'differentuser',
      });

      // Act & Assert
      await expect(service.createUser(inputCreateUserDto)).rejects.toThrow(
        new ConflictException('Email already exists'),
      );
    });

    it('should throw BadRequestException when password is provided', async () => {
      // Arrange
      const inputCreateUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      // Act & Assert
      await expect(service.createUser(inputCreateUserDto)).rejects.toThrow(
        new BadRequestException(
          'Password should not be provided when creating user directly. Use auth service for registration.',
        ),
      );
    });
  });

  describe('findAllUsers', () => {
    it('should return paginated users with default pagination', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user-1',
          email: 'user1@example.com',
          username: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          email: 'user2@example.com',
          username: 'user2',
          firstName: 'Jane',
          lastName: 'Smith',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const actualResult = await service.findAllUsers();

      // Assert
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          isActive: true,
        },
        skip: 0,
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
      });
      expect(actualResult).toHaveLength(2);
      expect(actualResult[0]).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'user1@example.com',
        }),
      );
    });
  });

  describe('findUserById', () => {
    it('should find user by ID successfully', async () => {
      // Arrange
      const inputId = 'user-123';
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const actualResult = await service.findUserById(inputId);

      // Assert
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(actualResult).toEqual(
        expect.objectContaining({
          id: 'user-123',
          email: 'test@example.com',
        }),
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const inputId = 'nonexistent-user';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findUserById(inputId)).rejects.toThrow(
        new NotFoundException('User with ID nonexistent-user not found'),
      );
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      // Arrange
      const inputId = 'user-123';
      const inputUpdateUserDto: UpdateUserDto = {
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        bio: 'Updated bio',
      };

      const mockExistingUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      const mockUpdatedUser = {
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Updated John',
        lastName: 'Updated Doe',
        bio: 'Updated bio',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockExistingUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      // Act
      const actualResult = await service.updateUser(
        inputId,
        inputUpdateUserDto,
      );

      // Assert
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: inputUpdateUserDto,
      });
      expect(actualResult).toEqual(
        expect.objectContaining({
          firstName: 'Updated John',
          lastName: 'Updated Doe',
          bio: 'Updated bio',
        }),
      );
    });
  });

  describe('searchUsers', () => {
    it('should search users successfully', async () => {
      // Arrange
      const inputQuery = 'john';
      const mockUsers = [
        {
          id: 'user-1',
          email: 'john@example.com',
          username: 'johnsmith',
          firstName: 'John',
          lastName: 'Smith',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);

      // Act
      const actualResult = await service.searchUsers(inputQuery);

      // Assert
      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { username: { contains: 'john', mode: 'insensitive' } },
                { firstName: { contains: 'john', mode: 'insensitive' } },
                { lastName: { contains: 'john', mode: 'insensitive' } },
              ],
            },
          ],
        },
        skip: 0,
        take: 10,
        orderBy: {
          username: 'asc',
        },
      });
      expect(actualResult).toHaveLength(1);
    });
  });

  describe('getUserTest', () => {
    it('should return test message', () => {
      // Act
      const actualResult = service.getUserTest();

      // Assert
      expect(actualResult).toEqual({ message: 'Users service is working' });
    });
  });
});
