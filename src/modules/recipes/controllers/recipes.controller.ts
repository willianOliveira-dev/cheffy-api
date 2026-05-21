import { prisma } from '@/lib/db/prisma.js';
import { RecipesRepository } from '../repositories/recipes.repository.js';
import type { CreateRecipeDto } from '../schemas/dtos/create-recipe.dto.js';
import type { FindAllRecipesDto } from '../schemas/dtos/find-all-recipes.dto.js';
import type { UpdateRecipeDto } from '../schemas/dtos/update-recipe.dto.js';
import { NutritionCalculatorService } from '../services/nutrition-calculator.service.js';
import { RecipesService } from '../services/recipes.service.js';

const repository = new RecipesRepository();
const nutritionCalculator = new NutritionCalculatorService(prisma);
export const recipesService = new RecipesService(repository, nutritionCalculator);

export class RecipesController {
	constructor(private readonly service: RecipesService) {}

	async create(data: CreateRecipeDto, userId: string): ReturnType<RecipesService['create']> {
		return await this.service.create(data, userId);
	}

	async getAll(query: FindAllRecipesDto): ReturnType<RecipesService['getAll']> {
		return await this.service.getAll(query);
	}

	async getById(id: string, userId?: string): ReturnType<RecipesService['getById']> {
		return await this.service.getById(id, userId);
	}

	async getBySlug(slug: string): ReturnType<RecipesService['getBySlug']> {
		return await this.service.getBySlug(slug);
	}

	async update(id: string, data: UpdateRecipeDto): ReturnType<RecipesService['update']> {
		return await this.service.update(id, data);
	}

	async delete(id: string): ReturnType<RecipesService['delete']> {
		return await this.service.delete(id);
	}

	async favorite(id: string, userId: string): ReturnType<RecipesService['favorite']> {
		return await this.service.favorite(id, userId);
	}

	async unfavorite(id: string, userId: string): ReturnType<RecipesService['unfavorite']> {
		return await this.service.unfavorite(id, userId);
	}
}

export const recipesController = new RecipesController(recipesService);
