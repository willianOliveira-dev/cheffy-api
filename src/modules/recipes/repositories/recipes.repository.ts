import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma.js';
import { BadRequestError } from '@/shared/errors/app.error.js';
import { generateUniqueSlug } from '@/shared/utils/slug.util.js';
import type { CreateRecipeDto } from '../schemas/dtos/create-recipe.dto.js';
import {
	type FindAllRecipesDto,
	findAllRecipesDtoSchema,
} from '../schemas/dtos/find-all-recipes.dto.js';
import {
	type FindMyRecipesDto,
	findMyRecipesDtoSchema,
} from '../schemas/dtos/find-my-recipes.dto.js';
import type { UpdateRecipeDto } from '../schemas/dtos/update-recipe.dto.js';

export type RecipeViewContext = {
	userId?: string;
	visitorId?: string;
	ipHash?: string;
	userAgent?: string;
};

const RECIPE_VIEW_INTERVAL_IN_MS = 24 * 60 * 60 * 1000;

const recipeDetailInclude = Prisma.validator<Prisma.RecipeInclude>()({
	sections: {
		include: {
			ingredients: {
				include: { ingredient: true },
			},
			steps: true,
		},
	},
	author: { select: { id: true, name: true } },
	category: true,
	tags: { include: { tag: true } },
	nutritionLabel: true,
});

const recipeSummaryInclude = Prisma.validator<Prisma.RecipeInclude>()({
	author: { select: { id: true, name: true } },
	category: { select: { id: true, name: true, slug: true } },
	tags: { include: { tag: { select: { name: true, slug: true } } } },
});

export class RecipesRepository {
	async create(
		dto: CreateRecipeDto,
		authorId: string,
		nutritionData: Prisma.RecipeNutritionLabelCreateWithoutRecipeInput | null = null,
	) {
		const slug = await generateUniqueSlug(prisma.recipe, dto.title);

		return await prisma.recipe.create({
			data: {
				title: dto.title,
				slug,
				description: dto.description,
				imageUrl: dto.imageUrl ?? null,
				imagePublicId: dto.imagePublicId ?? null,
				prepTime: dto.prepTime,
				cookTime: dto.cookTime,
				totalTime: dto.prepTime + dto.cookTime,
				yieldAmount: dto.yieldAmount,
				yieldUnit: dto.yieldUnit,
				difficulty: dto.difficulty,
				isPublished: false,
				isFeatured: false,
				views: 0,
				totalFavorites: 0,
				authorId,
				categoryId: dto.categoryId,
				sections: {
					create: dto.sections.map((section) => ({
						title: section.title,
						position: section.position,
						ingredients: {
							create: section.ingredients.map((ing) => ({
								displayText: ing.displayText,
								quantity: ing.quantity ?? null,
								quantityInGrams: ing.quantityInGrams,
								unit: ing.unit,
								notes: ing.notes ?? null,
								position: ing.position,
								ingredient: {
									connect: { id: ing.ingredientId },
								},
							})),
						},

						steps: {
							create: section.steps.map((step) => ({
								description: step.description,
								position: step.position,
								imageUrl: step.imageUrl ?? null,
								imagePublicId: step.imagePublicId ?? null,
							})),
						},
					})),
				},

				...(dto.tagIds?.length
					? {
							tags: {
								create: dto.tagIds.map((tagId) => ({
									tag: { connect: { id: tagId } },
								})),
							},
						}
					: {}),

				...(nutritionData
					? {
							nutritionLabel: {
								create: nutritionData,
							},
						}
					: {}),
			},
		});
	}
	async findById(id: string, viewContext?: RecipeViewContext) {
		const recipe = await prisma.recipe.findFirst({
			where: { id, deletedAt: null, isPublished: true },
			include: recipeDetailInclude,
		});

		if (!recipe) return null;

		const [isFavorited, updatedViews] = await Promise.all([
			this.isFavorited(recipe.id, viewContext?.userId),
			this.registerView(recipe.id, viewContext),
		]);

		return { ...recipe, views: updatedViews ?? recipe.views, isFavorited };
	}

	async findBySlug(slug: string, viewContext?: RecipeViewContext) {
		const recipe = await prisma.recipe.findFirst({
			where: { slug, deletedAt: null, isPublished: true },
			include: recipeDetailInclude,
		});

		if (!recipe) return null;

		const [isFavorited, updatedViews] = await Promise.all([
			this.isFavorited(recipe.id, viewContext?.userId),
			this.registerView(recipe.id, viewContext),
		]);

		return { ...recipe, views: updatedViews ?? recipe.views, isFavorited };
	}

	async findByIdForAuthor(id: string, authorId: string) {
		const recipe = await prisma.recipe.findFirst({
			where: { id, authorId, deletedAt: null },
			include: recipeDetailInclude,
		});

		if (!recipe) return null;

		const isFavorited = await this.isFavorited(recipe.id, authorId);

		return { ...recipe, isFavorited };
	}

