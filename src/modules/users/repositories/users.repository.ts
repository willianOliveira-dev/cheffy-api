import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import type { FindFavoriteRecipesDto } from '../schemas/dtos/find-favorite-recipes.dto.js';

export class UsersRepository {
	async findById(id: string) {
		return await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				email: true,
				emailVerified: true,
				image: true,
			},
		});
	}

	async findFavoriteRecipes(userId: string, filters: FindFavoriteRecipesDto) {
		const where: Prisma.FavoriteWhereInput = {
			userId,
			recipe: {
				deletedAt: null,
			},
		};

		if (filters.search) {
			where.recipe = {
				deletedAt: null,
				OR: [
					{ title: { contains: filters.search, mode: 'insensitive' } },
					{ description: { contains: filters.search, mode: 'insensitive' } },
				],
			};
		}

		const skip = (filters.page - 1) * filters.limit;
		const orderBy: Prisma.FavoriteOrderByWithRelationInput = {
			createdAt: filters.orderBy === 'oldest' ? 'asc' : 'desc',
		};

		const [favorites, total] = await Promise.all([
			prisma.favorite.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy,
				include: {
					recipe: {
						include: {
							author: { select: { id: true, name: true } },
							category: { select: { id: true, name: true, slug: true } },
							tags: { include: { tag: { select: { name: true, slug: true } } } },
							favorites: {
								where: { userId },
								select: { id: true },
								take: 1,
							},
						},
					},
				},
			}),
			prisma.favorite.count({ where }),
		]);

		return {
			items: favorites.map((favorite) => {
				const { favorites, ...recipe } = favorite.recipe;
				return {
					...recipe,
					isFavorited: favorites.length > 0,
				};
			}),
			total,
		};
	}
}
