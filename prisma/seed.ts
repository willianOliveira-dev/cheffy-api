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
	stepTime: number;
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
};

const nutritionSource = 'Seed Cheffy aproximado';
const unsplashImage = (photoId: string) =>
	`https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=1200&q=80`;
const ingredientImage = (photoId: string) =>
	`https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=640&q=80`;
const chefImage = unsplashImage('photo-1577219491135-ce391730fb2c');
const sourceImage = (query: string) => recipeImageFallbacks[query] ?? recipeImageFallbacks.food;

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
] as const;

const recipeImageFallbacks: Record<string, string> = {
	food: unsplashImage('photo-1504674900247-0877df9cc836'),
	'escondidinho carne seca': unsplashImage('photo-1604908176997-125f25cc6f3d'),
	'mushroom risotto': unsplashImage('photo-1476124369491-e7addf5db371'),
	'lasagna bolognese': unsplashImage('photo-1574894709920-11b28e7367e3'),
	'spaghetti tomato basil': unsplashImage('photo-1473093295043-cdd812d0e601'),
	'beef pancake': unsplashImage('photo-1529042410759-befb1204b468'),
	'spinach cheese omelette': unsplashImage('photo-1510693206972-df098062cb71'),
	'tapioca cheese tomato': unsplashImage('photo-1525351484163-7529414344d8'),
	'chicken sweet potato bowl': unsplashImage('photo-1546069901-ba9599a7e63c'),
	'tropical chicken salad': unsplashImage('photo-1512621776951-a57141f2eefd'),
	'pumpkin soup': unsplashImage('photo-1476718406336-bb5a9690ee2a'),
	'caldo verde soup': unsplashImage('photo-1547592166-23ac45744acd'),
	'chickpea curry': unsplashImage('photo-1604329760661-e71dc83f8f26'),
	'eggplant parmesan': unsplashImage('photo-1572441713132-51c75654db73'),
	'baked tilapia vegetables': unsplashImage('photo-1519708227418-c8fd9a32b7a2'),
	'salmon cashew crust': unsplashImage('photo-1467003909585-2f8a72700288'),
	'cuscuz paulista tuna': unsplashImage('photo-1540189549336-e6e99c3679fe'),
	'banana oat cake': unsplashImage('photo-1578985545062-69928b1d9587'),
	'dark chocolate mousse': unsplashImage('photo-1511381939415-e44015466834'),
};

const recipeImagesBySlug = {
	'moqueca-baiana-de-peixe-e-camarao': unsplashImage('photo-1534766555764-ce878a5e3a2b'),
	'feijoada-brasileira-completa': unsplashImage('photo-1544025162-d76694265947'),
	'pao-de-queijo-mineiro': unsplashImage('photo-1509440159596-0249088772ff'),
	'brigadeiro-tradicional': unsplashImage('photo-1606313564200-e75d5e30476c'),
	'strogonoff-de-frango-cremoso': unsplashImage('photo-1604908176997-125f25cc6f3d'),
	'salpicao-de-frango-tradicional': unsplashImage('photo-1512621776951-a57141f2eefd'),
	'bobo-de-camarao-baiano': unsplashImage('photo-1534766555764-ce878a5e3a2b'),
} satisfies Record<string, string>;

