import {
	DifficultyLevel,
	MeasurementUnit,
	type Prisma,
	type PrismaClient,
	YieldUnit,
} from '@prisma/client';
import { prisma } from '../src/lib/db/prisma.js';
import { NutritionCalculatorService } from '../src/modules/recipes/services/nutrition-calculator.service.js';

type Nutrition = {
	energyKcalPer100g: number;
	carbohydratesPer100g: number;
	totalSugarsPer100g: number;
	addedSugarsPer100g: number;
	proteinPer100g: number;
	totalFatPer100g: number;
	saturatedFatPer100g: number;
	transFatPer100g: number;
	fiberPer100g: number;
	sodiumMgPer100g: number;
};

type SeedIngredient = Nutrition & {
	name: string;
	category: string;
	imageUrl?: string;
};

type RecipeIngredient = {
	name: string;
	grams: number;
	text?: string;
	unit?: MeasurementUnit;
	notes?: string;
};

type SeedStep = {
	description: string;
	imageUrl?: string;
};

type SeedRecipeSection = {
	title: string;
	ingredients: RecipeIngredient[];
	steps: SeedStep[];
};

type SeedRecipe = {
	title: string;
	slug: string;
	description: string;
	imageUrl: string;
	prepTime: number;
	cookTime: number;
	yieldAmount: number;
	yieldUnit: YieldUnit;
	difficulty: DifficultyLevel;
	category: string;
	tags: string[];
	isFeatured?: boolean;
	ingredients: RecipeIngredient[];
	steps: SeedStep[];
	sections?: SeedRecipeSection[];
};

const nutritionSource = 'Seed Cheffy aproximado';
const unsplashImage = (photoId: string) =>
	`https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;
const ingredientImage = (photoId: string) =>
	`https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=640&q=80`;
const wikimediaImage = (path: string) => `https://upload.wikimedia.org/wikipedia/commons/${path}`;
const chefImage = unsplashImage('photo-1577219491135-ce391730fb2c');

const categories = [
	[
		'Pratos principais',
		'pratos-principais',
		'Receitas completas para almoço e jantar.',
		'utensils',
		unsplashImage('photo-1504674900247-0877df9cc836'),
	],
	[
		'Lanches',
		'lanches',
		'Opções rápidas para café da manhã e lanche.',
		'sandwich',
		unsplashImage('photo-1528735602780-2552fd46c7af'),
	],
	[
		'Sobremesas',
		'sobremesas',
		'Doces clássicos para finalizar a refeição.',
		'cake-slice',
		unsplashImage('photo-1563729784474-d77dbb933a9e'),
	],
	[
		'Saladas',
		'saladas',
		'Receitas frias, coloridas e leves.',
		'salad',
		unsplashImage('photo-1512621776951-a57141f2eefd'),
	],
	[
		'Massas',
		'massas',
		'Massas, molhos e preparos de forno.',
		'wheat',
		unsplashImage('photo-1473093295043-cdd812d0e601'),
	],
	[
		'Caldos e sopas',
		'caldos-e-sopas',
		'Receitas de colher para dias leves ou frios.',
		'soup',
		unsplashImage('photo-1547592166-23ac45744acd'),
	],
	[
		'Café da manhã',
		'cafe-da-manha',
		'Receitas para começar o dia.',
		'coffee',
		unsplashImage('photo-1482049016688-2d3e1b311543'),
	],
	[
		'Acompanhamentos',
		'acompanhamentos',
		'Para servir com o prato principal.',
		'bowl',
		unsplashImage('photo-1541592106381-b31e9677c0e5'),
	],
] as const;

const ingredientImagesByCategory: Record<string, string> = {
	cereais: ingredientImage('photo-1536304993881-ff6e9eefa2a6'),
	leguminosas: ingredientImage('photo-1515543904379-3d757afe72e4'),
	massas: ingredientImage('photo-1473093295043-cdd812d0e601'),
	farinhas: ingredientImage('photo-1509440159596-0249088772ff'),
	açúcares: ingredientImage('photo-1558642452-9d2a7deb7f62'),
	laticínios: ingredientImage('photo-1628088062854-d1870b4553da'),
	'laticínios e similares': ingredientImage('photo-1550583724-b2692b85b150'),
	líquidos: ingredientImage('photo-1548839140-29a749e1cf4d'),
	queijos: ingredientImage('photo-1486297678162-eb2a19b0a32d'),
	óleos: ingredientImage('photo-1474979266404-7eaacbcd87c5'),
	ovos: ingredientImage('photo-1582722872445-44dc5f7e3c8f'),
	aves: ingredientImage('photo-1604503468506-a8da13d82791'),
	carnes: ingredientImage('photo-1607623814075-e51df1bdc82f'),
	embutidos: ingredientImage('photo-1524438418049-ab2acb7aa48f'),
	peixe: ingredientImage('photo-1519708227418-c8fd9a32b7a2'),
	'frutos do mar': ingredientImage('photo-1565680018434-b513d5e5fd47'),
	'proteínas vegetais': ingredientImage('photo-1546069901-ba9599a7e63c'),
	hortaliças: ingredientImage('photo-1540420773420-3366772f4999'),
	molhos: ingredientImage('photo-1607532941433-304659e8198a'),
	tubérculos: ingredientImage('photo-1518977676601-b53f82aba655'),
	conservas: ingredientImage('photo-1589927986089-35812388d1f4'),
	cogumelos: ingredientImage('photo-1504545102780-26774c1bb073'),
	frutas: ingredientImage('photo-1619566636858-adf3ef46400b'),
	'frutas secas': ingredientImage('photo-1599940824399-b87987ceb72a'),
	confeitaria: ingredientImage('photo-1488477181946-6428a0291777'),
	chocolates: ingredientImage('photo-1511381939415-e44015466834'),
	oleaginosas: ingredientImage('photo-1599599810694-b5b37304c041'),
	sementes: ingredientImage('photo-1490474418585-ba9bad8fd0ea'),
	acompanhamentos: ingredientImage('photo-1541592106381-b31e9677c0e5'),
	temperos: ingredientImage('photo-1606914501449-5a96b6ce24ca'),
	ervas: ingredientImage('photo-1515586000433-45406d8e6662'),
	bebidas: ingredientImage('photo-1495474472287-4d71bcdd2085'),
	suínos: ingredientImage('photo-1607623814075-e51df1bdc82f'),
	'frango e aves': ingredientImage('photo-1604503468506-a8da13d82791'),
	'gorduras e óleos': ingredientImage('photo-1474979266404-7eaacbcd87c5'),
};

const tags = [
	'Brasileira',
	'Tradicional',
	'Baiana',
	'Mineira',
	'Sem glúten',
	'Fácil',
	'Almoço',
	'Festa',
	'Frango',
	'Peixe',
	'Vegetariana',
	'Vegana',
	'Fitness',
	'Rápida',
	'Massa',
	'Doce',
	'Nordestina',
	'Italiana',
	'Cremosa',
	'Forno',
	'Grelhado',
	'Japonesa',
	'Mexicana',
	'Árabe',
	'Proteico',
	'Low carb',
	'Jantar',
	'Lanche',
	'Café da manhã',
	'Assado',
	'Refogado',
	'Cozido',
	'Sopas',
	'Integral',
	'Sem lactose',
].map((name) => ({ name, slug: toSlug(name) }));

const n = (
	name: string,
	category: string,
	energy: number,
	carbs: number,
	sugars: number,
	addedSugars: number,
	protein: number,
	fat: number,
	saturatedFat: number,
	fiber: number,
	sodium: number,
): SeedIngredient => ({
	name,
	category,
	energyKcalPer100g: energy,
	carbohydratesPer100g: carbs,
	totalSugarsPer100g: sugars,
	addedSugarsPer100g: addedSugars,
	proteinPer100g: protein,
	totalFatPer100g: fat,
	saturatedFatPer100g: saturatedFat,
	transFatPer100g: 0,
	fiberPer100g: fiber,
	sodiumMgPer100g: sodium,
});

