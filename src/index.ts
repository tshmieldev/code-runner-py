import { Hono } from "hono";
import { serve } from "bun";
import { DEFAULT_CONFIG as CONFIG } from "./config";
import { setupContainerCleanup } from "./lib/docker";
import { initializeCodeDir, cleanupExecutorDirectory } from "./lib/files";
import unitTestController from "./controllers/unit-tests";
import performanceTestController from "./controllers/deprecated-performance-tests";

// Initialize
const app = new Hono();
initializeCodeDir();
setupContainerCleanup();

await cleanupExecutorDirectory();

app.route("/unit-tests", unitTestController);
app.route("/performance-tests", performanceTestController);

serve({
    fetch: app.fetch,
    port: CONFIG.SERVER_PORT,
});

console.log(`🚀 Runner running on http://localhost:${CONFIG.SERVER_PORT}`);
