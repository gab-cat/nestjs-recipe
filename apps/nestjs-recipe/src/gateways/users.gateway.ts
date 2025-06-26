/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
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
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiNoContentResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { USERS_PATTERNS, MicroserviceLoggerService } from '@app/shared';
import { Gateway } from './base.gateway';
import {
  UpdateUserDto,
  SafeUserDto,
  UserWithRecipesDto,
} from 'apps/users/src/models/user.dto';

@ApiTags('Users')
@Controller('api/v1/users')
export class UsersGateway extends Gateway {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
    private readonly microserviceLogger: MicroserviceLoggerService,
  ) {
    super();
    this.microserviceLogger.logClientConnection(
      'USERS_SERVICE',
      'localhost',
      3003,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve a paginated list of all users.',
  })
  @ApiOkResponse({
    description: 'List of users successfully retrieved',
    type: [SafeUserDto],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users per page',
    example: 10,
    type: Number,
  })
  async findAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SafeUserDto[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const requestData = { page: pageNum, limit: limitNum };

    return firstValueFrom(
      this.microserviceLogger.logAndSend<SafeUserDto[]>(
        this.usersClient,
        USERS_PATTERNS.FIND_ALL_USERS,
        requestData,
        'UsersGateway.findAllUsers',
      ),
    );
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search users',
    description:
      'Search for users by username, email, first name, or last name.',
  })
  @ApiOkResponse({
    description: 'Search results successfully retrieved',
    type: [SafeUserDto],
  })
  @ApiQuery({
    name: 'q',
    required: true,
    description: 'Search query string',
    example: 'john',
    type: String,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of users per page',
    example: 10,
    type: Number,
  })
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SafeUserDto[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return firstValueFrom(
      this.microserviceLogger.logAndSend<SafeUserDto[]>(
        this.usersClient,
        USERS_PATTERNS.SEARCH_USERS,
        {
          query,
          page: pageNum,
          limit: limitNum,
        },
        'UsersGateway.searchUsers',
      ),
    );
  }

  @Get('profile/:id')
  @ApiOperation({
    summary: 'Get user profile with recipes',
    description: 'Retrieve user profile information including their recipes.',
  })
  @ApiOkResponse({
    description: 'User profile successfully retrieved',
    schema: {
      type: 'object',
      properties: {
        username: { type: 'string', example: 'john_doe' },
        email: { type: 'string', example: 'john@example.com' },
        firstName: { type: 'string', example: 'John' },
        lastName: { type: 'string', example: 'Doe' },
        bio: { type: 'string', example: 'Passionate home cook' },
        avatar: { type: 'string', example: 'https://example.com/avatar.jpg' },
        recipes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clm987654321' },
              name: { type: 'string', example: 'Chocolate Chip Cookies' },
              image: {
                type: 'string',
                example: 'https://example.com/cookie.jpg',
              },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'clm123456789',
  })
  async getUserProfile(@Param('id') id: string): Promise<UserWithRecipesDto> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<UserWithRecipesDto>(
        this.usersClient,
        USERS_PATTERNS.GET_USER_PROFILE,
        { id },
        'UsersGateway.getUserProfile',
      ),
    );
  }

  @Get('email/:email')
  @ApiOperation({
    summary: 'Find user by email',
    description: 'Retrieve user information by email address.',
  })
  @ApiOkResponse({
    description: 'User successfully retrieved',
    type: SafeUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'john@example.com',
  })
  async findUserByEmail(
    @Param('email') email: string,
  ): Promise<UserWithRecipesDto> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<UserWithRecipesDto>(
        this.usersClient,
        USERS_PATTERNS.FIND_USER_BY_EMAIL,
        { email },
        'UsersGateway.findUserByEmail',
      ),
    );
  }

  @Get('username/:username')
  @ApiOperation({
    summary: 'Find user by username',
    description: 'Retrieve user information by username.',
  })
  @ApiOkResponse({
    description: 'User successfully retrieved',
    type: SafeUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'username',
    description: 'Username',
    example: 'john_doe',
  })
  async findUserByUsername(
    @Param('username') username: string,
  ): Promise<SafeUserDto> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<SafeUserDto>(
        this.usersClient,
        USERS_PATTERNS.FIND_USER_BY_USERNAME,
        { username },
        'UsersGateway.findUserByUsername',
      ),
    );
  }

  @Get('test')
  @ApiOperation({
    summary: 'Users service health check',
    description: 'Test endpoint to verify users service connectivity.',
  })
  @ApiOkResponse({
    description: 'Users service is operational',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string', example: 'Users service is working' },
      },
    },
  })
  async getUserTest(): Promise<{ message: string }> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<{ message: string }>(
        this.usersClient,
        USERS_PATTERNS.TEST,
        {},
        'UsersGateway.getUserTest',
      ),
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier.',
  })
  @ApiOkResponse({
    description: 'User successfully retrieved',
    type: SafeUserDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: 'clm123456789',
  })
  async findUserById(@Param('id') id: string): Promise<SafeUserDto> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<SafeUserDto>(
        this.usersClient,
        USERS_PATTERNS.FIND_USER_BY_ID,
        { id },
        'UsersGateway.findUserById',
      ),
    );
  }

  @Patch('email/:email')
  @ApiOperation({
    summary: 'Update user by email',
    description:
      'Update user information by email address. Typically used for profile updates.',
  })
  @ApiOkResponse({
    description: 'User successfully updated',
    type: SafeUserDto,
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'john@example.com',
  })
  @ApiBody({ type: UpdateUserDto })
  async updateUserByEmail(
    @Param('email') email: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SafeUserDto> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<SafeUserDto>(
        this.usersClient,
        USERS_PATTERNS.UPDATE_USER,
        {
          email,
          updateUserDto,
        },
        'UsersGateway.updateUserByEmail',
      ),
    );
  }

  @Delete('email/:email')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user by email',
    description:
      'Delete a user account by email address. This permanently removes the user from the system.',
  })
  @ApiNoContentResponse({
    description: 'User successfully deleted',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'john@example.com',
  })
  async deleteUserByEmail(@Param('email') email: string): Promise<void> {
    return firstValueFrom(
      this.microserviceLogger.logAndSend<void>(
        this.usersClient,
        USERS_PATTERNS.DELETE_USER,
        { email },
        'UsersGateway.deleteUserByEmail',
      ),
    );
  }
}
