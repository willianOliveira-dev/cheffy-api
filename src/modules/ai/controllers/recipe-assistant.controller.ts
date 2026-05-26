import { AiRecipesRepository } from '../repositories/ai-recipes.repository.js';
import type { AskRecipeAssistantDto } from '../schemas/dtos/ask-recipe-assistant.dto.js';
import { OllamaChatService } from '../services/ollama-chat.service.js';
import { RecipeAssistantService } from '../services/recipe-assistant.service.js';
import { RecipeAssistantStreamService } from '../services/recipe-assistant-stream.service.js';
import { RecipeAssistantPromptService } from '../services/recipe-assistant-prompt.service.js';

const repository = new AiRecipesRepository();
const chatService = new OllamaChatService();
const promptService = new RecipeAssistantPromptService();

export const recipeAssistantService = new RecipeAssistantService(
	repository,
	chatService,
	promptService,
);

export const recipeAssistantStreamService = new RecipeAssistantStreamService(
	repository,
	chatService,
	promptService,
);

export class RecipeAssistantController {
	constructor(private readonly service: RecipeAssistantService) {}

	async ask(
		recipeId: string,
		data: AskRecipeAssistantDto,
	): ReturnType<RecipeAssistantService['ask']> {
		return await this.service.ask(recipeId, data);
	}
}

export const recipeAssistantController = new RecipeAssistantController(recipeAssistantService);

