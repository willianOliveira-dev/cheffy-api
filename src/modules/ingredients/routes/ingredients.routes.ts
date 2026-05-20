import { createRoute, z } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { ingredientsController } from '../controllers/ingredients.controller.js';
import { createIngredientDtoSchema } from '../schemas/dtos/create-ingredient.dto.js';
import { findAllIngredientsDtoSchema } from '../schemas/dtos/find-all-ingredients.dto.js';
import {
	ingredientNutritionDtoSchema,
	updateIngredientNutritionDtoSchema,
} from '../schemas/dtos/ingredient-nutrition.dto.js';
import { updateIngredientDtoSchema } from '../schemas/dtos/update-ingredient.dto.js';
import {
	ingredientNutritionResponseSchema,
	ingredientResponseSchema,
	paginatedIngredientListResponseSchema,
} from '../schemas/responses/ingredient.response.js';

export const ingredientsRoutes = createRouter();

const path = '/ingredients';

const getIngredientsRoute = createRoute({
	method: 'get',
	path: path,
	operationId: 'getIngredients',
	tags: ['Ingredients'],
	request: {
		query: findAllIngredientsDtoSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: paginatedIngredientListResponseSchema,
				},
			},
			description: 'Lista de ingredientes',
		},
	},
});

const getIngredientByIdRoute = createRoute({
	method: 'get',
	path: `${path}/{id}`,
	operationId: 'getIngredientById',
	tags: ['Ingredients'],
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ingredientResponseSchema,
				},
			},
			description: 'Ingrediente por ID',
		},
	},
});

const createIngredientRoute = createRoute({
	method: 'post',
	path: path,
	operationId: 'createIngredient',
	tags: ['Ingredients'],
	middleware: [authenticateMiddleware] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: createIngredientDtoSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: ingredientResponseSchema,
				},
			},
			description: 'Ingrediente criado',
		},
	},
});

const updateIngredientRoute = createRoute({
	method: 'patch',
	path: `${path}/{id}`,
	operationId: 'updateIngredient',
	tags: ['Ingredients'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
		body: {
			content: {
				'application/json': {
					schema: updateIngredientDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ingredientResponseSchema,
				},
			},
			description: 'Ingrediente atualizado',
		},
	},
});

const deleteIngredientRoute = createRoute({
	method: 'delete',
	path: `${path}/{id}`,
	operationId: 'deleteIngredient',
	tags: ['Ingredients'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		204: {
			description: 'Ingrediente deletado',
		},
	},
});

const getIngredientNutritionRoute = createRoute({
	method: 'get',
	path: `${path}/{id}/nutrition`,
	operationId: 'getIngredientNutrition',
	tags: ['Ingredients'],
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ingredientNutritionResponseSchema,
				},
			},
			description: 'Informação nutricional do ingrediente',
		},
	},
});

const upsertIngredientNutritionRoute = createRoute({
	method: 'put',
	path: `${path}/{id}/nutrition`,
	operationId: 'upsertIngredientNutrition',
	tags: ['Ingredients'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
		body: {
			content: {
				'application/json': {
					schema: ingredientNutritionDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ingredientNutritionResponseSchema,
				},
			},
			description: 'Informação nutricional atualizada/criada',
		},
	},
});

const updateIngredientNutritionRoute = createRoute({
	method: 'patch',
	path: `${path}/{id}/nutrition`,
	operationId: 'updateIngredientNutrition',
	tags: ['Ingredients'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
		body: {
			content: {
				'application/json': {
					schema: updateIngredientNutritionDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: ingredientNutritionResponseSchema,
				},
			},
			description: 'Informação nutricional atualizada',
		},
	},
});

ingredientsRoutes.openapi(getIngredientsRoute, async (c) => {
	const query = c.req.valid('query');
	const result = await ingredientsController.getAll(query);
	return c.json(result, 200);
});

ingredientsRoutes.openapi(getIngredientByIdRoute, async (c) => {
	const { id } = c.req.valid('param');
	const result = await ingredientsController.getById(id);
	return c.json(result, 200);
});

ingredientsRoutes.openapi(createIngredientRoute, async (c) => {
	const data = c.req.valid('json');
	const result = await ingredientsController.create(data);
	return c.json(result, 201);
});

ingredientsRoutes.openapi(updateIngredientRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const result = await ingredientsController.update(id, data);
	return c.json(result, 200);
});

ingredientsRoutes.openapi(deleteIngredientRoute, async (c) => {
	const { id } = c.req.valid('param');
	await ingredientsController.delete(id);
	return c.body(null, 204);
});

ingredientsRoutes.openapi(getIngredientNutritionRoute, async (c) => {
	const { id } = c.req.valid('param');
	const result = await ingredientsController.getNutrition(id);
	return c.json(result, 200);
});

ingredientsRoutes.openapi(upsertIngredientNutritionRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const result = await ingredientsController.upsertNutrition(id, data);
	return c.json(result, 200);
});

ingredientsRoutes.openapi(updateIngredientNutritionRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const result = await ingredientsController.updateNutrition(id, data);
	return c.json(result, 200);
});
