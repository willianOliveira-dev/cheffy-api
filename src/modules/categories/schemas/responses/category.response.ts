import { z } from '@hono/zod-openapi';

export const categoryResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		slug: z.string(),
		description: z.string().nullable(),
		iconKey: z.string(),
		imageUrl: z.string().nullable(),
		position: z.number(),
	})
	.openapi('Category');

export const categoryListResponseSchema = z.array(categoryResponseSchema).openapi('CategoryList');

export const paginatedCategoryListResponseSchema = z
	.object({
		data: categoryListResponseSchema,
		meta: z.object({
			page: z.number(),
			pageSize: z.number(),
			totalItems: z.number(),
			totalPages: z.number(),
			hasNext: z.boolean(),
			hasPrevious: z.boolean(),
		}),
	})
	.openapi('PaginatedCategoryList');
