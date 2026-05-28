import z from "zod";

export const healthResponseSchema = z
    .object({
        status: z.literal('ok'),
        service: z.literal('cheffy-api'),
        environment: z.string(),
        version: z.string(),
        timestamp: z.string().datetime(),
    })
    .openapi('Health');