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
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  ChangePasswordDto,
  AUTH_PATTERNS,
} from '@app/shared';
import { Gateway } from './base.gateway';

@Controller('api/v1/auth')
export class AuthGateway extends Gateway {
  constructor(
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    super();
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.authClient.send<AuthResponse>(AUTH_PATTERNS.REGISTER, registerDto),
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return firstValueFrom(
      this.authClient.send<AuthResponse>(AUTH_PATTERNS.LOGIN, loginDto),
    );
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return firstValueFrom(
      this.authClient.send<AuthResponse>(
        AUTH_PATTERNS.REFRESH_TOKEN,
        refreshTokenDto,
      ),
    );
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @Body() data: { userId: string; refreshToken: string },
  ): Promise<void> {
    return firstValueFrom(
      this.authClient.send<void>(AUTH_PATTERNS.LOGOUT, data),
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Body() data: { userId: string; changePasswordDto: ChangePasswordDto },
  ): Promise<void> {
    return firstValueFrom(
      this.authClient.send<void>(AUTH_PATTERNS.CHANGE_PASSWORD, data),
    );
  }

  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() data: { token: string }): Promise<any> {
    return firstValueFrom(
      this.authClient.send(AUTH_PATTERNS.VALIDATE_TOKEN, data),
    );
  }

  @Get('test')
  async getAuthTest(): Promise<{ message: string }> {
    return firstValueFrom(
      this.authClient.send<{ message: string }>(AUTH_PATTERNS.TEST, {}),
    );
  }
}
