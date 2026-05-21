import type { z } from 'zod';
import { createCategoryDtoSchema } from './create-category.dto.js';

export const updateCategoryDtoSchema = createCategoryDtoSchema.partial();

export type UpdateCategoryDto = z.infer<typeof updateCategoryDtoSchema>;
