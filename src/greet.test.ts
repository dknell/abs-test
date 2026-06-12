import { greet } from "./greet";
import { test, expect } from "vitest";
test("AC1", () => { expect(greet("Sam")).toBe("Hello, Sam"); });
