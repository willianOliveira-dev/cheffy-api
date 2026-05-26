import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import type { FindCategoryRecipesDto } from '../schemas/dtos/find-category-recipes.dto.js';

const recipeSummaryInclude = Prisma.validator<Prisma.RecipeInclude>()({
	author: { select: { id: true, name: true } },
	category: { select: { id: true, name: true, slug: true } },
	tags: { include: { tag: { select: { name: true, slug: true } } } },
});

export class HomeRepository {
	async findHeaderCategories() {
		return await prisma.category.findMany({
			orderBy: [{ position: 'asc' }, { name: 'asc' }],
			select: {
				id: true,
				name: true,
				slug: true,
				iconKey: true,
			},
		});
	}

	async findFavoriteFlavorCategories() {
		return await prisma.category.findMany({
			orderBy: [{ position: 'asc' }, { name: 'asc' }],
			select: {
				id: true,
				name: true,
				slug: true,
				imageUrl: true,
			},
		});
	}

	async findWeeklyHighlightRecipes(createdAfter: Date, limit: number) {
		return await prisma.recipe.findMany({
			where: {
				deletedAt: null,
				isPublished: true,
				createdAt: { gte: createdAfter },
			},
			orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
			take: limit,
			include: recipeSummaryInclude,
		});
	}

	async findFallbackWeeklyHighlightRecipes(limit: number) {
		return await prisma.recipe.findMany({
			where: {
				deletedAt: null,
				isPublished: true,
			},
			orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
			take: limit,
			include: recipeSummaryInclude,
		});
	}

	async findMostAccessedRecipes(limit: number) {
		return await prisma.recipe.findMany({
			where: {
				deletedAt: null,
				isPublished: true,
			},
			orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
			take: limit,
			include: recipeSummaryInclude,
		});
	}

	async findFeaturedRecipes(limit: number) {
		return await prisma.recipe.findMany({
			where: {
				deletedAt: null,
				isPublished: true,
				isFeatured: true,
			},
			orderBy: { createdAt: 'desc' },
			take: limit,
			include: recipeSummaryInclude,
		});
	}

	async findCategoryBySlug(slug: string) {
		return await prisma.category.findUnique({
			where: { slug },
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
				iconKey: true,
				imageUrl: true,
			},
		});
	}

	async findCategoryRecipes(categoryId: string, filters: FindCategoryRecipesDto) {
		const where = this.buildRecipeWhere(categoryId, filters);
		const skip = (filters.page - 1) * filters.limit;

		const [items, totalItems] = await Promise.all([
			prisma.recipe.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: this.resolveRecipeOrderBy(filters.orderBy),
				include: recipeSummaryInclude,
			}),
			prisma.recipe.count({ where }),
		]);

		return { items, totalItems };
	}

	private buildRecipeWhere(
		categoryId: string,
		filters: FindCategoryRecipesDto,
	): Prisma.RecipeWhereInput {
		const where: Prisma.RecipeWhereInput = {
			deletedAt: null,
			isPublished: true,
			categoryId,
		};

		if (filters.tagId) where.tags = { some: { tagId: filters.tagId } };
		if (filters.difficulty) where.difficulty = filters.difficulty;
		if (filters.maxTotalTime) where.totalTime = { lte: filters.maxTotalTime };
		if (filters.search) {
			where.OR = [
				{ title: { contains: filters.search, mode: 'insensitive' } },
				{ description: { contains: filters.search, mode: 'insensitive' } },
			];
		}

		return where;
	}

	private resolveRecipeOrderBy(
		orderBy: FindCategoryRecipesDto['orderBy'],
	): Prisma.RecipeOrderByWithRelationInput {
		return orderBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };
	}

	async getFavoritedIds(recipeIds: string[], userId: string): Promise<Set<string>> {
		if (recipeIds.length === 0) return new Set();

		const favorites = await prisma.favorite.findMany({
			where: {
				userId,
				recipeId: { in: recipeIds },
			},
			select: { recipeId: true },
		});

		return new Set(favorites.map((f) => f.recipeId));
	}
}
