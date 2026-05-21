import { createRoute, z } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { tagsController } from '../controllers/tags.controller.js';
import { createTagDtoSchema } from '../schemas/dtos/create-tag.dto.js';
import { findAllTagsDtoSchema } from '../schemas/dtos/find-all-tags.dto.js';
import { updateTagDtoSchema } from '../schemas/dtos/update-tag.dto.js';
import {
	paginatedTagListResponseSchema,
	tagResponseSchema,
} from '../schemas/responses/tag.response.js';

export const tagsRoutes = createRouter();

const path = '/tags';

const getTagsRoute = createRoute({
	method: 'get',
	path,
	operationId: 'getTags',
	tags: ['Tags'],
	request: {
		query: findAllTagsDtoSchema,
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: paginatedTagListResponseSchema,
				},
			},
			description: 'Lista de tags',
		},
	},
});

const getTagByIdRoute = createRoute({
	method: 'get',
	path: `${path}/{id}`,
	operationId: 'getTagById',
	tags: ['Tags'],
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: tagResponseSchema,
				},
			},
			description: 'Tag por ID',
		},
	},
});

const getTagBySlugRoute = createRoute({
	method: 'get',
	path: `${path}/slug/{slug}`,
	operationId: 'getTagBySlug',
	tags: ['Tags'],
	request: {
		params: z.object({ slug: z.string() }),
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: tagResponseSchema,
				},
			},
			description: 'Tag por slug',
		},
	},
});

const createTagRoute = createRoute({
	method: 'post',
	path,
	operationId: 'createTag',
	tags: ['Tags'],
	middleware: [authenticateMiddleware] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: createTagDtoSchema,
				},
			},
		},
	},
	responses: {
		201: {
			content: {
				'application/json': {
					schema: tagResponseSchema,
				},
			},
			description: 'Tag criada',
		},
	},
});

const updateTagRoute = createRoute({
	method: 'patch',
	path: `${path}/{id}`,
	operationId: 'updateTag',
	tags: ['Tags'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
		body: {
			content: {
				'application/json': {
					schema: updateTagDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: tagResponseSchema,
				},
			},
			description: 'Tag atualizada',
		},
	},
});

const deleteTagRoute = createRoute({
	method: 'delete',
	path: `${path}/{id}`,
	operationId: 'deleteTag',
	tags: ['Tags'],
	middleware: [authenticateMiddleware] as const,
	request: {
		params: z.object({ id: z.string().uuid() }),
	},
	responses: {
		204: {
			description: 'Tag deletada',
		},
	},
});

tagsRoutes.openapi(getTagsRoute, async (c) => {
	const query = c.req.valid('query');
	const result = await tagsController.getAll(query);
	return c.json(result, 200);
});

tagsRoutes.openapi(getTagByIdRoute, async (c) => {
	const { id } = c.req.valid('param');
	const result = await tagsController.getById(id);
	return c.json(result, 200);
});

tagsRoutes.openapi(getTagBySlugRoute, async (c) => {
	const { slug } = c.req.valid('param');
	const result = await tagsController.getBySlug(slug);
	return c.json(result, 200);
});

tagsRoutes.openapi(createTagRoute, async (c) => {
	const data = c.req.valid('json');
	const result = await tagsController.create(data);
	return c.json(result, 201);
});

tagsRoutes.openapi(updateTagRoute, async (c) => {
	const { id } = c.req.valid('param');
	const data = c.req.valid('json');
	const result = await tagsController.update(id, data);
	return c.json(result, 200);
});

tagsRoutes.openapi(deleteTagRoute, async (c) => {
	const { id } = c.req.valid('param');
	await tagsController.delete(id);
	return c.body(null, 204);
});
