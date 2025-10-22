import { test, expect } from "bun:test";
import app from "../controllers/unit-tests";
import { RunUnitTestRequest } from "../lib/validation";

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
  expect(returned.success).toBe(false);
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
