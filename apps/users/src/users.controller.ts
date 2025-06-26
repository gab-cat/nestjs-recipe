import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { USERS_PATTERNS, USERS_EVENTS } from '@app/shared';
import {
  UpdateUserDto,
  SafeUserDto,
  UserWithRecipesDto,
} from './models/user.dto';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERNS.FIND_ALL_USERS)
  async findAllUsers(
    @Payload() data: { page?: number; limit?: number },
  ): Promise<SafeUserDto[]> {
    const { page = 1, limit = 10 } = data;
    return this.usersService.findAllUsers(page, limit);
  }

  @MessagePattern(USERS_PATTERNS.SEARCH_USERS)
  async searchUsers(
    @Payload() data: { query: string; page?: number; limit?: number },
  ): Promise<SafeUserDto[]> {
    const { query, page = 1, limit = 10 } = data;
    return this.usersService.searchUsers(query, page, limit);
  }

  @MessagePattern(USERS_PATTERNS.FIND_USER_BY_ID)
  async findUserById(@Payload() data: { id: string }): Promise<SafeUserDto> {
    return this.usersService.findUserById(data.id);
  }

  @MessagePattern(USERS_PATTERNS.FIND_USER_BY_EMAIL)
  async findUserByEmail(
    @Payload() data: { email: string },
  ): Promise<UserWithRecipesDto> {
    return this.usersService.findUserByEmail(data.email);
  }

  @MessagePattern(USERS_PATTERNS.FIND_USER_BY_USERNAME)
  async findUserByUsername(
    @Payload() data: { username: string },
  ): Promise<SafeUserDto> {
    return this.usersService.findUserByUsername(data.username);
  }

  @MessagePattern(USERS_PATTERNS.GET_USER_PROFILE)
  async getUserProfile(
    @Payload() data: { id: string },
  ): Promise<UserWithRecipesDto> {
    return this.usersService.getUserProfile(data.id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_USER)
  async updateUser(
    @Payload() data: { email: string; updateUserDto: UpdateUserDto },
  ): Promise<SafeUserDto> {
    return this.usersService.updateUser(data.email, data.updateUserDto);
  }

  @MessagePattern(USERS_PATTERNS.DELETE_USER)
  async deleteUser(@Payload() data: { email: string }): Promise<void> {
    await this.usersService.deleteUser(data.email);
  }

  @MessagePattern(USERS_PATTERNS.TEST)
  getUserTest(): { message: string } {
    return this.usersService.getUserTest();
  }

  // Event handlers (if needed)
  @EventPattern(USERS_EVENTS.USER_CREATED)
  handleUserCreated(@Payload() data: any): void {
    // Handle user creation event
    console.log('User created event received:', data);
  }

  @EventPattern(USERS_EVENTS.USER_UPDATED)
  handleUserUpdated(@Payload() data: any): void {
    // Handle user update event
    console.log('User updated event received:', data);
  }

  @EventPattern(USERS_EVENTS.USER_DEACTIVATED)
  handleUserDeactivated(@Payload() data: any): void {
    // Handle user deactivation event
    console.log('User deactivated event received:', data);
  }
}
