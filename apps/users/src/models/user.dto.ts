import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({
    description: 'Unique user identifier',
    example: 'clm123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Passionate home cook and recipe creator',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  @IsBoolean()
  isActive: boolean;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Account last update timestamp',
    example: '2023-06-01T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
    format: 'email',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
  })
  @IsString()
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Passionate home cook and recipe creator',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Passionate home cook and recipe creator',
    required: false,
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export type UserProfile = Omit<User, 'isActive'>;

export type SafeUser = Omit<User, 'isActive' | 'id'>;

export class SafeUserDto {
  @ApiProperty({
    description: 'Unique username',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsString()
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'User biography',
    example: 'Passionate home cook and recipe creator',
  })
  @IsString()
  bio: string;

  @ApiProperty({
    description: 'User avatar URL',
    example: 'https://example.com/avatar.jpg',
  })
  @IsString()
  avatar: string;
}

export type RecipeSummary = {
  id: string;
  name: string;
  slug: string;
  image: string;
  createdAt: Date;
};

export class RecipeSummaryDto {
  @ApiProperty({
    description: 'Recipe identifier',
    example: 'clm987654321',
  })
  id: string;

  @ApiProperty({
    description: 'Recipe name',
    example: 'Chocolate Chip Cookies',
  })
  name: string;

  @ApiProperty({
    description: 'Recipe slug',
    example: 'chocolate-chip-cookies',
  })
  slug: string;

  @ApiProperty({
    description: 'Recipe image URL',
    example: 'https://example.com/recipe-image.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Recipe creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export type UserWithRecipes = SafeUser & {
  recipes: RecipeSummary[];
};

export class UserWithRecipesDto extends SafeUserDto {
  @ApiProperty({
    description: 'User recipes',
    type: [RecipeSummaryDto],
  })
  recipes: RecipeSummaryDto[];
}
