ALTER TABLE "recipe_nutrition_labels"
ADD COLUMN "servingUnit" VARCHAR(40),
ADD COLUMN "servingUnitPlural" VARCHAR(40),
ADD COLUMN "servingDescription" VARCHAR(100),
ADD COLUMN "servingsDescription" VARCHAR(100);
