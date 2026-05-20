import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { timing } from 'hono/timing';
import { env } from './config/env.js';
import { errorHandler } from './global/error-handler.global.js';
import { defaultValidationHook } from './hooks/validation.hook.js';
import { registerRoutes } from './modules/root.routes.js';
import { logger } from './shared/utils/logger.util.js';

export function bootstrapApp() {
	const app = new OpenAPIHono({
		defaultHook: defaultValidationHook,
	});

	app.onError(errorHandler);
	app.use(
		'*',
		honoLogger((message, ...rest) => {
			logger.info({ context: 'http', rest: rest.length > 0 ? rest : undefined }, message);
		}),
	);
	app.use('*', timing());
	app.use('*', secureHeaders());
	app.use(
		'*',
		cors({
			origin: env.ALLOWED_ORIGINS,
			allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
			allowHeaders: ['Content-Type', 'Authorization', 'Cookie'],
			credentials: true,
		}),
	);

	registerRoutes(app);

	return app;
}
