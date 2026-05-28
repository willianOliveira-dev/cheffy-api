import { UsersRepository } from '../repositories/users.repository.js';
import type { FindFavoriteRecipesDto } from '../schemas/dtos/find-favorite-recipes.dto.js';
import { UsersService } from '../services/users.service.js';

const repository = new UsersRepository();
export const usersService = new UsersService(repository);

export class UsersController {
	constructor(private readonly service: UsersService) {}

	async getMe(userId: string): ReturnType<UsersService['getMe']> {
		return await this.service.getMe(userId);
	}

	async getFavoriteRecipes(
		userId: string,
		filters: FindFavoriteRecipesDto,
	): ReturnType<UsersService['getFavoriteRecipes']> {
		return await this.service.getFavoriteRecipes(userId, filters);
	}
}

export const usersController = new UsersController(usersService);
