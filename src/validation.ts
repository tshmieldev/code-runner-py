import z from 'zod'

export const configSchema = z.object({
  timeout: z.number().min(1).max(300).int().optional(),
  memory: z.number().min(64).max(2048).int().optional(),
  cpus: z.number().min(0.5).max(4.0).multipleOf(0.5).optional(),
  tmp_size: z.number().min(10).max(1024).int().optional(),
})

export const requestSchema = z.object({
    usercode: z.string().min(1),
    unittests: z.string().min(1),
    performancetests: z.string(),
    api_key: z.string().min(1),
    config: configSchema.optional(),
})

export type RunRequest = z.infer<typeof requestSchema> 
export type Config = z.infer<typeof configSchema>