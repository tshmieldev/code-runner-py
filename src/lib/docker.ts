import { resolve } from "path";
import { DEFAULT_CONFIG as CONFIG, DOCKER_CONFIG } from "../config";
import { type Config } from "./validation";

// Track active containers
let activeContainers = new Set<string>();

export function buildDockerCommand(
    sessionId: string,
    sessionPath: string,
    config?: Config,
): string[] {
    const containerName = `code-runner-${sessionId}`;
    const dockerConfig = DOCKER_CONFIG(config);
    return [
        "docker",
        "run",
        "--rm",
        "-i",
        "--name",
        containerName, // Named container for cleanup tracking
        "--network",
        "none", // No network access
        "--cpus",
        dockerConfig.CPUS, // CPU limits
        "--memory",
        dockerConfig.MEMORY, // Memory limits
        "--read-only", // Read-only root filesystem (extra security)
        "--tmpfs",
        `/tmp:noexec,nosuid,size=${dockerConfig.TMP_SIZE}`, // Temporary filesystem for /tmp
        "--user",
        `${process.getuid?.() || 1000}:${process.getgid?.() || 1000}`, // Run as current user
        "-v",
        `${resolve(sessionPath)}:/code:ro`, // Mount session directory as READ-ONLY
        "-w",
        "/code",
        CONFIG.DOCKER.IMAGE,
        "bash",
        "-c",
        `PYTHONDONTWRITEBYTECODE=1 timeout ${dockerConfig.TIMEOUT} python3 unit-test-runner.py; exit $?`,
    ];
}

export function getContainerName(sessionId: string): string {
    return `code-runner-${sessionId}`;
}

export function trackContainer(containerName: string): void {
    activeContainers.add(containerName);
}

export function untrackContainer(containerName: string): void {
    activeContainers.delete(containerName);
}

export async function cleanupContainer(containerName: string): Promise<void> {
    try {
        const killProc = Bun.spawn(["docker", "kill", containerName], {
            stdout: "ignore",
            stderr: "ignore",
        });
        // Wait for the kill command to complete before attempting to remove the container.
        // This prevents a race condition where `docker rm` is called before the container has stopped.
        await killProc.exited;
        Bun.spawn(["docker", "rm", "-f", containerName], {
            stdout: "ignore",
            stderr: "ignore",
        });
        activeContainers.delete(containerName);
    } catch (err) {
        // This is non-crucial as containers have the --rm flag
        console.error(`Error cleaning up container ${containerName}:`, err);
    }
}

export async function cleanupAllContainers(): Promise<void> {
    const cleanup = Array.from(activeContainers).map(cleanupContainer);
    await Promise.all(cleanup);
}

export function getActiveContainers(): Set<string> {
    return activeContainers;
}

// Setup process handlers for container cleanup
export function setupContainerCleanup(): void {
    // Handle process exit signals
    process.on("SIGTERM", async () => {
        console.log("Received SIGTERM, cleaning up containers...");
        await cleanupAllContainers();
        process.exit(0);
    });

    process.on("SIGINT", async () => {
        console.log("Received SIGINT, cleaning up containers...");
        await cleanupAllContainers();
        process.exit(0);
    });

    process.on("exit", () => {
        // Synchronous cleanup on normal exit
        Array.from(activeContainers).forEach((containerName) => {
            try {
                Bun.spawnSync(["docker", "kill", containerName], {
                    stdout: "ignore",
                    stderr: "ignore",
                });
            } catch {}
        });
    });
}
