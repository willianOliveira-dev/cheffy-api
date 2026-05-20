import { serve } from '@hono/node-server';
import { bootstrapApp } from './app.js';
import { env } from './config/env.js';

function startServer() {
	const app = bootstrapApp();

	serve({ fetch: app.fetch, port: env.PORT }, (info) => {
		console.log(`Server listening on http://localhost:${info.port}`);
	});
}

startServer();
