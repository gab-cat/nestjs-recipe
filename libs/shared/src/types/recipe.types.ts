import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  MinLength,
  ArrayMinSize,
  Min,
  IsBoolean,
  IsObject,
  IsDate,
} from 'class-validator';

export type Recipe = {
  id: string;
  name: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  cookingTime: string;
  servings: number;
  image: string;
  isPublished: boolean;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
};

export class RecipeDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

  @IsString()
  @MinLength(1)
  cookingTime: string;

  @IsNumber()
  @Min(1)
  servings: number;

  @IsString()
  @MinLength(1)
  image: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsString()
  @MinLength(1)
  authorId: string;

  @IsDate()
  createdAt: Date;

  @IsDate()
  updatedAt: Date;
}

export class CreateRecipeDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

  @IsString()
  @MinLength(1)
  cookingTime: string;

  @IsNumber()
  @Min(1)
  servings: number;

  @IsString()
  @MinLength(1)
  image: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateRecipeDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions?: string[];

  @IsOptional()
  @IsString()
  @MinLength(1)
  cookingTime?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  servings?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  image?: string;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export type RecipeWithAuthor = Recipe & {
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
};

export class RecipeWithAuthorDto extends RecipeDto {
  @IsObject()
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}
