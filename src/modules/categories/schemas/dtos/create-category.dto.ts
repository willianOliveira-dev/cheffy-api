import { z } from 'zod';

export const createCategoryDtoSchema = z.object({
	name: z
		.string({ message: 'O nome da categoria deve ser um texto' })
		.min(1, 'O nome da categoria e obrigatorio')
		.max(65, 'O nome da categoria deve ter no maximo 65 caracteres'),
	description: z
		.string({ message: 'A descricao deve ser um texto' })
		.max(250, 'A descricao deve ter no maximo 250 caracteres')
		.optional()
		.nullable(),
	iconKey: z
		.string({ message: 'A chave do icone deve ser um texto' })
		.max(30, 'A chave do icone deve ter no maximo 30 caracteres')
		.default('utensils'),
	imageUrl: z
		.string({ message: 'A URL da imagem deve ser um texto' })
		.url('A URL da imagem informada e invalida')
		.optional()
		.nullable(),
	imagePublicId: z
		.string({ message: 'O public ID da imagem deve ser um texto' })
		.optional()
		.nullable(),
	position: z
		.number({ message: 'A posicao deve ser um numero' })
		.int('A posicao deve ser um numero inteiro')
		.nonnegative('A posicao nao pode ser negativa')
		.default(0),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;
