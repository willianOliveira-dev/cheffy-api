import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';
import { localization } from 'better-auth-localization';
import { env } from '@/config/env.js';
import { prisma } from '../db/prisma.js';

const isProduction = env.NODE_ENV === 'production';

export const auth = betterAuth({
    baseURL: env.BETTER_AUTH_URL,
    secret: env.BETTER_AUTH_SECRET,
    trustedOrigins: env.ALLOWED_ORIGINS,
    account: {
        storeStateStrategy: 'database',
    },

    advanced: {
        trustedProxyHeaders: true,
        defaultCookieAttributes: {
            sameSite: isProduction ? 'none' : 'lax',
            secure: isProduction,
            ...(isProduction ? { partitioned: true } : {}),
        },
        disableOriginCheck: !isProduction,
        disableCSRFCheck: !isProduction,
    },
    socialProviders: {
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
    database: prismaAdapter(prisma, { provider: 'postgresql' }),
    plugins: [openAPI(), localization({ defaultLocale: 'pt-BR' })],
});
