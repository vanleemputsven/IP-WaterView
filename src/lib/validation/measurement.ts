import { z } from "zod";

export const measurementIngestSchema = z.object({
  temperatureCelsius: z.number().min(-10).max(50).optional(),
  ph: z.number().min(0).max(14).optional(),
  chlorinePpm: z.number().min(0).max(20).optional(),
  timestamp: z.string().datetime().optional(),
}).refine(
  (data) =>
    data.temperatureCelsius !== undefined ||
    data.ph !== undefined ||
    data.chlorinePpm !== undefined,
  { message: "At least one measurement value is required" }
);

export type MeasurementIngestInput = z.infer<typeof measurementIngestSchema>;
