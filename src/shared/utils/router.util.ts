import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultValidationHook } from '@/hooks/validation.hook.js';

export function createRouter() {
	return new OpenAPIHono({
		defaultHook: defaultValidationHook,
	});
}
