import type { z } from 'zod';
import { findAllRecipesDtoSchema } from '@/modules/recipes/schemas/dtos/find-all-recipes.dto.js';

export const findCategoryRecipesDtoSchema = findAllRecipesDtoSchema.omit({
	categoryId: true,
});

export type FindCategoryRecipesDto = z.infer<typeof findCategoryRecipesDtoSchema>;
