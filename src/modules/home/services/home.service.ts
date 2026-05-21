import { NotFoundError } from '@/shared/errors/app.error.js';
import type { HomeRepository } from '../repositories/home.repository.js';
import type { FindCategoryRecipesDto } from '../schemas/dtos/find-category-recipes.dto.js';

const HOME_SECTION_LIMIT = 10;
const WEEKLY_HIGHLIGHT_DAYS = 7;

export class HomeService {
	constructor(private readonly repository: HomeRepository) {}

	async getHome() {
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

		return {
			headerCategories,
			weeklyHighlights,
			mostAccessedRecipes,
			featuredRecipes,
			favoriteFlavorCategories,
		};
	}

	async getCategoryRecipes(slug: string, filters: FindCategoryRecipesDto) {
		const category = await this.repository.findCategoryBySlug(slug);
		if (!category) {
			throw new NotFoundError('Categoria');
		}

		const { items, totalItems } = await this.repository.findCategoryRecipes(category.id, filters);
		const totalPages = Math.ceil(totalItems / filters.limit);

		return {
			category,
			recipes: {
				items,
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
