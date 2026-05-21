import { z } from '@hono/zod-openapi';

export const tagResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		slug: z.string(),
	})
	.openapi('Tag');

export const tagListResponseSchema = z.array(tagResponseSchema).openapi('TagList');

export const paginatedTagListResponseSchema = z
	.object({
		data: tagListResponseSchema,
		meta: z.object({
			page: z.number(),
			pageSize: z.number(),
			totalItems: z.number(),
			totalPages: z.number(),
			hasNext: z.boolean(),
			hasPrevious: z.boolean(),
		}),
	})
	.openapi('PaginatedTagList');
