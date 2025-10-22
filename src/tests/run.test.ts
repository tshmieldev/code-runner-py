import { Hono } from "hono";
import { test, expect, it } from "bun:test";
import app from "../controllers/unit-tests";
import z from "zod";
import { RunUnitTestRequest } from "../lib/validation";

test("Code grading", async () => {
    const mockUserCode = await Bun.file(
        __dirname + "/data/mock-usercode.py",
    ).text();
    const mockUnitTests = await Bun.file(
        __dirname + "/data/mock-unit-tests.py",
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
    console.log(returned);
    return true;
});
