import { DifficultyLevel, MeasurementUnit, YieldUnit } from '@prisma/client';
import { z } from 'zod';

const preparationStepSchema = z.object({
	description: z
		.string({ message: 'A descrição do passo deve ser um texto' })
		.min(1, 'A descrição do passo é obrigatória'),
	position: z
		.number({ message: 'A posição do passo deve ser um número' })
		.int('A posição do passo deve ser um número inteiro')
		.nonnegative('A posição do passo não pode ser negativa'),
	stepTime: z
		.number({ message: 'O tempo do passo deve ser um número' })
		.int('O tempo do passo deve ser um número inteiro')
		.positive('O tempo do passo deve ser maior que zero')
		.optional(),
	mediaUrl: z
		.string({ message: 'A URL da mídia deve ser um texto' })
		.url('A URL da mídia informada é inválida')
		.optional(),
});

const sectionIngredientSchema = z.object({
	displayText: z
		.string({ message: 'O texto de exibição deve ser um texto' })
		.min(1, 'O texto de exibição é obrigatório'),
	quantity: z.string({ message: 'A quantidade deve ser um texto' }).optional(),
	quantityInGrams: z
		.number({ message: 'A quantidade em gramas deve ser um número' })
		.positive('A quantidade em gramas deve ser maior que zero'),
	unit: z.enum(MeasurementUnit, { message: 'A unidade de medida é inválida' }).default('UNIT'),
	notes: z.string({ message: 'As notas devem ser um texto' }).optional(),
	position: z
		.number({ message: 'A posição do ingrediente deve ser um número' })
		.int('A posição do ingrediente deve ser um número inteiro')
		.nonnegative('A posição do ingrediente não pode ser negativa'),
	ingredientId: z
		.string({ message: 'O ID do ingrediente base deve ser um texto' })
		.uuid('O ID do ingrediente base fornecido é inválido'),
});

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
