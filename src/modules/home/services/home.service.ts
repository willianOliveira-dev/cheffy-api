import { NotFoundError } from '@/shared/errors/app.error.js';
import type { HomeRepository } from '../repositories/home.repository.js';
import type { FindCategoryRecipesDto } from '../schemas/dtos/find-category-recipes.dto.js';

const HOME_SECTION_LIMIT = 10;
const WEEKLY_HIGHLIGHT_DAYS = 7;

type FavoriteAwareRecipe<T extends { id: string }> = T & { isFavorited: boolean };

export class HomeService {
	constructor(private readonly repository: HomeRepository) {}

	async getHome(userId?: string) {
		const [
			headerCategories,
			weeklyHighlights,
			mostAccessedRecipes,
			featuredRecipes,
			favoriteFlavorCategories,
		] = await Promise.all([
			this.repository.findHeaderCategories(),
			this.getWeeklyHighlights(),
			this.repository.findMostAccessedRecipes(HOME_SECTION_LIMIT),
			this.repository.findFeaturedRecipes(HOME_SECTION_LIMIT),
			this.repository.findFavoriteFlavorCategories(),
		]);

		let favoritedIds = new Set<string>();
		if (userId) {
			const allRecipeIds = [
				...weeklyHighlights.map((r) => r.id),
				...mostAccessedRecipes.map((r) => r.id),
				...featuredRecipes.map((r) => r.id),
			];
			favoritedIds = await this.repository.getFavoritedIds(allRecipeIds, userId);
		}

		const mapFavorites = <T extends { id: string }>(recipes: T[]): FavoriteAwareRecipe<T>[] =>
			recipes.map((recipe) => ({ ...recipe, isFavorited: favoritedIds.has(recipe.id) }));

		return {
			headerCategories,
			weeklyHighlights: mapFavorites(weeklyHighlights),
			mostAccessedRecipes: mapFavorites(mostAccessedRecipes),
			featuredRecipes: mapFavorites(featuredRecipes),
			favoriteFlavorCategories,
		};
	}

	async getCategoryRecipes(slug: string, filters: FindCategoryRecipesDto, userId?: string) {
		const category = await this.repository.findCategoryBySlug(slug);
		if (!category) {
			throw new NotFoundError('Categoria');
		}

		const { items, totalItems } = await this.repository.findCategoryRecipes(category.id, filters);
		const totalPages = Math.ceil(totalItems / filters.limit);

		let mappedItems = items;
		if (userId && items.length > 0) {
			const favoritedIds = await this.repository.getFavoritedIds(
				items.map((r) => r.id),
				userId,
			);
			mappedItems = items.map((recipe) => ({
				...recipe,
				isFavorited: favoritedIds.has(recipe.id),
			}));
		}

		return {
			category,
			recipes: {
				items: mappedItems,
				meta: {
					page: filters.page,
					pageSize: filters.limit,
					totalItems,
					totalPages,
					hasNext: filters.page < totalPages,
					hasPrevious: filters.page > 1,
				},
			},
		};
	}

	private async getWeeklyHighlights() {
		const createdAfter = new Date();
		createdAfter.setDate(createdAfter.getDate() - WEEKLY_HIGHLIGHT_DAYS);

		const weeklyHighlights = await this.repository.findWeeklyHighlightRecipes(
			createdAfter,
			HOME_SECTION_LIMIT,
		);

		if (weeklyHighlights.length > 0) {
			return weeklyHighlights;
		}

		return await this.repository.findFallbackWeeklyHighlightRecipes(HOME_SECTION_LIMIT);
	}
}
