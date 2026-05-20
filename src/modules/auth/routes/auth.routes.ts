import { auth } from '@/lib/auth/auth.lib.js'
import { createRouter } from '@/shared/utils/router.util.js'

export const authRoutes = createRouter()

authRoutes.all("/api/auth/*", async (c) => auth.handler(c.req.raw))

authRoutes.get("/api/auth/open-api/generate-schema", async (c) => {
    const openApiAuthSchema = await auth.api.generateOpenAPISchema();
    return c.json(openApiAuthSchema);
})