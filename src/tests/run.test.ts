import { Hono } from "hono";
import { test, expect, it } from "bun:test";
import app from "../controllers/unit-tests";
import z from "zod";
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

test("Correct code gets max points", async () => {
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
  return true;
});

test("Incorrect code gets less than max points", async () => {
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
  expect(total_points).toBe(max_points);
  return true;
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

  return true;
});
