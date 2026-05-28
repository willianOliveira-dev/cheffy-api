import { z } from '@hono/zod-openapi';

export const recipeAssistantResponseSchema = z
	.object({
		recipeId: z.string().uuid(),
		answer: z.string(),
		provider: z.literal('groq'),
		model: z.string(),
		createdAt: z.string().datetime(),
	})
	.openapi('RecipeAssistantResponse');
