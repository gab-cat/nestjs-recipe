import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  USERS_PATTERNS,
  USERS_EVENTS,
  SafeUserDto,
  RecipeSummary,
} from '@app/shared';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(USERS_PATTERNS.CREATE_USER)
  async createUser(
    @Payload() createUserDto: CreateUserDto,
  ): Promise<SafeUserDto> {
    return this.usersService.createUser(createUserDto);
  }

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
  async findUserByEmail(@Payload() data: { email: string }) {
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
  ): Promise<SafeUserDto & { recipes: RecipeSummary[] }> {
    return this.usersService.getUserProfile(data.id);
  }

  @MessagePattern(USERS_PATTERNS.UPDATE_USER)
  async updateUser(
    @Payload() data: { id: string; updateUserDto: UpdateUserDto },
  ): Promise<SafeUserDto> {
    return this.usersService.updateUser(data.id, data.updateUserDto);
  }

  @MessagePattern(USERS_PATTERNS.DEACTIVATE_USER)
  async deactivateUser(@Payload() data: { id: string }): Promise<void> {
    return this.usersService.deactivateUser(data.id);
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
