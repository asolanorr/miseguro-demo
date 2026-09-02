import { insurersResponseSchema } from "./insurers.schema";
import type { Insurer } from "./insurers.types";

export async function fetchInsurers(): Promise<Insurer[]> {
  const res = await fetch("/api/insurers");
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.error.message);
  }

  return insurersResponseSchema.parse(json.data);
}
