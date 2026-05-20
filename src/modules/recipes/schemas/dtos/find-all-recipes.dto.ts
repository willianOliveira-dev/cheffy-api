import { DifficultyLevel } from '@prisma/client';
import { z } from 'zod';

export const findAllRecipesDtoSchema = z.object({
	page: z.coerce.number().int().positive().default(1),
	limit: z.coerce.number().int().positive().default(10),
	categoryId: z.string().uuid('ID de categoria inválido').optional(),
	tagId: z.string().uuid('ID de tag inválido').optional(),
	search: z.string().optional(),
	difficulty: z.nativeEnum(DifficultyLevel).optional(),
	maxTotalTime: z.coerce.number().int().positive().optional(),
	orderBy: z.enum(['newest', 'oldest']).default('newest'),
});

export type FindAllRecipesDto = z.infer<typeof findAllRecipesDtoSchema>;
