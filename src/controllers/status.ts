import {
    OpenAPIHono,
    type RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import { statusRoute } from "../lib/openapi";
import { getActiveContainers } from "../lib/docker";

const app = new OpenAPIHono();

// Path is overriden, as I prefer to have the
// full path in lib/openapi.ts to keep the
// semantics there and in index.ts
app.openapi(
    { ...statusRoute, path: "/" },
    async (c): Promise<RouteConfigToTypedResponse<typeof statusRoute>> => {
        return c.json({ runningContainers: getActiveContainers().size }, 200);
    },
);

export default app;
