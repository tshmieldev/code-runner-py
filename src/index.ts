import { serve } from "bun";
import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { openApiDocConfig } from "./lib/openapi";
import { DEFAULT_CONFIG as CONFIG } from "./config";
import { setupContainerCleanup } from "./lib/docker";
import { initializeCodeDir, cleanupExecutorDirectory } from "./lib/files";
import { registerMetrics } from "./lib/prometheus";
import metricsController from "./controllers/metrics";
import unitTestController from "./controllers/unit-tests";
import statusController from "./controllers/status";
//import { swaggerUI } from "@hono/swagger-ui";

// Initialize resources
initializeCodeDir();
setupContainerCleanup();
await cleanupExecutorDirectory();

const app = new OpenAPIHono();

// Metrics stuff

app.use("*", registerMetrics);
app.route("/metrics", metricsController);

app.route("/run", unitTestController);
app.route("/status", statusController);

// Docs stuff
app.doc("/doc", openApiDocConfig);
app.get(
    "/api-docs",
    Scalar({
        url: "/doc",
        title: "Tshmieldev's Amazing Runalyzer API",
        theme: "kepler",
    }),
);
// Sorry, Scalar is just cooler than Swagger
// app.get("/api-docs", swaggerUI({ url: "/doc" }));

serve({
    fetch: app.fetch,
    port: CONFIG.SERVER_PORT,
});

console.log(`🚀 Code runner running on http://localhost:${CONFIG.SERVER_PORT}`);
console.log(
    `📚 API Documentation: http://localhost:${CONFIG.SERVER_PORT}/api-docs`,
);
console.log(`📋 OpenAPI Spec: http://localhost:${CONFIG.SERVER_PORT}/doc`);
console.log(
    `📈 Prometheus metrics: http://localhost:${CONFIG.SERVER_PORT}/metrics`,
);
