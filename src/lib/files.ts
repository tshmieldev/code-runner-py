import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import { mkdir, copyFile, rm, writeFile } from "fs/promises";
import { DEFAULT_CONFIG as CONFIG } from "../config";

// Initialize executor directory
export function initializeCodeDir(): void {
    if (!existsSync(CONFIG.CODE_DIR)) {
        mkdirSync(CONFIG.CODE_DIR);
    }
}

export async function createSessionDirectory(
    sessionId: string,
): Promise<string> {
    const sessionPath = join(CONFIG.CODE_DIR, sessionId);
    await mkdir(sessionPath, { recursive: true });
    return sessionPath;
}

export async function writeCodeFile(
    sessionPath: string,
    filename: string,
    content: string,
): Promise<void> {
    await writeFile(join(sessionPath, filename), content);
}

export async function prepareUnitTestFiles(
    sessionPath: string,
    usercode: string,
    unittests: string,
): Promise<void> {
    const srcDir = __dirname;
    await copyFile(
        join(srcDir, "python", "unittestlib.py"),
        join(sessionPath, "unittestlib.py"),
    );
    await copyFile(
        join(srcDir, "python", "unit-test-runner.py"),
        join(sessionPath, "unit-test-runner.py"),
    );
    await writeCodeFile(sessionPath, "usercode.py", usercode);
    await writeCodeFile(sessionPath, "unittests.py", unittests);
}

export async function cleanupExecutorDirectory(): Promise<void> {
    try {
        await rm(CONFIG.CODE_DIR, { recursive: true, force: true });
    } catch (cleanupErr) {
        console.warn(`Failed to cleanup /executor:`, cleanupErr);
    }
}

export async function cleanupSessionDirectory(
    sessionPath: string,
    sessionId: string,
): Promise<void> {
    try {
        await rm(sessionPath, { recursive: true, force: true });
    } catch (cleanupErr) {
        console.warn(`Failed to cleanup session ${sessionId}:`, cleanupErr);
    }
}
