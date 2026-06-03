import { MeasurementUnit } from '@prisma/client';
import { z } from 'zod';

const WEIGHT_UNIT_TO_GRAMS: Partial<Record<MeasurementUnit, number>> = {
	[MeasurementUnit.G]: 1,
	[MeasurementUnit.KG]: 1000,
	[MeasurementUnit.MG]: 0.001,
	[MeasurementUnit.OZ]: 28.3495,
	[MeasurementUnit.LB]: 453.59237,
};

const QUANTITY_IN_GRAMS_TOLERANCE = 0.001;

export const sectionIngredientQuantitySchema = z
	.object({
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
	})
	.superRefine((ingredient, context) => {
		const multiplier = WEIGHT_UNIT_TO_GRAMS[ingredient.unit];
		if (!multiplier) return;

		const convertedQuantityInGrams = convertQuantityToGrams(ingredient.quantity, multiplier);
		if (!convertedQuantityInGrams) {
			context.addIssue({
				code: 'custom',
				path: ['quantity'],
				message: 'Informe a quantidade quando a unidade de medida for em peso',
			});
			return;
		}

		if (!isCloseWeight(ingredient.quantityInGrams, convertedQuantityInGrams)) {
			context.addIssue({
				code: 'custom',
				path: ['quantityInGrams'],
				message: 'A quantidade em gramas deve corresponder à quantidade informada',
			});
		}
	})
	.transform((ingredient) => {
		const multiplier = WEIGHT_UNIT_TO_GRAMS[ingredient.unit];
		if (!multiplier) return ingredient;

		const convertedQuantityInGrams = convertQuantityToGrams(ingredient.quantity, multiplier);
		if (!convertedQuantityInGrams) return ingredient;

		return {
			...ingredient,
			quantityInGrams: convertedQuantityInGrams,
		};
	});

function convertQuantityToGrams(quantity: string | undefined, multiplier: number) {
	const amount = parseQuantityAmount(quantity);
	if (!amount) return undefined;

	return roundIngredientWeight(amount * multiplier);
}

function parseQuantityAmount(quantity: string | undefined) {
	const normalizedQuantity = quantity?.trim().replace(',', '.');
	if (!normalizedQuantity) return undefined;

	const mixedFraction = normalizedQuantity.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
	if (mixedFraction) {
		const whole = Number(mixedFraction[1]);
		const numerator = Number(mixedFraction[2]);
		const denominator = Number(mixedFraction[3]);
		if (denominator > 0) return whole + numerator / denominator;
	}

	const fraction = normalizedQuantity.match(/^(\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
	if (fraction) {
		const numerator = Number(fraction[1]);
		const denominator = Number(fraction[2]);
		if (denominator > 0) return numerator / denominator;
	}

	const numericMatch = normalizedQuantity.match(/^\d+(?:\.\d+)?/);
	const amount = Number(numericMatch?.[0]);
	return Number.isFinite(amount) && amount > 0 ? amount : undefined;
}

function roundIngredientWeight(value: number) {
	return Math.round(value * 1000) / 1000;
}

function isCloseWeight(currentWeight: number, expectedWeight: number) {
	return Math.abs(currentWeight - expectedWeight) <= QUANTITY_IN_GRAMS_TOLERANCE;
}
