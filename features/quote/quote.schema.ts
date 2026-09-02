import { z } from "zod";
import {
  VEHICLE_ANNUAL_KM_MAX,
  VEHICLE_YEAR_MAX,
  VEHICLE_YEAR_MIN,
} from "@/lib/constants";

const MIN_DRIVER_AGE = 18;
const MAX_DRIVER_BIRTH_YEAR = VEHICLE_YEAR_MAX - MIN_DRIVER_AGE;
const MIN_DRIVER_BIRTH_YEAR = 1940;
const MAX_CLAIMS_LAST_3_YEARS = 5;
const MAX_PREFERRED_DEDUCTIBLE_CRC = 5_000_000;

export const profileSchema = z.object({
  provinceId: z.string().min(1),
  cantonId: z.string().min(1),
  hasCurrentInsurance: z.boolean(),
  purchaseIntent: z.enum(["now", "exploring"]),
});

export const vehicleSchema = z.object({
  year: z.number().int().min(VEHICLE_YEAR_MIN).max(VEHICLE_YEAR_MAX),
  makeId: z.string().min(1),
  modelId: z.string().min(1),
  trimId: z.string().min(1),
  ownership: z.enum(["owned", "financed", "leased"]),
  use: z.enum(["commuting", "pleasure", "business"]),
  annualKm: z.number().int().min(0).max(VEHICLE_ANNUAL_KM_MAX),
});

export const driverSchema = z.object({
  // Los mensajes de error de este schema no se muestran directamente: los
  // formularios traducen el error a texto vía messages/*.json a partir del
  // nombre del campo (features/quote/*-form.tsx), nunca del string que
  // arme Zod, para no meter texto visible en un archivo sin acceso a i18n.
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .refine((value) => {
      const year = Number(value.slice(0, 4));
      return year >= MIN_DRIVER_BIRTH_YEAR && year <= MAX_DRIVER_BIRTH_YEAR;
    }),
  licenseYears: z.number().int().min(0).max(80),
  claimsLast3Years: z.number().int().min(0).max(MAX_CLAIMS_LAST_3_YEARS),
  consentAccepted: z.literal(true),
  consentTimestamp: z.string().min(1),
});

export const coverageSchema = z.object({
  level: z.enum(["liability", "extended", "full"]),
  preferredDeductibleCrc: z
    .number()
    .int()
    .min(0)
    .max(MAX_PREFERRED_DEDUCTIBLE_CRC)
    .nullable(),
});

export const quoteRequestSchema = z.object({
  profile: profileSchema,
  vehicle: vehicleSchema,
  driver: driverSchema,
  coverage: coverageSchema,
});

export const leadSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  phone: z.string().min(1).optional(),
  selectedOfferId: z.string().min(1).nullable(),
  request: quoteRequestSchema,
  consentAccepted: z.literal(true),
  consentTimestamp: z.string().min(1),
});
