/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  ChangePasswordDto,
} from '@app/shared';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    changePassword: jest.fn(),
    validateToken: jest.fn(),
    getAuthTest: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedAuthResponse: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
          firstName: 'John',
          lastName: 'Doe',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      mockAuthService.register.mockResolvedValue(expectedAuthResponse);

      // Act
      const actualResult = await controller.register(inputRegisterDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(inputRegisterDto);
      expect(authService.register).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedAuthResponse);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        email: 'existing@example.com',
        username: 'testuser',
        password: 'password123',
      };

      mockAuthService.register.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      // Act & Assert
      await expect(controller.register(inputRegisterDto)).rejects.toThrow(
        ConflictException,
      );
      expect(authService.register).toHaveBeenCalledWith(inputRegisterDto);
    });
  });

  describe('login', () => {
    it('should login user successfully with valid credentials', async () => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedAuthResponse: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
        },
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedAuthResponse);

      // Act
      const actualResult = await controller.login(inputLoginDto);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(inputLoginDto);
      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedAuthResponse);
    });

    it('should throw UnauthorizedException with invalid credentials', async () => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      // Act & Assert
      await expect(controller.login(inputLoginDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(authService.login).toHaveBeenCalledWith(inputLoginDto);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens successfully with valid refresh token', async () => {
      // Arrange
      const inputRefreshTokenDto: RefreshTokenDto = {
        refreshToken: 'valid-refresh-token',
      };

      const expectedAuthResponse: AuthResponse = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          username: 'testuser',
        },
        tokens: {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
        },
      };

      mockAuthService.refreshToken.mockResolvedValue(expectedAuthResponse);

      // Act
      const actualResult = await controller.refreshToken(inputRefreshTokenDto);

      // Assert
      expect(authService.refreshToken).toHaveBeenCalledWith(
        inputRefreshTokenDto,
      );
      expect(authService.refreshToken).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedAuthResponse);
    });

    it('should throw UnauthorizedException with invalid refresh token', async () => {
      // Arrange
      const inputRefreshTokenDto: RefreshTokenDto = {
        refreshToken: 'invalid-refresh-token',
      };

      mockAuthService.refreshToken.mockRejectedValue(
        new UnauthorizedException('Invalid refresh token'),
      );

      // Act & Assert
      await expect(
        controller.refreshToken(inputRefreshTokenDto),
      ).rejects.toThrow(UnauthorizedException);
      expect(authService.refreshToken).toHaveBeenCalledWith(
        inputRefreshTokenDto,
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Arrange
      const inputData = {
        userId: 'user-123',
        refreshToken: 'refresh-token',
      };

      mockAuthService.logout.mockResolvedValue(undefined);

      // Act
      const actualResult = await controller.logout(inputData);

      // Assert
      expect(authService.logout).toHaveBeenCalledWith(
        inputData.userId,
        inputData.refreshToken,
      );
      expect(authService.logout).toHaveBeenCalledTimes(1);
      expect(actualResult).toBeUndefined();
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      // Arrange
      const inputData = {
        userId: 'user-123',
        changePasswordDto: {
          currentPassword: 'oldpassword',
          newPassword: 'newpassword123',
        } as ChangePasswordDto,
      };

      mockAuthService.changePassword.mockResolvedValue(undefined);

      // Act
      const actualResult = await controller.changePassword(inputData);

      // Assert
      expect(authService.changePassword).toHaveBeenCalledWith(
        inputData.userId,
        inputData.changePasswordDto,
      );
      expect(authService.changePassword).toHaveBeenCalledTimes(1);
      expect(actualResult).toBeUndefined();
    });
  });

  describe('validateToken', () => {
    it('should validate token successfully', async () => {
      // Arrange
      const inputData = { token: 'valid-token' };
      const expectedValidationResult = {
        valid: true,
        userId: 'user-123',
        email: 'test@example.com',
      };

      mockAuthService.validateToken.mockResolvedValue(expectedValidationResult);

      // Act
      const actualResult = await controller.validateToken(inputData);

      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith(inputData.token);
      expect(authService.validateToken).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedValidationResult);
    });

    it('should return invalid result for invalid token', async () => {
      // Arrange
      const inputData = { token: 'invalid-token' };
      const expectedValidationResult = { valid: false };

      mockAuthService.validateToken.mockResolvedValue(expectedValidationResult);

      // Act
      const actualResult = await controller.validateToken(inputData);

      // Assert
      expect(authService.validateToken).toHaveBeenCalledWith(inputData.token);
      expect(actualResult).toEqual(expectedValidationResult);
    });
  });

  describe('getAuthTest', () => {
    it('should return test message', () => {
      // Arrange
      const expectedMessage = { message: 'Auth service is working' };
      mockAuthService.getAuthTest.mockReturnValue(expectedMessage);

      // Act
      const actualResult = controller.getAuthTest();

      // Assert
      expect(authService.getAuthTest).toHaveBeenCalledTimes(1);
      expect(actualResult).toEqual(expectedMessage);
    });
  });

  describe('Event Handlers', () => {
    it('should handle user registered event', () => {
      // Arrange
      const inputEventData = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleUserRegistered(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User registered event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });

    it('should handle user logged in event', () => {
      // Arrange
      const inputEventData = {
        userId: 'user-123',
        email: 'test@example.com',
      };
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      // Act
      controller.handleUserLoggedIn(inputEventData);

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        'User logged in event received:',
        inputEventData,
      );

      consoleSpy.mockRestore();
    });
  });
});
