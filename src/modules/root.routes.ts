import type { OpenAPIHono } from '@hono/zod-openapi';
import { aiRoutes } from './ai/routes/ai.routes.js';
import { authRoutes } from './auth/routes/auth.routes.js';
import { categoriesRoutes } from './categories/routes/categories.routes.js';
import { homeRoutes } from './home/routes/home.routes.js';
import { ingredientsRoutes } from './ingredients/routes/ingredients.routes.js';
import { recipesRoutes } from './recipes/routes/recipes.routes.js';
import { storageRoutes } from './storage/routes/storage.routes.js';
import { swaggerRoutes } from './swagger/routes/swagger.routes.js';
import { tagsRoutes } from './tags/routes/tags.routes.js';
import { usersRoutes } from './users/routes/users.routes.js';

export function registerRoutes(app: OpenAPIHono) {
	const basePath = '/api/v1';

	app.route('/', authRoutes);
	app.route(basePath, homeRoutes);
	app.route(basePath, recipesRoutes);
	app.route(basePath, ingredientsRoutes);
	app.route(basePath, categoriesRoutes);
	app.route(basePath, tagsRoutes);
	app.route(basePath, storageRoutes);
	app.route(basePath, usersRoutes);
	app.route(basePath, aiRoutes);

	swaggerRoutes(app);
}
