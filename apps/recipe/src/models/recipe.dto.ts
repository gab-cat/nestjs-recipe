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
import { ApiProperty } from '@nestjs/swagger';

export type Recipe = {
  id: string;
  name: string;
  slug: string;
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
  @ApiProperty({
    description: 'Recipe identifier',
    example: 'clm123456789',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Recipe name',
    example: 'Chocolate Chip Cookies',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Recipe slug',
    example: 'chocolate-chip-cookies',
  })
  @IsString()
  slug: string;

  @ApiProperty({
    description: 'Recipe description',
    example:
      'Delicious homemade chocolate chip cookies that are crispy on the outside and chewy on the inside',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of ingredients',
    example: [
      '2 cups flour',
      '1 cup butter',
      '1/2 cup brown sugar',
      '1/2 cup white sugar',
      '2 eggs',
      '1 tsp vanilla',
      '1 tsp baking soda',
      '1/2 tsp salt',
      '2 cups chocolate chips',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({
    description: 'Step-by-step cooking instructions',
    example: [
      'Preheat oven to 375°F',
      'Mix dry ingredients in a bowl',
      'Cream butter and sugars',
      'Add eggs and vanilla',
      'Combine wet and dry ingredients',
      'Fold in chocolate chips',
      'Drop onto baking sheets',
      'Bake for 9-11 minutes',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

  @ApiProperty({
    description: 'Total cooking time',
    example: '30 minutes',
  })
  @IsString()
  @MinLength(1)
  cookingTime: string;

  @ApiProperty({
    description: 'Number of servings',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  servings: number;

  @ApiProperty({
    description: 'Recipe image URL',
    example: 'https://example.com/chocolate-chip-cookies.jpg',
  })
  @IsString()
  @MinLength(1)
  image: string;

  @ApiProperty({
    description: 'Whether the recipe is published publicly',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({
    description: 'Recipe author ID',
    example: 'clm123456789',
  })
  @IsString()
  @MinLength(1)
  authorId: string;

  @ApiProperty({
    description: 'Recipe creation timestamp',
    example: '2023-01-01T00:00:00.000Z',
  })
  @IsDate()
  createdAt: Date;

  @ApiProperty({
    description: 'Recipe last update timestamp',
    example: '2023-06-01T00:00:00.000Z',
  })
  @IsDate()
  updatedAt: Date;
}

export class CreateRecipeDto {
  @ApiProperty({
    description: 'Recipe name',
    example: 'Chocolate Chip Cookies',
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name: string;

  @ApiProperty({
    description: 'Recipe description',
    example:
      'Delicious homemade chocolate chip cookies that are crispy on the outside and chewy on the inside',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of ingredients',
    example: [
      '2 cups flour',
      '1 cup butter',
      '1/2 cup brown sugar',
      '1/2 cup white sugar',
      '2 eggs',
      '1 tsp vanilla',
      '1 tsp baking soda',
      '1/2 tsp salt',
      '2 cups chocolate chips',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({
    description: 'Step-by-step cooking instructions',
    example: [
      'Preheat oven to 375°F',
      'Mix dry ingredients in a bowl',
      'Cream butter and sugars',
      'Add eggs and vanilla',
      'Combine wet and dry ingredients',
      'Fold in chocolate chips',
      'Drop onto baking sheets',
      'Bake for 9-11 minutes',
    ],
    type: [String],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions: string[];

  @ApiProperty({
    description: 'Total cooking time',
    example: '30 minutes',
  })
  @IsString()
  @MinLength(1)
  cookingTime: string;

  @ApiProperty({
    description: 'Number of servings',
    example: 4,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  servings: number;

  @ApiProperty({
    description: 'Recipe image URL',
    example: 'https://example.com/chocolate-chip-cookies.jpg',
  })
  @IsString()
  @MinLength(1)
  image: string;

  @ApiProperty({
    description: 'Whether the recipe is published publicly',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class UpdateRecipeDto {
  @ApiProperty({
    description: 'Recipe name',
    example: 'Updated Chocolate Chip Cookies',
    minLength: 3,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiProperty({
    description: 'Recipe description',
    example:
      'Updated description for delicious homemade chocolate chip cookies',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'List of ingredients',
    example: ['2 cups flour', '1 cup butter', '1/2 cup brown sugar'],
    type: [String],
    minItems: 1,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({
    description: 'Step-by-step cooking instructions',
    example: [
      'Preheat oven to 375°F',
      'Mix ingredients',
      'Bake for 10 minutes',
    ],
    type: [String],
    minItems: 1,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  instructions?: string[];

  @ApiProperty({
    description: 'Total cooking time',
    example: '25 minutes',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  cookingTime?: string;

  @ApiProperty({
    description: 'Number of servings',
    example: 6,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  servings?: number;

  @ApiProperty({
    description: 'Recipe image URL',
    example: 'https://example.com/updated-cookies.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  image?: string;

  @ApiProperty({
    description: 'Whether the recipe is published publicly',
    example: false,
    required: false,
  })
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
  @ApiProperty({
    description: 'Recipe author information',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'clm123456789' },
      username: { type: 'string', example: 'john_doe' },
      firstName: { type: 'string', example: 'John' },
      lastName: { type: 'string', example: 'Doe' },
    },
  })
  @IsObject()
  author: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}
