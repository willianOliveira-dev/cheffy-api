import { prisma } from '@/lib/db/prisma.js';
import { type RecipeViewContext, RecipesRepository } from '../repositories/recipes.repository.js';
import type { CreateRecipeDto } from '../schemas/dtos/create-recipe.dto.js';
import type { FindAllRecipesDto } from '../schemas/dtos/find-all-recipes.dto.js';
import type { FindMyRecipesDto } from '../schemas/dtos/find-my-recipes.dto.js';
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

	async getAll(query: FindAllRecipesDto, userId?: string): ReturnType<RecipesService['getAll']> {
		return await this.service.getAll(query, userId);
	}

	async getById(
		id: string,
		viewContext?: RecipeViewContext,
	): ReturnType<RecipesService['getById']> {
		return await this.service.getById(id, viewContext);
	}

	async getBySlug(
		slug: string,
		viewContext?: RecipeViewContext,
	): ReturnType<RecipesService['getBySlug']> {
		return await this.service.getBySlug(slug, viewContext);
	}

	async getOwnRecipes(
		userId: string,
		query: FindMyRecipesDto,
	): ReturnType<RecipesService['getOwnRecipes']> {
		return await this.service.getOwnRecipes(userId, query);
	}

	async getOwnById(
		id: string,
		userId: string,
	): ReturnType<RecipesService['getOwnById']> {
		return await this.service.getOwnById(id, userId);
	}

	async update(
		id: string,
		data: UpdateRecipeDto,
		userId: string,
	): ReturnType<RecipesService['updateOwn']> {
		return await this.service.updateOwn(id, userId, data);
	}

	async delete(id: string, userId: string): ReturnType<RecipesService['deleteOwn']> {
		return await this.service.deleteOwn(id, userId);
	}

	async favorite(id: string, userId: string): ReturnType<RecipesService['favorite']> {
		return await this.service.favorite(id, userId);
	}

	async unfavorite(id: string, userId: string): ReturnType<RecipesService['unfavorite']> {
		return await this.service.unfavorite(id, userId);
	}
}

export const recipesController = new RecipesController(recipesService);
