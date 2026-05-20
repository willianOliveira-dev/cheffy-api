import { defaultValidationHook } from "@/hooks/validation.hook.js";
import { OpenAPIHono } from "@hono/zod-openapi";

export function createRouter() {
    return new OpenAPIHono({
        defaultHook: defaultValidationHook
    })
}