import { z } from 'zod';

export const createTagDtoSchema = z.object({
	name: z
		.string({ message: 'O nome da tag deve ser um texto' })
		.min(1, 'O nome da tag Ã© obrigatÃ³rio')
		.max(65, 'O nome da tag deve ter no mÃ¡ximo 65 caracteres'),
});

export type CreateTagDto = z.infer<typeof createTagDtoSchema>;
