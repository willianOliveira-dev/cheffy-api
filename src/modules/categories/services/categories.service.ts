import type { Category } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import { BadRequestError, ConflictError, NotFoundError } from '@/shared/errors/app.error.js';
import { generateUniqueSlug } from '@/shared/utils/slug.util.js';
import type { CategoriesRepository } from '../repositories/categories.repository.js';
import type { CreateCategoryDto } from '../schemas/dtos/create-category.dto.js';
import type { FindAllCategoriesDto } from '../schemas/dtos/find-all-categories.dto.js';
import type { UpdateCategoryDto } from '../schemas/dtos/update-category.dto.js';

export class CategoriesService {
	constructor(private readonly repository: CategoriesRepository) {}

	async create(dto: CreateCategoryDto): Promise<Category> {
		const existing = await this.repository.findByName(dto.name);
		if (existing) {
			throw new ConflictError('Já existe uma categoria cadastrada com este nome');
		}

		const slug = await generateUniqueSlug(prisma.category, dto.name);

		return await this.repository.create(dto, slug);
	}

	async getAll(filters: FindAllCategoriesDto): Promise<{
		data: Category[];
		meta: {
			page: number;
			pageSize: number;
			totalItems: number;
			totalPages: number;
			hasNext: boolean;
			hasPrevious: boolean;
		};
	}> {
		const result = await this.repository.findAll(filters);
		const totalPages = Math.ceil(result.total / filters.limit);

		return {
			data: result.items,
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

	async getById(id: string): Promise<Category> {
		const category = await this.repository.findById(id);
		if (!category) {
			throw new NotFoundError('Categoria');
		}
		return category;
	}

	async getBySlug(slug: string): Promise<Category> {
		const category = await this.repository.findBySlug(slug);
		if (!category) {
			throw new NotFoundError('Categoria');
		}
		return category;
	}

	async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
		await this.getById(id);

		if (dto.name !== undefined) {
			const existing = await this.repository.findByName(dto.name);
			if (existing && existing.id !== id) {
				throw new ConflictError('Já existe outra categoria cadastrada com este nome');
			}
		}

		let slug: string | undefined;
		if (dto.name !== undefined) {
			slug = await generateUniqueSlug(prisma.category, dto.name);
		}

		return await this.repository.update(id, dto, slug);
	}

	async delete(id: string): Promise<void> {
		await this.getById(id);

		const hasRecipes = await this.repository.hasRecipes(id);
		if (hasRecipes) {
			throw new BadRequestError(
				'Não é possível excluir uma categoria que possui receitas associadas',
			);
		}

		await this.repository.delete(id);
	}
}