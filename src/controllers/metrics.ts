import {
    OpenAPIHono,
    type RouteConfigToTypedResponse,
} from "@hono/zod-openapi";
import { metricsRoute } from "../lib/openapi";
import { printMetrics } from "../lib/prometheus";

const app = new OpenAPIHono();

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
        // @ts-ignore This will return 200
        return printMetrics(c);
    },
);

export default app;
