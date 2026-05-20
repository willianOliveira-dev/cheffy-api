import { NotFoundError } from "@/shared/errors/app.error.js";
import type { CreateRecipeDto } from "../schemas/dtos/create-recipe.dto.js";
import type { FindAllRecipesDto } from "../schemas/dtos/find-all-recipes.dto.js";
import type { UpdateRecipeDto } from "../schemas/dtos/update-recipe.dto.js";
import { RecipesRepository } from "../repositories/recipes.repository.js";
import { NutritionCalculatorService } from "./nutrition-calculator.service.js";

export class RecipesService {
    constructor(
        private readonly repository: RecipesRepository,
        private readonly nutritionCalculator: NutritionCalculatorService
    ) {}

    async create(dto: CreateRecipeDto, authorId: string) {
        const nutritionData = await this.nutritionCalculator.calculateForRecipe(dto);
        return await this.repository.create(dto, authorId, nutritionData);
    }

    async getById(id: string) {
        const recipe = await this.repository.findById(id);
        if (!recipe) throw new NotFoundError("Receita");
        return recipe;
    }

    async getBySlug(slug: string) {
        const recipe = await this.repository.findBySlug(slug);
        if (!recipe) throw new NotFoundError("Receita");
        return recipe;
    }

    async getAll(dto: FindAllRecipesDto) {
        return await this.repository.findAll(dto);
    }

    async update(id: string, data: UpdateRecipeDto) {
        await this.getById(id);
        // We only recalculate if sections are provided in the update payload
        // Alternatively, we could fetch existing sections, merge them, and recalculate.
        // For simplicity, we calculate if sections are present in the update.
        let nutritionData = null;
        if (data.sections) {
             nutritionData = await this.nutritionCalculator.calculateForRecipe(data);
        }
        return await this.repository.update(id, data, nutritionData);
    }

    async delete(id: string) {
        await this.getById(id);
        return await this.repository.delete(id);
    }
}
