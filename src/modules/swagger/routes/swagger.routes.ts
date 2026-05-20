import type { OpenAPIHono } from '@hono/zod-openapi';
import { Scalar } from '@scalar/hono-api-reference';
import { env } from '@/config/env.js';

export function swaggerRoutes(app: OpenAPIHono) {
	app.doc('/doc', {
		openapi: '3.1.0',
		info: {
			title: 'Cheffy API',
			version: env.API_VERSION,
			description: '',
		},
		servers: [
			{
				url: `http://localhost:${env.PORT}`,
				description: 'Localhost',
			},
			{
				url: env.BASE_URL,
				description: 'Production',
			},
		],
	});

	app.get(
		'/docs',
		Scalar({
			pageTitle: 'Cheffy API Documentação',
			theme: 'bluePlanet',
			sources: [
				{
					title: 'Cheffy API',
					url: '/doc',
				},
				{
					title: 'Auth API',
					url: '/api/auth/open-api/generate-schema',
				},
			],
		}),
	);
}
