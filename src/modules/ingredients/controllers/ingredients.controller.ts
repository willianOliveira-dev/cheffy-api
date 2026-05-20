import { IngredientsRepository } from '../repositories/ingredients.repository.js';
import type { CreateIngredientDto } from '../schemas/dtos/create-ingredient.dto.js';
import type { FindAllIngredientsDto } from '../schemas/dtos/find-all-ingredients.dto.js';
import type {
	IngredientNutritionDto,
	UpdateIngredientNutritionDto,
} from '../schemas/dtos/ingredient-nutrition.dto.js';
import type { UpdateIngredientDto } from '../schemas/dtos/update-ingredient.dto.js';
import { IngredientsService } from '../services/ingredients.service.js';

const repository = new IngredientsRepository();
export const ingredientsService = new IngredientsService(repository);

export class IngredientsController {
	constructor(private readonly service: IngredientsService) {}

	async create(data: CreateIngredientDto): ReturnType<IngredientsService['create']> {
		return await this.service.create(data);
	}

	async getAll(filters: FindAllIngredientsDto): ReturnType<IngredientsService['getAll']> {
		return await this.service.getAll(filters);
	}

	async getById(id: string): ReturnType<IngredientsService['getById']> {
		return await this.service.getById(id);
	}

	async update(id: string, data: UpdateIngredientDto): ReturnType<IngredientsService['update']> {
		return await this.service.update(id, data);
	}

	async delete(id: string): ReturnType<IngredientsService['delete']> {
		return await this.service.delete(id);
	}

	async getNutrition(ingredientId: string): ReturnType<IngredientsService['getNutrition']> {
		return await this.service.getNutrition(ingredientId);
	}

	async upsertNutrition(
		ingredientId: string,
		data: IngredientNutritionDto,
	): ReturnType<IngredientsService['upsertNutrition']> {
		return await this.service.upsertNutrition(ingredientId, data);
	}

	async updateNutrition(
		ingredientId: string,
		data: UpdateIngredientNutritionDto,
	): ReturnType<IngredientsService['updateNutrition']> {
		return await this.service.updateNutrition(ingredientId, data);
	}
}

export const ingredientsController = new IngredientsController(ingredientsService);
