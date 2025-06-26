// Recipe Service Message Patterns
export const RECIPE_PATTERNS = {
  // Commands (Message Patterns)
  CREATE_RECIPE: { cmd: 'recipe.create' },
  FIND_ALL_RECIPES: { cmd: 'recipe.find_all' },
  FIND_RECIPE_BY_ID: { cmd: 'recipe.find_by_id' },
  FIND_RECIPE_BY_SLUG: { cmd: 'recipe.find_by_slug' },
  FIND_RECIPES_BY_AUTHOR: { cmd: 'recipe.find_by_author' },
  UPDATE_RECIPE: { cmd: 'recipe.update' },
  DELETE_RECIPE: { cmd: 'recipe.delete' },
  SEARCH_RECIPES: { cmd: 'recipe.search' },
  TEST: { cmd: 'recipe.test' },
} as const;

// Recipe Service Event Patterns
export const RECIPE_EVENTS = {
  RECIPE_CREATED: 'recipe.created',
  RECIPE_UPDATED: 'recipe.updated',
  RECIPE_DELETED: 'recipe.deleted',
  RECIPE_VIEWED: 'recipe.viewed',
  RECIPE_RATED: 'recipe.rated',
} as const;
