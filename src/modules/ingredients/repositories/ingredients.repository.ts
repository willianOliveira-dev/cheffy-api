import type { Prisma, PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import type { CreateIngredientDto } from '../schemas/dtos/create-ingredient.dto.js';
import type { FindAllIngredientsDto } from '../schemas/dtos/find-all-ingredients.dto.js';
import type {
	IngredientNutritionDto,
	UpdateIngredientNutritionDto,
} from '../schemas/dtos/ingredient-nutrition.dto.js';
import type { UpdateIngredientDto } from '../schemas/dtos/update-ingredient.dto.js';

export class IngredientsRepository {
	constructor(private readonly db: PrismaClient = prisma) {}

	async create(data: CreateIngredientDto, slug: string) {
		return await this.db.ingredient.create({
			data: {
				name: data.name,
				slug,
				imageUrl: data.imageUrl ?? null,
				category: data.category ?? null,
			},
			include: {
				nutrition: true,
			},
		});
	}

	async findAll(filters: FindAllIngredientsDto) {
		const where: Prisma.IngredientWhereInput = {};

		if (filters.search) {
			where.OR = [
				{ name: { contains: filters.search, mode: 'insensitive' } },
				{ slug: { contains: filters.search, mode: 'insensitive' } },
			];
		}

		if (filters.category) {
			where.category = { equals: filters.category, mode: 'insensitive' };
		}

		const skip = (filters.page - 1) * filters.limit;

		const [items, total] = await Promise.all([
			this.db.ingredient.findMany({
				where,
				skip,
				take: filters.limit,
				orderBy: { name: 'asc' },
				include: { nutrition: true },
			}),
			this.db.ingredient.count({ where }),
		]);

		return { items, total };
	}

	async findById(id: string) {
		return await this.db.ingredient.findUnique({
			where: { id },
			include: { nutrition: true },
		});
	}

	async findBySlug(slug: string) {
		return await this.db.ingredient.findUnique({
			where: { slug },
			include: { nutrition: true },
		});
	}

	async update(id: string, data: UpdateIngredientDto, slug?: string) {
		const updateData: Prisma.IngredientUpdateInput = {};
		if (data.name) updateData.name = data.name;
		if (slug) updateData.slug = slug;
		if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
		if (data.category !== undefined) updateData.category = data.category;

		return await this.db.ingredient.update({
			where: { id },
			data: updateData,
			include: { nutrition: true },
		});
	}

	async delete(id: string) {
		await this.db.ingredient.delete({ where: { id } });
	}

	async getNutrition(ingredientId: string) {
		return await this.db.ingredientNutrition.findUnique({
			where: { ingredientId },
		});
	}

	async upsertNutrition(ingredientId: string, data: IngredientNutritionDto) {
		return await this.db.ingredientNutrition.upsert({
			where: { ingredientId },
			create: {
				ingredientId,
				energyKcalPer100g: data.energyKcalPer100g,
				carbohydratesPer100g: data.carbohydratesPer100g,
				totalSugarsPer100g: data.totalSugarsPer100g ?? null,
				addedSugarsPer100g: data.addedSugarsPer100g ?? null,
				proteinPer100g: data.proteinPer100g,
				totalFatPer100g: data.totalFatPer100g,
				saturatedFatPer100g: data.saturatedFatPer100g ?? null,
				transFatPer100g: data.transFatPer100g ?? null,
				fiberPer100g: data.fiberPer100g ?? null,
				sodiumMgPer100g: data.sodiumMgPer100g ?? null,
				source: data.source ?? null,
			},
			update: {
				energyKcalPer100g: data.energyKcalPer100g,
				carbohydratesPer100g: data.carbohydratesPer100g,
				totalSugarsPer100g: data.totalSugarsPer100g ?? null,
				addedSugarsPer100g: data.addedSugarsPer100g ?? null,
				proteinPer100g: data.proteinPer100g,
				totalFatPer100g: data.totalFatPer100g,
				saturatedFatPer100g: data.saturatedFatPer100g ?? null,
				transFatPer100g: data.transFatPer100g ?? null,
				fiberPer100g: data.fiberPer100g ?? null,
				sodiumMgPer100g: data.sodiumMgPer100g ?? null,
				source: data.source ?? null,
			},
		});
	}

	async updateNutrition(ingredientId: string, data: UpdateIngredientNutritionDto) {
		const updateData: Prisma.IngredientNutritionUpdateInput = {};
		if (data.energyKcalPer100g !== undefined) updateData.energyKcalPer100g = data.energyKcalPer100g;
		if (data.carbohydratesPer100g !== undefined)
			updateData.carbohydratesPer100g = data.carbohydratesPer100g;
		if (data.totalSugarsPer100g !== undefined)
			updateData.totalSugarsPer100g = data.totalSugarsPer100g;
		if (data.addedSugarsPer100g !== undefined)
			updateData.addedSugarsPer100g = data.addedSugarsPer100g;
		if (data.proteinPer100g !== undefined) updateData.proteinPer100g = data.proteinPer100g;
		if (data.totalFatPer100g !== undefined) updateData.totalFatPer100g = data.totalFatPer100g;
		if (data.saturatedFatPer100g !== undefined)
			updateData.saturatedFatPer100g = data.saturatedFatPer100g;
		if (data.transFatPer100g !== undefined) updateData.transFatPer100g = data.transFatPer100g;
		if (data.fiberPer100g !== undefined) updateData.fiberPer100g = data.fiberPer100g;
		if (data.sodiumMgPer100g !== undefined) updateData.sodiumMgPer100g = data.sodiumMgPer100g;
		if (data.source !== undefined) updateData.source = data.source;

		return await this.db.ingredientNutrition.update({
			where: { ingredientId },
			data: updateData,
		});
	}
}
