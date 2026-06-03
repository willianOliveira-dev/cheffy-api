ALTER TABLE "recipe_nutrition_labels"
ADD COLUMN "totalEnergyKcal" DOUBLE PRECISION;

UPDATE "recipe_nutrition_labels"
SET "totalEnergyKcal" = "energyKcalPerServing" * COALESCE(NULLIF("servingsPerRecipe", 0), 1);

ALTER TABLE "recipe_nutrition_labels"
ALTER COLUMN "totalEnergyKcal" SET NOT NULL;
