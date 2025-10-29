import { createRoute, z } from "@hono/zod-openapi";
import {
    runUnitTestRequestSchema,
    runUnitTestResponseSchema,
    errorResponseSchema,
    statusResponseSchema,
} from "./validation";

export const metricsRoute = createRoute({
    method: "get",
    path: "/metrics",
    tags: ["metrics"],
    summary: "Get Prometheus metrics.",
    description: "Returns default prometheus metrics",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: z.any(), // Managed by prometheus
                },
            },
            description: "Server metrics as returned by printMetrics().",
        },
        401: {
            content: {
                "application/json": {
                    schema: errorResponseSchema,
                },
            },
            description: "Unauthorized",
        },
        500: {
            content: {
                "application/json": {
                    schema: errorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
});

export const unitTestRoute = createRoute({
    method: "post",
    path: "/run",
    tags: ["Unit Tests"],
    summary: "Execute Python code with unit tests",
    description:
        "Runs Python code in a sandboxed Docker container and tests it with the provided unit tests.",
    request: {
        body: {
            content: {
                "application/json": {
                    schema: runUnitTestRequestSchema,
                },
            },
            description: "Python code and test definitions",
        },
    },
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: runUnitTestResponseSchema,
                },
            },
            description:
                "Test execution completed successfully (Without errors)",
        },
        400: {
            content: {
                "application/json": {
                    schema: errorResponseSchema,
                },
            },
            description: "Bad request - Invalid JSON or validation errors",
        },
        401: {
            content: {
                "application/json": {
                    schema: errorResponseSchema,
                },
            },
            description: "Unauthorized - Invalid API key",
        },
        500: {
            content: {
                "application/json": {
                    schema: errorResponseSchema,
                },
            },
            description: "Internal server error",
        },
    },
});

export const statusRoute = createRoute({
    method: "get",
    path: "/status",
    tags: ["Status"],
    summary: "Get the status of the server",
    description: "Returns the status of the server",
    responses: {
        200: {
            content: {
                "application/json": {
                    schema: statusResponseSchema,
                },
            },
            description: "OK",
        },
    },
});

export const openApiDocConfig = {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "Tshmieldev's Amazing Runalyzer API",
        description:
            "A secure Python code execution service that runs user code in Docker containers with comprehensive unit testing capabilities.",
    },
};
