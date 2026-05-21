import { z } from 'zod';

export const createIngredientDtoSchema = z.object({
	name: z
		.string({ message: 'O nome do ingrediente deve ser um texto' })
		.min(1, 'O nome do ingrediente e obrigatorio'),
	imageUrl: z
		.string({ message: 'A URL da imagem deve ser um texto' })
		.url('A URL da imagem informada e invalida')
		.optional()
		.nullable(),
	imagePublicId: z
		.string({ message: 'O public ID da imagem deve ser um texto' })
		.optional()
		.nullable(),
	category: z
		.string({ message: 'A categoria deve ser um texto' })
		.max(50, 'A categoria deve ter no maximo 50 caracteres')
		.optional()
		.nullable(),
});

export type CreateIngredientDto = z.infer<typeof createIngredientDtoSchema>;
