import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService, AppConfigService } from '@app/shared';
import {
  RegisterDto,
  AuthResponse,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
} from './models/auth.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtRefreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: AppConfigService,
  ) {
    const jwtConfig = this.configService.getJwtConfig();
    this.jwtSecret = jwtConfig.secret;
    this.jwtRefreshSecret = jwtConfig.refreshSecret;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const { email, username, password, firstName, lastName, bio, avatar } =
      registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: 'Email already exists',
        });
      }
      if (existingUser.username === username) {
        throw new RpcException({
          statusCode: HttpStatus.CONFLICT,
          message: 'Username already exists',
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user with hashed password stored in auth_credentials table
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          username,
          firstName,
          lastName,
          bio,
          avatar,
        },
      });

      // Store hashed password in a separate auth table (following security best practices)
      await tx.authCredential.create({
        data: {
          userId: newUser.id,
          hashedPassword,
        },
      });

      return newUser;
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      },
      tokens,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginDto;

    // Find user by email with auth credentials
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        authCredentials: true,
      },
    });

    if (!user || !user.isActive || !user.authCredentials) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.authCredentials.hashedPassword,
    );

    if (!isPasswordValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      });
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      },
      tokens,
    };
  }

  // SIMPLIFIED VERSION - Just JWT verification, no database storage
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    const { refreshToken } = refreshTokenDto;

    try {
      // Verify refresh token using JWT secret only
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret);
      const userId = payload.sub as string;

      // Verify user still exists and is active
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.isActive) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'User not found or inactive',
        });
      }

      // Generate new tokens
      const tokens = this.generateTokens(userId);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        },
        tokens,
      };
    } catch {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid refresh token',
      });
    }
  }

  // SIMPLIFIED VERSION - Cannot revoke tokens, they remain valid until expiry
  logout(userId: string, refreshToken: string): void {
    // In stateless approach, we can't actually revoke the token
    // The token will remain valid until it expires naturally
    // You could add logic here to blacklist tokens in cache/memory if needed
    console.log(
      `User ${userId} logged out, but token ${refreshToken.substring(0, 10)}... remains valid until expiry`,
    );
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        authCredentials: true,
      },
    });

    if (!user || !user.authCredentials) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'User not found',
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.authCredentials.hashedPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Current password is incorrect',
      });
    }

    // Hash and store new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    await this.prisma.authCredential.update({
      where: { userId },
      data: { hashedPassword: hashedNewPassword },
    });
  }

  async validateToken(token: string): Promise<AuthResponse> {
    try {
      const payload = jwt.verify(token, this.jwtSecret);
      const userId = payload.sub;

      const user = await this.prisma.user.findUnique({
        where: { id: userId as string },
      });

      if (!user || !user.isActive) {
        throw new RpcException({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'User not found or inactive',
        });
      }

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
        },
        tokens: {
          accessToken: token,
          refreshToken: token,
        },
      };
    } catch {
      throw new RpcException({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid token',
      });
    }
  }

  getAuthTest(): { status: string; message: string } {
    return { status: 'success', message: 'Auth service is working' };
  }

  private generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
  } {
    const payload = { sub: userId };

    const accessToken = jwt.sign(payload, this.jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }
}
