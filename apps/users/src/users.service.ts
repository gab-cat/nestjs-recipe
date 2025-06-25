import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService, RecipeSummary } from '@app/shared';
import { CreateUserDto, UpdateUserDto, User, SafeUserDto } from '@app/shared';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserDto: CreateUserDto): Promise<SafeUserDto> {
    const { email, username, password, ...userData } = createUserDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictException('Email already exists');
      }
      if (existingUser.username === username) {
        throw new ConflictException('Username already exists');
      }
    }

    // Password handling should be done by auth service during registration
    if (password) {
      throw new BadRequestException(
        'Password should not be provided when creating user directly. Use auth service for registration.',
      );
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        username,
        ...userData,
      },
    });

    return this.mapToSafeUserDto(user as User);
  }

  async findAllUsers(page = 1, limit = 10): Promise<SafeUserDto[]> {
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return users.map((user) => this.mapToSafeUserDto(user as User));
  }

  async findUserById(id: string): Promise<SafeUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.mapToSafeUserDto(user as User);
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return null;
    }

    return this.mapToUser(user as User);
  }

  async findUserByUsername(username: string): Promise<SafeUserDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }

    return this.mapToSafeUserDto(user as User);
  }

  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<SafeUserDto> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.mapToSafeUserDto(updatedUser as User);
  }

  async deactivateUser(id: string): Promise<void> {
    const existingUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async searchUsers(
    query: string,
    page = 1,
    limit = 10,
  ): Promise<SafeUserDto[]> {
    const skip = (page - 1) * limit;

    const users = await this.prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { firstName: { contains: query, mode: 'insensitive' } },
              { lastName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      skip,
      take: limit,
      orderBy: {
        username: 'asc',
      },
    });

    return users.map((user) => this.mapToSafeUserDto(user as User));
  }

  async getUserProfile(
    id: string,
  ): Promise<SafeUserDto & { recipes: RecipeSummary[] }> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        recipes: {
          select: {
            id: true,
            name: true,
            image: true,
            createdAt: true,
          },
          where: {
            isPublished: true,
          },
          take: 5,
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return {
      ...this.mapToSafeUserDto(user as User),
      recipes: user.recipes,
    };
  }

  getUserTest(): { message: string } {
    return { message: 'Users service is working' };
  }

  private mapToSafeUserDto(user: User): SafeUserDto {
    return {
      username: user.username,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      bio: user.bio || '',
      avatar: user.avatar || '',
    };
  }

  private mapToUser(user: User): User {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      bio: user.bio || undefined,
      avatar: user.avatar || undefined,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
