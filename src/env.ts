import { z } from 'zod'

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  WEB_BASE_URL: z.string().url(),
  API_BASE_URL: z.string().url(),
  API_PORT: z.coerce.number().default(3030),
})

export const env = envSchema.parse(process.env)
