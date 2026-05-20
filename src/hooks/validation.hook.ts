import type { Context, Env } from 'hono';
import type { ZodError } from 'zod';
import { logger } from '@/shared/utils/logger.util.js';

export const defaultValidationHook = (
	result: { success: true; data: unknown } | { success: false; error: ZodError },
	c: Context<Env>
) => {
	if (!result.success) {
		const issues = result.error.issues.map((issue) => ({
			field: issue.path.join('.') || 'unknown',
			message: issue.message,
		}));

		logger.warn({ issues, url: c.req.url }, 'Falha na validação de entrada');

		return c.json(
			{
				code: 'VALIDATION_ERROR',
				message: 'Dados inválidos',
				details: issues,
			},
			400,
		);
	}
};
