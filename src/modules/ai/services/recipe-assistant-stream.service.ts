import { NotFoundError } from '@/shared/errors/app.error.js';
import type { AiRecipesRepository } from '../repositories/ai-recipes.repository.js';
import type { AskRecipeAssistantDto } from '../schemas/dtos/ask-recipe-assistant.dto.js';
import type { OllamaChatService } from './ollama-chat.service.js';
import type { RecipeAssistantPromptService } from './recipe-assistant-prompt.service.js';

export class RecipeAssistantStreamService {
	constructor(
		private readonly repository: AiRecipesRepository,
		private readonly chatService: OllamaChatService,
		private readonly promptService: RecipeAssistantPromptService,
	) {}

	async *stream(recipeId: string, dto: AskRecipeAssistantDto): AsyncGenerator<string> {
		const recipe = await this.repository.findRecipeContextById(recipeId);
		if (!recipe) throw new NotFoundError('Receita');

		const messages = this.promptService.buildMessages(recipe, dto);

		yield* this.chatService.chatStream(messages);
	}
}