const ingredients: SeedIngredient[] = [
	// CEREAIS
	n('Arroz branco cozido', 'cereais', 128, 28.1, 0.1, 0, 2.5, 0.2, 0.1, 1.6, 1),
	n('Arroz integral cozido', 'cereais', 111, 23, 0.4, 0, 2.6, 0.9, 0.2, 1.8, 5),
	n('Arroz arbóreo', 'cereais', 356, 78, 0.2, 0, 6.5, 0.7, 0.2, 1.3, 5),
	n('Arroz parboilizado cozido', 'cereais', 130, 28.5, 0.1, 0, 2.6, 0.3, 0.1, 1.4, 2),
	n('Aveia em flocos', 'cereais', 389, 66, 1, 0, 16.9, 6.9, 1.2, 10.6, 2),
	n('Milho para pipoca', 'cereais', 365, 74, 0.6, 0, 9, 4.7, 0.5, 15, 8),
	n('Quinoa cozida', 'cereais', 120, 21.3, 0.9, 0, 4.4, 1.9, 0.2, 2.8, 7),
	n('Cuscuz marroquino cozido', 'cereais', 112, 23.2, 0.1, 0, 3.8, 0.2, 0, 1.4, 5),
	n('Trigo para quibe', 'cereais', 342, 75, 0.4, 0, 11, 1.7, 0.3, 12, 12),
	n('Fubá', 'cereais', 361, 76, 0.6, 0, 7, 1.6, 0.2, 3.7, 2),
	n('Farinha de milho', 'cereais', 354, 75, 0.9, 0, 7.1, 1.5, 0.2, 5.2, 1),
	// LEGUMINOSAS
	n('Feijão preto cozido', 'leguminosas', 77, 14, 0.3, 0, 4.5, 0.5, 0.1, 8.4, 2),
	n('Feijão preto', 'leguminosas', 341, 62.4, 1.4, 0, 21.6, 1.4, 0.4, 19.6, 5),
	n('Feijão carioca cozido', 'leguminosas', 76, 13.6, 0.4, 0, 4.8, 0.5, 0.1, 8.5, 2),
	n('Feijão branco cozido', 'leguminosas', 139, 25, 0.3, 0, 9.7, 0.5, 0.1, 6.3, 2),
	n('Feijão fradinho cozido', 'leguminosas', 116, 20.7, 2.5, 0, 7.8, 0.5, 0.1, 6.5, 4),
	n('Lentilha cozida', 'leguminosas', 116, 20.1, 1.8, 0, 9, 0.4, 0.1, 7.9, 2),
	n('Grão-de-bico cozido', 'leguminosas', 164, 27.4, 4.8, 0, 8.9, 2.6, 0.3, 7.6, 7),
	n('Soja cozida', 'leguminosas', 173, 9.9, 3, 0, 16.6, 9, 1.3, 6, 1),
	n('Ervilha seca cozida', 'leguminosas', 118, 21.1, 3.1, 0, 8.3, 0.4, 0.1, 8.3, 2),
	// MASSAS E FARINHAS
	n('Macarrão cozido', 'massas', 158, 30.9, 0.6, 0, 5.8, 0.9, 0.2, 1.8, 1),
	n('Massa para lasanha', 'massas', 350, 72, 2.5, 0, 12, 1.5, 0.3, 3, 10),
	n('Macarrão integral cozido', 'massas', 124, 26.5, 0.6, 0, 5.3, 0.5, 0.1, 3.9, 2),
	n('Farinha de trigo', 'farinhas', 364, 76, 0.3, 0, 10, 1, 0.2, 2.7, 2),
	n('Farinha de trigo integral', 'farinhas', 340, 72, 0.4, 0, 13.2, 2.5, 0.4, 10.7, 2),
	n('Farinha de mandioca', 'farinhas', 365, 89, 1.6, 0, 1.6, 0.3, 0.1, 6.4, 1),
	n('Farinha de rosca', 'farinhas', 392, 79, 2.1, 0, 11.5, 4.2, 0.7, 3.2, 648),
	n('Farinha de amêndoas', 'farinhas', 571, 21.3, 4, 0, 21.2, 50, 3.8, 11, 2),
	n('Goma de tapioca', 'farinhas', 330, 81, 0, 0, 0.2, 0, 0, 0.5, 5),
	n('Polvilho doce', 'farinhas', 351, 86, 0, 0, 0.4, 0, 0, 0.2, 2),
	n('Polvilho azedo', 'farinhas', 351, 86, 0, 0, 0.4, 0, 0, 0.2, 2),
	n('Amido de milho', 'farinhas', 381, 91, 0, 0, 0.3, 0.1, 0, 0.5, 9),
	n('Farinha de aveia', 'farinhas', 375, 68, 1.1, 0, 13, 6.5, 1.1, 10, 3),
	n('Fermento biológico seco', 'confeitaria', 325, 41, 0, 0, 40, 7.6, 1.5, 27, 51),
	n('Fermento químico', 'confeitaria', 53, 28, 0, 0, 0, 0, 0, 0, 10600),
	// AÇÚCARES E ADOÇANTES
	n('Açúcar', 'açúcares', 387, 100, 100, 100, 0, 0, 0, 0, 1),
	n('Açúcar mascavo', 'açúcares', 373, 96, 93, 93, 0.1, 0, 0, 0, 28),
	n('Açúcar de coco', 'açúcares', 375, 97, 87, 87, 0.5, 0, 0, 0, 0),
	n('Mel', 'açúcares', 304, 82, 82, 82, 0.3, 0, 0, 0.2, 4),
	n('Melado de cana', 'açúcares', 290, 74, 60, 60, 1.2, 0.1, 0, 0.5, 37),
	n('Agave', 'açúcares', 310, 76, 68, 68, 0.1, 0.5, 0, 0.2, 4),
	n('Stevia em pó', 'açúcares', 0, 0, 0, 0, 0, 0, 0, 0, 10),
	// LATICÍNIOS
	n('Leite condensado', 'laticínios', 321, 54, 54, 35, 7.9, 8.7, 5.5, 0, 125),
	n('Creme de leite', 'laticínios', 221, 4.5, 3.5, 0, 2.1, 22, 14, 0, 70),
	n('Creme de leite fresco', 'laticínios', 335, 2.9, 2.9, 0, 2.1, 35, 22, 0, 40),
	n('Leite integral', 'laticínios', 61, 4.8, 5, 0, 3.2, 3.3, 1.9, 0, 43),
	n('Leite', 'laticínios', 61, 4.8, 5, 0, 3.2, 3.3, 1.9, 0, 43),
	n('Leite desnatado', 'laticínios', 35, 4.8, 5, 0, 3.4, 0.1, 0.1, 0, 44),
	n('Leite de cabra', 'laticínios', 69, 4.5, 4.5, 0, 3.6, 4.2, 2.7, 0, 50),
	n('Iogurte natural', 'laticínios', 61, 4.7, 4.7, 0, 3.5, 3.3, 2.1, 0, 46),
	n('Iogurte grego integral', 'laticínios', 97, 3.6, 3.2, 0, 9, 5, 3.2, 0, 36),
	n('Iogurte grego desnatado', 'laticínios', 59, 3.6, 3.2, 0, 10, 0.4, 0.3, 0, 36),
	n('Manteiga', 'laticínios', 717, 0.1, 0.1, 0, 0.9, 81, 51, 0, 11),
	n('Manteiga sem sal', 'laticínios', 717, 0.1, 0.1, 0, 0.9, 81, 51, 0, 2),
	n('Creme azedo', 'laticínios', 193, 4.3, 4.3, 0, 2.7, 19.4, 12, 0, 53),
	n('Requeijão cremoso', 'laticínios', 255, 3.6, 1.2, 0, 8, 24, 15, 0, 590),
	// QUEIJOS
	n('Queijo minas', 'queijos', 264, 3.2, 1.3, 0, 17.4, 20.2, 12.4, 0, 579),
	n('Queijo minas curado ralado', 'queijos', 390, 2.5, 0.5, 0, 28, 30, 18, 0, 700),
	n('Parmesão ralado', 'queijos', 431, 4.1, 0.9, 0, 38, 29, 17, 0, 1529),
	n('Muçarela', 'queijos', 280, 3.1, 1, 0, 18, 21, 13, 0, 620),
	n('Ricota', 'queijos', 174, 3, 0.3, 0, 11, 13, 8, 0, 84),
	n('Cream cheese', 'queijos', 342, 4.1, 3.8, 0, 6, 34, 19, 0, 321),
	n('Queijo coalho', 'queijos', 308, 2.2, 0.6, 0, 20.5, 24.5, 15.5, 0, 760),
	n('Queijo prato', 'queijos', 355, 2.5, 0.5, 0, 23, 28, 17, 0, 650),
	n('Queijo cheddar', 'queijos', 403, 1.3, 0.5, 0, 24.9, 33.1, 21, 0, 621),
	n('Queijo brie', 'queijos', 334, 0.5, 0.5, 0, 20.7, 27.7, 17.4, 0, 629),
	n('Gorgonzola', 'queijos', 353, 2.3, 0.5, 0, 21.4, 28.7, 18.7, 0, 1146),
	n('Provolone', 'queijos', 351, 2.1, 0.5, 0, 25.6, 26.6, 17.1, 0, 876),
	// OVOS
	n('Ovo', 'ovos', 143, 0.7, 0.4, 0, 12.6, 9.5, 3.1, 0, 142),
	n('Clara de ovo', 'ovos', 52, 0.7, 0.4, 0, 10.9, 0.2, 0, 0, 166),
	n('Gema de ovo', 'ovos', 322, 3.6, 0.5, 0, 15.9, 26.5, 7.8, 0, 48),
	// ÓLEOS E GORDURAS
	n('Azeite de oliva', 'óleos', 884, 0, 0, 0, 0, 100, 14, 0, 2),
	n('Óleo', 'óleos', 884, 0, 0, 0, 0, 100, 14, 0, 0),
	n('Óleo de coco', 'óleos', 862, 0, 0, 0, 0, 100, 86, 0, 0),
	n('Azeite de dendê', 'óleos', 884, 0, 0, 0, 0, 100, 49, 0, 0),
	n('Óleo de gergelim', 'óleos', 884, 0, 0, 0, 0, 100, 14, 0, 0),
	n('Banha de porco', 'óleos', 897, 0, 0, 0, 0, 99.5, 39.2, 0, 0),
	n('Margarina', 'óleos', 718, 0.7, 0.7, 0, 0.2, 80.5, 16.7, 0, 753),
	// AVES
	n('Peito de frango', 'aves', 165, 0, 0, 0, 31, 3.6, 1, 0, 74),
	n('Coxa de frango', 'aves', 209, 0, 0, 0, 26, 11, 3.1, 0, 95),
	n('Sobrecoxa de frango', 'aves', 209, 0, 0, 0, 26, 11, 3.1, 0, 95),
	n('Frango inteiro', 'aves', 215, 0, 0, 0, 18.6, 15.1, 4.3, 0, 70),
	n('Frango desfiado cozido', 'aves', 172, 0, 0, 0, 32, 4, 1.1, 0, 80),
	n('Peito de peru', 'aves', 135, 1.7, 0.4, 0, 29.9, 1, 0.3, 0, 998),
	n('Fígado de frango', 'aves', 119, 0.9, 0, 0, 17, 4.8, 1.7, 0, 71),
	// CARNES BOVINAS
	n('Carne bovina moída', 'carnes', 250, 0, 0, 0, 26, 15, 6, 0, 72),
	n('Patinho bovino', 'carnes', 219, 0, 0, 0, 35, 8, 3, 0, 61),
	n('Alcatra', 'carnes', 211, 0, 0, 0, 32, 8.5, 3.4, 0, 58),
	n('Filé mignon', 'carnes', 202, 0, 0, 0, 28.7, 9, 3.8, 0, 54),
	n('Picanha', 'carnes', 260, 0, 0, 0, 27, 16, 7, 0, 62),
	n('Contrafilé', 'carnes', 220, 0, 0, 0, 30, 10.5, 4.5, 0, 57),
	n('Costela bovina', 'carnes', 290, 0, 0, 0, 24, 20, 8.5, 0, 64),
	n('Acém bovino', 'carnes', 235, 0, 0, 0, 27, 13, 5.5, 0, 60),
	n('Músculo bovino', 'carnes', 200, 0, 0, 0, 31, 7, 2.5, 0, 62),
	n('Carne seca dessalgada', 'carnes', 313, 0, 0, 0, 36, 18, 7, 0, 1200),
	// CARNES SUÍNAS
	n('Costelinha suína defumada', 'carnes', 320, 0, 0, 0, 20, 26, 9, 0, 950),
	n('Pernil suíno', 'carnes', 258, 0, 0, 0, 27, 16, 6, 0, 62),
	n('Lombo suíno', 'carnes', 182, 0, 0, 0, 29.6, 6.3, 2.2, 0, 55),
	n('Paleta suína', 'carnes', 225, 0, 0, 0, 26, 13, 4.8, 0, 58),
	n('Costela de porco fresca', 'carnes', 275, 0, 0, 0, 22, 20, 7.4, 0, 60),
	// EMBUTIDOS
	n('Linguiça calabresa', 'embutidos', 312, 2.4, 0.5, 0.5, 15, 27, 9, 0, 1180),
	n('Linguiça fresca', 'embutidos', 290, 1.8, 0.4, 0.4, 15, 25, 8.5, 0, 900),
	n('Paio', 'embutidos', 318, 2, 0.4, 0.4, 15, 28, 10, 0, 1120),
	n('Bacon', 'embutidos', 541, 1.4, 0, 0, 37, 42, 14, 0, 1717),
	n('Presunto cozido', 'embutidos', 117, 3, 1, 0.5, 18, 3.7, 1.3, 0, 1100),
	n('Mortadela', 'embutidos', 265, 2.9, 0.5, 0.5, 13, 23, 8, 0, 1060),
	n('Salame', 'embutidos', 336, 2.6, 0.5, 0.5, 22, 26.4, 9.4, 0, 1700),
	n('Pepperoni', 'embutidos', 494, 0.6, 0.5, 0.5, 19.3, 43.7, 14.8, 0, 1761),
	// PEIXES
	n('Peixe branco em postas', 'peixe', 105, 0, 0, 0, 22, 1.7, 0.4, 0, 80),
	n('Filé de tilápia', 'peixe', 96, 0, 0, 0, 20, 1.7, 0.6, 0, 52),
	n('Salmão', 'peixe', 208, 0, 0, 0, 20, 13, 3.1, 0, 59),
	n('Atum em lata escorrido', 'peixe', 132, 0, 0, 0, 28, 1, 0.3, 0, 377),
	n('Bacalhau dessalgado', 'peixe', 105, 0, 0, 0, 23, 0.9, 0.2, 0, 400),
	n('Sardinha em lata', 'peixe', 208, 0, 0, 0, 24.6, 11.5, 3.1, 0, 505),
	n('Filé de merluza', 'peixe', 92, 0, 0, 0, 18.7, 1.7, 0.5, 0, 61),
	n('Peixe espada', 'peixe', 144, 0, 0, 0, 19.8, 7, 1.9, 0, 98),
	n('Truta', 'peixe', 148, 0, 0, 0, 20.8, 6.6, 1.9, 0, 52),
	n('Robalo', 'peixe', 97, 0, 0, 0, 18.4, 2.5, 0.6, 0, 87),
	// FRUTOS DO MAR
	n('Camarão limpo', 'frutos do mar', 99, 0.2, 0, 0, 24, 0.3, 0.1, 0, 111),
	n('Lula', 'frutos do mar', 92, 3.1, 0, 0, 15.6, 1.4, 0.4, 0, 44),
	n('Polvo cozido', 'frutos do mar', 164, 4.4, 0, 0, 29.8, 2.1, 0.5, 0, 460),
	n('Mariscos cozidos', 'frutos do mar', 172, 8.6, 0, 0, 23.8, 4.5, 0.9, 0, 360),
	n('Mexilhão', 'frutos do mar', 172, 7.4, 0, 0, 23.8, 4.5, 0.9, 0, 369),
	n('Caranguejo cozido', 'frutos do mar', 97, 0, 0, 0, 19.4, 1.5, 0.2, 0, 395),
	// PROTEÍNAS VEGETAIS
	n('Tofu firme', 'proteínas vegetais', 144, 3, 0.6, 0, 17, 8.7, 1.3, 2.3, 14),
	n('Proteína de soja texturizada', 'proteínas vegetais', 336, 33, 8, 0, 52, 1.2, 0.2, 15, 20),
	n('Tempeh', 'proteínas vegetais', 193, 9.4, 0, 0, 18.5, 10.8, 2.2, 9, 9),
	n('Edamame cozido', 'proteínas vegetais', 121, 8.9, 2.2, 0, 11.9, 5.2, 0.6, 5.2, 6),
	// TOMATE E DERIVADOS
	n('Tomate', 'hortaliças', 18, 3.9, 2.6, 0, 0.9, 0.2, 0, 1.2, 5),
	n('Tomate cereja', 'hortaliças', 18, 3.9, 2.6, 0, 0.9, 0.2, 0, 1.2, 5),
	n('Tomate seco', 'hortaliças', 258, 55.8, 29.3, 0, 14.1, 3, 0.4, 12.3, 2095),
	n('Molho de tomate', 'molhos', 29, 6.7, 4.2, 0, 1.3, 0.2, 0, 1.4, 400),
	n('Extrato de tomate', 'molhos', 82, 19, 12, 0, 4.3, 0.5, 0.1, 4.1, 59),
	n('Polpa de tomate', 'molhos', 32, 7.3, 4.9, 0, 1.5, 0.2, 0, 1.6, 320),
	// HORTALIÇAS
	n('Cebola', 'hortaliças', 40, 9.3, 4.2, 0, 1.1, 0.1, 0, 1.7, 4),
	n('Cebola roxa', 'hortaliças', 42, 9.8, 4.7, 0, 1.2, 0.1, 0, 1.8, 4),
	n('Cebola-verde (cebolinha)', 'hortaliças', 30, 6.5, 2.2, 0, 1.8, 0.3, 0, 1.8, 16),
	n('Alho', 'temperos', 149, 33, 1, 0, 6.4, 0.5, 0.1, 2.1, 17),
	n('Alho-poró', 'hortaliças', 61, 14.1, 3.9, 0, 1.5, 0.3, 0, 1.8, 20),
	n('Cenoura', 'hortaliças', 41, 9.6, 4.7, 0, 0.9, 0.2, 0, 2.8, 69),
	n('Batata inglesa', 'tubérculos', 77, 17, 0.8, 0, 2, 0.1, 0, 2.2, 6),
	n('Batata-doce', 'tubérculos', 86, 20, 4.2, 0, 1.6, 0.1, 0, 3, 55),
	n('Batata-doce roxa', 'tubérculos', 90, 21.3, 6, 0, 1.6, 0.1, 0, 3.2, 55),
	n('Mandioca cozida', 'tubérculos', 125, 30, 1.4, 0, 1, 0.3, 0.1, 1.8, 14),
	n('Mandioquinha', 'tubérculos', 94, 21.8, 2.1, 0, 1.5, 0.2, 0, 3.4, 4),
	n('Inhame cozido', 'tubérculos', 116, 27.5, 0.5, 0, 1.5, 0.1, 0, 4.1, 9),
	n('Cará cozido', 'tubérculos', 116, 27.2, 0.5, 0, 1.5, 0.1, 0, 4, 9),
	n('Abóbora cabotiá', 'hortaliças', 48, 12, 2.5, 0, 1.4, 0.1, 0, 2.5, 1),
	n('Abóbora moranga', 'hortaliças', 26, 6.5, 2.8, 0, 1, 0.1, 0, 0.5, 1),
	n('Abobrinha', 'hortaliças', 17, 3.1, 2.5, 0, 1.2, 0.3, 0.1, 1, 8),
	n('Berinjela', 'hortaliças', 25, 5.9, 3.5, 0, 1, 0.2, 0, 3, 2),
	n('Brócolis', 'hortaliças', 34, 6.6, 1.7, 0, 2.8, 0.4, 0.1, 2.6, 33),
	n('Brócolis ninja', 'hortaliças', 34, 6.6, 1.7, 0, 2.8, 0.4, 0.1, 2.6, 33),
	n('Couve-flor', 'hortaliças', 25, 5, 1.9, 0, 1.9, 0.3, 0.1, 2, 30),
	n('Couve manteiga', 'hortaliças', 32, 5.4, 0.8, 0, 3, 0.6, 0.1, 4, 38),
	n('Couve-de-bruxelas', 'hortaliças', 43, 8.9, 2.2, 0, 3.4, 0.3, 0.1, 3.8, 25),
	n('Espinafre', 'hortaliças', 23, 3.6, 0.4, 0, 2.9, 0.4, 0.1, 2.2, 79),
	n('Alface', 'hortaliças', 15, 2.9, 0.8, 0, 1.4, 0.2, 0, 1.3, 28),
	n('Alface americana', 'hortaliças', 14, 2.9, 1.9, 0, 0.9, 0.1, 0, 1.2, 10),
	n('Rúcula', 'hortaliças', 25, 3.7, 2.1, 0, 2.6, 0.7, 0.1, 1.6, 27),
	n('Agrião', 'hortaliças', 11, 1.3, 0.2, 0, 2.3, 0.1, 0, 0.5, 41),
	n('Pepino', 'hortaliças', 15, 3.6, 1.7, 0, 0.7, 0.1, 0, 0.5, 2),
	n('Pepino japonês', 'hortaliças', 13, 2.8, 1.4, 0, 0.6, 0.1, 0, 0.4, 2),
	n('Pimentão vermelho', 'hortaliças', 31, 6, 4.2, 0, 1, 0.3, 0, 2.1, 4),
	n('Pimentão amarelo', 'hortaliças', 27, 6.3, 0.8, 0, 1, 0.2, 0, 0.9, 2),
	n('Pimentão verde', 'hortaliças', 20, 4.6, 2.4, 0, 0.9, 0.2, 0, 1.7, 3),
	n('Pimenta dedo-de-moça', 'hortaliças', 40, 8.8, 5.3, 0, 1.9, 0.4, 0.1, 1.5, 9),
	n('Milho verde', 'conservas', 96, 21, 4.5, 0, 3.4, 1.5, 0.2, 2.4, 15),
	n('Milho verde em espiga', 'hortaliças', 86, 19, 3.2, 0, 3.2, 1.2, 0.2, 2, 15),
	n('Ervilha em lata', 'conservas', 81, 14, 5.7, 0, 5.4, 0.4, 0.1, 5.7, 5),
	n('Ervilha fresca', 'leguminosas', 81, 14.5, 5.7, 0, 5.4, 0.4, 0.1, 5.1, 5),
	n('Palmito', 'conservas', 28, 4.6, 0, 0, 2.5, 0.6, 0.1, 2.4, 426),
	n('Vagem', 'hortaliças', 31, 7, 1.4, 0, 1.8, 0.1, 0, 2.7, 6),
	n('Chuchu', 'hortaliças', 19, 4.5, 1.7, 0, 0.8, 0.1, 0, 1.7, 2),
	n('Quiabo', 'hortaliças', 33, 7.5, 1.5, 0, 2, 0.1, 0, 3.2, 7),
	n('Jiló', 'hortaliças', 22, 5.1, 2.4, 0, 0.9, 0.1, 0, 2.5, 3),
	n('Maxixe', 'hortaliças', 19, 4.4, 1.7, 0, 0.7, 0.1, 0, 1.9, 3),
	n('Aspargo', 'hortaliças', 20, 3.9, 1.9, 0, 2.2, 0.1, 0, 2.1, 2),
	n('Repolho branco', 'hortaliças', 25, 5.8, 3.2, 0, 1.3, 0.1, 0, 2.5, 18),
	n('Repolho roxo', 'hortaliças', 31, 7.4, 3.8, 0, 1.4, 0.1, 0, 2.1, 27),
	n('Acelga', 'hortaliças', 19, 3.7, 1.1, 0, 1.8, 0.2, 0, 1.6, 213),
	n('Beterraba', 'hortaliças', 43, 9.6, 6.8, 0, 1.6, 0.2, 0, 2.8, 78),
	n('Rabanete', 'hortaliças', 16, 3.4, 2.2, 0, 0.7, 0.1, 0, 1.6, 39),
	n('Nabo', 'hortaliças', 28, 6.4, 3.8, 0, 0.9, 0.1, 0, 1.8, 67),
	// COGUMELOS
	n('Champignon', 'cogumelos', 22, 3.3, 2, 0, 3.1, 0.3, 0.1, 1, 5),
	n('Cogumelo paris', 'cogumelos', 22, 3.3, 2, 0, 3.1, 0.3, 0.1, 1, 5),
	n('Shiitake', 'cogumelos', 34, 6.8, 2.4, 0, 2.2, 0.5, 0.1, 2.5, 9),
	n('Portobello', 'cogumelos', 29, 5.1, 2.7, 0, 2.5, 0.5, 0.1, 1.3, 9),
	n('Shimeji', 'cogumelos', 36, 6.8, 2.4, 0, 3.3, 0.5, 0.1, 2.7, 5),
	n('Cogumelo seco', 'cogumelos', 296, 63.9, 4.8, 0, 9.8, 1, 0.2, 17.5, 11),
	// FRUTAS
	n('Maçã verde', 'frutas', 52, 14, 10, 0, 0.3, 0.2, 0, 2.4, 1),
	n('Maçã fuji', 'frutas', 52, 13.8, 10.4, 0, 0.3, 0.2, 0, 2.4, 1),
	n('Banana', 'frutas', 89, 23, 12, 0, 1.1, 0.3, 0.1, 2.6, 1),
	n('Banana da terra', 'frutas', 122, 31.9, 15, 0, 1.3, 0.4, 0.1, 2.3, 4),
	n('Morango', 'frutas', 32, 7.7, 4.9, 0, 0.7, 0.3, 0, 2, 1),
	n('Manga', 'frutas', 60, 15, 13.7, 0, 0.8, 0.4, 0.1, 1.6, 1),
	n('Abacate', 'frutas', 160, 8.5, 0.7, 0, 2, 14.7, 2.1, 6.7, 7),
	n('Limão', 'frutas', 29, 9.3, 2.5, 0, 1.1, 0.3, 0, 2.8, 2),
	n('Limão tahiti', 'frutas', 29, 9.3, 2.5, 0, 1.1, 0.3, 0, 2.8, 2),
	n('Laranja', 'frutas', 47, 11.8, 9.4, 0, 0.9, 0.1, 0, 2.4, 0),
	n('Laranja pera', 'frutas', 47, 11.8, 9.4, 0, 0.9, 0.1, 0, 2.4, 0),
	n('Abacaxi', 'frutas', 50, 13.1, 9.8, 0, 0.5, 0.1, 0, 1.4, 1),
	n('Maracujá polpa', 'frutas', 68, 15.3, 7.3, 0, 2.2, 0.4, 0.1, 2, 28),
	n('Mamão formosa', 'frutas', 39, 10.3, 7.3, 0, 0.6, 0.1, 0, 1.8, 3),
	n('Goiaba', 'frutas', 68, 14.3, 8.9, 0, 2.6, 1, 0.3, 6.3, 2),
	n('Melão', 'frutas', 34, 8.2, 7.9, 0, 0.8, 0.2, 0, 0.9, 16),
	n('Melancia', 'frutas', 30, 7.6, 6.2, 0, 0.6, 0.2, 0, 0.4, 1),
	n('Uva itália', 'frutas', 69, 18.1, 15.5, 0, 0.7, 0.2, 0.1, 0.9, 2),
	n('Pêra', 'frutas', 57, 15.2, 9.8, 0, 0.4, 0.1, 0, 3.1, 1),
	n('Pêssego', 'frutas', 39, 9.5, 8.4, 0, 0.9, 0.3, 0, 1.5, 0),
	n('Kiwi', 'frutas', 61, 14.7, 9, 0, 1.1, 0.5, 0, 3, 3),
	n('Caju', 'frutas', 43, 9.2, 5, 0, 1.3, 0.2, 0, 1.7, 4),
	n('Cupuaçu polpa', 'frutas', 49, 10.9, 5.9, 0, 1.2, 0.3, 0.1, 1.2, 0),
	n('Açaí polpa', 'frutas', 58, 6.2, 1.5, 0, 1.2, 5.1, 1.3, 2.6, 28),
	// FRUTAS SECAS E CONSERVAS
	n('Uva-passa', 'frutas secas', 299, 79, 59, 0, 3.1, 0.5, 0.1, 3.7, 11),
	n('Damasco seco', 'frutas secas', 241, 63, 53, 0, 3.4, 0.5, 0, 7.3, 10),
	n('Tâmara seca', 'frutas secas', 282, 75, 63, 0, 2.5, 0.4, 0, 8, 2),
	n('Figo seco', 'frutas secas', 249, 64, 48, 0, 3.3, 1, 0.2, 9.8, 10),
	n('Ameixa seca', 'frutas secas', 240, 64, 38, 0, 2.2, 0.4, 0, 7.1, 2),
	// CONFEITARIA
	n('Coco ralado', 'confeitaria', 660, 24, 7, 0, 6.9, 65, 57, 16, 37),
	n('Coco fresco ralado', 'confeitaria', 354, 15.2, 6.2, 0, 3.3, 33.5, 29.7, 9, 20),
	n('Leite de coco', 'laticínios e similares', 197, 2.8, 1.6, 0, 2, 21, 18, 0, 15),
	n('Creme de coco', 'laticínios e similares', 330, 6, 3.5, 0, 3.3, 34, 30, 0, 15),
	n('Água de coco', 'laticínios e similares', 19, 3.7, 2.6, 0, 0.7, 0.2, 0.1, 1.1, 105),
	n('Granulado de chocolate', 'confeitaria', 470, 80, 70, 70, 3, 16, 10, 2, 40),
	n('Chocolate branco', 'chocolates', 539, 59, 57, 55, 5.9, 32.1, 19.4, 0, 90),
	// CHOCOLATES
	n('Chocolate em pó', 'chocolates', 228, 58, 1.8, 0, 19.6, 13.7, 8.1, 37, 21),
	n('Chocolate meio amargo', 'chocolates', 546, 61, 48, 45, 4.9, 31, 19, 7, 24),
	n('Chocolate ao leite', 'chocolates', 535, 59.5, 54, 50, 7.7, 30, 17.7, 3.4, 79),
	n('Cacau em pó 100%', 'chocolates', 228, 57.9, 1.8, 0, 19.6, 13.7, 8.1, 37, 21),
	n('Nibs de cacau', 'chocolates', 480, 34, 0, 0, 14, 42, 26, 27, 14),
	// OLEAGINOSAS E SEMENTES
	n('Castanha-de-caju', 'oleaginosas', 553, 30, 5.9, 0, 18, 44, 7.8, 3.3, 12),
	n('Amendoim', 'oleaginosas', 567, 16, 4, 0, 26, 49, 6.3, 8.5, 18),
	n('Nozes', 'oleaginosas', 654, 14, 2.6, 0, 15, 65, 6, 6.7, 2),
	n('Amêndoas', 'oleaginosas', 579, 21.5, 4.4, 0, 21.2, 49.9, 3.8, 12.5, 1),
	n('Avelã', 'oleaginosas', 628, 16.7, 4.3, 0, 15, 60.8, 4.5, 9.7, 0),
	n('Castanha-do-pará', 'oleaginosas', 659, 12.3, 2.3, 0, 14.3, 67.1, 15.1, 7.5, 3),
	n('Pistache', 'oleaginosas', 560, 27.5, 7.7, 0, 20.2, 45.3, 5.6, 10.6, 1),
	n('Macadâmia', 'oleaginosas', 718, 13.8, 4.6, 0, 7.9, 75.8, 12, 8.6, 5),
	n('Pasta de amendoim', 'oleaginosas', 588, 22, 9, 0, 25, 50, 10, 6, 486),
	n('Tahine (pasta de gergelim)', 'oleaginosas', 595, 21.2, 0.5, 0, 17, 53.8, 7.5, 9.3, 115),
	n('Linhaça', 'sementes', 534, 29, 1.6, 0, 18, 42, 3.7, 27, 30),
	n('Chia', 'sementes', 486, 42, 0, 0, 17, 31, 3.3, 34, 16),
	n('Gergelim', 'sementes', 573, 23.4, 0.3, 0, 17.7, 49.7, 7, 11.8, 11),
	n('Gergelim preto', 'sementes', 573, 23.4, 0.3, 0, 17.7, 49.7, 7, 11.8, 11),
	n('Semente de abóbora', 'sementes', 559, 10.7, 1.4, 0, 30.2, 49.1, 8.8, 6, 7),
	n('Semente de girassol', 'sementes', 584, 20, 2.6, 0, 20.8, 51.5, 4.5, 8.6, 9),
	// MOLHOS E CONDIMENTOS
	n('Maionese', 'molhos', 680, 0.6, 0.6, 0.6, 1, 75, 11, 0, 635),
	n('Mostarda', 'molhos', 66, 5.8, 1.4, 1, 4.4, 4, 0.2, 3.3, 1135),
	n('Ketchup', 'molhos', 112, 26, 22, 18, 1.3, 0.1, 0, 0.3, 907),
	n('Molho shoyu', 'molhos', 53, 4.9, 0.4, 0, 8.1, 0.6, 0.1, 0.8, 5493),
	n('Molho inglês (Worcestershire)', 'molhos', 78, 19.5, 10.3, 8, 1.1, 0.1, 0, 0.4, 3200),
	n('Molho de pimenta tabasco', 'molhos', 12, 0.9, 0.5, 0, 0.5, 0.7, 0.1, 0.5, 3000),
	n('Molho barbecue', 'molhos', 172, 40.5, 30, 25, 1.5, 0.5, 0.1, 0.8, 1560),
	n('Molho de soja (shoyu light)', 'molhos', 43, 5, 0.4, 0, 6.5, 0.5, 0.1, 0.8, 2200),
	n('Caldo de galinha em cubo', 'temperos', 250, 30, 2, 0, 8, 12, 4, 0, 8800),
	n('Caldo de legumes em cubo', 'temperos', 230, 28, 2, 0, 7, 11, 3.5, 0, 9000),
	n('Creme de cebola em pó', 'temperos', 337, 64.5, 17.5, 10, 8, 5.5, 2, 4.5, 4200),
	n('Vinagre de vinho branco', 'molhos', 21, 0.1, 0.1, 0, 0, 0, 0, 0, 2),
	n('Vinagre de maçã', 'molhos', 22, 0.9, 0.4, 0, 0, 0, 0, 0, 5),
	n('Vinagre balsâmico', 'molhos', 88, 17.3, 14.4, 14, 0.5, 0, 0, 0, 23),
	n('Azeite aromatizado', 'óleos', 884, 0, 0, 0, 0, 100, 14, 0, 2),
	// ACOMPANHAMENTOS
	n('Batata palha', 'acompanhamentos', 540, 52, 1, 0, 6, 35, 10, 4, 500),
	n('Farinha de pão (panko)', 'farinhas', 388, 79, 3, 0, 11, 4.2, 0.9, 3, 600),
	n('Torrada', 'acompanhamentos', 412, 74, 4, 0, 12, 6, 1.5, 3.5, 580),
	n('Biscoito cream cracker', 'acompanhamentos', 435, 72, 4, 2, 9, 12.5, 3.5, 3, 810),
	// TEMPEROS E ERVAS
	n('Sal', 'temperos', 0, 0, 0, 0, 0, 0, 0, 0, 38758),
	n('Sal grosso', 'temperos', 0, 0, 0, 0, 0, 0, 0, 0, 38758),
	n('Pimenta-do-reino', 'temperos', 251, 64, 0.6, 0, 10, 3.3, 1.4, 25, 20),
	n('Pimenta-do-reino branca', 'temperos', 296, 68.6, 0.6, 0, 10.4, 2.1, 0.7, 26.2, 5),
	n('Pimenta calabresa', 'temperos', 318, 56.6, 10.3, 0, 12, 17, 3, 27.2, 30),
	n('Pimenta-de-cheiro', 'temperos', 40, 8.8, 5.3, 0, 1.9, 0.4, 0.1, 1.5, 9),
	n('Noz-moscada', 'temperos', 525, 49, 2.1, 0, 5.8, 36.3, 25.9, 20.8, 16),
	n('Canela em pó', 'temperos', 247, 81, 2.2, 0, 4, 1.2, 0.3, 53, 10),
	n('Canela em pau', 'temperos', 247, 81, 2.2, 0, 4, 1.2, 0.3, 53, 10),
	n('Cominho', 'temperos', 375, 44, 2.3, 0, 17.8, 22.3, 1.5, 10.5, 168),
	n('Coentro em pó', 'temperos', 298, 55, 0, 0, 12.4, 17.8, 1, 41.9, 35),
	n('Cúrcuma (açafrão-da-terra)', 'temperos', 354, 65, 3.2, 0, 7.8, 9.9, 3.1, 21.1, 38),
	n('Páprica doce', 'temperos', 282, 54, 10, 0, 14.1, 12.9, 2.1, 34.9, 68),
	n('Páprica picante', 'temperos', 282, 54, 10, 0, 14.1, 12.9, 2.1, 34.9, 68),
	n('Curry em pó', 'temperos', 325, 58, 2.8, 0, 12.7, 14, 1.9, 33.2, 52),
	n('Colorau (urucum)', 'temperos', 358, 54, 0, 0, 14.4, 17.3, 2.7, 25.5, 23),
	n('Louro', 'temperos', 313, 75, 0, 0, 7.6, 8.4, 2.3, 26, 23),
	n('Orégano seco', 'temperos', 265, 68.9, 4.1, 0, 9, 4.3, 1.6, 42.5, 25),
	n('Tomilho seco', 'temperos', 276, 63.9, 1.7, 0, 9.1, 7.4, 2.1, 37, 55),
	n('Alecrim seco', 'temperos', 331, 64.1, 2.4, 0, 4.9, 15.2, 7.4, 42.6, 50),
	n('Coentro', 'ervas', 23, 3.7, 0.9, 0, 2.1, 0.5, 0, 2.8, 46),
	n('Salsinha', 'ervas', 36, 6.3, 0.9, 0, 3, 0.8, 0.1, 3.3, 56),
	n('Manjericão', 'ervas', 23, 2.7, 0.3, 0, 3.2, 0.6, 0, 1.6, 4),
	n('Manjericão seco', 'ervas', 233, 47.8, 1.7, 0, 22.4, 4, 0.7, 37.7, 76),
	n('Hortelã', 'ervas', 70, 14.9, 0.2, 0, 3.8, 0.9, 0.2, 8, 31),
	n('Cebolinha', 'ervas', 30, 6.5, 2.2, 0, 1.8, 0.3, 0, 1.8, 16),
	n('Alecrim fresco', 'ervas', 131, 20.7, 1.4, 0, 3.3, 5.9, 2.8, 14.1, 26),
	n('Tomilho fresco', 'ervas', 101, 24.5, 1.7, 0, 5.6, 1.7, 0.5, 14, 9),
	n('Estragão', 'ervas', 295, 50.2, 1.9, 0, 22.8, 7.2, 1.8, 7.4, 62),
	n('Sálvia', 'ervas', 315, 60.7, 1.7, 0, 10.6, 12.7, 7, 40.3, 11),
	n('Gengibre fresco', 'temperos', 80, 17.8, 1.7, 0, 1.8, 0.8, 0.2, 2, 13),
	n('Gengibre em pó', 'temperos', 335, 71.6, 3.4, 0, 8.9, 4.2, 1.2, 14.1, 27),
	// BEBIDAS
	n('Cerveja', 'bebidas', 43, 3.6, 0, 0, 0.5, 0, 0, 0, 14),
	n('Vinho tinto seco', 'bebidas', 85, 2.6, 0.6, 0, 0.1, 0, 0, 0, 6),
	n('Vinho branco seco', 'bebidas', 82, 2.6, 0.6, 0, 0.1, 0, 0, 0, 9),
	n('Rum', 'bebidas', 231, 0, 0, 0, 0, 0, 0, 0, 1),
	n('Cachaça', 'bebidas', 228, 0, 0, 0, 0, 0, 0, 0, 1),
	n('Café solúvel', 'bebidas', 357, 66.7, 0, 0, 12.2, 0, 0, 0, 63),
	n('Extrato de baunilha', 'confeitaria', 288, 12.7, 12.7, 12.7, 0.1, 0.1, 0, 0, 9),
	n('Licor de amêndoa (amaretto)', 'bebidas', 324, 32.5, 32.5, 32.5, 0.1, 0.1, 0, 0, 4),
	// EXTRAS PARA RECEITAS
	n('Água', 'líquidos', 0, 0, 0, 0, 0, 0, 0, 0, 0),
	n('Caldo de frango caseiro', 'líquidos', 15, 1.5, 0.5, 0, 1.5, 0.3, 0.1, 0, 300),
	n('Caldo de carne caseiro', 'líquidos', 20, 2, 0.5, 0, 2, 0.5, 0.2, 0, 350),
	n('Caldo de legumes caseiro', 'líquidos', 10, 2, 0.5, 0, 0.5, 0.1, 0, 0.5, 250),
	n('Vinho branco para cozinhar', 'bebidas', 82, 2.6, 0.6, 0, 0.1, 0, 0, 0, 9),
];

