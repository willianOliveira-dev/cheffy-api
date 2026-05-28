import type { RecipeAssistantRecipe } from '../repositories/ai-recipes.repository.js';
import type { AskRecipeAssistantDto } from '../schemas/dtos/ask-recipe-assistant.dto.js';
import type { RecipeAssistantChatMessage } from './groq-chat.service.js';

export type RecipeAssistantUserContext = {
	id: string;
	name?: string | null | undefined;
	email?: string | null | undefined;
	image?: string | null | undefined;
};

export class RecipeAssistantPromptService {
	buildMessages(
		recipe: RecipeAssistantRecipe,
		dto: AskRecipeAssistantDto,
		user: RecipeAssistantUserContext,
	): RecipeAssistantChatMessage[] {
		return [
			{
				role: 'system',
				content: this.buildSystemPrompt(),
			},
			{
				role: 'user',
				content: this.buildUserPrompt(recipe, dto, user),
			},
		];
	}

	private buildSystemPrompt() {
		return [
			'Você é o assistente gastronômico do Cheffy.',
			'Atue como um chef experiente, didático e prático, com alto conhecimento de culinárias, técnicas, substituições e restrições alimentares.',
			'Responda sempre em português do Brasil, com linguagem simples para pessoas leigas.',
			'Use somente os dados da receita atual enviados no contexto. Não invente outra receita, não cite receitas externas e não compare com receitas que não estão no contexto.',
			'Use o contexto do usuário autenticado para personalizar a resposta quando isso for natural. Você pode chamar a pessoa pelo nome, mas não mencione id, email ou dados internos, a menos que o próprio usuário pergunte diretamente sobre esses dados.',
			'Se o usuário pedir algo fora da receita atual, explique que você só consegue ajudar com a receita exibida nesta página.',
			'Você pode adaptar a receita para ficar mais leve, mais doce, mais fitness, vegana, vegetariana, sem glúten, sem lactose, econômica, mais rápida ou com outro objetivo culinário pedido pelo usuário.',
			'Quando sugerir alterações, seja específico: diga o que trocar, quanto usar, o impacto esperado no sabor/textura e se o modo de preparo muda.',
			'Toda alteração de quantidade deve trazer medidas em gramas. Se o usuário pedir xícaras, ou se a preferência enviada for "grams-and-cups", inclua também xícaras aproximadas.',
			'Ao converter para xícaras, informe que é uma aproximação quando a densidade do ingrediente puder variar.',
			'Não prometa resultados médicos ou nutricionais. Para alergias graves, doença celíaca ou dietas clínicas, recomende conferir rótulos e buscar orientação profissional.',
			'ATENÇÃO: NUNCA retorne blocos de código JSON ou a receita inteira atualizada. Seu formato de resposta deve ser EXCLUSIVAMENTE em texto e formatação Markdown (títulos, listas, negrito).',
		].join('\n');
	}

	private buildUserPrompt(
		recipe: RecipeAssistantRecipe,
		dto: AskRecipeAssistantDto,
		user: RecipeAssistantUserContext,
	) {
		return [
			'Contexto do usuário autenticado:',
			JSON.stringify(this.serializeUser(user), null, 2),
			'---',
			'Contexto da receita atual (use apenas como referência de leitura):',
			JSON.stringify(this.serializeRecipe(recipe), null, 2),
			'---',
			`Preferência de medidas do usuário: ${dto.measurePreference}`,
			`Pergunta/Mensagem do usuário: ${dto.message}`,
		].join('\n\n');
	}

	private serializeUser(user: RecipeAssistantUserContext) {
		return {
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
		};
	}

	private serializeRecipe(recipe: RecipeAssistantRecipe) {
		return {
			id: recipe.id,
			title: recipe.title,
			description: recipe.description,
			timesInMinutes: {
				prep: recipe.prepTime,
				cook: recipe.cookTime,
				total: recipe.totalTime,
			},
			yield: {
				amount: recipe.yieldAmount,
				unit: recipe.yieldUnit,
			},
			difficulty: recipe.difficulty,
			category: recipe.category,
			tags: recipe.tags.map(({ tag }) => tag),
			sections: recipe.sections.map((section) => ({
				title: section.title,
				position: section.position,
				ingredients: section.ingredients.map((ingredient) => ({
					name: ingredient.ingredient.name,
					displayText: ingredient.displayText,
					quantity: ingredient.quantity,
					quantityInGrams: ingredient.quantityInGrams,
					unit: ingredient.unit,
					notes: ingredient.notes,
					category: ingredient.ingredient.category,
				})),
				steps: section.steps.map((step) => ({
					position: step.position,
					description: step.description,
					stepTime: step.stepTime,
				})),
			})),
			nutritionLabel: recipe.nutritionLabel,
		};
	}
}
