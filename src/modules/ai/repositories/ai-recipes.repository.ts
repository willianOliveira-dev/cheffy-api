import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';

const recipeAssistantSelect = {
	id: true,
	title: true,
	description: true,
	prepTime: true,
	cookTime: true,
	totalTime: true,
	yieldAmount: true,
	yieldUnit: true,
	difficulty: true,
	category: {
		select: {
			name: true,
			slug: true,
		},
	},
	tags: {
		select: {
			tag: {
				select: {
					name: true,
					slug: true,
				},
			},
		},
	},
	sections: {
		orderBy: {
			position: 'asc',
		},
		select: {
			title: true,
			position: true,
			ingredients: {
				orderBy: {
					position: 'asc',
				},
				select: {
					displayText: true,
					quantity: true,
					quantityInGrams: true,
					unit: true,
					notes: true,
					ingredient: {
						select: {
							name: true,
							category: true,
						},
					},
				},
			},
			steps: {
				orderBy: {
					position: 'asc',
				},
				select: {
					description: true,
					position: true,
					stepTime: true,
				},
			},
		},
	},
	nutritionLabel: {
		select: {
			totalWeightInGrams: true,
			servingWeightInGrams: true,
			servingsPerRecipe: true,
			servingUnit: true,
			servingUnitPlural: true,
			servingDescription: true,
			servingsDescription: true,
			energyKcalPer100g: true,
			carbohydratesPer100g: true,
			proteinPer100g: true,
			totalFatPer100g: true,
			fiberPer100g: true,
			sodiumMgPer100g: true,
			energyKcalPerServing: true,
			carbohydratesPerServing: true,
			proteinPerServing: true,
			totalFatPerServing: true,
			fiberPerServing: true,
			sodiumMgPerServing: true,
			isApproximate: true,
		},
	},
} satisfies Prisma.RecipeSelect;

export type RecipeAssistantRecipe = Prisma.RecipeGetPayload<{
	select: typeof recipeAssistantSelect;
}>;

export class AiRecipesRepository {
	constructor(private readonly db: PrismaClient = prisma) {}

	async findRecipeContextById(id: string): Promise<RecipeAssistantRecipe | null> {
		return await this.db.recipe.findFirst({
			where: {
				id,
				deletedAt: null,
			},
			select: recipeAssistantSelect,
		});
	}
}