const recipeImagesBySlug: Record<string, string> = {
	'moqueca-baiana-de-peixe-e-camarao': wikimediaImage('8/84/MOQUECAB.jpg'),
	'feijoada-brasileira-completa': wikimediaImage('9/95/Feijoada_%C3%A0_brasileira_3.jpg'),
	'pao-de-queijo-mineiro': wikimediaImage('5/50/P%C3%A3o_de_Queijo_%28Brazilian_Cheese_Bread%29.jpg'),
	'brigadeiro-tradicional': wikimediaImage('b/b0/BrigadeiroBrazil.jpg'),
	'strogonoff-de-frango-cremoso': wikimediaImage('b/b4/Chicken_stroganoff.jpg'),
	'salpicao-de-frango-tradicional': wikimediaImage('7/73/Salpic%C3%A3o_de_frango.jpg'),
	'bobo-de-camarao-baiano': wikimediaImage('2/2f/Bob%C3%B3_de_camar%C3%A3o.jpg'),
	'escondidinho-de-carne-seca': wikimediaImage('1/19/Escondidinho_de_carne_seca.jpg'),
	'risoto-de-cogumelos': unsplashImage('photo-1476124369491-e7addf5db371'),
	'lasanha-a-bolonhesa': unsplashImage('photo-1574894709920-11b28e7367e3'),
	'espaguete-ao-molho-de-tomate-e-manjericao': unsplashImage('photo-1551892374-ecf8754cf8b0'),
	'panqueca-de-carne-moida': wikimediaImage('c/c9/Crepe_fourree_p1040332.jpg'),
	'omelete-de-espinafre-e-queijo': unsplashImage('photo-1510693206972-df098062cb71'),
	'tapioca-de-queijo-minas-com-tomate': unsplashImage('photo-1525351484163-7529414344d8'),
	'bowl-fitness-de-frango-e-batata-doce': unsplashImage('photo-1546069901-ba9599a7e63c'),
	'salada-tropical-com-frango': unsplashImage('photo-1512621776951-a57141f2eefd'),
	'sopa-cremosa-de-abobora': unsplashImage('photo-1476718406336-bb5a9690ee2a'),
	'caldo-verde-com-couve': unsplashImage('photo-1547592166-23ac45744acd'),
	'curry-vegano-de-grao-de-bico': unsplashImage('photo-1604329760661-e71dc83f8f26'),
	'berinjela-a-parmegiana': unsplashImage('photo-1625937286074-9ca519d5d9df'),
	'tilapia-assada-com-legumes': unsplashImage('photo-1519708227418-c8fd9a32b7a2'),
	'salmao-com-crosta-de-castanha': unsplashImage('photo-1467003909585-2f8a72700288'),
	'cuscuz-paulista-de-atum': wikimediaImage('3/35/CuscuzPaulista.jpg'),
	'bolo-de-banana-com-aveia': unsplashImage('photo-1578985545062-69928b1d9587'),
	'mousse-de-chocolate-meio-amargo': unsplashImage('photo-1511381939415-e44015466834'),
	'pizza-margherita-caseira': unsplashImage('photo-1513104890138-7c749659a591'),
	'frango-grelhado-com-limao-e-alho': unsplashImage('photo-1532550907401-a500c9a57435'),
	'risoto-de-camarao': unsplashImage('photo-1559742811-822873691df8'),
	'fango-a-parmegiana': unsplashImage('photo-1565299507177-b0ac66763828'),
	'arroz-de-forno-com-frango': unsplashImage('photo-1555939594-58d7cb561ad1'),
	'sopa-de-feijao': unsplashImage('photo-1547592166-23ac45744acd'),
	'bife-acebolado-com-arroz-e-feijao': unsplashImage('photo-1504674900247-0877df9cc836'),
	'quibe-assado': wikimediaImage('6/6b/Quibe_assado.jpg'),
	'coxinha-de-frango': wikimediaImage('d/d0/Coxinha.jpg'),
	'bolinho-de-bacalhau': wikimediaImage('5/52/Bolinhos_de_bacalhau.jpg'),
	'frango-assado-com-batata': unsplashImage('photo-1598515214211-89d3c73ae83b'),
	'bolo-de-cenoura-com-cobertura-de-chocolate': wikimediaImage('5/5a/Bolo_de_cenoura.jpg'),
	'pavê-de-chocolate': unsplashImage('photo-1519915028121-7d3463d20b13'),
	'caipirinha': wikimediaImage('8/8c/Caipirinha_with_lime_and_cachaca.jpg'),
	'farofa-de-manteiga': unsplashImage('photo-1540189549336-e6e99c3679fe'),
	'arroz-com-broccolis-e-queijo': unsplashImage('photo-1512621776951-a57141f2eefd'),
	'carne-moida-refogada': unsplashImage('photo-1504674900247-0877df9cc836'),
};

