import { type Hook } from "@hono/zod-openapi";
import { logger } from "@/shared/utils/logger.util.js";

export const defaultValidationHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      field: issue.path.join('.') || 'unknown',
      message: issue.message,
    }));

    logger.warn({ issues, url: c.req.url }, "Falha na validação de entrada");
    
    return c.json({
      code: 'VALIDATION_ERROR',
      message: 'Dados inválidos',
      details: issues,
    }, 400);
  }
}