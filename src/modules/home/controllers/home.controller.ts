import { HomeRepository } from '../repositories/home.repository.js';
import type { FindCategoryRecipesDto } from '../schemas/dtos/find-category-recipes.dto.js';
import { HomeService } from '../services/home.service.js';

const repository = new HomeRepository();
export const homeService = new HomeService(repository);

export class HomeController {
	constructor(private readonly service: HomeService) {}

	async getHome(): ReturnType<HomeService['getHome']> {
		return await this.service.getHome();
	}

	async getCategoryRecipes(
		slug: string,
		filters: FindCategoryRecipesDto,
	): ReturnType<HomeService['getCategoryRecipes']> {
		return await this.service.getCategoryRecipes(slug, filters);
	}
}

export const homeController = new HomeController(homeService);
