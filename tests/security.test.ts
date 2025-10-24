import { test, expect } from "bun:test";
import app from "../src/controllers/unit-tests";
import { type RunUnitTestRequest } from "../src/lib/validation";

test("Hacky solution does not pass", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-cheating-code.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-tests-1.py",
    ).text();

    const payload: RunUnitTestRequest = {
        api_key: process?.env?.API_KEY || "",
        user_code: mockUserCode,
        unit_tests: mockUnitTests,
    };

    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);

    const returned = await res.json();
    expect(returned.runalyzer_output.test_result.total_points).toBe(0);
});

test("Different return type does not pass", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-mistyped-code-1.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-tests-1.py",
    ).text();

    const payload: RunUnitTestRequest = {
        api_key: process?.env?.API_KEY || "",
        user_code: mockUserCode,
        unit_tests: mockUnitTests,
    };

    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);

    const returned = await res.json();

    expect(returned.success).toBe(true);
    expect(returned.runalyzer_output.test_result.total_points).toBe(0);
});

test("Request with invalid/missing API key does not get processed", async () => {
    const payload: RunUnitTestRequest = {
        api_key: "invalid",
        user_code: "bla",
        unit_tests: "bla",
    };

    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    expect(res.status).toBe(401);

    const returned = await res.json();
    expect(returned.success).toBe(false);
    expect(returned.error).toBe("Invalid API key");
});

test("Network is not accessible", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-network-code.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-tests-1.py",
    ).text();

    const payload: RunUnitTestRequest = {
        api_key: process?.env?.API_KEY || "",
        user_code: mockUserCode,
        unit_tests: mockUnitTests,
    };

    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);

    const returned = await res.json();

    expect(returned.success).toBe(false);
    expect(returned.runalyzer_errors).toInclude("Network is unreachable");
});

test("Write permissions are not granted", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-writing-code.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-tests-1.py",
    ).text();

    const payload: RunUnitTestRequest = {
        api_key: process?.env?.API_KEY || "",
        user_code: mockUserCode,
        unit_tests: mockUnitTests,
    };

    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);

    const returned = await res.json();

    expect(returned.success).toBe(false);
    expect(returned.runalyzer_errors).toInclude("Read-only file system");
});

test("Code can't delete files", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-deleting-code.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-tests-1.py",
    ).text();

    const payload: RunUnitTestRequest = {
        api_key: process?.env?.API_KEY || "",
        user_code: mockUserCode,
        unit_tests: mockUnitTests,
    };

    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    expect(res.status).toBe(200);

    const returned = await res.json();

    expect(returned.success).toBe(false);
    expect(returned.runalyzer_errors).toInclude("Read-only file system");
});

test("Malformed requests are handled", async () => {
    const res = await app.request("/", {
        method: "POST",
        body: "hello, world!",
    });
    expect(res.status).toBe(400);
});

test("Well-formed requests that don't follow the schema are handled", async () => {
    const res = await app.request("/", {
        method: "POST",
        body: JSON.stringify({
            api_key: process?.env?.API_KEY || "",
            this_is_not_user_code: "hello, world!",
            unit_tests: 1337,
        }),
    });
    expect(res.status).toBe(400);
});
