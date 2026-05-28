import type { z } from 'zod';
import type { recipeSummaryResponseSchema } from '@/modules/recipes/schemas/responses/recipe.response.js';
import { NotFoundError } from '@/shared/errors/app.error.js';
import type { PaginatedResponse } from '@/shared/types/paginated-response.js';
import type { UsersRepository } from '../repositories/users.repository.js';
import type { FindFavoriteRecipesDto } from '../schemas/dtos/find-favorite-recipes.dto.js';

export class UsersService {
	constructor(private readonly repository: UsersRepository) {}

	async getMe(
		userId: string,
	): Promise<NonNullable<Awaited<ReturnType<UsersRepository['findById']>>>> {
		const user = await this.repository.findById(userId);
		if (!user) {
			throw new NotFoundError('Usuário');
		}
		return user;
	}

	async getFavoriteRecipes(
		userId: string,
		filters: FindFavoriteRecipesDto,
	): Promise<PaginatedResponse<z.infer<typeof recipeSummaryResponseSchema>>> {
		await this.getMe(userId);
		const result = await this.repository.findFavoriteRecipes(userId, filters);
		const totalPages = Math.ceil(result.total / filters.limit);

		return {
			items: result.items,
			meta: {
				page: filters.page,
				pageSize: filters.limit,
				totalItems: result.total,
				totalPages,
				hasNext: filters.page < totalPages,
				hasPrevious: filters.page > 1,
			},
		};
	}
}
