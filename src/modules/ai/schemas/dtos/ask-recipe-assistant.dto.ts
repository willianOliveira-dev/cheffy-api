import { z } from 'zod';

export const askRecipeAssistantDtoSchema = z.object({
	message: z
		.string({ message: 'A mensagem deve ser um texto' })
		.min(3, 'A mensagem deve ter pelo menos 3 caracteres')
		.max(1200, 'A mensagem deve ter no máximo 1200 caracteres'),
	measurePreference: z.enum(['grams', 'grams-and-cups']).default('grams'),
});

export type AskRecipeAssistantDto = z.infer<typeof askRecipeAssistantDtoSchema>;
