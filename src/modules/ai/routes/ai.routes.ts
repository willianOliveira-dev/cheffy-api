import { createRoute, z } from '@hono/zod-openapi';
import { streamSSE } from 'hono/streaming';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { logger } from '@/shared/utils/logger.util.js';
import { AppError } from '@/shared/errors/app.error.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { recipeAssistantController, recipeAssistantStreamService } from '../controllers/recipe-assistant.controller.js';
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

const streamParamsSchema = z.object({
	recipeId: z.string().uuid(),
});

const streamPath = path.replace('{recipeId}', ':recipeId');

aiRoutes.post(`${streamPath}/stream`, authenticateMiddleware, async (c) => {
	const paramsResult = streamParamsSchema.safeParse(c.req.param());
	if (!paramsResult.success) {
		return c.json({ error: 'recipeId inválido' }, 400);
	}

	const bodyResult = askRecipeAssistantDtoSchema.safeParse(await c.req.json());
	if (!bodyResult.success) {
		return c.json({ error: 'Dados inválidos', details: bodyResult.error.flatten() }, 400);
	}

	const { recipeId } = paramsResult.data;
	const dto = bodyResult.data;

	return streamSSE(c, async (stream) => {
		let tokenIndex = 0;

		try {
			for await (const token of recipeAssistantStreamService.stream(recipeId, dto)) {
				await stream.writeSSE({
					data: JSON.stringify({ t: token }),
					event: 'token',
					id: String(tokenIndex++),
				});
			}

			await stream.writeSSE({
				data: '[DONE]',
				event: 'done',
				id: String(tokenIndex),
			});
		} catch (error) {
			const errorMessage = error instanceof AppError
				? error.message
				: 'Erro inesperado no assistente gastronômico';

			logger.error({ err: error, recipeId }, 'Stream SSE error');

			await stream.writeSSE({
				data: JSON.stringify({ error: errorMessage }),
				event: 'error',
				id: String(tokenIndex),
			});
		}
	});
});

