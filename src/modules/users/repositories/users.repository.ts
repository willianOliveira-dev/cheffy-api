import { prisma } from '@/lib/db/prisma.js';

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
				createdAt: true,
				updatedAt: true,
			},
		});
	}

	async findFavoriteRecipes(userId: string) {
		const favorites = await prisma.favorite.findMany({
			where: {
				userId,
				recipe: { deletedAt: null },
			},
			orderBy: { createdAt: 'desc' },
			include: {
				recipe: {
					include: {
						author: { select: { id: true, name: true } },
						category: { select: { id: true, name: true, slug: true } },
						tags: { include: { tag: { select: { name: true, slug: true } } } },
					},
				},
			},
		});

		return favorites.map((favorite) => favorite.recipe);
	}
}
