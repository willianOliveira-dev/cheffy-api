import { createRoute, z } from '@hono/zod-openapi';
import { auth } from '@/lib/auth/auth.lib.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { homeController } from '../controllers/home.controller.js';
import { findCategoryRecipesDtoSchema } from '../schemas/dtos/find-category-recipes.dto.js';
import {
	homeCategoryRecipesResponseSchema,
	homeResponseSchema,
} from '../schemas/responses/home.response.js';

export const homeRoutes = createRouter();

const getHomeRoute = createRoute({
	method: 'get',
	path: '/home',
	operationId: 'getHome',
	tags: ['Home'],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: homeResponseSchema,
				},
			},
			description: 'Dados da home',
		},
	},
});

const getCategoryRecipesRoute = createRoute({
	method: 'get',
	path: '/home/categories/{slug}/recipes',
	operationId: 'getHomeCategoryRecipes',
	tags: ['Home'],
	request: {
		params: z.object({
			slug: z.string(),
		}),
		query: findCategoryRecipesDtoSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: homeCategoryRecipesResponseSchema,
				},
			},
			description: 'Receitas filtradas por categoria',
		},
	},
});

homeRoutes.openapi(getHomeRoute, async (c) => {
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	const result = await homeController.getHome(session?.user.id);
	return c.json(homeResponseSchema.parse(result), 200);
});

homeRoutes.openapi(getCategoryRecipesRoute, async (c) => {
	const { slug } = c.req.valid('param');
	const query = c.req.valid('query');
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	const result = await homeController.getCategoryRecipes(slug, query, session?.user.id);
	return c.json(homeCategoryRecipesResponseSchema.parse(result), 200);
});
