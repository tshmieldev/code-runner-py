import z from 'zod'

export const requestSchema = z.object({
  usercode: z.string().min(1),
  unittests: z.string().min(1),
  performancetests: z.string(),
  api_key: z.string().min(1),
})

export type RunRequest = z.infer<typeof requestSchema> 