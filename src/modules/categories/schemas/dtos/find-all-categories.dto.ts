import { z } from 'zod';

export const findAllCategoriesDtoSchema = z.object({
	search: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
	orderBy: z.enum(['position', 'name', 'newest', 'oldest']).default('position'),
});

export type FindAllCategoriesDto = z.infer<typeof findAllCategoriesDtoSchema>;
