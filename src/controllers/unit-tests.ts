import {
    OpenAPIHono,
    type RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import { runUnitTestRequestSchema } from "../lib/validation";
import { v4 } from "uuid";
import {
    cleanupSessionDirectory,
    createSessionDirectory,
    prepareUnitTestFiles,
} from "../lib/files";
import {
    buildDockerCommand,
    getContainerName,
    trackContainer,
    untrackContainer,
} from "../lib/docker";
import { unitTestRoute } from "../lib/openapi";

const app = new OpenAPIHono();

// Path is overriden, as I prefer to have the
// full path in lib/openapi.ts to keep the
// semantics there and in index.ts
app.openapi(
    { ...unitTestRoute, path: "/" },
    async (c): Promise<RouteConfigToTypedResponse<typeof unitTestRoute>> => {
        let body = null;

        try {
            body = await c.req.json();
        } catch {
            return c.json({ success: false, error: "Invalid JSON" }, 400);
        }

        const validatedData = runUnitTestRequestSchema.safeParse(body);

        if (!validatedData.success) {
            return c.json(
                { success: false, error: validatedData.error.message },
                400,
            );
        }

        const { user_code, unit_tests, api_key, config } = validatedData.data;

        if (api_key !== Bun.env.API_KEY) {
            return c.json({ success: false, error: "Invalid API key" }, 401);
        }

        // Create unique session
        const sessionId = v4();
        const sessionPath = await createSessionDirectory(sessionId);
        const containerName = getContainerName(sessionId);

        try {
            // Setup files and container
            await prepareUnitTestFiles(sessionPath, user_code, unit_tests);
            trackContainer(containerName);

            // Execute in Docker
            const command = buildDockerCommand(sessionId, sessionPath, config);
            const proc = Bun.spawn(command, {
                stdout: "pipe",
                stderr: "pipe",
            });

            const stdout = await new Response(proc.stdout).text();
            const stderr = await new Response(proc.stderr).text();

            // Wait for process to complete and get exit code
            const exitCode = await proc.exited;

            const result = stdout ? JSON.parse(stdout) : undefined;

            // Yes, this could be one return
            // But typescript wants it to be split
            // Because of the discriminatory union
            if (exitCode === 0) {
                return c.json(
                    {
                        success: true,
                        runalyzer_output: result,
                        runalyzer_errors: stderr,
                        exit_code: exitCode,
                    },
                    200,
                );
            }
            return c.json(
                {
                    success: false,
                    runalyzer_output: result,
                    runalyzer_errors:
                        stderr ||
                        (exitCode === 124 ? "Time limit exceeded" : ""),
                    exit_code: exitCode,
                },
                200,
            );
        } catch (error) {
            console.error(error);
            return c.json(
                { success: false, error: "Internal server error" },
                500,
            );
        } finally {
            untrackContainer(containerName);
            await cleanupSessionDirectory(sessionPath, sessionId);
        }
    },
);

export default app;
