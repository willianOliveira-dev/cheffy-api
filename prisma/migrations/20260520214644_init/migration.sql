-- CreateEnum
CREATE TYPE "recipe_ai_insight_type" AS ENUM ('LIGHTER_VERSION', 'HIGH_PROTEIN', 'LOW_CALORIE', 'INGREDIENT_SWAP', 'GENERAL_TIPS', 'NUTRITION_EXPLANATION');

-- CreateEnum
CREATE TYPE "difficulty_level" AS ENUM ('EASY', 'MEDIUM', 'HARD', 'EXPERT');

-- CreateEnum
CREATE TYPE "yield_unit" AS ENUM ('PORTIONS', 'PEOPLE', 'UNITS', 'SLICES', 'PIECES', 'CUPS', 'GLASSES', 'PLATES', 'TO_TASTE');

-- CreateEnum
CREATE TYPE "measurement_unit" AS ENUM ('G', 'KG', 'MG', 'OZ', 'LB', 'ML', 'L', 'CUP', 'TBSP', 'TSP', 'UNIT', 'DOZEN', 'PINCH', 'DRIZZLE', 'CUBE', 'PACKAGE', 'CAN', 'BOTTLE', 'BOX', 'TO_TASTE', 'CLOVE', 'BUNCH', 'GLASS', 'LEAF', 'POT');

