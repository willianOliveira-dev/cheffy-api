import { z } from 'zod';
import { env } from '@/config/env.js';
import { ServiceUnavailableError } from '@/shared/errors/app.error.js';
import { logger } from '@/shared/utils/logger.util.js';

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

const ollamaStreamChunkSchema = z.object({
	model: z.string(),
	message: z.object({
		content: z.string(),
	}),
	done: z.boolean(),
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
				const errorText = await response.text().catch(() => 'No text');
				console.error(`[Ollama Error] Status: ${response.status}, Body: ${errorText}`);
				throw new ServiceUnavailableError('Assistente gastronômico indisponível no momento');
			}

			const payload: unknown = await response.json();
			const result = ollamaChatResponseSchema.safeParse(payload);

			if (!result.success || result.data.message.content.trim().length === 0) {
				console.error('[Ollama Error] Schema validation failed or empty response:', payload);
				throw new ServiceUnavailableError('Resposta inválida do assistente gastronômico');
			}

			return {
				content: result.data.message.content.trim(),
				model: result.data.model,
			};
		} catch (error) {
			console.error('[Ollama Exception]:', error);
			if (error instanceof ServiceUnavailableError) throw error;
			throw new ServiceUnavailableError('Assistente gastronômico indisponível no momento');
		} finally {
			clearTimeout(timeout);
		}
	}

	async *chatStream(messages: RecipeAssistantChatMessage[]): AsyncGenerator<string> {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), env.OLLAMA_TIMEOUT_MS);

		try {
			const response = await fetch(this.buildUrl('/api/chat'), {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					model: env.OLLAMA_MODEL,
					messages,
					stream: true,
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
				const errorText = await response.text().catch(() => 'No text');
				logger.error({ status: response.status, body: errorText }, 'Ollama stream request failed');
				throw new ServiceUnavailableError('Assistente gastronômico indisponível no momento');
			}

			if (!response.body) {
				throw new ServiceUnavailableError('Resposta sem corpo do assistente gastronômico');
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = '';

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split('\n');
				buffer = lines.pop() ?? '';

				for (const line of lines) {
					const trimmed = line.trim();
					if (trimmed.length === 0) continue;

					const parsed = ollamaStreamChunkSchema.safeParse(JSON.parse(trimmed));
					if (!parsed.success) continue;

					if (parsed.data.message.content.length > 0) {
						yield parsed.data.message.content;
					}

					if (parsed.data.done) return;
				}
			}
		} catch (error) {
			if (error instanceof ServiceUnavailableError) throw error;
			logger.error({ err: error }, 'Ollama stream exception');
			throw new ServiceUnavailableError('Assistente gastronômico indisponível no momento');
		} finally {
			clearTimeout(timeout);
		}
	}

	private buildUrl(path: string): string {
		return `${env.OLLAMA_BASE_URL.replace(/\/+$/, '')}${path}`;
	}
}
