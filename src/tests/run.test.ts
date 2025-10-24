import { test, expect } from "bun:test";
import app from "../controllers/unit-tests";
import { RunUnitTestRequest } from "../lib/validation";

test("Runalyzer works without errors", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-code-1.py",
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
    return true;
});

test("Correct code gets max points - simple return type", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-code-1.py",
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
    const { total_points, max_points } = returned.runalyzer_output.test_result;
    expect(total_points).toBe(max_points);
});

test("Correct code gets max points - custom return type", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-code-2.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-tests-2.py",
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
    const { total_points, max_points } = returned.runalyzer_output.test_result;
    expect(total_points).toBe(max_points);
});

test("Incorrect code gets less than max points - simple return type", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-wrong-1.py",
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
    const { total_points, max_points } = returned.runalyzer_output.test_result;
    expect(total_points).toBeLessThan(max_points);
});

test("Invalid code is handled, shows SyntaxError", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-invalid-code.py",
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
    expect(returned.runalyzer_errors).toInclude("SyntaxError");
});

test("Buggy code is handled, shows error", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-buggy-code.py",
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

    const returned = await res.json();
    expect(res.status).toBe(200);
    expect(returned.success).toBe(false);
    expect(returned.runalyzer_errors).toBeTruthy();
});

test(
    "Timeout code is handled, shows Time Limit Exceeded",
    async () => {
        const mockUserCode = await Bun.file(
            __dirname + "/data/mock-timeout-code.py",
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
        expect(returned.exit_code).toBe(124);
        expect(returned.success).toBe(false);
        expect(returned.runalyzer_errors).toInclude("Time limit exceeded");
    },
    {
        timeout: 6000,
    },
);

test(
    "Config override of timeout works",
    async () => {
        const mockUserCode = await Bun.file(
            __dirname + "/data/mock-timeout-code.py",
        ).text();
        const mockUnitTests = await Bun.file(
            __dirname + "/data/mock-tests-1.py",
        ).text();

        const payload: RunUnitTestRequest = {
            api_key: process?.env?.API_KEY || "",
            user_code: mockUserCode,
            unit_tests: mockUnitTests,
            config: {
                timeout: 6,
            },
        };

        const res = await app.request("/", {
            method: "POST",
            body: JSON.stringify(payload),
        });

        expect(res.status).toBe(200);

        const returned = await res.json();
        expect(returned.exit_code).toBe(124);
        expect(returned.success).toBe(false);
        expect(returned.runalyzer_errors).toInclude("Time limit exceeded");
    },
    {
        timeout: 7000,
    },
);
