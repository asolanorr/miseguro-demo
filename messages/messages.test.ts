import { describe, expect, it } from "vitest";
import es from "./es.json";
import en from "./en.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("messages key parity", () => {
  it("es.json and en.json expose the same set of keys", () => {
    expect(flattenKeys(en).sort()).toEqual(flattenKeys(es).sort());
  });
});
