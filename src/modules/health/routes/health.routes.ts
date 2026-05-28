import { createRoute} from '@hono/zod-openapi';
import { env } from '@/config/env.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { healthResponseSchema } from '../schemas/responses/health.response.js';

export const healthRoutes = createRouter();

const getHealthRoute = createRoute({
	method: 'get',
	path: '/health',
	operationId: 'getHealth',
	tags: ['Health'],
	responses: {
		200: {
			content: {
				'application/json': {
					schema: healthResponseSchema,
				},
			},
			description: 'Status de disponibilidade da API',
		},
	},
});

healthRoutes.openapi(getHealthRoute, (c) => {
	return c.json(
		healthResponseSchema.parse({
			status: 'ok',
			service: 'cheffy-api',
			environment: env.NODE_ENV,
			version: env.API_VERSION,
			timestamp: new Date().toISOString(),
		}),
		200,
	);
});
