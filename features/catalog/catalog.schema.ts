import { z } from "zod";

export const vehicleMakeSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const vehicleModelSchema = z.object({
  id: z.string().min(1),
  makeId: z.string().min(1),
  name: z.string().min(1),
});

export const vehicleTrimSchema = z.object({
  id: z.string().min(1),
  modelId: z.string().min(1),
  name: z.string().min(1),
});

export const provinceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
});

export const cantonSchema = z.object({
  id: z.string().min(1),
  provinceId: z.string().min(1),
  name: z.string().min(1),
});

export const catalogSchema = z.object({
  makes: z.array(vehicleMakeSchema),
  models: z.array(vehicleModelSchema),
  trims: z.array(vehicleTrimSchema),
  provinces: z.array(provinceSchema),
  cantons: z.array(cantonSchema),
});
