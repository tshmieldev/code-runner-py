import { prometheus } from "@hono/prometheus";

const { printMetrics, registerMetrics } = prometheus({
    collectDefaultMetrics: true,
});

export { printMetrics, registerMetrics };
