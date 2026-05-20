import { z } from 'zod';

export const createIngredientDtoSchema = z.object({
	name: z
		.string({ message: 'O nome do ingrediente deve ser um texto' })
		.min(1, 'O nome do ingrediente é obrigatório'),
	imageUrl: z
		.string({ message: 'A URL da imagem deve ser um texto' })
		.url('A URL da imagem informada é inválida')
		.optional()
		.nullable(),
	category: z
		.string({ message: 'A categoria deve ser um texto' })
		.max(50, 'A categoria deve ter no máximo 50 caracteres')
		.optional()
		.nullable(),
});

export type CreateIngredientDto = z.infer<typeof createIngredientDtoSchema>;
