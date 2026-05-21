import { z } from '@hono/zod-openapi';
import { recipeSummaryResponseSchema } from '@/modules/recipes/schemas/responses/recipe.response.js';

export const userResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		email: z.string().email(),
		emailVerified: z.boolean(),
		image: z.string().nullable(),
		createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
		updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
	})
	.openapi('User');

export const userFavoriteRecipesResponseSchema = z
	.array(recipeSummaryResponseSchema)
	.openapi('UserFavoriteRecipes');
