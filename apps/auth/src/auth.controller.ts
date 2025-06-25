import { Controller, UseGuards } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  LoginDto,
  RegisterDto,
  AuthResponse,
  RefreshTokenDto,
  ChangePasswordDto,
  AUTH_PATTERNS,
  AUTH_EVENTS,
} from '@app/shared';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern(AUTH_PATTERNS.REGISTER)
  async register(@Payload() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGIN)
  async login(@Payload() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @MessagePattern(AUTH_PATTERNS.REFRESH_TOKEN)
  async refreshToken(
    @Payload() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @MessagePattern(AUTH_PATTERNS.LOGOUT)
  @UseGuards(JwtAuthGuard)
  logout(@Payload() data: { userId: string; refreshToken: string }): void {
    return this.authService.logout(data.userId, data.refreshToken);
  }

  @MessagePattern(AUTH_PATTERNS.CHANGE_PASSWORD)
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Payload() data: { userId: string; changePasswordDto: ChangePasswordDto },
  ): Promise<void> {
    return this.authService.changePassword(data.userId, data.changePasswordDto);
  }

  @MessagePattern(AUTH_PATTERNS.VALIDATE_TOKEN)
  async validateToken(@Payload() data: { token: string }): Promise<any> {
    return this.authService.validateToken(data.token);
  }

  @MessagePattern(AUTH_PATTERNS.TEST)
  getAuthTest(): { message: string } {
    return this.authService.getAuthTest();
  }

  // Event handlers (if needed)
  @EventPattern(AUTH_EVENTS.USER_REGISTERED)
  handleUserRegistered(@Payload() data: any): void {
    // Handle user registration event
    console.log('User registered event received:', data);
  }

  @EventPattern(AUTH_EVENTS.USER_LOGGED_IN)
  handleUserLoggedIn(@Payload() data: any): void {
    // Handle user login event
    console.log('User logged in event received:', data);
  }
}