	async findAll(options: FindAllRecipesDto, userId?: string) {
		const parseResult = findAllRecipesDtoSchema.safeParse(options);

		if (!parseResult.success) {
			throw new BadRequestError(parseResult.error.message);
		}

		const opts = parseResult.data;

		const where: Prisma.RecipeWhereInput = {
			deletedAt: null,
			isPublished: true,
		};

		if (opts.categoryId) {
			where.categoryId = opts.categoryId;
		}

		if (opts.tagId) {
			where.tags = {
				some: { tagId: opts.tagId },
			};
		}

		if (opts.difficulty) {
			where.difficulty = opts.difficulty;
		}

		if (opts.maxTotalTime) {
			where.totalTime = { lte: opts.maxTotalTime };
		}

		if (opts.search) {
			where.OR = [
				{ title: { contains: opts.search, mode: 'insensitive' } },
				{ description: { contains: opts.search, mode: 'insensitive' } },
			];
		}

		let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: 'desc' };

		if (opts.orderBy === 'oldest') {
			orderBy = { createdAt: 'asc' };
		}

		const skip = (opts.page - 1) * opts.limit;

		const [recipes, total] = await Promise.all([
			prisma.recipe.findMany({
				where,
				orderBy,
				skip,
				take: opts.limit,
				include: recipeSummaryInclude,
			}),
			prisma.recipe.count({ where }),
		]);

		if (!userId || recipes.length === 0) {
			return { items: recipes, total };
		}

		const favorites = await prisma.favorite.findMany({
			where: {
				userId,
				recipeId: { in: recipes.map((r) => r.id) },
			},
			select: { recipeId: true },
		});

		const favoritedIds = new Set(favorites.map((f) => f.recipeId));

