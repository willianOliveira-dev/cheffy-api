import Groq from 'groq-sdk';
import type { ChatCompletionMessageParam } from 'groq-sdk/resources/chat/completions';
import { env } from '@/config/env.js';
import { ServiceUnavailableError } from '@/shared/errors/app.error.js';
import { logger } from '@/shared/utils/logger.util.js';

export type RecipeAssistantChatMessage = ChatCompletionMessageParam;

export type RecipeAssistantChatResult = {
	content: string;
	model: string;
};

export class GroqChatService {
	private readonly client = new Groq({
		apiKey: env.GROQ_API_KEY,
		timeout: env.GROQ_TIMEOUT_MS,
	});

	async chat(messages: RecipeAssistantChatMessage[]): Promise<RecipeAssistantChatResult> {
		try {
			const completion = await this.client.chat.completions.create({
				model: env.GROQ_MODEL,
				messages,
				stream: false,
				temperature: 0.4,
				top_p: 0.9,
				max_completion_tokens: 900,
			});

			const content = completion.choices[0]?.message.content;
			if (typeof content !== 'string' || content.trim().length === 0) {
				logger.error({ completionId: completion.id }, 'Groq returned an empty chat response');
				throw new ServiceUnavailableError('Resposta invalida do assistente gastronomico');
			}

			return {
				content: content.trim(),
				model: completion.model,
			};
		} catch (error) {
			if (error instanceof ServiceUnavailableError) throw error;
			this.logGroqError(error, 'Groq chat request failed');
			throw new ServiceUnavailableError('Assistente gastronomico indisponivel no momento');
		}
	}

	async *chatStream(messages: RecipeAssistantChatMessage[]): AsyncGenerator<string> {
		try {
			const completion = await this.client.chat.completions.create({
				model: env.GROQ_MODEL,
				messages,
				stream: true,
				temperature: 0.4,
				top_p: 0.9,
				max_completion_tokens: 900,
			});

			for await (const chunk of completion) {
				const token = chunk.choices[0]?.delta.content;
				if (typeof token === 'string' && token.length > 0) {
					yield token;
				}
			}
		} catch (error) {
			if (error instanceof ServiceUnavailableError) throw error;
			this.logGroqError(error, 'Groq stream request failed');
			throw new ServiceUnavailableError('Assistente gastronomico indisponivel no momento');
		}
	}

	private logGroqError(error: unknown, message: string) {
		if (error instanceof Groq.APIError) {
			logger.error({ status: error.status, name: error.name }, message);
			return;
		}

		logger.error({ err: error }, message);
	}
}