-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(65) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(250),
    "iconKey" VARCHAR(30) NOT NULL DEFAULT 'utensils',
    "imageUrl" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "slug" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" VARCHAR(50),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredient_nutritions" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "energyKcalPer100g" DOUBLE PRECISION NOT NULL,
    "carbohydratesPer100g" DOUBLE PRECISION NOT NULL,
    "totalSugarsPer100g" DOUBLE PRECISION,
    "addedSugarsPer100g" DOUBLE PRECISION,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "totalFatPer100g" DOUBLE PRECISION NOT NULL,
    "saturatedFatPer100g" DOUBLE PRECISION,
    "transFatPer100g" DOUBLE PRECISION,
    "fiberPer100g" DOUBLE PRECISION,
    "sodiumMgPer100g" DOUBLE PRECISION,
    "source" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ingredient_nutritions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipes" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "slug" TEXT NOT NULL,
    "description" VARCHAR(500) NOT NULL,
    "imageUrl" TEXT,
    "prepTime" INTEGER NOT NULL,
    "cookTime" INTEGER NOT NULL,
    "totalTime" INTEGER NOT NULL DEFAULT 0,
    "yieldAmount" INTEGER NOT NULL,
    "yieldUnit" "yield_unit" NOT NULL DEFAULT 'PORTIONS',
    "difficulty" "difficulty_level" NOT NULL DEFAULT 'MEDIUM',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "totalFavorites" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_nutrition_labels" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "totalWeightInGrams" DOUBLE PRECISION NOT NULL,
    "servingWeightInGrams" DOUBLE PRECISION NOT NULL,
    "servingsPerRecipe" INTEGER,
    "energyKcalPer100g" DOUBLE PRECISION NOT NULL,
    "carbohydratesPer100g" DOUBLE PRECISION NOT NULL,
    "totalSugarsPer100g" DOUBLE PRECISION,
    "addedSugarsPer100g" DOUBLE PRECISION,
    "proteinPer100g" DOUBLE PRECISION NOT NULL,
    "totalFatPer100g" DOUBLE PRECISION NOT NULL,
    "saturatedFatPer100g" DOUBLE PRECISION,
    "transFatPer100g" DOUBLE PRECISION,
    "fiberPer100g" DOUBLE PRECISION,
    "sodiumMgPer100g" DOUBLE PRECISION,
    "energyKcalPerServing" DOUBLE PRECISION NOT NULL,
    "carbohydratesPerServing" DOUBLE PRECISION NOT NULL,
    "totalSugarsPerServing" DOUBLE PRECISION,
    "addedSugarsPerServing" DOUBLE PRECISION,
    "proteinPerServing" DOUBLE PRECISION NOT NULL,
    "totalFatPerServing" DOUBLE PRECISION NOT NULL,
    "saturatedFatPerServing" DOUBLE PRECISION,
    "transFatPerServing" DOUBLE PRECISION,
    "fiberPerServing" DOUBLE PRECISION,
    "sodiumMgPerServing" DOUBLE PRECISION,
    "energyKcalDailyValuePercent" DOUBLE PRECISION,
    "carbohydratesDailyValuePercent" DOUBLE PRECISION,
    "addedSugarsDailyValuePercent" DOUBLE PRECISION,
    "proteinDailyValuePercent" DOUBLE PRECISION,
    "totalFatDailyValuePercent" DOUBLE PRECISION,
    "saturatedFatDailyValuePercent" DOUBLE PRECISION,
    "fiberDailyValuePercent" DOUBLE PRECISION,
    "sodiumDailyValuePercent" DOUBLE PRECISION,
    "isApproximate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_nutrition_labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_sections" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "recipe_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_section_ingredients" (
    "id" TEXT NOT NULL,
    "displayText" VARCHAR(250) NOT NULL,
    "quantity" VARCHAR(50),
    "quantityInGrams" DOUBLE PRECISION NOT NULL,
    "unit" "measurement_unit" NOT NULL DEFAULT 'UNIT',
    "notes" VARCHAR(250),
    "position" INTEGER NOT NULL DEFAULT 0,
    "sectionId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "recipe_section_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_ai_insights" (
    "id" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,
    "type" "recipe_ai_insight_type" NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "suggestions" JSONB,
    "warnings" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recipe_ai_insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preparation_steps" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "stepTime" INTEGER,
    "mediaUrl" TEXT,
    "sectionId" TEXT NOT NULL,

    CONSTRAINT "preparation_steps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recipe_tags" (
    "recipeId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "recipe_tags_pkey" PRIMARY KEY ("recipeId","tagId")
);

-- CreateTable
CREATE TABLE "favorites" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "session_token_key" ON "session"("token");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_slug_key" ON "ingredients"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ingredient_nutritions_ingredientId_key" ON "ingredient_nutritions"("ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "recipes_slug_key" ON "recipes"("slug");

-- CreateIndex
CREATE INDEX "recipes_slug_idx" ON "recipes"("slug");

-- CreateIndex
CREATE INDEX "recipes_isPublished_createdAt_idx" ON "recipes"("isPublished", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "recipes_authorId_idx" ON "recipes"("authorId");

-- CreateIndex
CREATE INDEX "recipes_categoryId_idx" ON "recipes"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "recipe_nutrition_labels_recipeId_key" ON "recipe_nutrition_labels"("recipeId");

-- CreateIndex
CREATE INDEX "recipe_section_ingredients_sectionId_idx" ON "recipe_section_ingredients"("sectionId");

-- CreateIndex
CREATE INDEX "recipe_section_ingredients_ingredientId_idx" ON "recipe_section_ingredients"("ingredientId");

-- CreateIndex
CREATE INDEX "recipe_ai_insights_recipeId_idx" ON "recipe_ai_insights"("recipeId");

-- CreateIndex
CREATE INDEX "preparation_steps_sectionId_idx" ON "preparation_steps"("sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_slug_key" ON "tags"("slug");

-- CreateIndex
CREATE INDEX "favorites_userId_idx" ON "favorites"("userId");

-- CreateIndex
CREATE INDEX "favorites_recipeId_idx" ON "favorites"("recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "favorites_userId_recipeId_key" ON "favorites"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "session" ADD CONSTRAINT "session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ingredient_nutritions" ADD CONSTRAINT "ingredient_nutritions_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipes" ADD CONSTRAINT "recipes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_nutrition_labels" ADD CONSTRAINT "recipe_nutrition_labels_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_sections" ADD CONSTRAINT "recipe_sections_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_section_ingredients" ADD CONSTRAINT "recipe_section_ingredients_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "recipe_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_section_ingredients" ADD CONSTRAINT "recipe_section_ingredients_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_ai_insights" ADD CONSTRAINT "recipe_ai_insights_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "preparation_steps" ADD CONSTRAINT "preparation_steps_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "recipe_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
