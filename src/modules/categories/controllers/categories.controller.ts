import { CategoriesRepository } from '../repositories/categories.repository.js';
import type { CreateCategoryDto } from '../schemas/dtos/create-category.dto.js';
import type { FindAllCategoriesDto } from '../schemas/dtos/find-all-categories.dto.js';
import type { UpdateCategoryDto } from '../schemas/dtos/update-category.dto.js';
import { CategoriesService } from '../services/categories.service.js';

const repository = new CategoriesRepository();
export const categoriesService = new CategoriesService(repository);

export class CategoriesController {
	constructor(private readonly service: CategoriesService) {}

	async create(data: CreateCategoryDto): ReturnType<CategoriesService['create']> {
		return await this.service.create(data);
	}

	async getAll(filters: FindAllCategoriesDto): ReturnType<CategoriesService['getAll']> {
		return await this.service.getAll(filters);
	}

	async getById(id: string): ReturnType<CategoriesService['getById']> {
		return await this.service.getById(id);
	}

	async getBySlug(slug: string): ReturnType<CategoriesService['getBySlug']> {
		return await this.service.getBySlug(slug);
	}

	async update(id: string, data: UpdateCategoryDto): ReturnType<CategoriesService['update']> {
		return await this.service.update(id, data);
	}

	async delete(id: string): ReturnType<CategoriesService['delete']> {
		return await this.service.delete(id);
	}
}

export const categoriesController = new CategoriesController(categoriesService);
