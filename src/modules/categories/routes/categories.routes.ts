import { createRoute, z } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { categoriesController } from '../controllers/categories.controller.js';
import { createCategoryDtoSchema } from '../schemas/dtos/create-category.dto.js';
import { findAllCategoriesDtoSchema } from '../schemas/dtos/find-all-categories.dto.js';
import { updateCategoryDtoSchema } from '../schemas/dtos/update-category.dto.js';
import {
	categoryResponseSchema,
	paginatedCategoryListResponseSchema,
} from '../schemas/responses/category.response.js';

export const categoriesRoutes = createRouter();

const path = '/categories';

const getCategoriesRoute = createRoute({
	method: 'get',
	path,
	operationId: 'getCategories',
	tags: ['Categories'],
	request: {
		query: findAllCategoriesDtoSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: paginatedCategoryListResponseSchema,
				},
			},
			description: 'Lista de categorias',
		},
	},
});

const getCategoryByIdRoute = createRoute({
	method: 'get',
	path: `${path}/{id}`,
	operationId: 'getCategoryById',
	tags: ['Categories'],
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: categoryResponseSchema,
				},
			},
			description: 'Categoria por ID',
		},
	},
});

const getCategoryBySlugRoute = createRoute({
	method: 'get',
	path: `${path}/slug/{slug}`,
	operationId: 'getCategoryBySlug',
	tags: ['Categories'],
	request: {
		params: z.object({ slug: z.string() }),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: categoryResponseSchema,
				},
			},
			description: 'Categoria por slug',
		},
	},
});

const createCategoryRoute = createRoute({
	method: 'post',
	path,
	operationId: 'createCategory',
	tags: ['Categories'],
	middleware: [authenticateMiddleware] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: createCategoryDtoSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: categoryResponseSchema,
				},
			},
			description: 'Categoria criada',
		},
	},
});

const updateCategoryRoute = createRoute({
	method: 'patch',
	path: `${path}/{id}`,
	operationId: 'updateCategory',
	tags: ['Categories'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
		body: {
			content: {
				'application/json': {
					schema: updateCategoryDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: categoryResponseSchema,
				},
			},
			description: 'Categoria atualizada',
		},
	},
});

const deleteCategoryRoute = createRoute({
	method: 'delete',
	path: `${path}/{id}`,
	operationId: 'deleteCategory',
	tags: ['Categories'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		204: {
			description: 'Categoria deletada',
		},
	},
});

categoriesRoutes.openapi(getCategoriesRoute, async (c) => {
	const query = c.req.valid('query');
	const result = await categoriesController.getAll(query);
	return c.json(result, 200);
});

categoriesRoutes.openapi(getCategoryByIdRoute, async (c) => {
	const { id } = c.req.valid('param');
	const result = await categoriesController.getById(id);
	return c.json(result, 200);
});

categoriesRoutes.openapi(getCategoryBySlugRoute, async (c) => {
	const { slug } = c.req.valid('param');
	const result = await categoriesController.getBySlug(slug);
	return c.json(result, 200);
});

categoriesRoutes.openapi(createCategoryRoute, async (c) => {
	const data = c.req.valid('json');
	const result = await categoriesController.create(data);
	return c.json(result, 201);
});

categoriesRoutes.openapi(updateCategoryRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const result = await categoriesController.update(id, data);
	return c.json(result, 200);
});

categoriesRoutes.openapi(deleteCategoryRoute, async (c) => {
	const { id } = c.req.valid('param');
	await categoriesController.delete(id);
	return c.body(null, 204);
});
