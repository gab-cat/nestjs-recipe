# Sample POST Recipe Request

## Endpoint
```
POST http://localhost:3000/api/v1/recipes
Content-Type: application/json
```

## Request Body Structure

The request body requires:
- `authorId`: The ID of the user creating the recipe
- `createRecipeDto`: The recipe data object

### CreateRecipeDto Fields:
- `name` (string, required): Recipe name
- `description` (string, optional): Recipe description  
- `ingredients` (string[], required): Array of ingredient strings
- `instructions` (string[], required): Array of instruction steps
- `cookingTime` (string, required): Cooking time (e.g., "30 minutes")
- `servings` (number, required): Number of servings
- `image` (string, required): Image URL or path

## Sample Request Examples

### Example 1: Classic Pasta Recipe

```json
{
  "authorId": "user-123-456-789",
  "createRecipeDto": {
    "name": "Classic Spaghetti Carbonara",
    "description": "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper. Simple yet delicious!",
    "ingredients": [
      "400g spaghetti",
      "200g pancetta or guanciale, diced",
      "4 large eggs",
      "100g Pecorino Romano cheese, grated",
      "100g Parmigiano-Reggiano cheese, grated",
      "Freshly ground black pepper",
      "Salt for pasta water"
    ],
    "instructions": [
      "Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente",
      "While pasta cooks, fry pancetta in a large skillet over medium heat until crispy, about 5 minutes",
      "In a bowl, whisk together eggs, both cheeses, and a generous amount of black pepper",
      "Reserve 1 cup of pasta cooking water, then drain the pasta",
      "Immediately add hot pasta to the skillet with pancetta",
      "Remove from heat and quickly toss with egg mixture, adding pasta water as needed to create a creamy sauce",
      "Serve immediately with extra cheese and black pepper"
    ],
    "cookingTime": "20 minutes",
    "servings": 4,
    "image": "https://example.com/images/spaghetti-carbonara.jpg"
  }
}
```

### Example 2: Quick Breakfast Recipe

```json
{
  "authorId": "user-987-654-321",
  "createRecipeDto": {
    "name": "Fluffy Pancakes",
    "description": "Light and fluffy pancakes perfect for weekend breakfast",
    "ingredients": [
      "2 cups all-purpose flour",
      "2 tablespoons sugar",
      "2 teaspoons baking powder",
      "1 teaspoon salt",
      "2 large eggs",
      "1 3/4 cups milk",
      "1/4 cup melted butter",
      "1 teaspoon vanilla extract"
    ],
    "instructions": [
      "In a large bowl, whisk together flour, sugar, baking powder, and salt",
      "In another bowl, beat eggs and stir in milk, melted butter, and vanilla",
      "Pour wet ingredients into dry ingredients and stir just until combined (don't overmix)",
      "Heat a griddle or large skillet over medium heat",
      "Pour 1/4 cup batter for each pancake onto griddle",
      "Cook until bubbles form on surface and edges look set, about 2-3 minutes",
      "Flip and cook until golden brown, about 1-2 minutes more",
      "Serve hot with maple syrup and butter"
    ],
    "cookingTime": "15 minutes",
    "servings": 6,
    "image": "https://example.com/images/fluffy-pancakes.jpg"
  }
}
```

### Example 3: Healthy Option

```json
{
  "authorId": "user-111-222-333",
  "createRecipeDto": {
    "name": "Mediterranean Quinoa Bowl",
    "ingredients": [
      "1 cup quinoa, rinsed",
      "2 cups vegetable broth",
      "1 cucumber, diced",
      "2 tomatoes, chopped",
      "1/2 red onion, thinly sliced",
      "1/2 cup kalamata olives, pitted",
      "1/2 cup feta cheese, crumbled",
      "1/4 cup olive oil",
      "2 tablespoons lemon juice",
      "1 teaspoon dried oregano",
      "Salt and pepper to taste",
      "Fresh parsley for garnish"
    ],
    "instructions": [
      "Cook quinoa in vegetable broth according to package directions, about 15 minutes",
      "Let quinoa cool to room temperature",
      "In a large bowl, combine cooled quinoa, cucumber, tomatoes, red onion, and olives",
      "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper",
      "Pour dressing over quinoa mixture and toss to combine",
      "Top with crumbled feta cheese and fresh parsley",
      "Serve immediately or chill for later"
    ],
    "cookingTime": "25 minutes",
    "servings": 4,
    "image": "https://example.com/images/quinoa-bowl.jpg"
  }
}
```

## cURL Examples

### Basic cURL command:
```bash
curl -X POST http://localhost:3000/api/v1/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "authorId": "user-123-456-789",
    "createRecipeDto": {
      "name": "Classic Spaghetti Carbonara",
      "description": "A traditional Italian pasta dish",
      "ingredients": ["400g spaghetti", "200g pancetta", "4 large eggs"],
      "instructions": ["Cook pasta", "Fry pancetta", "Mix with eggs"],
      "cookingTime": "20 minutes",
      "servings": 4,
      "image": "https://example.com/images/carbonara.jpg"
    }
  }'
```

### With authentication (if JWT is required):
```bash
curl -X POST http://localhost:3000/api/v1/recipes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "authorId": "user-123-456-789",
    "createRecipeDto": {
      "name": "Test Recipe",
      "ingredients": ["ingredient1", "ingredient2"],
      "instructions": ["step1", "step2"],
      "cookingTime": "15 minutes",
      "servings": 2,
      "image": "https://example.com/image.jpg"
    }
  }'
```

## Response Example

**Success Response (201 Created):**
```json
{
  "id": "recipe-abc-123-def",
  "name": "Classic Spaghetti Carbonara",
  "description": "A traditional Italian pasta dish with eggs, cheese, pancetta, and black pepper. Simple yet delicious!",
  "ingredients": [
    "400g spaghetti",
    "200g pancetta or guanciale, diced",
    "4 large eggs",
    "100g Pecorino Romano cheese, grated"
  ],
  "instructions": [
    "Bring a large pot of salted water to boil and cook spaghetti according to package directions until al dente",
    "While pasta cooks, fry pancetta in a large skillet over medium heat until crispy, about 5 minutes"
  ],
  "cookingTime": "20 minutes",
  "servings": 4,
  "image": "https://example.com/images/spaghetti-carbonara.jpg"
}
```

## Testing with Different Tools

### Postman
1. Set method to POST
2. URL: `http://localhost:3000/api/v1/recipes`
3. Headers: `Content-Type: application/json`
4. Body: Raw JSON with the sample data above

### Insomnia/Thunder Client
Same configuration as Postman

### HTTPie
```bash
http POST localhost:3000/api/v1/recipes \
  authorId="user-123-456-789" \
  createRecipeDto:='{"name":"Test Recipe","ingredients":["test"],"instructions":["test"],"cookingTime":"10 minutes","servings":1,"image":"test.jpg"}'
``` 