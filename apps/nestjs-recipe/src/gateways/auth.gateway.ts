import {
  Controller,
  Get,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';
import { AUTH_PATTERNS, MicroserviceLoggerService } from '@app/shared';
import { Gateway } from './base.gateway';
import {
  AuthResponse,
  RegisterDto,
  LoginDto,
  RefreshTokenDto,
  ChangePasswordDto,
  ValidateTokenDto,
} from 'apps/auth/src/models/auth.dto';

@ApiTags('Authentication')
@Controller('api/v1/auth')
export class AuthGateway extends Gateway {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
    private readonly microserviceLogger: MicroserviceLoggerService,
  ) {
    super();
    this.microserviceLogger.logClientConnection(
      'AUTH_SERVICE',
      'localhost',
      3001,
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Create a new user account with email, username, and password. Returns user information and authentication tokens.',
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data or validation failed',
  })
  @ApiConflictResponse({
    description: 'Email or username already exists',
  })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<AuthResponse>(
        this.authClient,
        AUTH_PATTERNS.REGISTER,
        registerDto,
        'AuthGateway.register',
      ),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login',
    description:
      'Authenticate user with email and password. Returns user information and authentication tokens.',
  })
  @ApiOkResponse({
    description: 'User successfully authenticated',
    type: AuthResponse,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<AuthResponse>(
        this.authClient,
        AUTH_PATTERNS.LOGIN,
        loginDto,
        'AuthGateway.login',
      ),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description:
      'Generate new access and refresh tokens using a valid refresh token.',
  })
  @ApiOkResponse({
    description: 'Tokens successfully refreshed',
    type: AuthResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired refresh token',
  })
  @ApiBody({ type: RefreshTokenDto })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<AuthResponse>(
        this.authClient,
        AUTH_PATTERNS.REFRESH_TOKEN,
        refreshTokenDto,
        'AuthGateway.refreshToken',
      ),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'User logout',
    description:
      'Logout user by invalidating tokens. Note: In stateless JWT implementation, tokens remain valid until expiry.',
  })
  @ApiNoContentResponse({
    description: 'User successfully logged out',
  })
  async logout(
    @Body() data: { userId: string; refreshToken: string },
  ): Promise<void> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<void>(
        this.authClient,
        AUTH_PATTERNS.LOGOUT,
        data,
        'AuthGateway.logout',
      ),
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() data: { userId: string; changePasswordDto: ChangePasswordDto },
  ): Promise<void> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<void>(
        this.authClient,
        AUTH_PATTERNS.CHANGE_PASSWORD,
        data,
        'AuthGateway.changePassword',
      ),
    );
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Validate token',
    description: 'Validate a token and return user information.',
  })
  @ApiOkResponse({
    description: 'Token successfully validated',
    type: AuthResponse,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or expired token',
  })
  @ApiBody({ type: ValidateTokenDto })
  async validateToken(@Body() data: ValidateTokenDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<AuthResponse>(
        this.authClient,
        AUTH_PATTERNS.VALIDATE_TOKEN,
        data,
        'AuthGateway.validateToken',
      ),
    );
  }

  @Get('test')
  @ApiOperation({
    summary: 'Auth service health check',
    description: 'Test endpoint to verify auth service connectivity.',
  })
  @ApiOkResponse({
    description: 'Auth service is operational',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Auth service is working' },
      },
    },
  })
  async getAuthTest(): Promise<{ message: string }> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<{ message: string }>(
        this.authClient,
        AUTH_PATTERNS.TEST,
        {},
        'AuthGateway.getAuthTest',
      ),
    );
  }
}
