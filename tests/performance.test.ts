import { test, expect } from "bun:test";
import app from "../src/controllers/unit-tests";
import {
    runUnitTestResponseSchema,
    type RunUnitTestRequest,
    type RunUnitTestResponse,
} from "../src/lib/validation";

test("App handles 20 concurrent requests - sorting big arrays", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-performance-code.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-performance-tests.py",
    ).text();

    const payload: RunUnitTestRequest = {
        api_key: process?.env?.API_KEY || "",
        user_code: mockUserCode,
        unit_tests: mockUnitTests,
    };

    const promises: Promise<Response>[] = [];
    for (let i = 0; i < 20; i++) {
        const req = app.request("/", {
            method: "POST",
            body: JSON.stringify(payload),
        });
        promises.push(req as Promise<Response>);
    }
    const start = Date.now();
    const finishedPromises = await Promise.all(promises);
    const end = Date.now();
    for (const result of finishedPromises) {
        expect(result.status).toBe(200);
        const returned: RunUnitTestResponse = await result.json();
        runUnitTestResponseSchema.parse(returned);

        const { total_points, max_total_points } =
            returned!.runalyzer_output!.test_result;
        expect(total_points).toBe(max_total_points);
    }
    console.log(`Time taken: ${end - start}ms`);
    expect(end - start).toBeLessThan(5000);
});
