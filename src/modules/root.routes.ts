import { type OpenAPIHono } from "@hono/zod-openapi"
import { authRoutes } from "./auth/routes/auth.routes.js"
import { swaggerRoutes } from "./swagger/routes/swagger.routes.js"

export function registerRoutes(app: OpenAPIHono) {
    app.route("/", authRoutes)
    swaggerRoutes(app)
}
