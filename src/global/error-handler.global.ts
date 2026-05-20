import type { Context } from 'hono';
import { AppError } from '@/shared/errors/app.error.js';
import { logger } from '@/shared/utils/logger.util.js';

export async function errorHandler(error: Error, c: Context) {
	if (error instanceof AppError) {
		logger.warn({ code: error.code, message: error.message, url: c.req.url }, 'Erro de aplicação');
		return c.json(
			{
				error: error.message,
				code: error.code,
			},
			error.statusCode,
		);
	}

	logger.error({ err: error, url: c.req.url }, 'Erro inesperado do servidor');

	return c.json(
		{
			error: 'Erro interno do servidor',
			code: 'INTERNAL_SERVER_ERROR',
		},
		500,
	);
}
