import { prisma } from "@/lib/db/prisma.js";
import { RecipesService } from "../services/recipes.service.js";
import { RecipesRepository } from "../repositories/recipes.repository.js";
import { NutritionCalculatorService } from "../services/nutrition-calculator.service.js";
import type { CreateRecipeDto } from "../schemas/dtos/create-recipe.dto.js";
import type { UpdateRecipeDto } from "../schemas/dtos/update-recipe.dto.js";
import type { FindAllRecipesDto } from "../schemas/dtos/find-all-recipes.dto.js";

const repository = new RecipesRepository();
const nutritionCalculator = new NutritionCalculatorService(prisma);
export const recipesService = new RecipesService(repository, nutritionCalculator);

export class RecipesController {
    constructor(private readonly service: RecipesService) {}

    async create(data: CreateRecipeDto, userId: string) {
        return await this.service.create(data, userId);
    }

    async getAll(query: FindAllRecipesDto) {
        return await this.service.getAll(query);
    }

    async getById(id: string) {
        return await this.service.getById(id);
    }

    async getBySlug(slug: string) {
        return await this.service.getBySlug(slug);
    }

    async update(id: string, data: UpdateRecipeDto) {
        return await this.service.update(id, data);
    }

    async delete(id: string) {
        return await this.service.delete(id);
    }
}

export const recipesController = new RecipesController(recipesService);
