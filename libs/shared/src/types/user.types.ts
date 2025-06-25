import {
  IsEmail,
  IsString,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';

export class User {
  @IsString()
  id: string;

  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;

  @IsBoolean()
  isActive: boolean;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  avatar?: string;
}

export type UserProfile = Omit<User, 'isActive'>;

export type SafeUser = Omit<User, 'isActive' | 'id'>;
export class SafeUserDto {
  @IsString()
  username: string;

  @IsString()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  bio: string;

  @IsString()
  avatar: string;
}

export type RecipeSummary = {
  id: string;
  name: string;
  image: string;
  createdAt: Date;
};

export type UserWithRecipes = SafeUser & {
  recipes: RecipeSummary[];
};
