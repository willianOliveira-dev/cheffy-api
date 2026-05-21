import type { OpenAPIHono } from '@hono/zod-openapi';
import { authRoutes } from './auth/routes/auth.routes.js';
import { categoriesRoutes } from './categories/routes/categories.routes.js';
import { ingredientsRoutes } from './ingredients/routes/ingredients.routes.js';
import { recipesRoutes } from './recipes/routes/recipes.routes.js';
import { swaggerRoutes } from './swagger/routes/swagger.routes.js';

export function registerRoutes(app: OpenAPIHono) {
	const basePath = '/api/v1';

	app.route('/', authRoutes);
	app.route(basePath, recipesRoutes);
	app.route(basePath, ingredientsRoutes);
	app.route(basePath, categoriesRoutes);

	swaggerRoutes(app);
}
