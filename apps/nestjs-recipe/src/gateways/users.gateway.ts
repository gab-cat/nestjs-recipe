/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Post,
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
import {
  CreateUserDto,
  UpdateUserDto,
  SafeUser,
  USERS_PATTERNS,
} from '@app/shared';
import { Gateway } from './base.gateway';

@Controller('api/v1/users')
export class UsersGateway extends Gateway {
  constructor(
    @Inject('USERS_SERVICE') private readonly usersClient: ClientProxy,
  ) {
    super();
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto): Promise<SafeUser> {
    return this.usersClient
      .send(USERS_PATTERNS.CREATE_USER, createUserDto)
      .toPromise();
  }

  @Get()
  async findAllUsers(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SafeUser[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersClient
      .send(USERS_PATTERNS.FIND_ALL_USERS, {
        page: pageNum,
        limit: limitNum,
      })
      .toPromise();
  }

  @Get('search')
  async searchUsers(
    @Query('q') query: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<SafeUser[]> {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersClient
      .send(USERS_PATTERNS.SEARCH_USERS, {
        query,
        page: pageNum,
        limit: limitNum,
      })
      .toPromise();
  }

  @Get('profile/:id')
  async getUserProfile(@Param('id') id: string): Promise<SafeUser> {
    return this.usersClient
      .send(USERS_PATTERNS.GET_USER_PROFILE, { id })
      .toPromise();
  }

  @Get('email/:email')
  async findUserByEmail(@Param('email') email: string) {
    return this.usersClient
      .send(USERS_PATTERNS.FIND_USER_BY_EMAIL, { email })
      .toPromise();
  }

  @Get('username/:username')
  async findUserByUsername(
    @Param('username') username: string,
  ): Promise<SafeUser> {
    return this.usersClient
      .send(USERS_PATTERNS.FIND_USER_BY_USERNAME, { username })
      .toPromise();
  }

  @Get('test')
  async getUserTest(): Promise<{ message: string }> {
    return this.usersClient.send(USERS_PATTERNS.TEST, {}).toPromise();
  }

  @Get(':id')
  async findUserById(@Param('id') id: string): Promise<SafeUser> {
    return this.usersClient
      .send(USERS_PATTERNS.FIND_USER_BY_ID, { id })
      .toPromise();
  }

  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<SafeUser> {
    return this.usersClient
      .send(USERS_PATTERNS.UPDATE_USER, {
        id,
        updateUserDto,
      })
      .toPromise();
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deactivateUser(@Param('id') id: string): Promise<void> {
    return this.usersClient
      .send(USERS_PATTERNS.DEACTIVATE_USER, { id })
      .toPromise();
  }
}
