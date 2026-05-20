import type { z } from 'zod';
import { createIngredientDtoSchema } from './create-ingredient.dto.js';

export const updateIngredientDtoSchema = createIngredientDtoSchema.partial();

export type UpdateIngredientDto = z.infer<typeof updateIngredientDtoSchema>;
