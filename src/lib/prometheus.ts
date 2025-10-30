import { Registry, collectDefaultMetrics, Gauge } from "prom-client";
import { prometheus } from "@hono/prometheus";

// Create custom registry
const register = new Registry();
collectDefaultMetrics({ register });

const prom = prometheus({
    collectDefaultMetrics: false, // We handle it manually
    registry: register,
});

const { printMetrics, registerMetrics } = prom;

// Custom gauge for running containers
const containersRunning = new Gauge({
    name: "containers_running",
    help: "Number of currently running containers",
    registers: [register],
});

register.registerMetric(containersRunning);

// Initialize to 0 to ensure it appears in metrics
containersRunning.set(0);

export function incrementContainers() {
    containersRunning.inc();
}

export function decrementContainers() {
    containersRunning.dec();
}

export function setContainers(count: number) {
    containersRunning.set(count);
}

export { printMetrics, registerMetrics };
