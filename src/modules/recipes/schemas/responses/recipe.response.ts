import { z } from '@hono/zod-openapi';
import { DifficultyLevel, MeasurementUnit, YieldUnit } from '@prisma/client';

const authorSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
});

const categorySummarySchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
});

const categoryResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
	description: z.string().nullable(),
	iconKey: z.string(),
	imageUrl: z.string().nullable(),
	position: z.number(),
	createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
	updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
});

const tagSummarySchema = z.object({
	recipeId: z.string().uuid(),
	tagId: z.string().uuid(),
	tag: z.object({
		name: z.string(),
		slug: z.string(),
	}),
});

const tagResponseSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	slug: z.string(),
});

const recipeTagResponseSchema = z.object({
	recipeId: z.string().uuid(),
	tagId: z.string().uuid(),
	tag: tagResponseSchema,
});

const nutritionLabelResponseSchema = z.object({
	id: z.string().uuid(),
	recipeId: z.string().uuid(),
	totalWeightInGrams: z.number(),
	servingWeightInGrams: z.number(),
	servingsPerRecipe: z.number().nullable(),
	energyKcalPer100g: z.number(),
	carbohydratesPer100g: z.number(),
	totalSugarsPer100g: z.number().nullable(),
	addedSugarsPer100g: z.number().nullable(),
	proteinPer100g: z.number(),
	totalFatPer100g: z.number(),
	saturatedFatPer100g: z.number().nullable(),
	transFatPer100g: z.number().nullable(),
	fiberPer100g: z.number().nullable(),
	sodiumMgPer100g: z.number().nullable(),
	energyKcalPerServing: z.number(),
	carbohydratesPerServing: z.number(),
	totalSugarsPerServing: z.number().nullable(),
	addedSugarsPerServing: z.number().nullable(),
	proteinPerServing: z.number(),
	totalFatPerServing: z.number(),
	saturatedFatPerServing: z.number().nullable(),
	transFatPerServing: z.number().nullable(),
	fiberPerServing: z.number().nullable(),
	sodiumMgPerServing: z.number().nullable(),
	energyKcalDailyValuePercent: z.number().nullable(),
	carbohydratesDailyValuePercent: z.number().nullable(),
	addedSugarsDailyValuePercent: z.number().nullable(),
	proteinDailyValuePercent: z.number().nullable(),
	totalFatDailyValuePercent: z.number().nullable(),
	saturatedFatDailyValuePercent: z.number().nullable(),
	fiberDailyValuePercent: z.number().nullable(),
	sodiumDailyValuePercent: z.number().nullable(),
	isApproximate: z.boolean(),
	createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
	updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
});

export const recipeSectionIngredientResponseSchema = z
	.object({
		id: z.string().uuid(),
		displayText: z.string(),
		quantity: z.string().nullable(),
		quantityInGrams: z.number(),
		unit: z.nativeEnum(MeasurementUnit),
		notes: z.string().nullable(),
		position: z.number(),
		sectionId: z.string().uuid(),
		ingredientId: z.string().uuid(),
		ingredient: z
			.object({
				id: z.string().uuid(),
				name: z.string(),
				slug: z.string(),
				imageUrl: z.string().nullable(),
				category: z.string().nullable(),
				createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
				updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
			})
			.optional(),
	})
	.openapi('RecipeSectionIngredient');

export const preparationStepResponseSchema = z
	.object({
		id: z.string().uuid(),
		description: z.string(),
		position: z.number(),
		stepTime: z.number().nullable(),
		mediaUrl: z.string().nullable(),
		sectionId: z.string().uuid(),
	})
	.openapi('PreparationStep');

export const recipeSectionResponseSchema = z
	.object({
		id: z.string().uuid(),
		title: z.string(),
		position: z.number(),
		recipeId: z.string().uuid(),
		ingredients: z.array(recipeSectionIngredientResponseSchema).optional(),
		steps: z.array(preparationStepResponseSchema).optional(),
	})
	.openapi('RecipeSection');

const baseRecipeSchema = {
	id: z.string().uuid(),
	title: z.string(),
	slug: z.string(),
	description: z.string(),
	imageUrl: z.string().nullable(),
	prepTime: z.number(),
	cookTime: z.number(),
	totalTime: z.number(),
	yieldAmount: z.number(),
	yieldUnit: z.nativeEnum(YieldUnit),
	difficulty: z.nativeEnum(DifficultyLevel),
	isPublished: z.boolean(),
	isFeatured: z.boolean(),
	totalFavorites: z.number(),
	deletedAt: z
		.union([z.string(), z.date()])
		.nullable()
		.openapi({ type: 'string', format: 'date-time' }),
	createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
	updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
	authorId: z.string().uuid(),
	categoryId: z.string().uuid(),
	isFavorited: z.boolean().optional(),
};

export const recipeSummaryResponseSchema = z
	.object({
		...baseRecipeSchema,
		author: authorSchema,
		category: categorySummarySchema,
		tags: z.array(tagSummarySchema),
	})
	.openapi('RecipeSummary');

export const recipeListResponseSchema = z.array(recipeSummaryResponseSchema).openapi('RecipeList');

export const paginatedRecipeListResponseSchema = z
	.object({
		items: z.array(recipeSummaryResponseSchema),
		meta: z.object({
			page: z.number(),
			pageSize: z.number(),
			totalItems: z.number(),
			totalPages: z.number(),
			hasNext: z.boolean(),
			hasPrevious: z.boolean(),
		}),
	})
	.openapi('PaginatedRecipeList');

export const recipeResponseSchema = z
	.object({
		...baseRecipeSchema,
		author: authorSchema.optional(),
		category: categoryResponseSchema.optional(),
		tags: z.array(recipeTagResponseSchema).optional(),
		sections: z.array(recipeSectionResponseSchema).optional(),
		nutritionLabel: nutritionLabelResponseSchema.nullable().optional(),
	})
	.openapi('Recipe');
