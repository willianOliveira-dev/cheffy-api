import type { z } from 'zod';
import { createTagDtoSchema } from './create-tag.dto.js';

export const updateTagDtoSchema = createTagDtoSchema.partial();

export type UpdateTagDto = z.infer<typeof updateTagDtoSchema>;
