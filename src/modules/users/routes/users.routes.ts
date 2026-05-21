import { createRoute } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { usersController } from '../controllers/users.controller.js';
import {
	userFavoriteRecipesResponseSchema,
	userResponseSchema,
} from '../schemas/responses/user.response.js';

export const usersRoutes = createRouter();

const getMeRoute = createRoute({
	method: 'get',
	path: '/me',
	operationId: 'getMe',
	tags: ['Users'],
	middleware: [authenticateMiddleware] as const,
	responses: {
		200: {
			content: {
				'application/json': {
					schema: userResponseSchema,
				},
			},
			description: 'Usuário autenticado',
		},
	},
});

const getMyFavoriteRecipesRoute = createRoute({
	method: 'get',
	path: '/me/favorites',
	operationId: 'getMyFavoriteRecipes',
	tags: ['Users'],
	middleware: [authenticateMiddleware] as const,
	responses: {
		200: {
			content: {
				'application/json': {
					schema: userFavoriteRecipesResponseSchema,
				},
			},
			description: 'Receitas favoritas do usuário autenticado',
		},
	},
});

usersRoutes.openapi(getMeRoute, async (c) => {
	const { user } = c.get('session');
	const result = await usersController.getMe(user.id);
	return c.json(result, 200);
});

usersRoutes.openapi(getMyFavoriteRecipesRoute, async (c) => {
	const { user } = c.get('session');
	const result = await usersController.getFavoriteRecipes(user.id);
	return c.json(result, 200);
});
