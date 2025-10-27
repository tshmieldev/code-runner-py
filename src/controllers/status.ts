import { OpenAPIHono, type RouteConfigToTypedResponse } from "@hono/zod-openapi";
import { statusRoute } from "../lib/openapi";
import { getActiveContainers } from "../lib/docker";

const app = new OpenAPIHono();

app.openapi(
    { ...statusRoute, path: "/" },
    async (c): Promise<RouteConfigToTypedResponse<typeof statusRoute>> => {
        return c.json({ runningContainers: getActiveContainers().size }, 200);
    },
);

export default app;