const ingredientImagesByCategory = {
	cereais: ingredientImage('photo-1536304993881-ff6e9eefa2a6'),
	leguminosas: ingredientImage('photo-1515543904379-3d757afe72e4'),
	massas: ingredientImage('photo-1473093295043-cdd812d0e601'),
	farinhas: ingredientImage('photo-1509440159596-0249088772ff'),
	açúcares: ingredientImage('photo-1582049169738-4c1f4f6aa141'),
	laticínios: ingredientImage('photo-1628088062854-d1870b4553da'),
	'laticínios e similares': ingredientImage('photo-1585238342028-4bbc1a83f7d6'),
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
} satisfies Record<string, string>;

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
	n('Arroz branco cozido', 'cereais', 128, 28.1, 0.1, 0, 2.5, 0.2, 0.1, 1.6, 1),
	n('Arroz arbóreo', 'cereais', 356, 78, 0.2, 0, 6.5, 0.7, 0.2, 1.3, 5),
	n('Feijão preto cozido', 'leguminosas', 77, 14, 0.3, 0, 4.5, 0.5, 0.1, 8.4, 2),
	n('Feijão preto', 'leguminosas', 77, 14, 0.3, 0, 4.5, 0.5, 0.1, 8.4, 2),
	n('Feijão carioca cozido', 'leguminosas', 76, 13.6, 0.4, 0, 4.8, 0.5, 0.1, 8.5, 2),
	n('Lentilha cozida', 'leguminosas', 116, 20.1, 1.8, 0, 9, 0.4, 0.1, 7.9, 2),
	n('Grão-de-bico cozido', 'leguminosas', 164, 27.4, 4.8, 0, 8.9, 2.6, 0.3, 7.6, 7),
	n('Macarrão cozido', 'massas', 158, 30.9, 0.6, 0, 5.8, 0.9, 0.2, 1.8, 1),
	n('Massa para lasanha', 'massas', 350, 72, 2.5, 0, 12, 1.5, 0.3, 3, 10),
	n('Farinha de trigo', 'farinhas', 364, 76, 0.3, 0, 10, 1, 0.2, 2.7, 2),
	n('Farinha de mandioca', 'farinhas', 365, 89, 1.6, 0, 1.6, 0.3, 0.1, 6.4, 1),
	n('Goma de tapioca', 'farinhas', 330, 81, 0, 0, 0.2, 0, 0, 0.5, 5),
	n('Polvilho doce', 'farinhas', 351, 86, 0, 0, 0.4, 0, 0, 0.2, 2),
	n('Polvilho azedo', 'farinhas', 351, 86, 0, 0, 0.4, 0, 0, 0.2, 2),
	n('Aveia em flocos', 'cereais', 389, 66, 1, 0, 16.9, 6.9, 1.2, 10.6, 2),
	n('Açúcar', 'açúcares', 387, 100, 100, 100, 0, 0, 0, 0, 1),
	n('Mel', 'açúcares', 304, 82, 82, 82, 0.3, 0, 0, 0.2, 4),
	n('Leite condensado', 'laticínios', 321, 54, 54, 35, 7.9, 8.7, 5.5, 0, 125),
	n('Creme de leite', 'laticínios', 221, 4.5, 3.5, 0, 2.1, 22, 14, 0, 70),
	n('Leite integral', 'laticínios', 61, 4.8, 5, 0, 3.2, 3.3, 1.9, 0, 43),
	n('Leite', 'laticínios', 61, 4.8, 5, 0, 3.2, 3.3, 1.9, 0, 43),
	n('Iogurte natural', 'laticínios', 61, 4.7, 4.7, 0, 3.5, 3.3, 2.1, 0, 46),
	n('Queijo minas', 'queijos', 264, 3.2, 1.3, 0, 17.4, 20.2, 12.4, 0, 579),
	n('Queijo minas curado ralado', 'queijos', 390, 2.5, 0.5, 0, 28, 30, 18, 0, 700),
	n('Parmesão ralado', 'queijos', 431, 4.1, 0.9, 0, 38, 29, 17, 0, 1529),
	n('Muçarela', 'queijos', 280, 3.1, 1, 0, 18, 21, 13, 0, 620),
	n('Ricota', 'queijos', 174, 3, 0.3, 0, 11, 13, 8, 0, 84),
	n('Manteiga', 'laticínios', 717, 0.1, 0.1, 0, 0.9, 81, 51, 0, 11),
	n('Azeite de oliva', 'óleos', 884, 0, 0, 0, 0, 100, 14, 0, 2),
	n('Óleo', 'óleos', 884, 0, 0, 0, 0, 100, 14, 0, 0),
	n('Azeite de dendê', 'óleos', 884, 0, 0, 0, 0, 100, 49, 0, 0),
	n('Ovo', 'ovos', 143, 0.7, 0.4, 0, 12.6, 9.5, 3.1, 0, 142),
	n('Peito de frango', 'aves', 165, 0, 0, 0, 31, 3.6, 1, 0, 74),
	n('Sobrecoxa de frango', 'aves', 209, 0, 0, 0, 26, 11, 3.1, 0, 95),
	n('Carne bovina moída', 'carnes', 250, 0, 0, 0, 26, 15, 6, 0, 72),
	n('Patinho bovino', 'carnes', 219, 0, 0, 0, 35, 8, 3, 0, 61),
	n('Carne seca dessalgada', 'carnes', 313, 0, 0, 0, 36, 18, 7, 0, 1200),
	n('Costelinha suína defumada', 'carnes', 320, 0, 0, 0, 20, 26, 9, 0, 950),
	n('Linguiça calabresa', 'embutidos', 312, 2.4, 0.5, 0.5, 15, 27, 9, 0, 1180),
	n('Paio', 'embutidos', 318, 2, 0.4, 0.4, 15, 28, 10, 0, 1120),
	n('Bacon', 'embutidos', 541, 1.4, 0, 0, 37, 42, 14, 0, 1717),
	n('Peixe branco em postas', 'peixe', 105, 0, 0, 0, 22, 1.7, 0.4, 0, 80),
	n('Filé de tilápia', 'peixe', 96, 0, 0, 0, 20, 1.7, 0.6, 0, 52),
	n('Salmão', 'peixe', 208, 0, 0, 0, 20, 13, 3.1, 0, 59),
	n('Atum em lata escorrido', 'peixe', 132, 0, 0, 0, 28, 1, 0.3, 0, 377),
	n('Camarão limpo', 'frutos do mar', 99, 0.2, 0, 0, 24, 0.3, 0.1, 0, 111),
	n('Bacalhau dessalgado', 'peixe', 105, 0, 0, 0, 23, 0.9, 0.2, 0, 400),
	n('Tofu firme', 'proteínas vegetais', 144, 3, 0.6, 0, 17, 8.7, 1.3, 2.3, 14),
	n('Proteína de soja texturizada', 'proteínas vegetais', 336, 33, 8, 0, 52, 1.2, 0.2, 15, 20),
	n('Tomate', 'hortaliças', 18, 3.9, 2.6, 0, 0.9, 0.2, 0, 1.2, 5),
	n('Molho de tomate', 'molhos', 29, 6.7, 4.2, 0, 1.3, 0.2, 0, 1.4, 400),
	n('Extrato de tomate', 'molhos', 82, 19, 12, 0, 4.3, 0.5, 0.1, 4.1, 59),
	n('Cebola', 'hortaliças', 40, 9.3, 4.2, 0, 1.1, 0.1, 0, 1.7, 4),
	n('Alho', 'temperos', 149, 33, 1, 0, 6.4, 0.5, 0.1, 2.1, 17),
	n('Cenoura', 'hortaliças', 41, 9.6, 4.7, 0, 0.9, 0.2, 0, 2.8, 69),
	n('Batata inglesa', 'tubérculos', 77, 17, 0.8, 0, 2, 0.1, 0, 2.2, 6),
	n('Batata-doce', 'tubérculos', 86, 20, 4.2, 0, 1.6, 0.1, 0, 3, 55),
	n('Mandioca cozida', 'tubérculos', 125, 30, 1.4, 0, 1, 0.3, 0.1, 1.8, 14),
	n('Abóbora cabotiá', 'hortaliças', 48, 12, 2.5, 0, 1.4, 0.1, 0, 2.5, 1),
	n('Abobrinha', 'hortaliças', 17, 3.1, 2.5, 0, 1.2, 0.3, 0.1, 1, 8),
	n('Berinjela', 'hortaliças', 25, 5.9, 3.5, 0, 1, 0.2, 0, 3, 2),
	n('Brócolis', 'hortaliças', 34, 6.6, 1.7, 0, 2.8, 0.4, 0.1, 2.6, 33),
	n('Couve-flor', 'hortaliças', 25, 5, 1.9, 0, 1.9, 0.3, 0.1, 2, 30),
	n('Couve manteiga', 'hortaliças', 32, 5.4, 0.8, 0, 3, 0.6, 0.1, 4, 38),
	n('Espinafre', 'hortaliças', 23, 3.6, 0.4, 0, 2.9, 0.4, 0.1, 2.2, 79),
	n('Alface', 'hortaliças', 15, 2.9, 0.8, 0, 1.4, 0.2, 0, 1.3, 28),
	n('Rúcula', 'hortaliças', 25, 3.7, 2.1, 0, 2.6, 0.7, 0.1, 1.6, 27),
	n('Pepino', 'hortaliças', 15, 3.6, 1.7, 0, 0.7, 0.1, 0, 0.5, 2),
	n('Pimentão vermelho', 'hortaliças', 31, 6, 4.2, 0, 1, 0.3, 0, 2.1, 4),
	n('Pimentão amarelo', 'hortaliças', 27, 6.3, 0.8, 0, 1, 0.2, 0, 0.9, 2),
	n('Milho verde', 'conservas', 96, 21, 4.5, 0, 3.4, 1.5, 0.2, 2.4, 15),
	n('Ervilha', 'conservas', 81, 14, 5.7, 0, 5.4, 0.4, 0.1, 5.7, 5),
	n('Palmito', 'conservas', 28, 4.6, 0, 0, 2.5, 0.6, 0.1, 2.4, 426),
	n('Champignon', 'cogumelos', 22, 3.3, 2, 0, 3.1, 0.3, 0.1, 1, 5),
	n('Cogumelo paris', 'cogumelos', 22, 3.3, 2, 0, 3.1, 0.3, 0.1, 1, 5),
	n('Maçã verde', 'frutas', 52, 14, 10, 0, 0.3, 0.2, 0, 2.4, 1),
	n('Banana', 'frutas', 89, 23, 12, 0, 1.1, 0.3, 0.1, 2.6, 1),
	n('Morango', 'frutas', 32, 7.7, 4.9, 0, 0.7, 0.3, 0, 2, 1),
	n('Manga', 'frutas', 60, 15, 13.7, 0, 0.8, 0.4, 0.1, 1.6, 1),
	n('Abacate', 'frutas', 160, 8.5, 0.7, 0, 2, 14.7, 2.1, 6.7, 7),
	n('Limão', 'frutas', 29, 9.3, 2.5, 0, 1.1, 0.3, 0, 2.8, 2),
	n('Uva-passa', 'frutas secas', 299, 79, 59, 0, 3.1, 0.5, 0.1, 3.7, 11),
	n('Coco ralado', 'confeitaria', 660, 24, 7, 0, 6.9, 65, 57, 16, 37),
	n('Leite de coco', 'laticínios e similares', 197, 2.8, 1.6, 0, 2, 21, 18, 0, 15),
	n('Chocolate em pó', 'chocolates', 228, 58, 1.8, 0, 19.6, 13.7, 8.1, 37, 21),
	n('Chocolate meio amargo', 'chocolates', 546, 61, 48, 45, 4.9, 31, 19, 7, 24),
	n('Granulado de chocolate', 'confeitaria', 470, 80, 70, 70, 3, 16, 10, 2, 40),
	n('Fermento químico', 'confeitaria', 53, 28, 0, 0, 0, 0, 0, 0, 10600),
	n('Castanha-de-caju', 'oleaginosas', 553, 30, 5.9, 0, 18, 44, 7.8, 3.3, 12),
	n('Amendoim', 'oleaginosas', 567, 16, 4, 0, 26, 49, 6.3, 8.5, 18),
	n('Nozes', 'oleaginosas', 654, 14, 2.6, 0, 15, 65, 6, 6.7, 2),
	n('Linhaça', 'sementes', 534, 29, 1.6, 0, 18, 42, 3.7, 27, 30),
	n('Chia', 'sementes', 486, 42, 0, 0, 17, 31, 3.3, 34, 16),
	n('Maionese', 'molhos', 680, 0.6, 0.6, 0.6, 1, 75, 11, 0, 635),
	n('Mostarda', 'molhos', 66, 5.8, 1.4, 1, 4.4, 4, 0.2, 3.3, 1135),
	n('Ketchup', 'molhos', 112, 26, 22, 18, 1.3, 0.1, 0, 0.3, 907),
	n('Molho shoyu', 'molhos', 53, 4.9, 0.4, 0, 8.1, 0.6, 0.1, 0.8, 5493),
	n('Batata palha', 'acompanhamentos', 540, 52, 1, 0, 6, 35, 10, 4, 500),
	n('Sal', 'temperos', 0, 0, 0, 0, 0, 0, 0, 0, 38758),
	n('Pimenta-do-reino', 'temperos', 251, 64, 0.6, 0, 10, 3.3, 1.4, 25, 20),
	n('Coentro', 'ervas', 23, 3.7, 0.9, 0, 2.1, 0.5, 0, 2.8, 46),
	n('Salsinha', 'ervas', 36, 6.3, 0.9, 0, 3, 0.8, 0.1, 3.3, 56),
	n('Manjericão', 'ervas', 23, 2.7, 0.3, 0, 3.2, 0.6, 0, 1.6, 4),
	n('Louro', 'temperos', 313, 75, 0, 0, 7.6, 8.4, 2.3, 26, 23),
];

