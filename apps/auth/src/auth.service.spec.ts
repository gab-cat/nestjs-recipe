import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '@app/shared';
import { RegisterDto } from '@app/shared';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    authCredential: {
      create: jest.fn(),
      update: jest.fn(),
    },
    authToken: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
        firstName: 'Test',
        lastName: 'User',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.$transaction.mockImplementation((callback: any) => {
        return callback({
          user: {
            create: jest.fn().mockResolvedValue({
              id: 'user-123',
              email: 'test@example.com',
              username: 'testuser',
              firstName: 'Test',
              lastName: 'User',
            }),
          },
          authCredential: {
            create: jest.fn().mockResolvedValue({}),
          },
        });
      });

      // Act
      const result = await service.register(inputRegisterDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123!',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-user',
        email: 'test@example.com',
        username: 'testuser',
      });

      // Act & Assert
      await expect(service.register(inputRegisterDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const inputUserId = 'user-123';
      const inputRefreshToken = 'refresh-token';

      mockPrismaService.authToken.updateMany.mockResolvedValue({ count: 1 });

      // Act
      await service.logout(inputUserId, inputRefreshToken);

      // Assert
      expect(mockPrismaService.authToken.updateMany).toHaveBeenCalledWith({
        where: {
          userId: inputUserId,
          token: inputRefreshToken,
          type: 'REFRESH_TOKEN',
        },
        data: {
          isRevoked: true,
        },
      });
    });
  });

  describe('getAuthTest', () => {
    it('should return test message', () => {
      // Act
      const result = service.getAuthTest();

      // Assert
      expect(result).toEqual({ message: 'Auth service is working' });
    });
  });
});