const recipeDescriptionsBySlug: Record<string, string> = {
	'moqueca-baiana-de-peixe-e-camarao':
		'Moqueca de panela cheia, com peixe macio, camarão e um caldo perfumado de dendê, leite de coco e coentro. Fica ótima com arroz branco e farofa simples.',
	'feijoada-brasileira-completa':
		'Feijoada para almoço sem pressa, encorpada e bem temperada, com feijão preto, carnes defumadas e aquele caldo que pede couve, arroz e laranja ao lado.',
	'pao-de-queijo-mineiro':
		'Pão de queijo de casca levemente crocante e miolo puxa-puxa, feito com a mistura de polvilhos que deixa a fornada mais saborosa.',
	'brigadeiro-tradicional':
		'Brigadeiro clássico de festa, cozido no ponto certo para enrolar sem ficar duro. Simples, brilhante e coberto com granulado.',
	'strogonoff-de-frango-cremoso':
		'Strogonoff de frango bem cremoso, com molho de tomate, champignon e creme de leite. É daqueles pratos rápidos que resolvem o almoço da semana.',
	'salpicao-de-frango-tradicional':
		'Salpicão frio, colorido e crocante, com frango desfiado, legumes, maçã verde e batata palha. Funciona muito bem em almoço de família.',
	'bobo-de-camarao-baiano':
		'Bobó de camarão com creme de mandioca aveludado, leite de coco e dendê na medida. O camarão entra no final para ficar suculento.',
	'escondidinho-de-carne-seca':
		'Escondidinho com purê de mandioca macio, carne seca refogada e queijo gratinado por cima. Comfort food brasileira sem complicar.',
	'risoto-de-cogumelos':
		'Risoto cremoso de cogumelos, finalizado com manteiga e parmesão. O arroz fica no ponto certo, úmido e com bastante sabor.',
	'lasanha-a-bolonhesa':
		'Lasanha de forno com camadas generosas de bolonhesa, muçarela e parmesão. Boa para servir em travessa e repetir sem cerimônia.',
	'espaguete-ao-molho-de-tomate-e-manjericao':
		'Espaguete simples e perfumado, com molho de tomate, alho, azeite e manjericão fresco. Uma massa rápida para o dia a dia.',
	'panqueca-de-carne-moida':
		'Panqueca recheada com carne moída bem refogada, coberta com molho de tomate e pronta para gratinar. Tem cara de almoço de casa.',
	'omelete-de-espinafre-e-queijo':
		'Omelete macia com espinafre, tomate e queijo minas. Fica pronta rápido e sustenta bem sem pesar.',
	'tapioca-de-queijo-minas-com-tomate':
		'Tapioca de frigideira com queijo minas, tomate e manjericão. Leve, sem glúten e boa para café da manhã ou lanche.',
	'bowl-fitness-de-frango-e-batata-doce':
		'Bowl completo com frango, batata-doce e legumes, montado para uma refeição prática, equilibrada e fácil de levar.',
	'salada-tropical-com-frango':
		'Salada fresca com frango, folhas, manga e abacate. O molho de limão e azeite deixa tudo mais vivo sem esconder os ingredientes.',
	'sopa-cremosa-de-abobora':
		'Sopa de abóbora cremosa e levemente adocicada, com alho, cebola e um toque de creme de leite no final.',
	'caldo-verde-com-couve':
		'Caldo verde simples, com batata batida, couve fininha e calabresa dourada. Fica encorpado sem precisar de muitos ingredientes.',
	'curry-vegano-de-grao-de-bico':
		'Curry vegano de grão-de-bico com leite de coco, tomate e espinafre. É aromático, nutritivo e fica ótimo com arroz.',
	'berinjela-a-parmegiana':
		'Berinjela à parmegiana com molho de tomate, queijo derretido e forno quente para dourar. Uma versão vegetariana bem servida.',
	'tilapia-assada-com-legumes':
		'Tilápia assada com legumes e limão, leve e direta ao ponto. Boa para quando a ideia é comer bem sem sujar muita panela.',
	'salmao-com-crosta-de-castanha':
		'Salmão assado com crosta de castanha-de-caju, servido com brócolis. A cobertura fica crocante e o peixe continua úmido.',
	'cuscuz-paulista-de-atum':
		'Cuscuz paulista de atum bem úmido, com legumes e molho de tomate. Depois de desenformado, fica bonito para servir em fatias.',
	'bolo-de-banana-com-aveia':
		'Bolo de banana com aveia, mel e canela, sem excesso de açúcar. Bom para lanche da tarde e para aproveitar banana madura.',
	'mousse-de-chocolate-meio-amargo':
		'Mousse de chocolate meio amargo, cremosa e intensa, feita para servir gelada em porções pequenas.',
	'pizza-margherita-caseira':
		'Pizza margherita caseira com massa fermentada, molho de tomate simples, muçarela e manjericão fresco.',
	'frango-grelhado-com-limao-e-alho':
		'Peito de frango marinado com limão, alho e ervas frescas, grelhado até ficar dourado por fora e suculento por dentro.',
	'risoto-de-camarao':
		'Risoto cremoso de camarão com vinho branco, caldo de frango e parmesão. Um prato elegante que fica pronto em menos de 40 minutos.',
	'frango-a-parmegiana':
		'Frango à parmegiana empanado e frito, coberto com molho de tomate e muçarela derretida. Clássico do cardápio brasileiro.',
	'arroz-de-forno-com-frango':
		'Arroz de forno recheado com frango desfiado, requeijão e milho. Um prato completo que vai direto da forma para a mesa.',
	'sopa-de-feijao':
		'Sopa de feijão encorpada, com linguiça, cenoura e macarrão. Reconfortante e perfeita para o jantar de dias mais frios.',
	'bife-acebolado-com-arroz-e-feijao':
		'Bife alto acebolado na frigideira quente, servido com arroz branco e feijão carioca. O almoço brasileiro mais clássico.',
	'quibe-assado':
		'Quibe assado com recheio de carne e cebola, bem temperado com hortelã, cominho e pimenta. Fica úmido e saboroso de forno.',
	'coxinha-de-frango':
		'Coxinha de frango com massa macia, recheio bem temperado e casquinha crocante. A saudade do lanche da tarde em forma de petisco.',
	'bolinho-de-bacalhau':
		'Bolinhos de bacalhau com batata, salsinha e cebola, fritos na hora. Crocantes por fora e macios por dentro.',
	'frango-assado-com-batata':
		'Frango assado inteiro com batatas temperadas, dourado no forno e suculento por dentro. Receita de domingo sem complicação.',
	'bolo-de-cenoura-com-cobertura-de-chocolate':
		'Bolo de cenoura cremoso e fofinho, com cobertura de chocolate derretido. A combinação perfeita para o café da tarde.',
	'pave-de-chocolate':
		'Pavê de chocolate em camadas com biscoito champagne, creme de chocolate e chantilly. Sobremesa gelada para servir em travessa.',
	'farofa-de-manteiga':
		'Farofa de manteiga simples, levemente crocante e dourada. Acompanhamento clássico para arroz, feijão e carnes.',
};

