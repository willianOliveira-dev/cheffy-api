import { z } from "zod";
import { DifficultyLevel } from "@prisma/client";

export const findAllRecipesDtoSchema = z.object({
  categoryId: z.string().uuid("ID de categoria inválido").optional(),
  tagId: z.string().uuid("ID de tag inválido").optional(),
  search: z.string().optional(),
  difficulty: z.nativeEnum(DifficultyLevel).optional(),
  maxTotalTime: z.coerce.number().int().positive().optional(),
  orderBy: z.enum(["newest", "oldest"]).default("newest"),
});

export type FindAllRecipesDto = z.infer<typeof findAllRecipesDtoSchema>;
