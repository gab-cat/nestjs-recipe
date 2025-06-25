import { Test, TestingModule } from '@nestjs/testing';
import { INestMicroservice } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';
import { AuthModule } from './../src/auth.module';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ChangePasswordDto,
  AUTH_PATTERNS,
} from '@app/shared';

describe('AuthController (e2e)', () => {
  let app: INestMicroservice;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    }).compile();

    app = moduleFixture.createNestMicroservice({
      transport: Transport.TCP,
      options: {
        port: 3001,
      },
    });

    await app.listen();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('Registration Flow', () => {
    it('should register a new user successfully', (done) => {
      // Arrange
      const inputRegisterDto: RegisterDto = {
        email: 'e2e-test@example.com',
        username: 'e2etestuser',
        password: 'password123',
        firstName: 'E2E',
        lastName: 'Test',
      };

      // Act & Assert
      app.send(AUTH_PATTERNS.REGISTER, inputRegisterDto).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.user).toEqual(
            expect.objectContaining({
              email: 'e2e-test@example.com',
              username: 'e2etestuser',
              firstName: 'E2E',
              lastName: 'Test',
            }),
          );
          expect(response.tokens).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should reject registration with duplicate email', (done) => {
      // Arrange - First register a user
      const inputRegisterDto: RegisterDto = {
        email: 'duplicate@example.com',
        username: 'firstuser',
        password: 'password123',
      };

      app.send(AUTH_PATTERNS.REGISTER, inputRegisterDto).subscribe({
        next: () => {
          // Now try to register with same email but different username
          const duplicateEmailDto: RegisterDto = {
            email: 'duplicate@example.com',
            username: 'seconduser',
            password: 'password123',
          };

          app.send(AUTH_PATTERNS.REGISTER, duplicateEmailDto).subscribe({
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

  describe('Authentication Flow', () => {
    let registeredUser: {
      email: string;
      password: string;
      tokens: { accessToken: string; refreshToken: string };
    };

    beforeEach((done) => {
      // Register a user for authentication tests
      const registerDto: RegisterDto = {
        email: 'auth-test@example.com',
        username: 'authtest',
        password: 'password123',
      };

      app.send(AUTH_PATTERNS.REGISTER, registerDto).subscribe({
        next: (response) => {
          registeredUser = {
            email: registerDto.email,
            password: registerDto.password,
            tokens: response.tokens,
          };
          done();
        },
        error: done,
      });
    });

    it('should login with valid credentials', (done) => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: registeredUser.email,
        password: registeredUser.password,
      };

      // Act & Assert
      app.send(AUTH_PATTERNS.LOGIN, inputLoginDto).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.user).toEqual(
            expect.objectContaining({
              email: registeredUser.email,
            }),
          );
          expect(response.tokens).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should reject login with invalid credentials', (done) => {
      // Arrange
      const inputLoginDto: LoginDto = {
        email: registeredUser.email,
        password: 'wrongpassword',
      };

      // Act & Assert
      app.send(AUTH_PATTERNS.LOGIN, inputLoginDto).subscribe({
        next: () => {
          done(new Error('Should have thrown UnauthorizedException'));
        },
        error: (error) => {
          expect(error.message).toContain('Invalid credentials');
          done();
        },
      });
    });

    it('should refresh tokens with valid refresh token', (done) => {
      // Arrange
      const inputRefreshTokenDto: RefreshTokenDto = {
        refreshToken: registeredUser.tokens.refreshToken,
      };

      // Act & Assert
      app.send(AUTH_PATTERNS.REFRESH_TOKEN, inputRefreshTokenDto).subscribe({
        next: (response) => {
          expect(response).toBeDefined();
          expect(response.tokens).toEqual(
            expect.objectContaining({
              accessToken: expect.any(String),
              refreshToken: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });
  });

  describe('Password Management', () => {
    let authenticatedUser: {
      userId: string;
      currentPassword: string;
      tokens: { refreshToken: string };
    };

    beforeEach((done) => {
      // Register and setup user for password tests
      const registerDto: RegisterDto = {
        email: 'password-test@example.com',
        username: 'passwordtest',
        password: 'oldpassword123',
      };

      app.send(AUTH_PATTERNS.REGISTER, registerDto).subscribe({
        next: (response) => {
          authenticatedUser = {
            userId: response.user.id,
            currentPassword: registerDto.password,
            tokens: response.tokens,
          };
          done();
        },
        error: done,
      });
    });

    it('should change password successfully', (done) => {
      // Arrange
      const inputChangePasswordDto: ChangePasswordDto = {
        currentPassword: authenticatedUser.currentPassword,
        newPassword: 'newpassword123',
      };

      const changePasswordData = {
        userId: authenticatedUser.userId,
        changePasswordDto: inputChangePasswordDto,
      };

      // Act & Assert
      app.send(AUTH_PATTERNS.CHANGE_PASSWORD, changePasswordData).subscribe({
        next: (response) => {
          expect(response).toBeUndefined(); // Change password returns void
          done();
        },
        error: done,
      });
    });
  });

  describe('Token Validation', () => {
    let validToken: string;

    beforeEach((done) => {
      // Register a user to get a valid token
      const registerDto: RegisterDto = {
        email: 'token-test@example.com',
        username: 'tokentest',
        password: 'password123',
      };

      app.send(AUTH_PATTERNS.REGISTER, registerDto).subscribe({
        next: (response) => {
          validToken = response.tokens.accessToken;
          done();
        },
        error: done,
      });
    });

    it('should validate valid token', (done) => {
      // Arrange
      const tokenData = { token: validToken };

      // Act & Assert
      app.send(AUTH_PATTERNS.VALIDATE_TOKEN, tokenData).subscribe({
        next: (response) => {
          expect(response).toEqual(
            expect.objectContaining({
              valid: true,
              userId: expect.any(String),
              email: expect.any(String),
            }),
          );
          done();
        },
        error: done,
      });
    });

    it('should reject invalid token', (done) => {
      // Arrange
      const tokenData = { token: 'invalid-token' };

      // Act & Assert
      app.send(AUTH_PATTERNS.VALIDATE_TOKEN, tokenData).subscribe({
        next: (response) => {
          expect(response).toEqual(
            expect.objectContaining({
              valid: false,
            }),
          );
          done();
        },
        error: done,
      });
    });
  });

  describe('Health Check', () => {
    it('should return test message', (done) => {
      // Act & Assert
      app.send(AUTH_PATTERNS.TEST, {}).subscribe({
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
