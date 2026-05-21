import { NotFoundError } from '@/shared/errors/app.error.js';
import type { UsersRepository } from '../repositories/users.repository.js';

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

	async getFavoriteRecipes(userId: string): ReturnType<UsersRepository['findFavoriteRecipes']> {
		await this.getMe(userId);
		return await this.repository.findFavoriteRecipes(userId);
	}
}
