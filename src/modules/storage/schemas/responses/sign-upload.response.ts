import { z } from '@hono/zod-openapi';

export const signUploadResponseSchema = z
	.object({
		signature: z.string(),
		timestamp: z.number(),
		folder: z.string(),
		publicId: z.string().optional(),
		cloudName: z.string(),
		apiKey: z.string(),
		uploadUrl: z.string().url(),
	})
	.openapi('SignUpload');
