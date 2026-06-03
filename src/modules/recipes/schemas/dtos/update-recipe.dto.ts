import { DifficultyLevel, YieldUnit } from '@prisma/client';
import { z } from 'zod';
import { sectionIngredientQuantitySchema } from './recipe-ingredient-quantity.schema.js';

const preparationStepSchema = z.object({
	description: z
		.string({ message: 'A descrição do passo deve ser um texto' })
		.min(1, 'A descrição do passo é obrigatória'),
	position: z
		.number({ message: 'A posição do passo deve ser um número' })
		.int('A posição do passo deve ser um número inteiro')
		.nonnegative('A posição do passo não pode ser negativa'),
	imageUrl: z
		.string({ message: 'A URL da imagem deve ser um texto' })
		.url('A URL da imagem informada é inválida')
		.optional()
		.nullable(),
	imagePublicId: z
		.string({ message: 'O public ID da imagem deve ser um texto' })
		.optional()
		.nullable(),
});

const sectionIngredientSchema = sectionIngredientQuantitySchema;

const recipeSectionSchema = z.object({
	title: z
		.string({ message: 'O título da seção deve ser um texto' })
		.min(1, 'O título da seção é obrigatório'),
	position: z
		.number({ message: 'A posição da seção deve ser um número' })
		.int('A posição da seção deve ser um número inteiro')
		.nonnegative('A posição da seção não pode ser negativa'),
	ingredients: z
		.array(sectionIngredientSchema, {
			message: 'Os ingredientes devem ser fornecidos em forma de lista',
		})
		.min(1, 'A seção precisa de pelo menos um ingrediente'),
	steps: z
		.array(preparationStepSchema, { message: 'Os passos devem ser fornecidos em forma de lista' })
		.min(1, 'A seção precisa de pelo menos um passo de preparo'),
});

export const updateRecipeDtoSchema = z
	.object({
		title: z
			.string({ message: 'O título da receita deve ser um texto' })
			.min(1, 'O título da receita é obrigatório')
			.optional(),
		description: z
			.string({ message: 'A descrição deve ser um texto' })
			.min(1, 'A descrição é obrigatória')
			.optional(),
		imageUrl: z
			.string({ message: 'A URL da imagem deve ser um texto' })
			.url('A URL da imagem informada e invalida')
			.optional()
			.nullable(),
		imagePublicId: z
			.string({ message: 'O public ID da imagem deve ser um texto' })
			.optional()
			.nullable(),
		prepTime: z
			.number({ message: 'O tempo de preparação é obrigatório' })
			.int('O tempo de preparação deve ser um número inteiro')
			.positive('O tempo de preparação deve ser um número positivo')
			.optional(),
		cookTime: z
			.number({ message: 'O tempo de cozimento é obrigatório' })
			.int('O tempo de cozimento deve ser um número inteiro')
			.positive('O tempo de cozimento deve ser um número positivo')
			.optional(),
		yieldAmount: z
			.number({ message: 'O rendimento é obrigatório' })
			.int('O rendimento deve ser um número inteiro')
			.positive('O rendimento deve ser um número positivo')
			.optional(),
		yieldUnit: z
			.enum(YieldUnit, { message: 'A unidade de rendimento informada é inválida' })
			.default('PORTIONS')
			.optional(),
		difficulty: z
			.enum(DifficultyLevel, { message: 'A dificuldade informada é inválida' })
			.default('MEDIUM')
			.optional(),
		categoryId: z
			.string({ message: 'O ID da categoria deve ser um texto' })
			.uuid('O ID da categoria fornecido é inválido')
			.optional(),
		sections: z
			.array(recipeSectionSchema, { message: 'As seções devem ser fornecidas em forma de lista' })
			.min(1, 'A receita deve possuir ao menos uma seção')
			.optional(),
		tagIds: z
			.array(
				z
					.string({ message: 'O ID da tag deve ser um texto' })
					.uuid('O ID da tag fornecido é inválido'),
				{ message: 'As tags devem ser fornecidas em forma de lista' },
			)
			.optional(),
	})
	.partial();

export type UpdateRecipeDto = z.infer<typeof updateRecipeDtoSchema>;