const pizzaSections: SeedRecipeSection[] = [
	{
		title: 'Massa',
		ingredients: [
			{ name: 'Farinha de trigo', grams: 500 },
			{ name: 'Água', grams: 300 },
			{ name: 'Fermento biológico seco', grams: 7 },
			{ name: 'Sal', grams: 8 },
			{ name: 'Azeite de oliva', grams: 20 },
		],
		steps: [
			{
				description:
					'Em uma tigela, dissolva o fermento biológico em 300 g de água morna (aproximadamente 35 °C) e deixe repousar por 5 minutos até espumar.',
			},
			{
				description:
					'Adicione a farinha de trigo e o sal, misturando com as mãos ou na batedeira com gancho até obter uma massa homogênea. Incorpore o azeite de oliva e sove por 10 minutos até a massa ficar lisa e elástica.',
			},
			{
				description:
					'Forme uma bola, cubra com filme plástico e deixe fermentar em temperatura ambiente por 1 hora ou até dobrar de volume.',
			},
			{
				description:
					'Divida a massa em 2 bolas iguais. Abra cada uma com as mãos ou rolo em superfície enfarinhada, formando discos de aproximadamente 30 cm, com a borda levemente mais alta.',
			},
		],
	},
	{
		title: 'Molho',
		ingredients: [
			{ name: 'Molho de tomate', grams: 240 },
			{ name: 'Alho', grams: 6 },
			{ name: 'Azeite de oliva', grams: 10 },
			{ name: 'Orégano seco', grams: 4 },
			{ name: 'Sal', grams: 3 },
		],
		steps: [
			{
				description:
					'Aqueça o azeite em fogo médio e doure o alho picado por 1 minuto sem deixar queimar.',
			},
			{
				description:
					'Adicione o molho de tomate e o orégano, tempere com sal e cozinhe em fogo baixo por 10 minutos, mexendo ocasionalmente, até engrossar levemente. Reserve.',
			},
		],
	},
	{
		title: 'Cobertura e forno',
		ingredients: [
			{ name: 'Muçarela', grams: 300 },
			{ name: 'Tomate', grams: 200 },
			{ name: 'Manjericão', grams: 10 },
			{ name: 'Azeite de oliva', grams: 8 },
		],
		steps: [
			{
				description:
					'Pré-aqueça o forno a 250 °C por pelo menos 20 minutos. Se tiver pedra refratária, aqueça-a também.',
			},
			{
				description:
					'Espalhe uma camada fina de molho sobre a massa, cubra com muçarela fatiada ou ralada e distribua rodelas de tomate por cima. Regue com um fio de azeite.',
			},
			{
				description:
					'Asse por 10–12 minutos até a borda dourar e o queijo borbulhar. Retire do forno, distribua as folhas de manjericão fresco e sirva imediatamente.',
			},
		],
	},
];

const coxinhaSections: SeedRecipeSection[] = [
	{
		title: 'Recheio',
		ingredients: [
			{ name: 'Peito de frango', grams: 500 },
			{ name: 'Requeijão cremoso', grams: 180 },
			{ name: 'Cebola', grams: 80 },
			{ name: 'Alho', grams: 8 },
			{ name: 'Salsinha', grams: 15 },
			{ name: 'Cebolinha', grams: 10 },
			{ name: 'Sal', grams: 4 },
			{ name: 'Pimenta-do-reino', grams: 2 },
		],
		steps: [
			{
				description:
					'Cozinhe o peito de frango em água fervente com sal e alho por 25 minutos. Escorra, deixe esfriar e desfie com dois garfos.',
			},
			{
				description:
					'Refogue a cebola picada no azeite por 3 minutos, adicione o alho e o frango desfiado. Tempere com sal, pimenta e misture o requeijão, a salsinha e a cebolinha. Reserve e deixe esfriar completamente.',
			},
		],
	},
	{
		title: 'Massa',
		ingredients: [
			{ name: 'Farinha de trigo', grams: 500 },
			{ name: 'Caldo de frango caseiro', grams: 500 },
			{ name: 'Manteiga', grams: 30 },
			{ name: 'Sal', grams: 5 },
		],
		steps: [
			{
				description:
					'Em uma panela, aqueça o caldo de frango com a manteiga e o sal. Quando ferver, adicione a farinha de trigo de uma vez, mexendo vigorosamente com colher de pau até a massa desgrudar do fundo da panela.',
			},
			{
				description:
					'Transfira para uma superfície e sove a massa ainda quente (use luvas se necessário) por 5 minutos até ficar lisa e homogênea. Divida em 25 bolinhas.',
			},
		],
	},
	{
		title: 'Empanamento e fritura',
		ingredients: [
			{ name: 'Ovo', grams: 150 },
			{ name: 'Farinha de rosca', grams: 200 },
			{ name: 'Óleo', grams: 500 },
		],
		steps: [
			{
				description:
					'Abra cada bolinha de massa na palma da mão, coloque uma colher de recheio no centro e feche moldando no formato de coxinha, afinando a ponta superior.',
			},
			{
				description:
					'Passe cada coxinha primeiro no ovo batido e depois na farinha de rosca, pressionando levemente para aderir.',
			},
			{
				description:
					'Aqueça o óleo a 170 °C e frite as coxinhas em lotes por 4–5 minutos, virando na metade do tempo, até ficarem douradas. Escorra em papel absorvente.',
			},
		],
	},
];

const quibeSections: SeedRecipeSection[] = [
	{
		title: 'Trigo hidratado',
		ingredients: [
			{ name: 'Trigo para quibe', grams: 300 },
			{ name: 'Água', grams: 350 },
		],
		steps: [
			{
				description:
					'Coloque o trigo para quibe em uma tigela e cubra com a água fria. Deixe hidratar por 30 minutos, escorra bem e esprema com as mãos para retirar o excesso de água.',
			},
		],
	},
	{
		title: 'Carne temperada',
		ingredients: [
			{ name: 'Carne bovina moída', grams: 600 },
			{ name: 'Cebola', grams: 160 },
			{ name: 'Hortelã', grams: 20 },
			{ name: 'Cominho', grams: 5 },
			{ name: 'Pimenta-do-reino', grams: 3 },
			{ name: 'Sal', grams: 8 },
			{ name: 'Azeite de oliva', grams: 30 },
		],
		steps: [
			{
				description:
					'Misture a carne moída com o trigo hidratado, a cebola ralada, a hortelã picada, o cominho, a pimenta e o sal. Amasse bem até obter uma massa homogênea.',
			},
		],
	},
	{
		title: 'Recheio e montagem',
		ingredients: [
			{ name: 'Carne bovina moída', grams: 250 },
			{ name: 'Cebola', grams: 80 },
			{ name: 'Pimenta-do-reino', grams: 2 },
			{ name: 'Sal', grams: 3 },
		],
		steps: [
			{
				description:
					'Refogue a cebola em azeite por 3 minutos, adicione 250 g de carne moída e cozinhe por 8 minutos, tempere com sal e pimenta. Esse será o recheio.',
			},
			{
				description:
					'Unte uma assadeira grande com azeite. Espalhe metade da massa de quibe, distribua o recheio por cima e cubra com a outra metade da massa. Faça riscos diagonais na superfície e regue com azeite.',
			},
			{
				description:
					'Asse em forno pré-aquecido a 200 °C por 40 minutos até dourar. Deixe repousar 10 minutos antes de cortar.',
			},
		],
	},
];

