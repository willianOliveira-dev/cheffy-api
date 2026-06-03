import { createHash, randomUUID } from 'node:crypto';
import { createRoute, z } from '@hono/zod-openapi';
import type { Context } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { env } from '@/config/env.js';
import { auth } from '@/lib/auth/auth.lib.js';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { recipesController } from '../controllers/recipes.controller.js';
import type { RecipeViewContext } from '../repositories/recipes.repository.js';
import { createRecipeDtoSchema } from '../schemas/dtos/create-recipe.dto.js';
import { findAllRecipesDtoSchema } from '../schemas/dtos/find-all-recipes.dto.js';
import { findMyRecipesDtoSchema } from '../schemas/dtos/find-my-recipes.dto.js';
import { updateRecipeDtoSchema } from '../schemas/dtos/update-recipe.dto.js';
import {
	myRecipesResponseSchema,
	paginatedRecipeListResponseSchema,
	recipeResponseSchema,
} from '../schemas/responses/recipe.response.js';

export const recipesRoutes = createRouter();

const path = '/recipes';
const meRecipesPath = '/me/recipes';
const visitorCookieName = 'cheffy_visitor_id';
const visitorCookieMaxAge = 60 * 60 * 24 * 365;

const getRecipesRoute = createRoute({
	method: 'get',
	path: path,
	operationId: 'getRecipes',
	tags: ['Recipes'],
	request: {
		query: findAllRecipesDtoSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: paginatedRecipeListResponseSchema,
				},
			},
			description: 'Lista de receitas',
		},
	},
});

const getRecipeByIdRoute = createRoute({
	method: 'get',
	path: `${path}/{id}`,
	operationId: 'getRecipeById',
	tags: ['Recipes'],
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita por ID',
		},
	},
});

const getRecipeBySlugRoute = createRoute({
	method: 'get',
	path: `${path}/slug/{slug}`,
	operationId: 'getRecipeBySlug',
	tags: ['Recipes'],
	request: {
		params: z.object({
			slug: z.string(),
		}),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita por slug',
		},
	},
});

const createRecipeRoute = createRoute({
	method: 'post',
	path: path,
	operationId: 'createRecipe',
	tags: ['Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: createRecipeDtoSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita criada',
		},
	},
});

const updateRecipeRoute = createRoute({
	method: 'put',
	path: `${path}/{id}`,
	operationId: 'updateRecipe',
	tags: ['Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: {
			content: {
				'application/json': {
					schema: updateRecipeDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita atualizada',
		},
	},
});

const deleteRecipeRoute = createRoute({
	method: 'delete',
	path: `${path}/{id}`,
	operationId: 'deleteRecipe',
	tags: ['Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		204: {
			description: 'Receita deletada',
		},
	},
});

const getMyRecipesRoute = createRoute({
	method: 'get',
	path: meRecipesPath,
	operationId: 'getMyRecipes',
	tags: ['My Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		query: findMyRecipesDtoSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: myRecipesResponseSchema,
				},
			},
			description: 'Lista de receitas do usuÃ¡rio autenticado',
		},
	},
});

const getMyRecipeByIdRoute = createRoute({
	method: 'get',
	path: `${meRecipesPath}/{id}`,
	operationId: 'getMyRecipeById',
	tags: ['My Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita do usuÃ¡rio autenticado por ID',
		},
	},
});

const createMyRecipeRoute = createRoute({
	method: 'post',
	path: meRecipesPath,
	operationId: 'createMyRecipe',
	tags: ['My Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: createRecipeDtoSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita criada para o usuÃ¡rio autenticado',
		},
	},
});

const updateMyRecipeRoute = createRoute({
	method: 'put',
	path: `${meRecipesPath}/{id}`,
	operationId: 'updateMyRecipe',
	tags: ['My Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
		body: {
			content: {
				'application/json': {
					schema: updateRecipeDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita do usuÃ¡rio autenticado atualizada',
		},
	},
});

const deleteMyRecipeRoute = createRoute({
	method: 'delete',
	path: `${meRecipesPath}/{id}`,
	operationId: 'deleteMyRecipe',
	tags: ['My Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		204: {
			description: 'Receita do usuÃ¡rio autenticado deletada',
		},
	},
});

const favoriteRecipeRoute = createRoute({
	method: 'post',
	path: `${path}/{id}/favorite`,
	operationId: 'favoriteRecipe',
	tags: ['Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita favoritada',
		},
	},
});

