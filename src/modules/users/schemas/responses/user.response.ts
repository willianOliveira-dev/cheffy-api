import { z } from '@hono/zod-openapi';
import { recipeSummaryResponseSchema } from '@/modules/recipes/schemas/responses/recipe.response.js';

export const userResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		email: z.string().email(),
		emailVerified: z.boolean(),
		image: z.string().nullable(),
	})
	.openapi('User');

export const userFavoriteRecipesResponseSchema = z
	.array(recipeSummaryResponseSchema)
	.openapi('UserFavoriteRecipes');
