"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchInsurers } from "./insurers.api";

export function useInsurers() {
  return useQuery({
    queryKey: ["insurers"],
    queryFn: fetchInsurers,
    staleTime: Infinity,
  });
}