const recipes: SeedRecipe[] = [
	r(
		'Moqueca baiana de peixe e camarão',
		'Pratos principais',
		'MOQUECAB.jpg',
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
		true,
	),
	r(
		'Feijoada brasileira completa',
		'Pratos principais',
		'Feijoada à brasileira 3.jpg',
		40,
		150,
		8,
		YieldUnit.PORTIONS,
		DifficultyLevel.HARD,
		['Brasileira', 'Tradicional', 'Almoço'],
		[
			['Feijão preto cozido', 1200],
			['Carne seca dessalgada', 500],
			['Costelinha suína defumada', 500],
			['Linguiça calabresa', 300],
			['Paio', 250],
			['Cebola', 240],
			['Alho', 30],
			['Louro', 2],
		],
		true,
	),
	r(
		'Pão de queijo mineiro',
		'Lanches',
		'Pão de Queijo (Brazilian Cheese Bread).jpg',
		25,
		25,
		24,
		YieldUnit.UNITS,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Mineira', 'Sem glúten', 'Fácil'],
		[
			['Polvilho doce', 300],
			['Polvilho azedo', 200],
			['Leite integral', 250],
			['Óleo', 92],
			['Ovo', 100],
			['Queijo minas curado ralado', 250],
			['Sal', 5],
		],
	),
	r(
		'Brigadeiro tradicional',
		'Sobremesas',
		'BrigadeiroBrazil.jpg',
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
		true,
	),
	r(
		'Strogonoff de frango cremoso',
		'Pratos principais',
		'Chicken stroganoff.jpg',
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
		],
	),
	r(
		'Salpicão de frango tradicional',
		'Saladas',
		'Salpicão de frango.jpg',
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
			['Ervilha', 170],
			['Uva-passa', 80],
			['Maionese', 250],
			['Batata palha', 120],
		],
	),
	r(
		'Bobó de camarão baiano',
		'Pratos principais',
		'Bobó de camarão.jpg',
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
		],
	),
	r(
		'Escondidinho de carne seca',
		'Pratos principais',
		sourceImage('escondidinho carne seca'),
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
		],
	),
	r(
		'Risoto de cogumelos',
		'Pratos principais',
		sourceImage('mushroom risotto'),
		15,
		30,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Vegetariana', 'Italiana', 'Cremosa'],
		[
			['Arroz arbóreo', 320],
			['Cogumelo paris', 300],
			['Cebola', 120],
			['Alho', 10],
			['Manteiga', 40],
			['Parmesão ralado', 80],
			['Azeite de oliva', 20],
		],
	),
	r(
		'Lasanha à bolonhesa',
		'Massas',
		sourceImage('lasagna bolognese'),
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
		],
	),
	r(
		'Espaguete ao molho de tomate e manjericão',
		'Massas',
		sourceImage('spaghetti tomato basil'),
		10,
		20,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Massa', 'Vegetariana', 'Rápida'],
		[
			['Macarrão cozido', 800],
			['Molho de tomate', 500],
			['Tomate', 240],
			['Alho', 12],
			['Azeite de oliva', 25],
			['Manjericão', 15],
			['Parmesão ralado', 40],
		],
	),
	r(
		'Panqueca de carne moída',
		'Pratos principais',
		sourceImage('beef pancake'),
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
		],
	),
	r(
		'Omelete de espinafre e queijo',
		'Café da manhã',
		sourceImage('spinach cheese omelette'),
		8,
		10,
		2,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Rápida', 'Fitness', 'Vegetariana'],
		[
			['Ovo', 200],
			['Espinafre', 80],
			['Queijo minas', 80],
			['Tomate', 100],
			['Cebola', 40],
			['Azeite de oliva', 8],
		],
	),
	r(
		'Tapioca de queijo minas com tomate',
		'Café da manhã',
		sourceImage('tapioca cheese tomato'),
		8,
		8,
		2,
		YieldUnit.UNITS,
		DifficultyLevel.EASY,
		['Brasileira', 'Sem glúten', 'Rápida'],
		[
			['Goma de tapioca', 140],
			['Queijo minas', 120],
			['Tomate', 120],
			['Manjericão', 8],
			['Azeite de oliva', 8],
		],
	),
	r(
		'Bowl fitness de frango e batata-doce',
		'Pratos principais',
		sourceImage('chicken sweet potato bowl'),
		20,
		30,
		2,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Fitness', 'Frango', 'Almoço'],
		[
			['Peito de frango', 350],
			['Batata-doce', 400],
			['Brócolis', 200],
			['Cenoura', 140],
			['Azeite de oliva', 15],
			['Limão', 40],
			['Sal', 3],
		],
	),
	r(
		'Salada tropical com frango',
		'Saladas',
		sourceImage('tropical chicken salad'),
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
		],
	),
	r(
		'Sopa cremosa de abóbora',
		'Caldos e sopas',
		sourceImage('pumpkin soup'),
		15,
		30,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Vegetariana', 'Cremosa'],
		[
			['Abóbora cabotiá', 900],
			['Cebola', 120],
			['Alho', 10],
			['Creme de leite', 120],
			['Azeite de oliva', 15],
			['Salsinha', 10],
			['Sal', 5],
		],
	),
	r(
		'Caldo verde com couve',
		'Caldos e sopas',
		sourceImage('caldo verde soup'),
		15,
		35,
		5,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Tradicional', 'Cremosa'],
		[
			['Batata inglesa', 900],
			['Couve manteiga', 200],
			['Linguiça calabresa', 250],
			['Cebola', 120],
			['Alho', 10],
			['Azeite de oliva', 15],
			['Sal', 5],
		],
	),
	r(
		'Curry vegano de grão-de-bico',
		'Pratos principais',
		sourceImage('chickpea curry'),
		15,
		30,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Vegana', 'Vegetariana', 'Fitness'],
		[
			['Grão-de-bico cozido', 700],
			['Leite de coco', 300],
			['Tomate', 240],
			['Cebola', 160],
			['Alho', 12],
			['Espinafre', 120],
			['Azeite de oliva', 18],
		],
	),
	r(
		'Berinjela à parmegiana',
		'Pratos principais',
		sourceImage('eggplant parmesan'),
		25,
		40,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Vegetariana', 'Forno'],
		[
			['Berinjela', 600],
			['Molho de tomate', 500],
			['Muçarela', 250],
			['Parmesão ralado', 60],
			['Farinha de trigo', 60],
			['Ovo', 100],
			['Azeite de oliva', 20],
		],
	),
	r(
		'Tilápia assada com legumes',
		'Pratos principais',
		sourceImage('baked tilapia vegetables'),
		15,
		25,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Peixe', 'Fitness', 'Almoço'],
		[
			['Filé de tilápia', 650],
			['Abobrinha', 250],
			['Tomate', 240],
			['Cenoura', 160],
			['Cebola', 120],
			['Azeite de oliva', 20],
			['Limão', 50],
			['Sal', 4],
		],
	),
	r(
		'Salmão com crosta de castanha',
		'Pratos principais',
		sourceImage('salmon cashew crust'),
		20,
		25,
		4,
		YieldUnit.PORTIONS,
		DifficultyLevel.MEDIUM,
		['Peixe', 'Fitness'],
		[
			['Salmão', 650],
			['Castanha-de-caju', 100],
			['Limão', 50],
			['Azeite de oliva', 15],
			['Brócolis', 250],
			['Sal', 4],
		],
	),
	r(
		'Cuscuz paulista de atum',
		'Lanches',
		sourceImage('cuscuz paulista tuna'),
		25,
		20,
		8,
		YieldUnit.SLICES,
		DifficultyLevel.MEDIUM,
		['Brasileira', 'Festa'],
		[
			['Farinha de mandioca', 300],
			['Atum em lata escorrido', 240],
			['Milho verde', 170],
			['Ervilha', 170],
			['Molho de tomate', 300],
			['Tomate', 200],
			['Cebola', 120],
			['Azeite de oliva', 25],
		],
	),
	r(
		'Bolo de banana com aveia',
		'Sobremesas',
		sourceImage('banana oat cake'),
		15,
		35,
		10,
		YieldUnit.SLICES,
		DifficultyLevel.EASY,
		['Doce', 'Fitness'],
		[
			['Banana', 500],
			['Aveia em flocos', 250],
			['Ovo', 150],
			['Iogurte natural', 170],
			['Mel', 80],
			['Fermento químico', 12],
			['Canela em pó', 5],
		],
	),
	r(
		'Mousse de chocolate meio amargo',
		'Sobremesas',
		sourceImage('dark chocolate mousse'),
		20,
		5,
		6,
		YieldUnit.PORTIONS,
		DifficultyLevel.EASY,
		['Doce', 'Cremosa'],
		[
			['Chocolate meio amargo', 220],
			['Creme de leite', 300],
			['Ovo', 150],
			['Açúcar', 60],
			['Manteiga', 20],
		],
	),
];

