import { z } from "@hono/zod-openapi";

export const configSchema = z.object({
    timeout: z.number().min(1).max(300).int().optional().openapi({
        description: "Timeout in seconds (1-300)",
        example: 5,
    }),
    memory: z.number().min(64).max(2048).int().optional().openapi({
        description: "Memory limit in MB (64-2048)",
        example: 256,
    }),
    cpus: z.number().min(0.5).max(4.0).multipleOf(0.5).optional().openapi({
        description: "CPU limit (0.5-4.0)",
        example: 0.5,
    }),
    tmp_size: z.number().min(10).max(1024).int().optional().openapi({
        description: "Temp filesystem size in MB (10-1024)",
        example: 100,
    }),
});

export const runUnitTestRequestSchema = z.object({
    user_code: z.string().min(1).openapi({
        description: "Python code to execute (must define `solution` function)",
        example: "def solution(a, b):\n    return a + b",
    }),
    unit_tests: z.string().min(1).openapi({
        description: "Test definitions using unittestlib",
        example:
            'from unittestlib import Test, Tester\n\nTester.tests = [\n    Test("add(1, 2) == 3", (1, 2), 3, 1)\n]\n\ndef test(solution):\n    return Tester.run(solution)',
    }),
    api_key: z.string().min(1).openapi({
        description: "Authentication key",
        example: "your-secret-api-key",
    }),
    config: configSchema.optional().openapi({
        description: "Optional execution configuration",
    }),
});

export const testResultSchema = z.object({
    name: z.string().openapi({
        description: "Test name",
        example: "add(1, 2) == 3",
    }),
    points: z.number().openapi({
        description: "Points earned",
        example: 1,
    }),
    max_points: z.number().openapi({
        description: "Maximum points possible",
        example: 1,
    }),
    expected: z.string().nullable().openapi({
        description: "Expected result",
        example: "3",
    }),
    result: z.string().nullable().openapi({
        description: "Actual result of user code",
        example: "3",
    }),
    is_secret: z.boolean().optional().openapi({
        description: "Whether test is hidden",
        example: false,
    }),
});

export const testResultOutputSchema = z.object({
    success: z.boolean().openapi({
        description: "Whether all tests passed",
        example: true,
    }),
    message: z.string().openapi({
        description: "Summary message",
        example: "Punkty: 1 / 1",
    }),
    results: z.array(testResultSchema).openapi({
        description: "Individual test results",
    }),
    total_points: z.number().openapi({
        description: "Total points earned",
        example: 1,
    }),
    max_total_points: z.number().openapi({
        description: "Total points possible",
        example: 1,
    }),
});

export const runalyzerOutputSchema = z.object({
    test_result: testResultOutputSchema.openapi({
        description: "Test execution results",
    }),
    stdout: z.string().openapi({
        description: "Standard output (truncated to 1024 chars)",
        example: "Test: add(1, 2) == 3: 3\nTest: add(-1, -2) == -3: -3",
    }),
    stderr: z.string().openapi({
        description: "Standard error (truncated to 1024 chars)",
        example: "",
    }),
    duration: z.number().openapi({
        description: "Execution duration in seconds",
        example: 1.58e-7,
    }),
    truncated: z.boolean().openapi({
        description: "Whether output was truncated",
        example: false,
    }),
});

const successResponseSchema = z.object({
    success: z.literal(true).openapi({
        description: "Execution completed successfully",
        example: true,
    }),
    runalyzer_output: runalyzerOutputSchema.openapi({
        description: "Test execution results",
    }),
    runalyzer_errors: z.string().optional().openapi({
        description: "Execution errors (stderr)",
        example: "",
    }),
    exit_code: z.literal(0).openapi({
        description: "Process exit code (0 for success)",
        example: 0,
    }),
});

const failureResponseSchema = z.object({
    success: z.literal(false).openapi({
        description: "Execution or request failed",
        example: false,
    }),
    error: z.string().optional().openapi({
        description: "Error with the request (e.g., invalid API key)",
        example: "Invalid API key",
    }),
    runalyzer_output: runalyzerOutputSchema.optional().openapi({
        description: "Partial test execution results, if any",
    }),
    runalyzer_errors: z.string().optional().openapi({
        description: "Execution errors or timeout message",
        example: "Time limit exceeded",
    }),
    exit_code: z.number().optional().openapi({
        description: "Process exit code (124 = timeout, !=0 - other error)",
        example: 1,
    }),
});

export const runUnitTestResponseSchema = z.discriminatedUnion("success", [
    successResponseSchema,
    failureResponseSchema,
]);

export const statusResponseSchema = z.object({
    runningContainers: z.number().openapi({
        description: "Number of running containers",
        example: 0,
    }),
});

export const errorResponseSchema = z.object({
    success: z.boolean().openapi({
        description: "Always false for error responses",
        example: false,
    }),
    error: z.string().openapi({
        description: "Error message",
        example: "Invalid API key | Internal server error etc.",
    }),
});

export type RunUnitTestRequest = z.infer<typeof runUnitTestRequestSchema>;
export type RunUnitTestResponse = z.infer<typeof runUnitTestResponseSchema>;
export type StatusResponse = z.infer<typeof statusResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type Config = z.infer<typeof configSchema>;
