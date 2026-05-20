import type { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { prisma } from '@/lib/db/prisma.js';
import { BadRequestError, NotFoundError } from '@/shared/errors/app.error.js';
import type { PaginatedResponse } from '@/shared/types/paginated-response.js';
import type { RecipesRepository } from '../repositories/recipes.repository.js';
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
	) {}

	async create(
		dto: CreateRecipeDto,
		authorId: string,
	): Promise<Awaited<ReturnType<RecipesRepository['create']>>> {
		const nutritionData = await this.nutritionCalculator.calculateForRecipe(dto);
		return await this.repository.create(dto, authorId, nutritionData);
	}

	async getById(id: string): Promise<NonNullable<Awaited<ReturnType<RecipesRepository['findById']>>>> {
		const recipe = await this.repository.findById(id);
		if (!recipe) throw new NotFoundError('Receita');
		return recipe;
	}

	async getBySlug(slug: string): Promise<NonNullable<Awaited<ReturnType<RecipesRepository['findBySlug']>>>> {
		const recipe = await this.repository.findBySlug(slug);
		if (!recipe) throw new NotFoundError('Receita');
		return recipe;
	}

	async getAll(
		dto: FindAllRecipesDto,
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
		const items = await this.repository.findAll(dto);
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
		await this.getById(id);
		let nutritionData = null;
		if (data.sections) {
			nutritionData = await this.nutritionCalculator.calculateForRecipe(data);
		}
		return await this.repository.update(id, data, nutritionData);
	}

	async delete(id: string): Promise<Awaited<ReturnType<RecipesRepository['delete']>>> {
		await this.getById(id);
		return await this.repository.delete(id);
	}
}