const recipes: SeedRecipe[] = [
	r(
		'Moqueca baiana de peixe e camarão',
		'Pratos principais',
		wikimediaImage('8/84/MOQUECAB.jpg'),
		25,
		30,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Tradicional', 'Baiana', 'Peixe', 'Almoço'],
		[
			['Peixe branco em postas', 800],
			['Camarão limpo', 300],
			['Leite de coco', 400],
			['Azeite de dendê', 45],
			['Tomate', 360],
			['Cebola', 240],
			['Pimentão vermelho', 160],
			['Pimentão amarelo', 160],
			['Coentro', 35],
			['Limão', 70],
			['Sal', 8],
		],
		[
			{
				description:
					'Tempere o peixe e o camarão com suco de limão, sal e pimenta. Deixe marinar por 15 minutos na geladeira.',
				imageUrl: unsplashImage('photo-1534604973900-c43ab4c2e0ab'),
			},
			{
				description:
					'Em panela de barro ou caçarola, aqueça o azeite de dendê em fogo médio. Doure a cebola e os pimentões em rodelas por 5 minutos.',
				imageUrl: unsplashImage('photo-1556909114-f6e7ad7d3136'),
			},
			{
				description:
					'Adicione o tomate em rodelas e cozinhe mais 3 minutos. Arrume o peixe sobre os legumes em camadas, regue com o leite de coco e tampe a panela.',
			},
			{
				description:
					'Cozinhe em fogo médio por 15 minutos. Adicione o camarão, tampe novamente e cozinhe por mais 5 minutos até o camarão ficar rosado.',
				imageUrl: unsplashImage('photo-1565557623262-b51c2513a641'),
			},
			{
				description:
					'Finalize com coentro fresco picado e sirva com arroz branco e farofa.',
			},
		],
		true,
	),
	r(
		'Feijoada brasileira completa',
		'Pratos principais',
		wikimediaImage('9/95/Feijoada_%C3%A0_brasileira_3.jpg'),
		40,
		150,
		8,
		YieldUnit.PORTIONS,
		DifficultyLevel.HARD,
		['Brasileira', 'Tradicional', 'Almoço'],
		[
			['Feijão preto', 1200],
			['Carne seca dessalgada', 500],
			['Costelinha suína defumada', 500],
			['Linguiça calabresa', 300],
			['Paio', 250],
			['Cebola', 240],
			['Alho', 30],
			['Louro', 2],
			['Azeite de oliva', 30],
			['Sal', 5],
		],
		[
			{
				description:
					'Deixe o feijão preto de molho por 8 horas ou de um dia para o outro. Dessalgue a carne seca trocando a água 3 vezes ao longo de 24 horas.',
			},
			{
				description:
					'Em panela de pressão, cozinhe o feijão escorrido com as carnes cortadas em pedaços, a linguiça, o paio, as folhas de louro e água suficiente para cobrir tudo. Cozinhe por 40 minutos após pressão.',
			},
			{
				description:
					'Em frigideira, frite a cebola e o alho picados em azeite até dourar. Adicione 2 conchas de feijão amassado para engrossar e devolva à panela.',
			},
			{
				description:
					'Cozinhe em fogo baixo descoberto por mais 20 minutos, ajustando o sal. A feijoada deve ficar com caldo encorpado e cremoso.',
			},
			{
				description:
					'Sirva com arroz branco, couve refogada no alho, farofa, laranja fatiada e uma pimentinha de molho.',
			},
		],
		true,
	),
	r(
		'Pão de queijo mineiro',
		'Lanches',
		wikimediaImage('5/50/P%C3%A3o_de_Queijo_%28Brazilian_Cheese_Bread%29.jpg'),
		25,
		25,
		24,
		YieldUnit.UNITS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Mineira', 'Sem glúten', 'Fácil', 'Café da manhã'],
		[
			['Polvilho doce', 300],
			['Polvilho azedo', 200],
			['Leite integral', 250],
			['Óleo', 92],
			['Ovo', 100],
			['Queijo minas curado ralado', 250],
			['Sal', 5],
		],
		[
			{
				description:
					'Pré-aqueça o forno a 200 °C. Misture os polvilhos e o sal em uma tigela grande.',
			},
			{
				description:
					'Aqueça o leite e o óleo juntos até ferver. Despeje sobre os polvilhos e mexa rapidamente com colher de pau até incorporar. Aguarde amornar.',
			},
			{
				description:
					'Adicione os ovos um a um, misturando bem após cada adição. Incorpore o queijo ralado e amasse até a massa ficar homogênea e levemente pegajosa.',
			},
			{
				description:
					'Com as mãos untadas com óleo, modele bolinhas de aproximadamente 40 g cada. Disponha em assadeira untada com espaço entre elas.',
			},
			{
				description:
					'Asse por 25 minutos até ficarem dourados e levemente rachados na superfície. Sirva quentes.',
			},
		],
		true,
	),
	r(
		'Brigadeiro tradicional',
		'Sobremesas',
		wikimediaImage('b/b0/BrigadeiroBrazil.jpg'),
		20,
		12,
		24,
		YieldUnit.UNITS,
		DifficultyLevel.EASY,
		['Brasileira', 'Tradicional', 'Fácil', 'Festa', 'Doce'],
		[
			['Leite condensado', 395],
			['Chocolate em pó', 35],
			['Manteiga', 15],
			['Granulado de chocolate', 100],
		],
		[
			{
				description:
					'Em panela de fundo grosso, misture o leite condensado, o chocolate em pó e a manteiga. Leve ao fogo médio mexendo sempre com espátula.',
			},
			{
				description:
					'Cozinhe por 10–12 minutos, mexendo sem parar, até a mistura desgrudar completamente do fundo e das laterais da panela.',
			},
			{
				description:
					'Transfira para um prato untado com manteiga e deixe esfriar completamente por pelo menos 1 hora.',
			},
			{
				description:
					'Com as mãos untadas com manteiga, modele bolinhas de aproximadamente 15 g. Passe no granulado de chocolate e coloque em forminhas de papel.',
			},
		],
		true,
	),
	r(
		'Strogonoff de frango cremoso',
		'Pratos principais',
		wikimediaImage('b/b4/Chicken_stroganoff.jpg'),
		15,
		25,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Fácil', 'Almoço', 'Frango', 'Cremosa'],
		[
			['Peito de frango', 700],
			['Cebola', 120],
			['Alho', 10],
			['Molho de tomate', 200],
			['Creme de leite', 200],
			['Champignon', 100],
			['Mostarda', 15],
			['Ketchup', 30],
			['Óleo', 10],
			['Sal', 4],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Corte o peito de frango em tiras de aproximadamente 2 cm. Tempere com sal, pimenta e reserve.',
			},
			{
				description:
					'Aqueça o óleo em frigideira grande em fogo alto. Sele o frango em lotes por 3 minutos de cada lado até dourar. Reserve.',
			},
			{
				description:
					'Na mesma frigideira, reduza o fogo para médio e refogue a cebola picada por 3 minutos. Adicione o alho e cozinhe mais 1 minuto.',
			},
			{
				description:
					'Devolva o frango à frigideira, adicione o molho de tomate, a mostarda e o ketchup. Cozinhe por 5 minutos.',
			},
			{
				description:
					'Adicione o champignon fatiado e o creme de leite. Misture bem e cozinhe por mais 3 minutos em fogo baixo sem deixar ferver. Sirva com arroz e batata palha.',
			},
		],
		true,
	),
	r(
		'Salpicão de frango tradicional',
		'Saladas',
		wikimediaImage('7/73/Salpic%C3%A3o_de_frango.jpg'),
		30,
		20,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Brasileira', 'Fácil', 'Frango', 'Festa'],
		[
			['Peito de frango', 600],
			['Cenoura', 260],
			['Maçã verde', 160],
			['Milho verde', 170],
			['Ervilha em lata', 170],
			['Uva-passa', 80],
			['Maionese', 250],
			['Batata palha', 120],
		],
		[
			{
				description:
					'Cozinhe o peito de frango em água com sal por 25 minutos. Escorra e desfie grosseiramente quando ainda morno.',
			},
			{
				description:
					'Rale a cenoura no ralo grosso. Corte a maçã verde em cubinhos pequenos (não descasque).',
			},
			{
				description:
					'Em uma tigela grande, misture o frango desfiado, a cenoura, a maçã, o milho escorrido, a ervilha escorrida e a uva-passa.',
			},
			{
				description:
					'Adicione a maionese e misture delicadamente até envolver tudo. Ajuste o sal se necessário.',
			},
			{
				description:
					'Leve à geladeira por pelo menos 1 hora. Na hora de servir, cubra com batata palha e sirva gelado.',
			},
		],
	),
	r(
		'Bobó de camarão baiano',
		'Pratos principais',
		wikimediaImage('2/2f/Bob%C3%B3_de_camar%C3%A3o.jpg'),
		30,
		45,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Baiana', 'Nordestina'],
		[
			['Camarão limpo', 700],
			['Mandioca cozida', 900],
			['Leite de coco', 400],
			['Azeite de dendê', 45],
			['Tomate', 240],
			['Cebola', 180],
			['Pimentão vermelho', 120],
			['Coentro', 30],
			['Alho', 15],
			['Limão', 40],
			['Sal', 6],
		],
		[
			{
				description:
					'Tempere o camarão com limão, sal e alho amassado. Reserve na geladeira por 15 minutos.',
			},
			{
				description:
					'Bata a mandioca cozida com metade do leite de coco no liquidificador até obter um creme liso. Reserve.',
			},
			{
				description:
					'Em panela grande, aqueça o azeite de dendê e refogue a cebola, o pimentão e o tomate picados por 8 minutos.',
			},
			{
				description:
					'Adicione o creme de mandioca e o restante do leite de coco. Cozinhe em fogo médio por 10 minutos, mexendo sempre.',
			},
			{
				description:
					'Adicione o camarão e cozinhe por apenas 5 minutos até ficarem rosados. Finalize com coentro e ajuste o sal.',
			},
		],
		true,
	),
	r(
		'Escondidinho de carne seca',
		'Pratos principais',
		wikimediaImage('1/19/Escondidinho_de_carne_seca.jpg'),
		35,
		45,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Nordestina', 'Forno'],
		[
			['Mandioca cozida', 1000],
			['Carne seca dessalgada', 500],
			['Cebola', 180],
			['Alho', 15],
			['Manteiga', 30],
			['Leite integral', 180],
			['Queijo minas', 180],
			['Salsinha', 20],
			['Sal', 4],
		],
		[
			{
				description:
					'Cozinhe a mandioca em água com sal até ficar bem macia. Escorra e amasse com manteiga e leite até obter um purê cremoso. Tempere com sal.',
			},
			{
				description:
					'Desfie a carne seca dessalgada. Em frigideira, refogue a cebola e o alho no azeite por 5 minutos. Adicione a carne desfiada e cozinhe por 10 minutos mexendo sempre.',
			},
			{
				description:
					'Adicione a salsinha picada à carne e misture.',
			},
			{
				description:
					'Em refratário untado, espalhe a carne refogada no fundo. Cubra com o purê de mandioca e alise a superfície.',
			},
			{
				description:
					'Cubra com o queijo minas fatiado ou ralado e leve ao forno pré-aquecido a 200 °C por 20 minutos até o queijo gratinar.',
			},
		],
	),
	r(
		'Risoto de cogumelos',
		'Pratos principais',
		unsplashImage('photo-1476124369491-e7addf5db371'),
		15,
		30,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Vegetariana', 'Italiana', 'Cremosa'],
		[
			['Arroz arbóreo', 320],
			['Shiitake', 150],
			['Cogumelo paris', 150],
			['Cebola', 120],
			['Alho', 10],
			['Manteiga', 40],
			['Parmesão ralado', 80],
			['Azeite de oliva', 20],
			['Vinho branco para cozinhar', 120],
			['Caldo de legumes caseiro', 1000],
			['Sal', 4],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Aqueça o caldo de legumes em panela separada e mantenha em fogo baixo.',
			},
			{
				description:
					'Em panela larga, aqueça o azeite e a metade da manteiga. Refogue a cebola picada por 4 minutos. Adicione o alho e os cogumelos fatiados, cozinhe por 5 minutos até dourar.',
			},
			{
				description:
					'Adicione o arroz arbóreo e toste por 2 minutos, mexendo sempre. Despeje o vinho branco e mexa até evaporar.',
			},
			{
				description:
					'Adicione o caldo quente concha a concha, mexendo constantemente e aguardando cada adição ser absorvida antes da próxima. Esse processo leva 18–20 minutos.',
			},
			{
				description:
					'Quando o arroz estiver al dente, desligue o fogo. Incorpore o restante da manteiga gelada e o parmesão, mexendo vigorosamente para criar uma textura cremosa. Ajuste o sal e sirva imediatamente.',
			},
		],
		true,
	),
	r(
		'Lasanha à bolonhesa',
		'Massas',
		unsplashImage('photo-1574894709920-11b28e7367e3'),
		35,
		50,
		8,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Massa', 'Forno', 'Italiana'],
		[
			['Massa para lasanha', 400],
			['Carne bovina moída', 700],
			['Molho de tomate', 600],
			['Cebola', 180],
			['Alho', 15],
			['Muçarela', 350],
			['Parmesão ralado', 80],
			['Azeite de oliva', 20],
			['Louro', 2],
			['Sal', 6],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Cozinhe as placas de lasanha em água fervente com sal por 2 minutos a menos do tempo indicado na embalagem. Escorra e reserve sobre pano úmido.',
			},
			{
				description:
					'Refogue a cebola e o alho no azeite por 5 minutos. Adicione a carne moída e cozinhe em fogo alto por 10 minutos, desmanchando com colher, até dourar.',
			},
			{
				description:
					'Adicione o molho de tomate, o louro, sal e pimenta. Cozinhe em fogo médio por 20 minutos até o molho encorpar. Retire o louro.',
			},
			{
				description:
					'Em refratário (35x25 cm), monte as camadas: molho bolonhesa, massa, molho, muçarela fatiada. Repita até acabar os ingredientes. Finalize com molho, muçarela e parmesão ralado.',
			},
			{
				description:
					'Cubra com papel alumínio e asse em forno pré-aquecido a 200 °C por 30 minutos. Retire o alumínio e asse por mais 15 minutos até gratinar. Aguarde 10 minutos antes de servir.',
			},
		],
		true,
	),
	{
		title: 'Pizza margherita caseira',
		slug: toSlug('Pizza margherita caseira'),
		category: 'Massas',
		imageUrl: recipeImagesBySlug['pizza-margherita-caseira'] ?? unsplashImage('photo-1513104890138-7c749659a591'),
		prepTime: 45,
		cookTime: 15,
		yieldAmount: 8,
		yieldUnit: YieldUnit.SLICES,
		difficulty: DifficultyLevel.MEDIUM,
		tags: ['Italiana', 'Massa', 'Forno', 'Vegetariana', 'Festa'],
		isFeatured: true,
		description: recipeDescriptionsBySlug['pizza-margherita-caseira'],
		ingredients: pizzaSections.flatMap((section) => section.ingredients),
		steps: pizzaSections.flatMap((section) => section.steps),
		sections: pizzaSections,
	},
	{
		title: 'Coxinha de frango',
		slug: toSlug('Coxinha de frango'),
		category: 'Lanches',
		imageUrl: recipeImagesBySlug['coxinha-de-frango'] ?? unsplashImage('photo-1528735602780-2552fd46c7af'),
		prepTime: 60,
		cookTime: 30,
		yieldAmount: 25,
		yieldUnit: YieldUnit.UNITS,
		difficulty: DifficultyLevel.HARD,
		tags: ['Brasileira', 'Tradicional', 'Festa', 'Lanche'],
		isFeatured: true,
		description: recipeDescriptionsBySlug['coxinha-de-frango'],
		ingredients: coxinhaSections.flatMap((section) => section.ingredients),
		steps: coxinhaSections.flatMap((section) => section.steps),
		sections: coxinhaSections,
	},
	{
		title: 'Quibe assado',
		slug: toSlug('Quibe assado'),
		category: 'Pratos principais',
		imageUrl: recipeImagesBySlug['quibe-assado'] ?? unsplashImage('photo-1504674900247-0877df9cc836'),
		prepTime: 40,
		cookTime: 40,
		yieldAmount: 8,
		yieldUnit: YieldUnit.PORTIONS,
		difficulty: DifficultyLevel.MEDIUM,
		tags: ['Árabe', 'Forno', 'Almoço'],
		isFeatured: false,
		description: recipeDescriptionsBySlug['quibe-assado'],
		ingredients: quibeSections.flatMap((section) => section.ingredients),
		steps: quibeSections.flatMap((section) => section.steps),
		sections: quibeSections,
	},
	r(
		'Espaguete ao molho de tomate e manjericão',
		'Massas',
		unsplashImage('photo-1551892374-ecf8754cf8b0'),
		10,
		20,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Massa', 'Vegetariana', 'Rápida', 'Italiana'],
		[
			['Macarrão cozido', 800],
			['Molho de tomate', 500],
			['Tomate', 240],
			['Alho', 12],
			['Azeite de oliva', 25],
			['Manjericão', 15],
			['Parmesão ralado', 40],
			['Sal', 4],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Cozinhe o macarrão em bastante água fervente com sal conforme indicação da embalagem. Reserve 1 xícara da água do cozimento.',
			},
			{
				description:
					'Enquanto o macarrão cozinha, aqueça o azeite e doure o alho fatiado em fogo médio-baixo por 2 minutos sem deixar escurecer.',
			},
			{
				description:
					'Adicione o tomate em cubinhos e refogue por 5 minutos. Junte o molho de tomate, ajuste o sal e cozinhe por mais 8 minutos.',
			},
			{
				description:
					'Escorra o macarrão e transfira direto para a frigideira com o molho. Adicione 2–3 colheres da água do cozimento e misture em fogo alto por 1 minuto.',
			},
			{
				description:
					'Desligue, acrescente o manjericão rasgado e o parmesão. Sirva imediatamente.',
			},
		],
	),
	r(
		'Omelete de espinafre e queijo',
		'Café da manhã',
		unsplashImage('photo-1510693206972-df098062cb71'),
		8,
		10,
		2,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Rápida', 'Fitness', 'Vegetariana', 'Proteico', 'Café da manhã'],
		[
			['Ovo', 200],
			['Espinafre', 80],
			['Queijo minas', 80],
			['Tomate', 100],
			['Cebola', 40],
			['Azeite de oliva', 8],
			['Sal', 3],
			['Pimenta-do-reino', 1],
		],
		[
			{
				description:
					'Bata os ovos em tigela com sal e pimenta até ficarem homogêneos.',
			},
			{
				description:
					'Aqueça o azeite em frigideira antiaderente de 20 cm em fogo médio. Refogue a cebola por 2 minutos e adicione o espinafre picado grosseiramente, cozinhando por mais 1 minuto.',
			},
			{
				description:
					'Despeje os ovos batidos sobre os legumes. Não mexa. Distribua o tomate em cubinhos e o queijo minas fatiado por cima.',
			},
			{
				description:
					'Tampe a frigideira e cozinhe em fogo baixo por 3 minutos até o ovo firmar. Dobre ao meio e sirva.',
			},
		],
	),
	r(
		'Tapioca de queijo minas com tomate',
		'Café da manhã',
		unsplashImage('photo-1525351484163-7529414344d8'),
		8,
		8,
		2,
		YieldUnit.UNITS,
		DifficultyLevel.EASY,
		['Brasileira', 'Sem glúten', 'Rápida', 'Café da manhã'],
		[
			['Goma de tapioca', 140],
			['Queijo minas', 120],
			['Tomate', 120],
			['Manjericão', 8],
			['Azeite de oliva', 8],
		],
		[
			{
				description:
					'Aqueça uma frigideira antiaderente de 20 cm em fogo médio-baixo sem adicionar gordura.',
			},
			{
				description:
					'Espalhe 70 g de goma de tapioca sobre a frigideira quente formando um disco uniforme. Pressione levemente com espátula.',
			},
			{
				description:
					'Quando as bordas começarem a soltar (cerca de 2 minutos), distribua o queijo minas fatiado e o tomate em rodelas sobre metade da tapioca.',
			},
			{
				description:
					'Dobre a tapioca ao meio sobre o recheio e pressione levemente. Desligue o fogo, regue com azeite e decore com manjericão fresco. Repita para a segunda tapioca.',
			},
		],
	),
	r(
		'Bowl fitness de frango e batata-doce',
		'Pratos principais',
		unsplashImage('photo-1546069901-ba9599a7e63c'),
		20,
		30,
		2,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Fitness', 'Frango', 'Almoço', 'Proteico', 'Low carb'],
		[
			['Peito de frango', 350],
			['Batata-doce', 400],
			['Brócolis', 200],
			['Cenoura', 140],
			['Azeite de oliva', 15],
			['Limão', 40],
			['Sal', 3],
			['Pimenta-do-reino', 2],
			['Alho', 8],
		],
		[
			{
				description:
					'Pré-aqueça o forno a 200 °C. Corte a batata-doce em cubos de 2 cm e a cenoura em rodelas. Tempere com azeite, alho picado, sal e pimenta.',
			},
			{
				description:
					'Distribua os legumes em assadeira e asse por 25 minutos, virando na metade do tempo.',
			},
			{
				description:
					'Tempere o peito de frango com sal, pimenta, limão e um fio de azeite. Grelhe em frigideira antiaderente por 6 minutos de cada lado até dourar. Fatie em tirinhas.',
			},
			{
				description:
					'Cozinhe o brócolis em água com sal por 4 minutos. Escorra.',
			},
			{
				description:
					'Monte os bowls com o frango, os legumes assados e o brócolis. Regue com azeite e suco de limão.',
			},
		],
	),
	r(
		'Salada tropical com frango',
		'Saladas',
		unsplashImage('photo-1512621776951-a57141f2eefd'),
		20,
		15,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Fitness', 'Frango', 'Rápida'],
		[
			['Peito de frango', 350],
			['Alface', 120],
			['Rúcula', 80],
			['Manga', 250],
			['Abacate', 200],
			['Pepino', 150],
			['Azeite de oliva', 18],
			['Limão', 50],
			['Sal', 3],
			['Pimenta-do-reino', 1],
		],
		[
			{
				description:
					'Tempere o frango com sal, pimenta e suco de metade do limão. Grelhe por 6 minutos de cada lado e fatie quando esfriar.',
			},
			{
				description:
					'Lave e seque as folhas. Corte a manga, o abacate e o pepino em cubos.',
			},
			{
				description:
					'Monte a salada com as folhas na base, distribua as frutas, o pepino e o frango fatiado por cima.',
			},
			{
				description:
					'Emulsione o azeite com o restante do suco de limão, sal e pimenta. Regue sobre a salada e sirva imediatamente.',
			},
		],
	),
	r(
		'Sopa cremosa de abóbora',
		'Caldos e sopas',
		unsplashImage('photo-1476718406336-bb5a9690ee2a'),
		15,
		30,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Vegetariana', 'Cremosa', 'Sopas'],
		[
			['Abóbora cabotiá', 900],
			['Cebola', 120],
			['Alho', 10],
			['Creme de leite', 120],
			['Azeite de oliva', 15],
			['Salsinha', 10],
			['Sal', 5],
			['Pimenta-do-reino', 2],
			['Noz-moscada', 2],
		],
		[
			{
				description:
					'Descasque e corte a abóbora em cubos de 3 cm. Pique a cebola e o alho.',
			},
			{
				description:
					'Em panela, aqueça o azeite e refogue a cebola por 5 minutos. Adicione o alho e cozinhe mais 1 minuto.',
			},
			{
				description:
					'Adicione a abóbora e água suficiente para cobrir. Cozinhe por 20 minutos em fogo médio até a abóbora ficar muito macia.',
			},
			{
				description:
					'Bata no liquidificador até ficar completamente lisa. Devolva à panela, adicione o creme de leite, noz-moscada, sal e pimenta. Aqueça em fogo baixo.',
			},
			{
				description:
					'Sirva com salsinha picada por cima e um fio de azeite.',
			},
		],
	),
	r(
		'Caldo verde com couve',
		'Caldos e sopas',
		unsplashImage('photo-1547592166-23ac45744acd'),
		15,
		35,
		5,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Tradicional', 'Cremosa', 'Sopas'],
		[
			['Batata inglesa', 900],
			['Couve manteiga', 200],
			['Linguiça calabresa', 250],
			['Cebola', 120],
			['Alho', 10],
			['Azeite de oliva', 15],
			['Sal', 5],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Descasque e corte as batatas em cubos. Em panela, aqueça o azeite e refogue a cebola e o alho picados por 5 minutos.',
			},
			{
				description:
					'Adicione as batatas e água para cobrir. Cozinhe por 20 minutos até as batatas ficarem macias. Bata com mixer diretamente na panela até ficar um caldo homogêneo.',
			},
			{
				description:
					'Fatie a linguiça em rodelas e doure em frigideira separada por 5 minutos. Adicione ao caldo.',
			},
			{
				description:
					'Lave e corte a couve em tiras bem finas (chiffonade). Adicione ao caldo fervente, cozinhe por apenas 2 minutos para manter a cor verde. Sirva quente.',
			},
		],
	),
	r(
		'Curry vegano de grão-de-bico',
		'Pratos principais',
		unsplashImage('photo-1604329760661-e71dc83f8f26'),
		15,
		30,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Vegana', 'Vegetariana', 'Fitness', 'Proteico'],
		[
			['Grão-de-bico cozido', 700],
			['Leite de coco', 300],
			['Tomate', 240],
			['Cebola', 160],
			['Alho', 12],
			['Espinafre', 120],
			['Azeite de oliva', 18],
			['Curry em pó', 10],
			['Gengibre fresco', 15],
			['Sal', 4],
		],
		[
			{
				description:
					'Em panela grande, aqueça o azeite e refogue a cebola picada por 5 minutos até amolecer.',
			},
			{
				description:
					'Adicione o alho e o gengibre ralados, o curry em pó e cozinhe por 2 minutos mexendo sempre até perfumar.',
			},
			{
				description:
					'Adicione o tomate em cubinhos e cozinhe por 5 minutos. Junte o grão-de-bico escorrido e o leite de coco.',
			},
			{
				description:
					'Cozinhe em fogo médio por 15 minutos até o molho encorpar levemente. Adicione o espinafre nos últimos 2 minutos, apenas para murchar.',
			},
			{
				description:
					'Ajuste o sal e sirva com arroz branco ou pão naan.',
			},
		],
	),
	r(
		'Berinjela à parmegiana',
		'Pratos principais',
		unsplashImage('photo-1625937286074-9ca519d5d9df'),
		25,
		40,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Vegetariana', 'Forno', 'Italiana'],
		[
			['Berinjela', 600],
			['Molho de tomate', 500],
			['Muçarela', 250],
			['Parmesão ralado', 60],
			['Farinha de trigo', 60],
			['Ovo', 100],
			['Azeite de oliva', 20],
			['Sal', 4],
			['Orégano seco', 3],
		],
		[
			{
				description:
					'Fatie a berinjela em rodelas de 1 cm. Salgue e deixe descansar por 30 minutos para perder o amargor. Seque bem com papel toalha.',
			},
			{
				description:
					'Passe cada fatia na farinha de trigo, depois no ovo batido. Frite em azeite quente por 2 minutos de cada lado até dourar. Escorra no papel absorvente.',
			},
			{
				description:
					'Em refratário, faça uma camada de molho de tomate. Coloque as fatias de berinjela, cubra com molho e muçarela fatiada. Repita as camadas.',
			},
			{
				description:
					'Finalize com parmesão ralado e orégano. Asse em forno a 200 °C por 20 minutos até gratinar.',
			},
		],
	),
	r(
		'Tilápia assada com legumes',
		'Pratos principais',
		unsplashImage('photo-1519708227418-c8fd9a32b7a2'),
		15,
		25,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Peixe', 'Fitness', 'Almoço', 'Assado'],
		[
			['Filé de tilápia', 650],
			['Abobrinha', 250],
			['Tomate', 240],
			['Cenoura', 160],
			['Cebola', 120],
			['Azeite de oliva', 20],
			['Limão', 50],
			['Sal', 4],
			['Alecrim fresco', 10],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Tempere os filés de tilápia com suco de limão, sal, pimenta e azeite. Deixe marinar por 10 minutos.',
			},
			{
				description:
					'Corte os legumes em fatias ou cubos médios. Distribua em assadeira, regue com azeite, sal e pimenta.',
			},
			{
				description:
					'Asse os legumes em forno pré-aquecido a 200 °C por 15 minutos.',
			},
			{
				description:
					'Retire a assadeira do forno, arrume os filés sobre os legumes, decore com alecrim e asse por mais 12 minutos até o peixe ficar opaco e desfazer levemente.',
			},
		],
	),
	r(
		'Salmão com crosta de castanha',
		'Pratos principais',
		unsplashImage('photo-1467003909585-2f8a72700288'),
		20,
		25,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Peixe', 'Fitness', 'Proteico', 'Assado'],
		[
			['Salmão', 650],
			['Castanha-de-caju', 100],
			['Limão', 50],
			['Azeite de oliva', 15],
			['Brócolis', 250],
			['Sal', 4],
			['Pimenta-do-reino', 2],
			['Salsinha', 10],
		],
		[
			{
				description:
					'Triture as castanhas-de-caju grosseiramente no processador. Misture com salsinha picada, sal e um fio de azeite.',
			},
			{
				description:
					'Tempere os filés de salmão com suco de limão, sal e pimenta. Espalhe a crosta de castanha sobre o lado de cima de cada filé.',
			},
			{
				description:
					'Disponha em assadeira untada e asse em forno pré-aquecido a 200 °C por 15–18 minutos.',
			},
			{
				description:
					'Cozinhe o brócolis em água com sal por 4 minutos. Sirva ao lado do salmão com suco de limão.',
			},
		],
		true,
	),
	r(
		'Cuscuz paulista de atum',
		'Lanches',
		wikimediaImage('3/35/CuscuzPaulista.jpg'),
		25,
		20,
		8,
		YieldUnit.SLICES,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Festa'],
		[
			['Farinha de milho', 300],
			['Atum em lata escorrido', 240],
			['Milho verde', 170],
			['Ervilha em lata', 170],
			['Molho de tomate', 300],
			['Tomate', 200],
			['Cebola', 120],
			['Azeite de oliva', 25],
			['Salsinha', 15],
			['Sal', 4],
		],
		[
			{
				description:
					'Refogue a cebola picada no azeite por 5 minutos. Adicione o molho de tomate e cozinhe por 8 minutos.',
			},
			{
				description:
					'Adicione o atum desfiado, o milho e a ervilha escorridos. Misture bem e ajuste o sal.',
			},
			{
				description:
					'Em uma tigela, misture a farinha de milho com o caldo quente do refogado até hidratar a farinha. Deve ficar úmida mas não encharcada.',
			},
			{
				description:
					'Incorpore o refogado à farinha hidratada. Adicione o tomate em cubinhos e a salsinha.',
			},
			{
				description:
					'Transfira para forma de pudim untada, pressione bem e leve ao forno a 180 °C por 30 minutos. Deixe esfriar antes de desenformar.',
			},
		],
	),
	r(
		'Bolo de banana com aveia',
		'Sobremesas',
		unsplashImage('photo-1578985545062-69928b1d9587'),
		15,
		35,
		10,
		YieldUnit.SLICES,
		DifficultyLevel.EASY,
		['Doce', 'Fitness', 'Integral'],
		[
			['Banana', 500],
			['Aveia em flocos', 250],
			['Ovo', 150],
			['Iogurte natural', 170],
			['Mel', 80],
			['Fermento químico', 12],
			['Canela em pó', 5],
		],
		[
			{
				description:
					'Pré-aqueça o forno a 180 °C. Unte e enfarinhe uma forma de bolo inglês (23x10 cm).',
			},
			{
				description:
					'Amasse as bananas maduras com um garfo até virar purê. Bata com os ovos, o iogurte e o mel.',
			},
			{
				description:
					'Adicione a aveia, a canela e o fermento. Misture até incorporar mas não bata em excesso.',
			},
			{
				description:
					'Despeje na forma e asse por 35 minutos ou até o palito sair limpo. Aguarde esfriar na forma antes de desenformar.',
			},
		],
	),
	r(
		'Mousse de chocolate meio amargo',
		'Sobremesas',
		unsplashImage('photo-1511381939415-e44015466834'),
		20,
		5,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Doce', 'Cremosa'],
		[
			['Chocolate meio amargo', 220],
			['Creme de leite fresco', 300],
			['Ovo', 150],
			['Açúcar', 60],
			['Manteiga', 20],
		],
		[
			{
				description:
					'Derreta o chocolate com a manteiga em banho-maria ou micro-ondas. Deixe amornar.',
			},
			{
				description:
					'Separe as claras das gemas. Bata as gemas com metade do açúcar até ficarem claras e cremosas. Misture ao chocolate derretido.',
			},
			{
				description:
					'Bata as claras em neve com o restante do açúcar até picos firmes.',
			},
			{
				description:
					'Bata o creme de leite fresco até ponto de chantilly suave.',
			},
			{
				description:
					'Incorpore delicadamente as claras em neve ao chocolate, depois o chantilly, fazendo movimentos de baixo para cima. Distribua em taças e leve à geladeira por mínimo 4 horas.',
			},
		],
	),
	r(
		'Frango grelhado com limão e alho',
		'Pratos principais',
		unsplashImage('photo-1532550907401-a500c9a57435'),
		20,
		15,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Frango', 'Fitness', 'Grelhado', 'Proteico', 'Low carb'],
		[
			['Peito de frango', 800],
			['Limão', 80],
			['Alho', 20],
			['Azeite de oliva', 25],
			['Alecrim fresco', 10],
			['Tomilho fresco', 8],
			['Sal', 6],
			['Pimenta-do-reino', 3],
		],
		[
			{
				description:
					'Faça cortes superficiais no peito de frango para a marinada penetrar melhor. Tempere com sal, pimenta, alho amassado, suco de limão e azeite. Deixe marinar por pelo menos 30 minutos.',
			},
			{
				description:
					'Aqueça uma grelha ou frigideira de ferro em fogo alto até ficar bem quente.',
			},
			{
				description:
					'Grelhe o frango por 6–7 minutos de cada lado sem mexer, para criar marcas de grelha.',
			},
			{
				description:
					'Retire e deixe descansar por 5 minutos antes de fatiar. Sirva com alecrim e tomilho frescos.',
			},
		],
		false,
	),
	r(
		'Frango a parmegiana',
		'Pratos principais',
		unsplashImage('photo-1565299507177-b0ac66763828'),
		25,
		20,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Frango', 'Almoço', 'Forno', 'Italiana'],
		[
			['Peito de frango', 700],
			['Molho de tomate', 400],
			['Muçarela', 200],
			['Farinha de trigo', 80],
			['Ovo', 150],
			['Farinha de rosca', 120],
			['Parmesão ralado', 40],
			['Óleo', 100],
			['Sal', 5],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Abra os filés de frango com um martelo de carne ou rolo entre dois plásticos até terem aproximadamente 1 cm de espessura. Tempere com sal e pimenta.',
			},
			{
				description:
					'Monte a linha de empanamento: farinha de trigo, ovo batido com sal, farinha de rosca. Passe cada filé nessa sequência.',
			},
			{
				description:
					'Frite em óleo quente (170 °C) por 3 minutos de cada lado até dourar. Escorra no papel absorvente.',
			},
			{
				description:
					'Disponha em assadeira. Cubra com molho de tomate, muçarela fatiada e parmesão.',
			},
			{
				description:
					'Leve ao forno a 200 °C por 10 minutos até o queijo gratinar. Sirva com arroz e macarrão.',
			},
		],
		true,
	),
	r(
		'Arroz de forno com frango',
		'Pratos principais',
		unsplashImage('photo-1555939594-58d7cb561ad1'),
		25,
		40,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Frango', 'Forno', 'Almoço', 'Brasileira'],
		[
			['Arroz branco cozido', 600],
			['Frango desfiado cozido', 400],
			['Requeijão cremoso', 200],
			['Milho verde', 170],
			['Ervilha em lata', 170],
			['Molho de tomate', 200],
			['Muçarela', 200],
			['Sal', 4],
			['Orégano seco', 3],
		],
		[
			{
				description:
					'Em tigela, misture o arroz cozido, o frango desfiado, o requeijão, o milho, a ervilha, o molho de tomate e o sal.',
			},
			{
				description:
					'Transfira para um refratário untado e alise a superfície.',
			},
			{
				description:
					'Cubra com muçarela ralada ou fatiada e polvilhe orégano.',
			},
			{
				description:
					'Leve ao forno pré-aquecido a 200 °C por 25–30 minutos até gratinar. Sirva direto do refratário.',
			},
		],
		false,
	),
	r(
		'Bife acebolado com arroz e feijão',
		'Pratos principais',
		unsplashImage('photo-1504674900247-0877df9cc836'),
		10,
		20,
		2,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Brasileira', 'Tradicional', 'Rápida', 'Almoço'],
		[
			['Contrafilé', 400],
			['Cebola', 200],
			['Alho', 10],
			['Manteiga', 20],
			['Arroz branco cozido', 300],
			['Feijão carioca cozido', 300],
			['Azeite de oliva', 15],
			['Sal', 5],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Tempere os bifes com sal, pimenta e alho amassado. Deixe descansar por 10 minutos.',
			},
			{
				description:
					'Aqueça uma frigideira de ferro em fogo alto até começar a soltar fumaça. Adicione a manteiga e os bifes.',
			},
			{
				description:
					'Sele por 2 minutos de cada lado para ponto mal passado, 3 minutos para ao ponto. Retire e reserve.',
			},
			{
				description:
					'Na mesma frigideira, reduza o fogo para médio, adicione mais um pouco de manteiga e frite a cebola em rodelas por 5 minutos até amolecer e dourar.',
			},
			{
				description:
					'Devolva os bifes, cubra com as cebolas e sirva com arroz e feijão.',
			},
		],
		false,
	),
	r(
		'Sopa de feijão',
		'Caldos e sopas',
		unsplashImage('photo-1547592166-23ac45744acd'),
		15,
		40,
		5,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Brasileira', 'Tradicional', 'Sopas', 'Jantar'],
		[
			['Feijão carioca cozido', 600],
			['Linguiça fresca', 250],
			['Cenoura', 150],
			['Batata inglesa', 200],
			['Cebola', 120],
			['Alho', 12],
			['Macarrão cozido', 200],
			['Azeite de oliva', 15],
			['Salsinha', 10],
			['Sal', 4],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Em panela grande, aqueça o azeite e doure a linguiça em rodelas por 5 minutos. Retire e reserve.',
			},
			{
				description:
					'No mesmo azeite, refogue a cebola e o alho por 4 minutos. Adicione a cenoura e a batata em cubinhos.',
			},
			{
				description:
					'Adicione o feijão cozido com o caldo (ou água), a linguiça reservada e cozinhe por 20 minutos em fogo médio.',
			},
			{
				description:
					'Amasse algumas conchas de feijão com garfo para engrossar o caldo. Adicione o macarrão cozido, ajuste o sal e cozinhe mais 5 minutos.',
			},
			{
				description:
					'Finalize com salsinha picada e sirva bem quente.',
			},
		],
		false,
	),
	r(
		'Bolinho de bacalhau',
		'Lanches',
		wikimediaImage('5/52/Bolinhos_de_bacalhau.jpg'),
		30,
		20,
		30,
		YieldUnit.UNITS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Peixe', 'Festa', 'Lanche'],
		[
			['Bacalhau dessalgado', 400],
			['Batata inglesa', 500],
			['Ovo', 100],
			['Cebola', 80],
			['Salsinha', 20],
			['Cebolinha', 10],
			['Azeite de oliva', 15],
			['Óleo', 400],
			['Sal', 3],
			['Pimenta-do-reino', 2],
		],
		[
			{
				description:
					'Cozinhe o bacalhau dessalgado em água fervente por 15 minutos. Escorra, deixe esfriar e desfie retirando todas as espinhas.',
			},
			{
				description:
					'Cozinhe as batatas em água com sal até ficarem macias. Amasse ainda quentes.',
			},
			{
				description:
					'Misture o bacalhau desfiado com o purê de batata, cebola picada, salsinha, cebolinha, os ovos e o azeite. Ajuste o sal e pimenta.',
			},
			{
				description:
					'Modele bolinhos com 2 colheres de sopa, dando formato oval (quenelle).',
			},
			{
				description:
					'Frite em óleo quente (170 °C) por 4 minutos virando na metade, até ficarem dourados. Escorra e sirva quente.',
			},
		],
		false,
	),
	r(
		'Frango assado com batata',
		'Pratos principais',
		unsplashImage('photo-1598515214211-89d3c73ae83b'),
		30,
		90,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Brasileira', 'Frango', 'Forno', 'Almoço', 'Assado'],
		[
			['Frango inteiro', 1500],
			['Batata inglesa', 800],
			['Alho', 30],
			['Limão', 80],
			['Manteiga', 50],
			['Azeite de oliva', 30],
			['Alecrim fresco', 15],
			['Tomilho fresco', 10],
			['Sal', 10],
			['Pimenta-do-reino', 4],
		],
		[
			{
				description:
					'Prepare a marinada: misture manteiga amolecida com alho amassado, suco de limão, sal, pimenta, alecrim e tomilho.',
			},
			{
				description:
					'Passe a manteiga temperada por fora e por baixo da pele do frango. Amarre as coxas com barbante e coloque em assadeira funda.',
			},
			{
				description:
					'Corte as batatas em quartos, tempere com azeite, sal, pimenta e disponha ao redor do frango.',
			},
			{
				description:
					'Asse em forno pré-aquecido a 200 °C por 1 hora e 30 minutos, regando com os sucos da assadeira a cada 30 minutos.',
			},
			{
				description:
					'O frango está pronto quando o termômetro marcar 74 °C na parte mais grossa da coxa. Deixe descansar 10 minutos antes de cortar.',
			},
		],
		true,
	),
	r(
		'Bolo de cenoura com cobertura de chocolate',
		'Sobremesas',
		wikimediaImage('5/5a/Bolo_de_cenoura.jpg'),
		20,
		35,
		10,
		YieldUnit.SLICES,
		DifficultyLevel.EASY,
		['Brasileira', 'Doce', 'Fácil', 'Café da manhã'],
		[
			['Cenoura', 300],
			['Ovo', 150],
			['Óleo', 120],
			['Açúcar', 200],
			['Farinha de trigo', 200],
			['Fermento químico', 12],
			['Chocolate em pó', 40],
			['Manteiga', 30],
			['Leite integral', 50],
		],
		[
			{
				description:
					'Pré-aqueça o forno a 180 °C. Unte e enfarinhe uma forma redonda de 24 cm.',
			},
			{
				description:
					'No liquidificador, bata a cenoura cortada em pedaços, o óleo, os ovos e o açúcar por 3 minutos até ficar homogêneo.',
			},
			{
				description:
					'Transfira para tigela e adicione a farinha de trigo peneirada e o fermento. Misture delicadamente com espátula.',
			},
			{
				description:
					'Despeje na forma e asse por 35 minutos até o palito sair limpo.',
			},
			{
				description:
					'Para a cobertura, misture o chocolate em pó, a manteiga e o leite em panela. Leve ao fogo médio mexendo sempre por 5 minutos até engrossar. Espalhe sobre o bolo ainda quente.',
			},
		],
		true,
	),
	r(
		'Panqueca de carne moída',
		'Pratos principais',
		wikimediaImage('c/c9/Crepe_fourree_p1040332.jpg'),
		30,
		35,
		6,
		YieldUnit.UNITS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Almoço'],
		[
			['Farinha de trigo', 180],
			['Leite integral', 300],
			['Ovo', 100],
			['Carne bovina moída', 500],
			['Molho de tomate', 350],
			['Cebola', 120],
			['Alho', 10],
			['Óleo', 15],
			['Sal', 5],
			['Pimenta-do-reino', 2],
			['Salsinha', 10],
		],
		[
			{
				description:
					'Bata no liquidificador os ovos, o leite, a farinha de trigo e uma pitada de sal. Deixe a massa descansar 15 minutos.',
			},
			{
				description:
					'Frite as panquecas em frigideira antiaderente untada com papel toalha levemente oleado, 1 minuto de cada lado. Reserve.',
			},
			{
				description:
					'Refogue a cebola e o alho no óleo por 4 minutos. Adicione a carne moída e cozinhe por 10 minutos até secar. Tempere com sal, pimenta e salsinha.',
			},
			{
				description:
					'Recheie cada panqueca com a carne moída e enrole. Disponha em refratário.',
			},
			{
				description:
					'Cubra com molho de tomate e parmesão ralado. Asse a 200 °C por 15 minutos.',
			},
		],
	),
	r(
		'Farofa de manteiga',
		'Acompanhamentos' as any,
		unsplashImage('photo-1540189549336-e6e99c3679fe'),
		5,
		15,
		8,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Brasileira', 'Tradicional', 'Fácil'],
		[
			['Farinha de mandioca', 400],
			['Manteiga', 80],
			['Cebola', 120],
			['Ovo', 100],
			['Salsinha', 15],
			['Cebolinha', 10],
			['Sal', 4],
		],
		[
			{
				description:
					'Derreta a manteiga em frigideira grande em fogo médio. Refogue a cebola picada por 5 minutos até amolecer.',
			},
			{
				description:
					'Quebre os ovos na frigideira, mexendo para fazer ovos mexidos grosseiros. Cozinhe por 2 minutos.',
			},
			{
				description:
					'Adicione a farinha de mandioca aos poucos, mexendo sempre para não grudar, por 5 minutos até ficar levemente tostada e dourada.',
			},
			{
				description:
					'Desligue o fogo, adicione salsinha e cebolinha picadas, ajuste o sal e sirva.',
			},
		],
		false,
	),
];

