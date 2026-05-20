import { z } from '@hono/zod-openapi';

export const ingredientNutritionResponseSchema = z
	.object({
		id: z.string().uuid(),
		ingredientId: z.string().uuid(),
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
		source: z.string().nullable(),
		createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
		updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
	})
	.openapi('IngredientNutrition');

export const ingredientResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		slug: z.string(),
		imageUrl: z.string().nullable(),
		category: z.string().nullable(),
		createdAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
		updatedAt: z.union([z.string(), z.date()]).openapi({ type: 'string', format: 'date-time' }),
		nutrition: ingredientNutritionResponseSchema.nullable().optional(),
	})
	.openapi('Ingredient');

export const ingredientListResponseSchema = z
	.array(ingredientResponseSchema)
	.openapi('IngredientList');

export const paginatedIngredientListResponseSchema = z
	.object({
		data: ingredientListResponseSchema,
		meta: z.object({
			page: z.number(),
			pageSize: z.number(),
			totalItems: z.number(),
			totalPages: z.number(),
			hasNext: z.boolean(),
			hasPrevious: z.boolean(),
		}),
	})
	.openapi('PaginatedIngredientList');
