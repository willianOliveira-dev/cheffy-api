import { createRoute, z } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { recipeAssistantController } from '../controllers/recipe-assistant.controller.js';
import { askRecipeAssistantDtoSchema } from '../schemas/dtos/ask-recipe-assistant.dto.js';
import { recipeAssistantResponseSchema } from '../schemas/responses/recipe-assistant.response.js';

export const aiRoutes = createRouter();

const path = '/ai/recipes/{recipeId}/assistant';

const askRecipeAssistantRoute = createRoute({
	method: 'post',
	path,
	operationId: 'askRecipeAssistant',
	tags: ['AI'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			recipeId: z.string().uuid(),
		}),
		body: {
			content: {
				'application/json': {
					schema: askRecipeAssistantDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeAssistantResponseSchema,
				},
			},
			description: 'Resposta do assistente gastronômico para a receita atual',
		},
	},
});

aiRoutes.openapi(askRecipeAssistantRoute, async (c) => {
	const { recipeId } = c.req.valid('param');
	const data = c.req.valid('json');
	const result = await recipeAssistantController.ask(recipeId, data);
	return c.json(recipeAssistantResponseSchema.parse(result), 200);
});
