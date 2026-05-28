import { NotFoundError } from '@/shared/errors/app.error.js';
import type { AiRecipesRepository } from '../repositories/ai-recipes.repository.js';
import type { AskRecipeAssistantDto } from '../schemas/dtos/ask-recipe-assistant.dto.js';
import type { GroqChatService } from './groq-chat.service.js';
import type {
	RecipeAssistantPromptService,
	RecipeAssistantUserContext,
} from './recipe-assistant-prompt.service.js';

export class RecipeAssistantStreamService {
	constructor(
		private readonly repository: AiRecipesRepository,
		private readonly chatService: GroqChatService,
		private readonly promptService: RecipeAssistantPromptService,
	) {}

	async *stream(
		recipeId: string,
		dto: AskRecipeAssistantDto,
		user: RecipeAssistantUserContext,
	): AsyncGenerator<string> {
		const recipe = await this.repository.findRecipeContextById(recipeId);
		if (!recipe) throw new NotFoundError('Receita');

		const messages = this.promptService.buildMessages(recipe, dto, user);

		yield* this.chatService.chatStream(messages);
	}
}
