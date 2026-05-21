import { z } from '@hono/zod-openapi';
import {
	paginatedRecipeListResponseSchema,
	recipeSummaryResponseSchema,
} from '@/modules/recipes/schemas/responses/recipe.response.js';

export const homeHeaderCategoryResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		slug: z.string(),
		iconKey: z.string(),
	})
	.openapi('HomeHeaderCategory');

export const homeFavoriteFlavorCategoryResponseSchema = z
	.object({
		id: z.string().uuid(),
		name: z.string(),
		slug: z.string(),
		imageUrl: z.string().nullable(),
	})
	.openapi('HomeFavoriteFlavorCategory');

export const homeResponseSchema = z
	.object({
		headerCategories: z.array(homeHeaderCategoryResponseSchema),
		weeklyHighlights: z.array(recipeSummaryResponseSchema),
		mostAccessedRecipes: z.array(recipeSummaryResponseSchema),
		featuredRecipes: z.array(recipeSummaryResponseSchema),
		favoriteFlavorCategories: z.array(homeFavoriteFlavorCategoryResponseSchema),
	})
	.openapi('Home');

export const homeCategoryRecipesResponseSchema = z
	.object({
		category: homeFavoriteFlavorCategoryResponseSchema.extend({
			description: z.string().nullable(),
			iconKey: z.string(),
		}),
		recipes: paginatedRecipeListResponseSchema,
	})
	.openapi('HomeCategoryRecipes');
