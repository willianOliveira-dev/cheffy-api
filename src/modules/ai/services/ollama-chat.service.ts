import { z } from 'zod';
import { env } from '@/config/env.js';
import { ServiceUnavailableError } from '@/shared/errors/app.error.js';

export type RecipeAssistantChatMessage = {
	role: 'system' | 'user' | 'assistant';
	content: string;
};

export type RecipeAssistantChatResult = {
	content: string;
	model: string;
};

const ollamaChatResponseSchema = z.object({
	model: z.string(),
	message: z.object({
		role: z.string(),
		content: z.string(),
	}),
});

export class OllamaChatService {
	async chat(messages: RecipeAssistantChatMessage[]): Promise<RecipeAssistantChatResult> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS);

		try {
			const response = await fetch(this.buildUrl('/api/chat'), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					model: env.OLLAMA_MODEL,
					messages,
					stream: false,
					think: false,
					options: {
						temperature: 0.4,
						top_p: 0.9,
						num_predict: 900,
					},
				}),
				signal: controller.signal,
			});

			if (!response.ok) {
				throw new ServiceUnavailableError('Assistente gastronômico indisponível no momento');
			}

			const payload: unknown = await response.json();
			const result = ollamaChatResponseSchema.safeParse(payload);

			if (!result.success || result.data.message.content.trim().length === 0) {
				throw new ServiceUnavailableError('Resposta inválida do assistente gastronômico');
			}

			return {
				content: result.data.message.content.trim(),
				model: result.data.model,
			};
		} catch (error) {
			if (error instanceof ServiceUnavailableError) throw error;
			throw new ServiceUnavailableError('Assistente gastronômico indisponível no momento');
		} finally {
			clearTimeout(timeout);
		}
	}

	private buildUrl(path: string) {
		return `${env.OLLAMA_BASE_URL.replace(/\/+$/, '')}${path}`;
	}
}
