import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import type { CreateCategoryDto } from '../schemas/dtos/create-category.dto.js';
import type { FindAllCategoriesDto } from '../schemas/dtos/find-all-categories.dto.js';
import type { UpdateCategoryDto } from '../schemas/dtos/update-category.dto.js';

export class CategoriesRepository {
	constructor(private readonly db: PrismaClient = prisma) {}

	async create(data: CreateCategoryDto, slug: string) {
		return await this.db.category.create({
			data: {
				name: data.name,
				slug,
				description: data.description ?? null,
				iconKey: data.iconKey,
				imageUrl: data.imageUrl ?? null,
				imagePublicId: data.imagePublicId ?? null,
				position: data.position,
			},
		});
	}

	async findAll(filters: FindAllCategoriesDto) {
		const where: Prisma.CategoryWhereInput = {};

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: 'insensitive' } },
				{ slug: { contains: filters.search, mode: 'insensitive' } },
				{ description: { contains: filters.search, mode: 'insensitive' } },
			];
		}

		const orderBy = this.resolveOrderBy(filters.orderBy);
		const skip = (filters.page - 1) * filters.limit;

		const [items, total] = await Promise.all([
			this.db.category.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy,
			}),
			this.db.category.count({ where }),
		]);

		return { items, total };
	}

	async findById(id: string) {
		return await this.db.category.findUnique({ where: { id } });
	}

	async findBySlug(slug: string) {
		return await this.db.category.findUnique({ where: { slug } });
	}

	async findByName(name: string) {
		return await this.db.category.findUnique({ where: { name } });
	}

	async update(id: string, data: UpdateCategoryDto, slug?: string) {
		const updateData: Prisma.CategoryUpdateInput = {};

		if (data.name !== undefined) updateData.name = data.name;
		if (slug !== undefined) updateData.slug = slug;
		if (data.description !== undefined) updateData.description = data.description;
		if (data.iconKey !== undefined) updateData.iconKey = data.iconKey;
		if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
		if (data.imagePublicId !== undefined) updateData.imagePublicId = data.imagePublicId;
		if (data.position !== undefined) updateData.position = data.position;

		return await this.db.category.update({
			where: { id },
			data: updateData,
		});
	}

	async delete(id: string) {
		await this.db.category.delete({ where: { id } });
	}

	async hasRecipes(id: string): Promise<boolean> {
		const count = await this.db.recipe.count({ where: { categoryId: id } });
		return count > 0;
	}

	private resolveOrderBy(
		orderBy: FindAllCategoriesDto['orderBy'],
	): Prisma.CategoryOrderByWithRelationInput {
		switch (orderBy) {
			case 'name':
				return { name: 'asc' };
			case 'newest':
				return { createdAt: 'desc' };
			case 'oldest':
				return { createdAt: 'asc' };
			default:
				return { position: 'asc' };
		}
	}
}