		return {
			items: recipes.map((recipe) => ({
				...recipe,
				isFavorited: favoritedIds.has(recipe.id),
			})),
			total,
		};
	}

	async findAllByAuthor(authorId: string, options: FindMyRecipesDto) {
		const parseResult = findMyRecipesDtoSchema.safeParse(options);

		if (!parseResult.success) {
			throw new BadRequestError(parseResult.error.message);
		}

		const opts = parseResult.data;
		const where: Prisma.RecipeWhereInput = {
			authorId,
			deletedAt: null,
		};

		if (opts.isPublished !== undefined) {
			where.isPublished = opts.isPublished === 'true';
		}

		if (opts.search) {
			where.OR = [
				{ title: { contains: opts.search, mode: 'insensitive' } },
				{ description: { contains: opts.search, mode: 'insensitive' } },
			];
		}

		const skip = (opts.page - 1) * opts.limit;
		const orderBy: Prisma.RecipeOrderByWithRelationInput =
			opts.orderBy === 'oldest' ? { createdAt: 'asc' } : { createdAt: 'desc' };

		const [recipes, total] = await Promise.all([
			prisma.recipe.findMany({
				where,
				orderBy,
				skip,
				take: opts.limit,
				include: recipeSummaryInclude,
			}),
			prisma.recipe.count({ where }),
		]);

		if (recipes.length === 0) {
			return { items: recipes, total };
		}

		const favorites = await prisma.favorite.findMany({
			where: {
				userId: authorId,
				recipeId: { in: recipes.map((recipe) => recipe.id) },
			},
			select: { recipeId: true },
		});

		const favoritedIds = new Set(favorites.map((favorite) => favorite.recipeId));

		return {
			items: recipes.map((recipe) => ({
				...recipe,
				isFavorited: favoritedIds.has(recipe.id),
			})),
			total,
		};
	}

	async update(
		id: string,
		data: UpdateRecipeDto,
		nutritionData?: Prisma.RecipeNutritionLabelCreateWithoutRecipeInput | null,
	) {
		const { tagIds, sections, prepTime, cookTime, ...scalarFields } = data;

		const totalTime =
			prepTime !== undefined && cookTime !== undefined ? prepTime + cookTime : undefined;

		const prismaData: Prisma.RecipeUpdateInput = {
			...this.buildScalarUpdate(scalarFields),
			...(prepTime !== undefined && { prepTime }),
			...(cookTime !== undefined && { cookTime }),
			...(totalTime !== undefined && { totalTime }),
			...this.buildTagsUpdate(tagIds),
			...this.buildSectionsUpdate(sections),
			...(nutritionData
				? {
						nutritionLabel: {
							upsert: {
								create: nutritionData,
								update: nutritionData,
							},
						},
					}
				: {}),
		};

		return await prisma.recipe.update({
			where: { id },
			data: prismaData,
		});
	}

	async delete(id: string) {
		return await prisma.recipe.update({
			where: { id },
			data: {
				deletedAt: new Date(),
				imageUrl: null,
				imagePublicId: null,
			},
		});
	}

	async favorite(recipeId: string, userId: string) {
		return await prisma.$transaction(async (tx) => {
			const recipe = await tx.recipe.findFirst({
				where: { id: recipeId, deletedAt: null, isPublished: true },
				select: { id: true },
			});

			if (!recipe) {
				return null;
			}

			const existingFavorite = await tx.favorite.findUnique({
				where: { userId_recipeId: { userId, recipeId } },
				select: { id: true },
			});

			if (!existingFavorite) {
				await tx.favorite.create({
					data: { userId, recipeId },
				});
			}

			const totalFavorites = await tx.favorite.count({
				where: { recipeId },
			});

			return await tx.recipe.update({
				where: { id: recipeId },
				data: { totalFavorites },
				include: recipeDetailInclude,
			});
		});
	}

	async unfavorite(recipeId: string, userId: string) {
		return await prisma.$transaction(async (tx) => {
			const recipe = await tx.recipe.findFirst({
				where: { id: recipeId, deletedAt: null, isPublished: true },
				select: { id: true },
			});

			if (!recipe) {
				return null;
			}

			const existingFavorite = await tx.favorite.findUnique({
				where: { userId_recipeId: { userId, recipeId } },
				select: { id: true },
			});

			if (existingFavorite) {
				await tx.favorite.delete({
					where: { userId_recipeId: { userId, recipeId } },
				});
			}

			const totalFavorites = await tx.favorite.count({
				where: { recipeId },
			});

			return await tx.recipe.update({
				where: { id: recipeId },
				data: { totalFavorites },
				include: recipeDetailInclude,
			});
		});
	}

	private async isFavorited(recipeId: string, userId?: string): Promise<boolean> {
		if (!userId) return false;

		const favorite = await prisma.favorite.findUnique({
			where: {
				userId_recipeId: {
					userId,
					recipeId,
				},
			},
			select: { id: true },
		});

		return Boolean(favorite);
	}

	private async registerView(
		recipeId: string,
		viewContext?: RecipeViewContext,
	): Promise<number | null> {
		if (!viewContext?.userId && !viewContext?.visitorId) return null;

		const viewedAfter = new Date(Date.now() - RECIPE_VIEW_INTERVAL_IN_MS);
		const identityWhere: Prisma.RecipeViewWhereInput = viewContext.userId
			? { userId: viewContext.userId }
			: { visitorId: viewContext.visitorId as string };

		return await prisma.$transaction(async (tx) => {
			const existingView = await tx.recipeView.findFirst({
				where: {
					recipeId,
					createdAt: { gte: viewedAfter },
					...identityWhere,
				},
				select: { id: true },
			});

			if (existingView) {
				return null;
			}

			await tx.recipeView.create({
				data: {
					recipeId,
					...(viewContext.userId ? { userId: viewContext.userId } : {}),
					...(!viewContext.userId && viewContext.visitorId
						? { visitorId: viewContext.visitorId }
						: {}),
					...(viewContext.ipHash ? { ipHash: viewContext.ipHash } : {}),
					...(viewContext.userAgent ? { userAgent: viewContext.userAgent } : {}),
				},
			});

			const views = await tx.recipeView.count({
				where: { recipeId },
			});

			await tx.recipe.update({
				where: { id: recipeId },
				data: { views },
			});

			return views;
		});
	}

	private buildScalarUpdate(
		fields: Omit<UpdateRecipeDto, 'tagIds' | 'sections' | 'prepTime' | 'cookTime'>,
	): Prisma.RecipeUpdateInput {
		const result: Prisma.RecipeUpdateInput = {};
		if (fields.title !== undefined) result.title = fields.title;
		if (fields.description !== undefined) result.description = fields.description;
		if (fields.imageUrl !== undefined) result.imageUrl = fields.imageUrl;
		if (fields.imagePublicId !== undefined) result.imagePublicId = fields.imagePublicId;
		if (fields.yieldAmount !== undefined) result.yieldAmount = fields.yieldAmount;
		if (fields.yieldUnit !== undefined) result.yieldUnit = fields.yieldUnit;
		if (fields.difficulty !== undefined) result.difficulty = fields.difficulty;
		if (fields.categoryId !== undefined) result.category = { connect: { id: fields.categoryId } };
		return result;
	}

	private buildTagsUpdate(tagIds: UpdateRecipeDto['tagIds']): Prisma.RecipeUpdateInput {
		if (!tagIds) return {};
		return {
			tags: {
				deleteMany: {},
				create: tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })),
			},
		};
	}

	private buildSectionsUpdate(sections: UpdateRecipeDto['sections']): Prisma.RecipeUpdateInput {
		if (!sections) return {};
		return {
			sections: {
				deleteMany: {},
				create: sections.map((section) => ({
					title: section.title,
					position: section.position,
					ingredients: {
						create: section.ingredients.map((ing) => ({
							displayText: ing.displayText,
							quantity: ing.quantity ?? null,
							quantityInGrams: ing.quantityInGrams,
							unit: ing.unit,
							notes: ing.notes ?? null,
							position: ing.position,
							ingredient: { connect: { id: ing.ingredientId } },
						})),
					},
					steps: {
						create: section.steps.map((step) => ({
							description: step.description,
							position: step.position,
							imageUrl: step.imageUrl ?? null,
							imagePublicId: step.imagePublicId ?? null,
						})),
					},
				})),
			},
		};
	}
}
