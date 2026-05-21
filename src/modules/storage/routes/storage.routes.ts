import { createRoute } from '@hono/zod-openapi';
import { authenticateMiddleware } from '@/middlewares/auth/auth.middleware.js';
import { createRouter } from '@/shared/utils/router.util.js';
import { storageController } from '../controllers/storage.controller.js';
import { signUploadDtoSchema } from '../schemas/dtos/sign-upload.dto.js';
import { signUploadResponseSchema } from '../schemas/responses/sign-upload.response.js';

export const storageRoutes = createRouter();

const path = '/storage';

const signUploadRoute = createRoute({
	method: 'post',
	path: `${path}/sign`,
	operationId: 'signUpload',
	tags: ['Storage'],
	middleware: [authenticateMiddleware] as const,
	request: {
		body: {
			content: {
				'application/json': {
					schema: signUploadDtoSchema,
				},
			},
		},
	},
	responses: {
		200: {
			content: {
				'application/json': {
					schema: signUploadResponseSchema,
				},
			},
			description: 'Assinatura para upload direto ao Cloudinary',
		},
	},
});

storageRoutes.openapi(signUploadRoute, async (c) => {
	const data = c.req.valid('json');
	const result = await storageController.signUpload(data);
	return c.json(signUploadResponseSchema.parse(result), 200);
});
