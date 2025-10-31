import {
    OpenAPIHono,
    type RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import { metricsRoute } from "../lib/openapi";
import { printMetrics } from "../lib/prometheus";

const app = new OpenAPIHono();

// Path is overriden, as I prefer to have the
// full path in lib/openapi.ts to keep the
// semantics there and in index.ts
app.openapi(
    { ...metricsRoute, path: "/" },
    async (c): Promise<RouteConfigToTypedResponse<typeof metricsRoute>> => {
        if (
            c.req.header("authorization") !==
            `Bearer ${process.env.METRICS_API_KEY}`
        ) {
            return c.json(
                {
                    success: false,
                    error: "Unauthorized",
                },
                401,
            );
        }
        return printMetrics(c) as unknown as RouteConfigToTypedResponse<
            typeof metricsRoute
        >;
    },
);

export default app;