const unfavoriteRecipeRoute = createRoute({
	method: 'delete',
	path: `${path}/{id}/favorite`,
	operationId: 'unfavoriteRecipe',
	tags: ['Recipes'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({
			id: z.string().uuid(),
		}),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: recipeResponseSchema,
				},
			},
			description: 'Receita removida dos favoritos',
		},
	},
});

recipesRoutes.openapi(getRecipesRoute, async (c) => {
	const query = c.req.valid('query');
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	const recipes = await recipesController.getAll(query, session?.user.id);
	return c.json(paginatedRecipeListResponseSchema.parse(recipes), 200);
});

recipesRoutes.openapi(getRecipeByIdRoute, async (c) => {
	const { id } = c.req.valid('param');
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	const recipe = await recipesController.getById(id, getRecipeViewContext(c, session?.user.id));
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

recipesRoutes.openapi(getRecipeBySlugRoute, async (c) => {
	const { slug } = c.req.valid('param');
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});
	const recipe = await recipesController.getBySlug(slug, getRecipeViewContext(c, session?.user.id));
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

recipesRoutes.openapi(createRecipeRoute, async (c) => {
	const data = c.req.valid('json');
	const { user } = c.get('session');
	const recipe = await recipesController.create(data, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 201);
});

recipesRoutes.openapi(updateRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const { user } = c.get('session');
	const recipe = await recipesController.update(id, data, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

recipesRoutes.openapi(deleteRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const { user } = c.get('session');
	await recipesController.delete(id, user.id);
	return c.body(null, 204);
});

recipesRoutes.openapi(getMyRecipesRoute, async (c) => {
	const { user } = c.get('session');
	const query = c.req.valid('query');
	const recipes = await recipesController.getOwnRecipes(user.id, query);
	return c.json(myRecipesResponseSchema.parse(recipes), 200);
});

recipesRoutes.openapi(getMyRecipeByIdRoute, async (c) => {
	const { id } = c.req.valid('param');
	const { user } = c.get('session');
	const recipe = await recipesController.getOwnById(id, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

recipesRoutes.openapi(createMyRecipeRoute, async (c) => {
	const data = c.req.valid('json');
	const { user } = c.get('session');
	const recipe = await recipesController.create(data, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 201);
});

recipesRoutes.openapi(updateMyRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const { user } = c.get('session');
	const recipe = await recipesController.update(id, data, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

recipesRoutes.openapi(deleteMyRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const { user } = c.get('session');
	await recipesController.delete(id, user.id);
	return c.body(null, 204);
});

recipesRoutes.openapi(favoriteRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const { user } = c.get('session');
	const recipe = await recipesController.favorite(id, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

recipesRoutes.openapi(unfavoriteRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const { user } = c.get('session');
	const recipe = await recipesController.unfavorite(id, user.id);
	return c.json(recipeResponseSchema.parse(recipe), 200);
});

function getRecipeViewContext(c: Context, userId?: string): RecipeViewContext {
	const userAgent = c.req.header('user-agent');
	const ipHash = hashIp(getClientIp(c));

	if (userId) {
		const viewContext: RecipeViewContext = {
			userId,
		};

		if (ipHash) viewContext.ipHash = ipHash;
		if (userAgent) viewContext.userAgent = userAgent;

		return viewContext;
	}

	let visitorId = getCookie(c, visitorCookieName);
	if (!visitorId) {
		visitorId = randomUUID();
		setCookie(c, visitorCookieName, visitorId, {
			httpOnly: true,
			maxAge: visitorCookieMaxAge,
			path: '/',
			sameSite: 'Lax',
			secure: env.NODE_ENV === 'production',
		});
	}

	const viewContext: RecipeViewContext = {
		visitorId,
	};

	if (ipHash) viewContext.ipHash = ipHash;
	if (userAgent) viewContext.userAgent = userAgent;

	return viewContext;
}

function getClientIp(c: Context): string | undefined {
	const forwardedFor = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
	return c.req.header('cf-connecting-ip') ?? c.req.header('x-real-ip') ?? forwardedFor;
}

function hashIp(ip?: string): string | undefined {
	if (!ip) return undefined;
	return createHash('sha256').update(`${env.BETTER_AUTH_SECRET}:${ip}`).digest('hex');
}