async function main() {
	const calculator = new NutritionCalculatorService(prisma as unknown as PrismaClient);
	const author = await seedAuthor();
	const categoryByName = await seedCategories();
	const tagByName = await seedTags();
	const ingredientByName = await seedIngredients();

	for (const recipe of recipes) {
		const categoryId = requireMapValue(categoryByName, recipe.category, 'Categoria');
		const tagIds = recipe.tags.map((tag) => requireMapValue(tagByName, tag, 'Tag'));
		const seedSections = getRecipeSeedSections(recipe);
		const sections = buildSections(recipe, ingredientByName);
		const calculatedNutritionLabel = await calculator.calculateForRecipe({
			title: recipe.title,
			description: recipe.description,
			prepTime: recipe.prepTime,
			cookTime: recipe.cookTime,
			yieldAmount: recipe.yieldAmount,
			yieldUnit: recipe.yieldUnit,
			difficulty: recipe.difficulty,
			categoryId,
			tagIds,
			sections: seedSections.map((section, sectionIndex) => ({
				title: section.title,
				position: sectionIndex + 1,
				ingredients: section.ingredients.map((ingredient, index) => ({
					ingredientId: requireMapValue(ingredientByName, ingredient.name, 'Ingrediente'),
					displayText: ingredient.text ?? formatIngredientText(ingredient.name, ingredient.grams),
					quantity: formatQuantity(ingredient.grams),
					quantityInGrams: ingredient.grams,
					unit: ingredient.unit ?? MeasurementUnit.G,
					notes: ingredient.notes,
					position: index + 1,
				})),
				steps: section.steps.map((step, index) => ({
					description: step.description,
					position: index + 1,
					imageUrl: step.imageUrl,
				})),
			})),
		});
		const nutritionLabel = calculatedNutritionLabel
			? { ...calculatedNutritionLabel, isApproximate: true }
			: null;

		await prisma.recipe.upsert({
			where: { slug: recipe.slug },
			update: {
				title: recipe.title,
				description: recipe.description,
				imageUrl: recipe.imageUrl,
				imagePublicId: null,
				prepTime: recipe.prepTime,
				cookTime: recipe.cookTime,
				totalTime: recipe.prepTime + recipe.cookTime,
				yieldAmount: recipe.yieldAmount,
				yieldUnit: recipe.yieldUnit,
				difficulty: recipe.difficulty,
				isPublished: true,
				isFeatured: recipe.isFeatured ?? false,
				deletedAt: null,
				author: { connect: { id: author.id } },
				category: { connect: { id: categoryId } },
				tags: {
					deleteMany: {},
					create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
				},
				sections: {
					deleteMany: {},
					create: sections,
				},
				...(nutritionLabel
					? {
							nutritionLabel: {
								upsert: {
									create: nutritionLabel,
									update: nutritionLabel,
								},
							},
						}
					: {}),
			},
			create: {
				title: recipe.title,
				slug: recipe.slug,
				description: recipe.description,
				imageUrl: recipe.imageUrl,
				imagePublicId: null,
				prepTime: recipe.prepTime,
				cookTime: recipe.cookTime,
				totalTime: recipe.prepTime + recipe.cookTime,
				yieldAmount: recipe.yieldAmount,
				yieldUnit: recipe.yieldUnit,
				difficulty: recipe.difficulty,
				isPublished: true,
				isFeatured: recipe.isFeatured ?? false,
				author: { connect: { id: author.id } },
				category: { connect: { id: categoryId } },
				tags: {
					create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
				},
				sections: {
					create: sections,
				},
				...(nutritionLabel
					? {
							nutritionLabel: {
								create: nutritionLabel,
							},
						}
					: {}),
			},
		});
	}

	console.log(
		`Seed concluído: ${recipes.length} receitas, ${ingredients.length} ingredientes com nutrição e ${categories.length} categorias.`,
	);
}

