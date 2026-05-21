import type { Ingredient, IngredientNutrition } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import { StorageService } from '@/modules/storage/services/storage.service.js';
import { ConflictError, NotFoundError } from '@/shared/errors/app.error.js';
import { generateUniqueSlug } from '@/shared/utils/slug.util.js';
import type { IngredientsRepository } from '../repositories/ingredients.repository.js';
import type { CreateIngredientDto } from '../schemas/dtos/create-ingredient.dto.js';
import type { FindAllIngredientsDto } from '../schemas/dtos/find-all-ingredients.dto.js';
import type {
	IngredientNutritionDto,
	UpdateIngredientNutritionDto,
} from '../schemas/dtos/ingredient-nutrition.dto.js';
import type { UpdateIngredientDto } from '../schemas/dtos/update-ingredient.dto.js';

export class IngredientsService {
	constructor(
		private readonly repository: IngredientsRepository,
		private readonly storageService: StorageService = new StorageService(),
	) {}

	async create(
		dto: CreateIngredientDto,
	): Promise<Ingredient & { nutrition?: IngredientNutrition | null }> {
		const slug = await generateUniqueSlug(prisma.ingredient, dto.name);

		const existing = await this.repository.findBySlug(slug);
		if (existing) {
			throw new ConflictError('Já existe um ingrediente cadastrado com este nome');
		}

		const ingredient = await this.repository.create(dto, slug);
		if (!ingredient.nutrition) {
			await this.repository.upsertNutrition(ingredient.id, {
				energyKcalPer100g: 0,
				carbohydratesPer100g: 0,
				totalSugarsPer100g: 0,
				addedSugarsPer100g: 0,
				proteinPer100g: 0,
				totalFatPer100g: 0,
				saturatedFatPer100g: 0,
				transFatPer100g: 0,
				fiberPer100g: 0,
				sodiumMgPer100g: 0,
				source: null,
			});
		}
		return (await this.repository.findById(ingredient.id)) as Ingredient & {
			nutrition?: IngredientNutrition | null;
		};
	}

	async getAll(filters: FindAllIngredientsDto): Promise<{
		data: Ingredient[];
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
				totalPages: totalPages,
				hasNext: filters.page < totalPages,
				hasPrevious: filters.page > 1,
			},
		};
	}

	async getById(id: string): Promise<Ingredient & { nutrition?: IngredientNutrition | null }> {
		const ingredient = await this.repository.findById(id);
		if (!ingredient) {
			throw new NotFoundError('Ingrediente');
		}
		return ingredient;
	}

	async update(
		id: string,
		dto: UpdateIngredientDto,
	): Promise<Ingredient & { nutrition?: IngredientNutrition | null }> {
		const currentIngredient = await this.getById(id);

		let slug: string | undefined;
		if (dto.name) {
			slug = await generateUniqueSlug(prisma.ingredient, dto.name);
			const existing = await this.repository.findBySlug(slug);
			if (existing && existing.id !== id) {
				throw new ConflictError('Já existe outro ingrediente cadastrado com este nome');
			}
		}

		const updatedIngredient = slug
			? await this.repository.update(id, dto, slug)
			: await this.repository.update(id, dto);

		await this.deleteReplacedImage(currentIngredient.imagePublicId, dto.imagePublicId);

		return updatedIngredient;
	}

	async delete(id: string): Promise<void> {
		const ingredient = await this.getById(id);
		if (ingredient.imagePublicId) {
			await this.storageService.deleteImageAsset(ingredient.imagePublicId);
		}
		await this.repository.delete(id);
	}

	async getNutrition(ingredientId: string): Promise<IngredientNutrition> {
		await this.getById(ingredientId);

		const nutrition = await this.repository.getNutrition(ingredientId);
		if (!nutrition) {
			throw new NotFoundError('Informações nutricionais');
		}
		return nutrition;
	}

	async upsertNutrition(
		ingredientId: string,
		dto: IngredientNutritionDto,
	): Promise<IngredientNutrition> {
		await this.getById(ingredientId);
		const nutritionDto = this.applyDefaultNutrition(dto);
		return await this.repository.upsertNutrition(ingredientId, nutritionDto);
	}

	private applyDefaultNutrition(dto: Partial<IngredientNutritionDto>): IngredientNutritionDto {
		return {
			energyKcalPer100g: dto.energyKcalPer100g ?? 0,
			carbohydratesPer100g: dto.carbohydratesPer100g ?? 0,
			totalSugarsPer100g: dto.totalSugarsPer100g ?? 0,
			addedSugarsPer100g: dto.addedSugarsPer100g ?? 0,
			proteinPer100g: dto.proteinPer100g ?? 0,
			totalFatPer100g: dto.totalFatPer100g ?? 0,
			saturatedFatPer100g: dto.saturatedFatPer100g ?? 0,
			transFatPer100g: dto.transFatPer100g ?? 0,
			fiberPer100g: dto.fiberPer100g ?? 0,
			sodiumMgPer100g: dto.sodiumMgPer100g ?? 0,
			source: dto.source ?? null,
		} as IngredientNutritionDto;
	}

	async updateNutrition(
		ingredientId: string,
		dto: UpdateIngredientNutritionDto,
	): Promise<IngredientNutrition> {
		await this.getById(ingredientId);

		const existing = await this.repository.getNutrition(ingredientId);
		if (!existing) {
			throw new NotFoundError('Informações nutricionais');
		}

		return await this.repository.updateNutrition(ingredientId, dto);
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
