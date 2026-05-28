import { z } from 'zod';

export const findFavoriteRecipesDtoSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	search: z.string().optional(),
	orderBy: z.enum(['newest', 'oldest']).default('newest'),
});

export type FindFavoriteRecipesDto = z.infer<typeof findFavoriteRecipesDtoSchema>;
