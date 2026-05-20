import { createRoute, z } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { recipesController } from '../controllers/recipes.controller.js';
import { createRecipeDtoSchema } from '../schemas/dtos/create-recipe.dto.js';
import { findAllRecipesDtoSchema } from '../schemas/dtos/find-all-recipes.dto.js';
import { updateRecipeDtoSchema } from '../schemas/dtos/update-recipe.dto.js';
import {
	paginatedRecipeListResponseSchema,
	recipeResponseSchema,
} from '../schemas/responses/recipe.response.js';

export const recipesRoutes = createRouter();

const path = '/recipes';

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

recipesRoutes.openapi(getRecipesRoute, async (c) => {
	const query = c.req.valid('query');
	const recipes = await recipesController.getAll(query);
	return c.json(recipes, 200);
});

recipesRoutes.openapi(getRecipeByIdRoute, async (c) => {
	const { id } = c.req.valid('param');
	const recipe = await recipesController.getById(id);
	return c.json(recipe, 200);
});

recipesRoutes.openapi(getRecipeBySlugRoute, async (c) => {
	const { slug } = c.req.valid('param');
	const recipe = await recipesController.getBySlug(slug);
	return c.json(recipe, 200);
});

recipesRoutes.openapi(createRecipeRoute, async (c) => {
	const data = c.req.valid('json');
	const { user } = c.get('session');
	const recipe = await recipesController.create(data, user.id);
	return c.json(recipe, 201);
});

recipesRoutes.openapi(updateRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const recipe = await recipesController.update(id, data);
	return c.json(recipe, 200);
});

recipesRoutes.openapi(deleteRecipeRoute, async (c) => {
	const { id } = c.req.valid('param');
	await recipesController.delete(id);
	return c.body(null, 204);
});
