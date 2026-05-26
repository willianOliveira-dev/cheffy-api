import { HomeRepository } from '../repositories/home.repository.js';
import type { FindCategoryRecipesDto } from '../schemas/dtos/find-category-recipes.dto.js';
import { HomeService } from '../services/home.service.js';

const repository = new HomeRepository();
export const homeService = new HomeService(repository);

export class HomeController {
	constructor(private readonly service: HomeService) {}

	async getHome(userId?: string): ReturnType<HomeService['getHome']> {
		return await this.service.getHome(userId);
	}

	async getCategoryRecipes(
		slug: string,
		query: FindCategoryRecipesDto,
		userId?: string,
	): ReturnType<HomeService['getCategoryRecipes']> {
		return await this.service.getCategoryRecipes(slug, query, userId);
	}
}

export const homeController = new HomeController(homeService);
