import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '@/lib/db/prisma.js';
import { StorageService } from '@/modules/storage/services/storage.service.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';
import type { PaginatedResponse } from '@/shared/types/paginated-response.js';
import type { RecipesRepository, RecipeViewContext } from '../repositories/recipes.repository.js';
import type { CreateRecipeDto } from '../schemas/dtos/create-recipe.dto.js';
import type { FindAllRecipesDto } from '../schemas/dtos/find-all-recipes.dto.js';
import { findAllRecipesDtoSchema } from '../schemas/dtos/find-all-recipes.dto.js';
import type { UpdateRecipeDto } from '../schemas/dtos/update-recipe.dto.js';
import type { recipeSummaryResponseSchema } from '../schemas/responses/recipe.response.js';
import type { NutritionCalculatorService } from './nutrition-calculator.service.js';

export class RecipesService {
	constructor(
		private readonly repository: RecipesRepository,
		private readonly nutritionCalculator: NutritionCalculatorService,
		private readonly storageService: StorageService = new StorageService(),
	) {}

	async create(
		dto: CreateRecipeDto,
		authorId: string,
	): Promise<Awaited<ReturnType<RecipesRepository['create']>>> {
		const nutritionData = await this.nutritionCalculator.calculateForRecipe(dto);
		return await this.repository.create(dto, authorId, nutritionData);
	}

	async getById(
		id: string,
		viewContext?: RecipeViewContext,
	): Promise<NonNullable<Awaited<ReturnType<RecipesRepository['findById']>>>> {
		const recipe = await this.repository.findById(id, viewContext);
		if (!recipe) throw new NotFoundError('Receita');
		return recipe;
	}

	async getBySlug(
		slug: string,
		viewContext?: RecipeViewContext,
	): Promise<NonNullable<Awaited<ReturnType<RecipesRepository['findBySlug']>>>> {
		const recipe = await this.repository.findBySlug(slug, viewContext);
		if (!recipe) throw new NotFoundError('Receita');
		return recipe;
	}

	async getAll(
		dto: FindAllRecipesDto,
		userId?: string,
	): Promise<PaginatedResponse<z.infer<typeof recipeSummaryResponseSchema>>> {
		const parseResult = findAllRecipesDtoSchema.safeParse(dto);
		if (!parseResult.success) {
			throw new BadRequestError(parseResult.error.message);
		}
		const opts = parseResult.data;

		const where: Prisma.RecipeWhereInput = { deletedAt: null };
		if (opts.categoryId) where.categoryId = opts.categoryId;
		if (opts.tagId) where.tags = { some: { tagId: opts.tagId } };
		if (opts.difficulty) where.difficulty = opts.difficulty;
		if (opts.maxTotalTime) where.totalTime = { lte: opts.maxTotalTime };
		if (opts.search) {
			where.OR = [
				{ title: { contains: opts.search, mode: 'insensitive' } },
				{ description: { contains: opts.search, mode: 'insensitive' } },
			];
		}

		const total = await prisma.recipe.count({ where });
		const items = await this.repository.findAll(dto, userId);
		const totalPages = Math.ceil(total / opts.limit);

		return {
			items,
			meta: {
				page: opts.page,
				pageSize: opts.limit,
				totalItems: total,
				totalPages,
				hasNext: opts.page < totalPages,
				hasPrevious: opts.page > 1,
			},
		};
	}

	async update(
		id: string,
		data: UpdateRecipeDto,
	): Promise<Awaited<ReturnType<RecipesRepository['update']>>> {
		const currentRecipe = await this.getById(id);
		let nutritionData = null;
		if (data.sections) {
			nutritionData = await this.nutritionCalculator.calculateForRecipe(data);
		}
		const updatedRecipe = await this.repository.update(id, data, nutritionData);
		await this.deleteReplacedImage(currentRecipe.imagePublicId, data.imagePublicId);

		return updatedRecipe;
	}

	async delete(id: string): Promise<Awaited<ReturnType<RecipesRepository['delete']>>> {
		const recipe = await this.getById(id);
		if (recipe.imagePublicId) {
			await this.storageService.deleteImageAsset(recipe.imagePublicId);
		}
		return await this.repository.delete(id);
	}

	async favorite(
		id: string,
		userId: string,
	): Promise<NonNullable<Awaited<ReturnType<RecipesRepository['favorite']>>>> {
		const recipe = await this.repository.favorite(id, userId);
		if (!recipe) throw new NotFoundError('Receita');
		return recipe;
	}

	async unfavorite(
		id: string,
		userId: string,
	): Promise<NonNullable<Awaited<ReturnType<RecipesRepository['unfavorite']>>>> {
		const recipe = await this.repository.unfavorite(id, userId);
		if (!recipe) throw new NotFoundError('Receita');
		return recipe;
	}

	private async deleteReplacedImage(
		currentImagePublicId: string | null,
		nextImagePublicId?: string | null,
	) {
		if (nextImagePublicId === undefined) return;
		if (!currentImagePublicId) return;
		if (nextImagePublicId === currentImagePublicId) return;

		await this.storageService.deleteImageAsset(currentImagePublicId);
	}
}
