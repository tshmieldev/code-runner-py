import z from 'zod'

export const configSchema = z.object({
  timeout: z.number().min(1).max(300).int().optional(),
  memory: z.number().min(64).max(2048).int().optional(),
  cpus: z.number().min(0.5).max(4.0).multipleOf(0.5).optional(),
  tmp_size: z.number().min(10).max(1024).int().optional(),
})

export const runUnitTestRequestSchema = z.object({
    user_code: z.string().min(1),
    unit_tests: z.string().min(1),
    api_key: z.string().min(1),
    config: configSchema.optional(),
})

export const runPerformanceTestRequestSchema = z.object({
    user_code: z.string().min(1),
    performance_tests: z.string().min(1),
    api_key: z.string().min(1),
    config: configSchema.optional(),
})

export const runUnitTestResponseSchema = z.object({
    success: z.boolean(),
    runalyzer_output: z.object({
      test_result: z.object({
        success: z.boolean(), // Whether the tests passed
        message: z.string(), // For user
        results: z.array(z.object({
          name: z.string(),
          points: z.number(),
          max_points: z.number(),
          error: z.string().or(z.null()),
          expected: z.string().or(z.null()),
          result: z.string().or(z.null()), // Actual result of user code
          is_secret: z.boolean().optional()
        })),
        total_points: z.number(),
        max_points: z.number(),
      }),
      stdout: z.string(),
      stderr: z.string(),
      truncated: z.boolean(),
    }),
    runalyzer_errors: z.string(),
    exit_code: z.number(),
})

export const runPerformanceTestResponseSchema = z.object({
  success: z.boolean(),
  runalyzer_output: z.object({
    test_result: z.object({
      success: z.boolean(),
      message: z.string(),
      results: z.array(z.object({
        name: z.string(),
        points: z.number(),
        max_points: z.number(),
        message: z.string().optional(),
        error: z.string().or(z.null()),
        metrics: z.object({
          avg_time: z.number().optional(),
          min_time: z.number().optional(),
          max_time: z.number().optional(),
          avg_memory: z.number().optional(),
          peak_memory: z.number().optional(),
        }).optional(),
      })),
      total_points: z.number(),
      max_points: z.number(),
    }),
    stdout: z.string(),
    stderr: z.string(),
    truncated: z.boolean(),
  }),
  runalyzer_errors: z.string(),
  exit_code: z.number(),
})

export type RunUnitTestRequest = z.infer<typeof runUnitTestRequestSchema> 
export type RunPerformanceTestRequest = z.infer<typeof runPerformanceTestRequestSchema>
export type Config = z.infer<typeof configSchema>