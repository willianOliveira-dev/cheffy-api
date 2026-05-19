import { OpenAPIHono } from '@hono/zod-openapi'
import { cors } from 'hono/cors'
import { timing } from 'hono/timing'
import { secureHeaders } from 'hono/secure-headers'
import { env } from './config/env.js'
import { logger } from 'hono/logger'
import pino from 'pino'

export function bootstrapApp() {
  const app = new OpenAPIHono()

  const pinoLogger = pino(env.NODE_ENV === "development" ? { transport: { target: 'pino-pretty' } } : undefined)

  app.use("*", logger((message, ...rest) => { pinoLogger.info({ context: 'http', rest: rest.length > 0 ? rest : undefined }, message);}));
  app.use("*", timing())
  app.use("*", secureHeaders())
  app.use("*", cors({
    origin: env.ALLOWED_ORIGINS,
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ['Content-Type', "Authorization", "Cookie"],
    credentials: true,
  }))

  return app
}