// Extra ingredient used by the banana cake. Kept near the recipe list so it is easy to notice.
ingredients.push(n('Canela em pó', 'temperos', 247, 81, 2.2, 0, 4, 1.2, 0.3, 53, 10));

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
	isFeatured = false,
): SeedRecipe {
	const slug = toSlug(title);
	return {
		title,
		slug,
		category,
		imageUrl: recipeImagesBySlug[slug as keyof typeof recipeImagesBySlug] ?? image,
		prepTime,
		cookTime,
		yieldAmount,
		yieldUnit,
		difficulty,
		tags,
		isFeatured,
		description: buildDescription(title, tags),
		ingredients: ingredientPairs.map(([name, grams, text]) => ({
			name,
			grams,
			text: text ?? formatIngredientText(name, grams),
		})),
		steps: buildSteps(title, prepTime + cookTime),
	};
}

async function main() {
	const calculator = new NutritionCalculatorService(prisma as unknown as PrismaClient);
	const author = await seedAuthor();
	const categoryByName = await seedCategories();
	const tagByName = await seedTags();
	const ingredientByName = await seedIngredients();

	for (const recipe of recipes) {
		const categoryId = requireMapValue(categoryByName, recipe.category, 'Categoria');
		const tagIds = recipe.tags.map((tag) => requireMapValue(tagByName, tag, 'Tag'));
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
			sections: [
				{
					title: 'Ingredientes e preparo',
					position: 1,
					ingredients: recipe.ingredients.map((ingredient, index) => ({
						ingredientId: requireMapValue(ingredientByName, ingredient.name, 'Ingrediente'),
						displayText: ingredient.text ?? formatIngredientText(ingredient.name, ingredient.grams),
						quantity: formatQuantity(ingredient.grams),
						quantityInGrams: ingredient.grams,
						unit: ingredient.unit ?? MeasurementUnit.G,
						notes: ingredient.notes,
						position: index + 1,
					})),
					steps: recipe.steps.map((step, index) => ({
						description: step.description,
						position: index + 1,
						stepTime: step.stepTime,
					})),
				},
			],
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
	return [
		{
			title: 'Ingredientes e preparo',
			position: 1,
			ingredients: {
				create: recipe.ingredients.map((ingredient, index) => ({
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
				create: recipe.steps.map((step, index) => ({
					description: step.description,
					position: index + 1,
					stepTime: step.stepTime,
				})),
			},
		},
	];
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
		ingredientImagesByCategory.hortaliças
	);
}

function buildDescription(title: string, recipeTags: string[]) {
	const tagText = recipeTags.slice(0, 3).join(', ').toLowerCase();
	return `${title} preparado com ingredientes conhecidos e medidas em gramas para gerar tabela nutricional aproximada. Receita ${tagText}, pensada para testar a experiência completa do Cheffy.`;
}

function buildSteps(title: string, totalTime: number): SeedStep[] {
	const descriptions = [
		'Separe e pese todos os ingredientes antes de começar.',
		'Prepare a base da receita em fogo médio, refogando ou misturando os ingredientes principais conforme o tipo de prato.',
		'Cozinhe até atingir textura, ponto e aroma característicos, ajustando sal e temperos aos poucos.',
		`Finalize e sirva ${title.toLowerCase()} ainda no melhor ponto de consumo.`,
	];
	const stepTimes = distributeStepTimes(totalTime, descriptions.length);
	return descriptions.map((description, index) => ({
		description,
		stepTime: stepTimes[index] ?? 1,
	}));
}

function distributeStepTimes(totalTime: number, stepCount: number) {
	const weights = [0.12, 0.34, 0.46, 0.08];
	const baseTimes = weights
		.slice(0, stepCount)
		.map((weight) => Math.max(1, Math.floor(totalTime * weight)));
	let remaining = totalTime - baseTimes.reduce((sum, time) => sum + time, 0);
	let index = 0;
	while (remaining > 0) {
		baseTimes[index % baseTimes.length]++;
		remaining--;
		index++;
	}
	while (remaining < 0) {
		const currentIndex = baseTimes.length - 1 - (index % baseTimes.length);
		if (baseTimes[currentIndex] > 1) {
			baseTimes[currentIndex]--;
			remaining++;
		}
		index++;
	}
	return baseTimes;
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

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