async function seedAuthor() {
	return await prisma.user.upsert({
		where: { email: 'chef.demo@cheffy.local' },
		update: {
			name: 'Chef Cheffy',
			emailVerified: true,
		},
		create: {
			name: 'Chef Cheffy',
			email: 'chef.demo@cheffy.local',
			emailVerified: true,
			image: chefImage,
		},
	});
}

async function seedCategories() {
	const categoryByName = new Map<string, string>();
	let position = 1;
	for (const [name, slug, description, iconKey, imageUrl] of categories) {
		const record = await prisma.category.upsert({
			where: { name },
			update: { slug, description, iconKey, imageUrl, imagePublicId: null, position },
			create: { name, slug, description, iconKey, imageUrl, imagePublicId: null, position },
		});
		categoryByName.set(record.name, record.id);
		position++;
	}
	return categoryByName;
}

async function seedTags() {
	const tagByName = new Map<string, string>();
	for (const tag of tags) {
		const record = await prisma.tag.upsert({
			where: { name: tag.name },
			update: { slug: tag.slug },
			create: tag,
		});
		tagByName.set(record.name, record.id);
	}
	return tagByName;
}

async function seedIngredients() {
	const ingredientByName = new Map<string, string>();
	for (const ingredient of ingredients) {
		const record = await prisma.ingredient.upsert({
			where: { name: ingredient.name },
			update: {
				slug: toSlug(ingredient.name),
				category: ingredient.category,
				imageUrl: ingredient.imageUrl ?? getIngredientImage(ingredient),
				imagePublicId: null,
				nutrition: {
					upsert: {
						create: buildNutritionData(ingredient),
						update: buildNutritionData(ingredient),
					},
				},
			},
			create: {
				name: ingredient.name,
				slug: toSlug(ingredient.name),
				category: ingredient.category,
				imageUrl: ingredient.imageUrl ?? getIngredientImage(ingredient),
				imagePublicId: null,
				nutrition: {
					create: buildNutritionData(ingredient),
				},
			},
		});
		ingredientByName.set(record.name, record.id);
	}
	return ingredientByName;
}

function buildSections(recipe: SeedRecipe, ingredientByName: Map<string, string>) {
	return getRecipeSeedSections(recipe).map((section, sectionIndex) => ({
		title: section.title,
		position: sectionIndex + 1,
		ingredients: {
			create: section.ingredients.map((ingredient, index) => ({
				displayText: ingredient.text ?? formatIngredientText(ingredient.name, ingredient.grams),
				quantity: formatQuantity(ingredient.grams),
				quantityInGrams: ingredient.grams,
				unit: ingredient.unit ?? MeasurementUnit.G,
				notes: ingredient.notes ?? null,
				position: index + 1,
				ingredient: {
					connect: { id: requireMapValue(ingredientByName, ingredient.name, 'Ingrediente') },
				},
			})),
		},
		steps: {
			create: section.steps.map((step, index) => ({
				description: step.description,
				position: index + 1,
			})),
		},
	}));
}

function getRecipeSeedSections(recipe: SeedRecipe): SeedRecipeSection[] {
	return (
		recipe.sections ?? [
			{
				title: 'Ingredientes e preparo',
				ingredients: recipe.ingredients,
				steps: recipe.steps,
			},
		]
	);
}

function buildNutritionData(ingredient: SeedIngredient) {
	return {
		energyKcalPer100g: ingredient.energyKcalPer100g,
		carbohydratesPer100g: ingredient.carbohydratesPer100g,
		totalSugarsPer100g: ingredient.totalSugarsPer100g,
		addedSugarsPer100g: ingredient.addedSugarsPer100g,
		proteinPer100g: ingredient.proteinPer100g,
		totalFatPer100g: ingredient.totalFatPer100g,
		saturatedFatPer100g: ingredient.saturatedFatPer100g,
		transFatPer100g: ingredient.transFatPer100g,
		fiberPer100g: ingredient.fiberPer100g,
		sodiumMgPer100g: ingredient.sodiumMgPer100g,
		source: nutritionSource,
	} satisfies Prisma.IngredientNutritionCreateWithoutIngredientInput;
}

function getIngredientImage(ingredient: SeedIngredient) {
	return (
		ingredientImagesByCategory[ingredient.category as keyof typeof ingredientImagesByCategory] ??
		ingredientImagesByCategory['hortaliças']
	);
}

function buildDescription(title: string, _recipeTags: string[]) {
	return (
		recipeDescriptionsBySlug[toSlug(title)] ??
		`${title} caseiro, com preparo direto e medidas em gramas para facilitar a cozinha do dia a dia.`
	);
}

function formatIngredientText(name: string, grams: number) {
	if (grams < 10) return `${grams} g de ${name.toLowerCase()}`;
	return `${Math.round(grams)} g de ${name.toLowerCase()}`;
}

function formatQuantity(grams: number) {
	return `${Math.round(grams)} g`;
}

function requireMapValue(map: Map<string, string>, key: string, label: string) {
	const value = map.get(key);
	if (!value) throw new Error(`${label} não encontrado: ${key}`);
	return value;
}

function toSlug(text: string) {
	return text
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function r(
	title: string,
	category: string,
	image: string,
	prepTime: number,
	cookTime: number,
	yieldAmount: number,
	yieldUnit: YieldUnit,
	difficulty: DifficultyLevel,
	tags: string[],
	ingredientPairs: ([string, number] | [string, number, string])[],
	steps: SeedStep[],
	isFeatured = false,
): SeedRecipe {
	const slug = toSlug(title);
	const ingredients = ingredientPairs.map(([name, grams, text]) => ({
		name,
		grams,
		text: text ?? formatIngredientText(name, grams),
	}));
	return {
		title,
		slug,
		category,
		imageUrl: recipeImagesBySlug[slug] ?? image,
		prepTime,
		cookTime,
		yieldAmount,
		yieldUnit,
		difficulty,
		tags,
		isFeatured,
		description: buildDescription(title, tags),
		ingredients,
		steps,
	};
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});