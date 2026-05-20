import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma.js"
import { type CreateRecipeDto } from "../schemas/dtos/create-recipe.dto.js";
import { generateUniqueSlug } from "@/shared/utils/slug.util.js";
import { type FindAllRecipesDto, findAllRecipesDtoSchema } from "../schemas/dtos/find-all-recipes.dto.js";
import { type UpdateRecipeDto } from "../schemas/dtos/update-recipe.dto.js";
import { BadRequestError } from "@/shared/errors/app.error.js";

export class RecipesRepository {
    async create(dto: CreateRecipeDto, authorId: string, nutritionData: Prisma.RecipeNutritionLabelCreateWithoutRecipeInput | null = null) {
        const slug = await generateUniqueSlug(prisma.recipe, dto.title);
        
        return await prisma.recipe.create({
            data: {
                title: dto.title,
                slug,
                description: dto.description,
                prepTime: dto.prepTime,
                cookTime: dto.cookTime,
                totalTime: dto.prepTime + dto.cookTime,
                yieldAmount: dto.yieldAmount,
                yieldUnit: dto.yieldUnit,
                difficulty: dto.difficulty,
                authorId,
                categoryId: dto.categoryId,
                sections: {
                    create: dto.sections.map(section => ({
                        title: section.title,
                        position: section.position,
                        ingredients: {
                            create: section.ingredients.map(ing => ({
                                displayText: ing.displayText,
                                quantity: ing.quantity ?? null,
                                quantityInGrams: ing.quantityInGrams,
                                unit: ing.unit,
                                notes: ing.notes ?? null,
                                position: ing.position,
                                ingredient: {
                                    connect: { id: ing.ingredientId }
                                }
                            }))
                        },
                        
                        steps: {
                            create: section.steps.map(step => ({
                                description: step.description,
                                position: step.position,
                                stepTime: step.stepTime ?? null,
                                mediaUrl: step.mediaUrl ?? null,
                            }))
                        }
                    }))
                },

                ...(dto.tagIds?.length ? {
                    tags: {
                        create: dto.tagIds.map(tagId => ({
                            tag: { connect: { id: tagId } }
                        }))
                    }
                } : {}),
                
                ...(nutritionData ? {
                    nutritionLabel: {
                        create: nutritionData
                    }
                } : {})
            }
        });
    }
    async findById(id: string) {
        return await prisma.recipe.findUnique({
            where: { id },
            include: {
                sections: {
                    include: {
                        ingredients: {
                            include: { ingredient: true }
                        },
                        steps: true
                    }
                },
                author: { select: { id: true, name: true } },
                category: true,
                tags: { include: { tag: true } },
                nutritionLabel: true
            }
        });
    }

    async findBySlug(slug: string) {
        return await prisma.recipe.findUnique({
            where: { slug },
            include: {
                sections: {
                    include: {
                        ingredients: {
                            include: { ingredient: true }
                        },
                        steps: true
                    }
                },
                author: { select: { id: true, name: true } },
                category: true,
                tags: { include: { tag: true } },
                nutritionLabel: true
            }
        });
    }

    async findAll(options: FindAllRecipesDto) {

        const parseResult = findAllRecipesDtoSchema.safeParse(options);

        if (!parseResult.success) {
            throw new BadRequestError(parseResult.error.message);
        }
        
        const opts = parseResult.data;

        const where: Prisma.RecipeWhereInput = {
            deletedAt: null,
        };

        if (opts.categoryId) {
            where.categoryId = opts.categoryId;
        }

        if (opts.tagId) {
            where.tags = {
                some: { tagId: opts.tagId }
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
                { title: { contains: opts.search, mode: "insensitive" } },
                { description: { contains: opts.search, mode: "insensitive" } },
            ];
        }

        let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: "desc" };
        
        if (opts.orderBy === "oldest") {
            orderBy = { createdAt: "asc" };
        }

        return await prisma.recipe.findMany({
            where,
            orderBy,
            include: {
                author: { select: { id: true, name: true } },
                category: { select: { id: true, name: true, slug: true } },
                tags: { include: { tag: { select: { name: true, slug: true } } } }
            }
        });
    }

    async update(id: string, data: UpdateRecipeDto, nutritionData?: Prisma.RecipeNutritionLabelCreateWithoutRecipeInput | null) {
        const { tagIds, sections, prepTime, cookTime, ...scalarFields } = data;

        const totalTime =
            prepTime !== undefined && cookTime !== undefined
                ? prepTime + cookTime
                : undefined;

        const prismaData: Prisma.RecipeUpdateInput = {
            ...this.buildScalarUpdate(scalarFields),
            ...(prepTime !== undefined && { prepTime }),
            ...(cookTime !== undefined && { cookTime }),
            ...(totalTime !== undefined && { totalTime }),
            ...this.buildTagsUpdate(tagIds),
            ...this.buildSectionsUpdate(sections),
            ...(nutritionData ? {
                nutritionLabel: {
                    upsert: {
                        create: nutritionData,
                        update: nutritionData
                    }
                }
            } : {})
        };

        return await prisma.recipe.update({
            where: { id },
            data: prismaData,
        });
    }

    async delete(id: string) {
        return await prisma.recipe.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }

    private buildScalarUpdate(
        fields: Omit<UpdateRecipeDto, "tagIds" | "sections" | "prepTime" | "cookTime">,
    ): Prisma.RecipeUpdateInput {
        const result: Prisma.RecipeUpdateInput = {};
        if (fields.title !== undefined) result.title = fields.title;
        if (fields.description !== undefined) result.description = fields.description;
        if (fields.yieldAmount !== undefined) result.yieldAmount = fields.yieldAmount;
        if (fields.yieldUnit !== undefined) result.yieldUnit = fields.yieldUnit;
        if (fields.difficulty !== undefined) result.difficulty = fields.difficulty;
        if (fields.categoryId !== undefined) result.category = { connect: { id: fields.categoryId } };
        return result;
    }

    private buildTagsUpdate(
        tagIds: UpdateRecipeDto["tagIds"],
    ): Prisma.RecipeUpdateInput {
        if (!tagIds) return {};
        return {
            tags: {
                deleteMany: {},
                create: tagIds.map(tagId => ({ tag: { connect: { id: tagId } } })),
            },
        };
    }

    private buildSectionsUpdate(
        sections: UpdateRecipeDto["sections"],
    ): Prisma.RecipeUpdateInput {
        if (!sections) return {};
        return {
            sections: {
                deleteMany: {},
                create: sections.map(section => ({
                    title: section.title,
                    position: section.position,
                    ingredients: {
                        create: section.ingredients.map(ing => ({
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
                        create: section.steps.map(step => ({
                            description: step.description,
                            position: step.position,
                            stepTime: step.stepTime ?? null,
                            mediaUrl: step.mediaUrl ?? null,
                        })),
                    },
                })),
            },
        };
    }
}