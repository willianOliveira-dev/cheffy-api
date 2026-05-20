import { type Prisma, type PrismaClient, YieldUnit } from '@prisma/client';
import type { CreateRecipeDto } from '../schemas/dtos/create-recipe.dto.js';
import type { UpdateRecipeDto } from '../schemas/dtos/update-recipe.dto.js';

const DAILY_VALUES = {
	energyKcal: 2000,
	carbohydrates: 275,
	addedSugars: 50,
	protein: 50,
	totalFat: 78,
	saturatedFat: 20,
	fiber: 28,
	sodiumMg: 2300,
};

export class NutritionCalculatorService {
	constructor(private readonly prisma: PrismaClient) {}

	async calculateForRecipe(
		dto: CreateRecipeDto | UpdateRecipeDto,
	): Promise<Prisma.RecipeNutritionLabelCreateWithoutRecipeInput | null> {
		if (!dto.sections || dto.sections.length === 0) {
			return null;
		}

		const ingredientIds = new Set<string>();
		for (const section of dto.sections) {
			if (section.ingredients) {
				for (const ingredient of section.ingredients) {
					if (ingredient.ingredientId) {
						ingredientIds.add(ingredient.ingredientId);
					}
				}
			}
		}

		if (ingredientIds.size === 0) {
			return null;
		}

		const nutritions = await this.prisma.ingredientNutrition.findMany({
			where: {
				ingredientId: { in: Array.from(ingredientIds) },
			},
		});

		const nutritionMap = new Map(nutritions.map((n) => [n.ingredientId, n]));

		let totalWeightInGrams = 0;
		let totalEnergyKcal = 0;
		let totalCarbohydrates = 0;
		let totalSugars = 0;
		let addedSugars = 0;
		let totalProtein = 0;
		let totalFat = 0;
		let saturatedFat = 0;
		let transFat = 0;
		let fiber = 0;
		let sodiumMg = 0;

		let hasMissingNutrition = false;

		for (const section of dto.sections) {
			if (!section.ingredients) continue;

			for (const ingredient of section.ingredients) {
				if (!ingredient.ingredientId) {
					continue;
				}

				const grams = ingredient.quantityInGrams;
				totalWeightInGrams += grams;

				const nutrition = nutritionMap.get(ingredient.ingredientId);
				if (!nutrition) {
					hasMissingNutrition = true;
					continue;
				}

				const multiplier = grams / 100;

				totalEnergyKcal += nutrition.energyKcalPer100g * multiplier;
				totalCarbohydrates += nutrition.carbohydratesPer100g * multiplier;
				totalProtein += nutrition.proteinPer100g * multiplier;
				totalFat += nutrition.totalFatPer100g * multiplier;

				if (nutrition.totalSugarsPer100g !== null)
					totalSugars += nutrition.totalSugarsPer100g * multiplier;
				if (nutrition.addedSugarsPer100g !== null)
					addedSugars += nutrition.addedSugarsPer100g * multiplier;
				if (nutrition.saturatedFatPer100g !== null)
					saturatedFat += nutrition.saturatedFatPer100g * multiplier;
				if (nutrition.transFatPer100g !== null) transFat += nutrition.transFatPer100g * multiplier;
				if (nutrition.fiberPer100g !== null) fiber += nutrition.fiberPer100g * multiplier;
				if (nutrition.sodiumMgPer100g !== null) sodiumMg += nutrition.sodiumMgPer100g * multiplier;
			}
		}

		if (totalWeightInGrams === 0) {
			return null;
		}

		let servingsPerRecipe = dto.yieldAmount || 1;
		if (dto.yieldUnit === YieldUnit.TO_TASTE) {
			servingsPerRecipe = 1;
		}

		const servingWeightInGrams = totalWeightInGrams / servingsPerRecipe;
		const per100gMultiplier = 100 / totalWeightInGrams;
		const perServingMultiplier = 1 / servingsPerRecipe;

		return {
			totalWeightInGrams,
			servingWeightInGrams,
			servingsPerRecipe,
			isApproximate: hasMissingNutrition,

			energyKcalPer100g: totalEnergyKcal * per100gMultiplier,
			carbohydratesPer100g: totalCarbohydrates * per100gMultiplier,
			totalSugarsPer100g: totalSugars * per100gMultiplier,
			addedSugarsPer100g: addedSugars * per100gMultiplier,
			proteinPer100g: totalProtein * per100gMultiplier,
			totalFatPer100g: totalFat * per100gMultiplier,
			saturatedFatPer100g: saturatedFat * per100gMultiplier,
			transFatPer100g: transFat * per100gMultiplier,
			fiberPer100g: fiber * per100gMultiplier,
			sodiumMgPer100g: sodiumMg * per100gMultiplier,

			energyKcalPerServing: totalEnergyKcal * perServingMultiplier,
			carbohydratesPerServing: totalCarbohydrates * perServingMultiplier,
			totalSugarsPerServing: totalSugars * perServingMultiplier,
			addedSugarsPerServing: addedSugars * perServingMultiplier,
			proteinPerServing: totalProtein * perServingMultiplier,
			totalFatPerServing: totalFat * perServingMultiplier,
			saturatedFatPerServing: saturatedFat * perServingMultiplier,
			transFatPerServing: transFat * perServingMultiplier,
			fiberPerServing: fiber * perServingMultiplier,
			sodiumMgPerServing: sodiumMg * perServingMultiplier,

			energyKcalDailyValuePercent:
				((totalEnergyKcal * perServingMultiplier) / DAILY_VALUES.energyKcal) * 100,
			carbohydratesDailyValuePercent:
				((totalCarbohydrates * perServingMultiplier) / DAILY_VALUES.carbohydrates) * 100,
			addedSugarsDailyValuePercent:
				((addedSugars * perServingMultiplier) / DAILY_VALUES.addedSugars) * 100,
			proteinDailyValuePercent:
				((totalProtein * perServingMultiplier) / DAILY_VALUES.protein) * 100,
			totalFatDailyValuePercent: ((totalFat * perServingMultiplier) / DAILY_VALUES.totalFat) * 100,
			saturatedFatDailyValuePercent:
				((saturatedFat * perServingMultiplier) / DAILY_VALUES.saturatedFat) * 100,
			fiberDailyValuePercent: ((fiber * perServingMultiplier) / DAILY_VALUES.fiber) * 100,
			sodiumDailyValuePercent: ((sodiumMg * perServingMultiplier) / DAILY_VALUES.sodiumMg) * 100,
		};
	}
}
