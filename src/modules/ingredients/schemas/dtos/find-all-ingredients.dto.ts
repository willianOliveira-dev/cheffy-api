import { z } from 'zod';

export const findAllIngredientsDtoSchema = z.object({
	search: z.string().optional(),
	category: z.string().optional(),
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().max(100).default(20),
});

export type FindAllIngredientsDto = z.infer<typeof findAllIngredientsDtoSchema>;
