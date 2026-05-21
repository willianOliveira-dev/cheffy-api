import { z } from 'zod';

export const signUploadDtoSchema = z.object({
	target: z.enum(['recipes', 'ingredients', 'categories']),
	entityId: z.string().uuid('ID do registro invalido'),
});

export type SignUploadDto = z.infer<typeof signUploadDtoSchema>;
