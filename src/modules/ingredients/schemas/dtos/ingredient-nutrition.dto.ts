import { z } from 'zod';

export const ingredientNutritionDtoSchema = z.object({
	energyKcalPer100g: z
		.number({ message: 'A energia deve ser um número' })
		.nonnegative('A energia não pode ser negativa'),
	carbohydratesPer100g: z
		.number({ message: 'Os carboidratos devem ser um número' })
		.nonnegative('Os carboidratos não podem ser negativos'),
	totalSugarsPer100g: z
		.number({ message: 'Os açúcares totais devem ser um número' })
		.nonnegative('Os açúcares não podem ser negativos')
		.optional()
		.nullable(),
	addedSugarsPer100g: z
		.number({ message: 'Os açúcares adicionados devem ser um número' })
		.nonnegative('Os açúcares adicionados não podem ser negativos')
		.optional()
		.nullable(),
	proteinPer100g: z
		.number({ message: 'A proteína deve ser um número' })
		.nonnegative('A proteína não pode ser negativa'),
	totalFatPer100g: z
		.number({ message: 'As gorduras totais devem ser um número' })
		.nonnegative('As gorduras não podem ser negativas'),
	saturatedFatPer100g: z
		.number({ message: 'As gorduras saturadas devem ser um número' })
		.nonnegative('As gorduras saturadas não podem ser negativas')
		.optional()
		.nullable(),
	transFatPer100g: z
		.number({ message: 'As gorduras trans devem ser um número' })
		.nonnegative('As gorduras trans não podem ser negativas')
		.optional()
		.nullable(),
	fiberPer100g: z
		.number({ message: 'A fibra deve ser um número' })
		.nonnegative('A fibra não pode ser negativa')
		.optional()
		.nullable(),
	sodiumMgPer100g: z
		.number({ message: 'O sódio deve ser um número' })
		.nonnegative('O sódio não pode ser negativo')
		.optional()
		.nullable(),
	source: z
		.string({ message: 'A fonte deve ser um texto' })
		.max(100, 'A fonte deve ter no máximo 100 caracteres')
		.optional()
		.nullable(),
});

export type IngredientNutritionDto = z.infer<typeof ingredientNutritionDtoSchema>;

export const updateIngredientNutritionDtoSchema = ingredientNutritionDtoSchema.partial();
export type UpdateIngredientNutritionDto = z.infer<typeof updateIngredientNutritionDtoSchema>;
