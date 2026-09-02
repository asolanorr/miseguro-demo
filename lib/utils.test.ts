import { describe, expect, it } from "vitest";
import { formatCrc } from "./utils";

describe("formatCrc", () => {
  it.each([
    [0, "₡0"],
    [1500, "₡1.500"],
    [780000, "₡780.000"],
    [1250000, "₡1.250.000"],
  ])("formats %i as %s", (value, expected) => {
    expect(formatCrc(value)).toBe(expected);
  });
});
