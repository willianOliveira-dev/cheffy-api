import { z } from 'zod';

export const findMyRecipesDtoSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	search: z.string().optional(),
	orderBy: z.enum(['newest', 'oldest']).default('newest'),
	isPublished: z
		.enum(['true', 'false'], { message: 'O filtro de publicacao deve ser true ou false' })
		.optional(),
});

export type FindMyRecipesDto = z.infer<typeof findMyRecipesDtoSchema>;
