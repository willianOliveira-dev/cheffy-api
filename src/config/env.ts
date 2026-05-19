import { z } from 'zod';

export const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    BASE_URL: z.string().url(),
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    PORT: z.coerce.number().default(8000),
    API_VERSION: z.string(),
    ALLOWED_ORIGINS: z
        .string()
        .default('http://localhost:3333')
        .transform((origin) =>
            origin.split(',').map((origin) => origin.trim()),
        ),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    BETTER_AUTH_URL: z.string(),
    BETTER_AUTH_SECRET: z.string(),
    GROQ_API_KEY: z.string(),
    FRONTEND_URL: z.string(),
});

export const env = envSchema.parse(process.env);
