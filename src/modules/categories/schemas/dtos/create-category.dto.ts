import { z } from 'zod';

export const createCategoryDtoSchema = z.object({
	name: z
		.string({ message: 'O nome da categoria deve ser um texto' })
		.min(1, 'O nome da categoria é obrigatório')
		.max(65, 'O nome da categoria deve ter no máximo 65 caracteres'),
	description: z
		.string({ message: 'A descrição deve ser um texto' })
		.max(250, 'A descrição deve ter no máximo 250 caracteres')
		.optional()
		.nullable(),
	iconKey: z
		.string({ message: 'A chave do ícone deve ser um texto' })
		.max(30, 'A chave do ícone deve ter no máximo 30 caracteres')
		.default('utensils'),
	imageUrl: z
		.string({ message: 'A URL da imagem deve ser um texto' })
		.url('A URL da imagem informada é inválida')
		.optional()
		.nullable(),
	position: z
		.number({ message: 'A posição deve ser um número' })
		.int('A posição deve ser um número inteiro')
		.nonnegative('A posição não pode ser negativa')
		.default(0),
});

export type CreateCategoryDto = z.infer<typeof createCategoryDtoSchema>;