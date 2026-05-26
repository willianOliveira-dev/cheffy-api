import { NotFoundError } from '@/shared/errors/app.error.js';
import type { AiRecipesRepository } from '../repositories/ai-recipes.repository.js';
import type { AskRecipeAssistantDto } from '../schemas/dtos/ask-recipe-assistant.dto.js';
import type { OllamaChatService } from './ollama-chat.service.js';
import type { RecipeAssistantPromptService } from './recipe-assistant-prompt.service.js';

export class RecipeAssistantService {
	constructor(
		private readonly repository: AiRecipesRepository,
		private readonly chatService: OllamaChatService,
		private readonly promptService: RecipeAssistantPromptService,
	) {}

	async ask(recipeId: string, dto: AskRecipeAssistantDto) {
		const recipe = await this.repository.findRecipeContextById(recipeId);
		if (!recipe) throw new NotFoundError('Receita');

		const messages = this.promptService.buildMessages(recipe, dto);
		const completion = await this.chatService.chat(messages);

		return {
			recipeId: recipe.id,
			answer: completion.content,
			provider: 'ollama' as const,
			model: completion.model,
			createdAt: new Date().toISOString(),
		};
	}
}
