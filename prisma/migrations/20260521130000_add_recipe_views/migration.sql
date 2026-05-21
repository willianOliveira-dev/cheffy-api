CREATE TABLE "recipe_views" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recipeId" TEXT NOT NULL,
    "userId" TEXT,
    "visitorId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "recipe_views_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "recipe_views_recipeId_createdAt_idx" ON "recipe_views"("recipeId", "createdAt");
CREATE INDEX "recipe_views_userId_createdAt_idx" ON "recipe_views"("userId", "createdAt");
CREATE INDEX "recipe_views_visitorId_createdAt_idx" ON "recipe_views"("visitorId", "createdAt");

ALTER TABLE "recipe_views" ADD CONSTRAINT "recipe_views_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "recipe_views" ADD CONSTRAINT "recipe_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
