const LABELS: Record<string, string> = {
  temperature_min: "Minimum temperature",
  temperature_max: "Maximum temperature",
  ph_min: "Minimum pH",
  ph_max: "Maximum pH",
  chlorine_min: "Minimum chlorine",
  chlorine_max: "Maximum chlorine",
};

export function formatThresholdLabel(key: string): string {
  return LABELS[key] ?? key.replace(/_/g, " ");
}

export function formatThresholdUnitSuffix(unit: string | null): string {
  if (!unit) return "";
  if (unit === "celsius") return "°C";
  if (unit === "ppm") return "ppm";
  return unit;
}
