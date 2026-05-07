import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * OpenAPI 3.0 specificatie als YAML — bron staat in `public/openapi.yaml`
 * (Swagger UI laadt dit endpoint voor een correcte Content-Type).
 */
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "openapi.yaml");
    const yaml = fs.readFileSync(filePath, "utf8");
    return new NextResponse(yaml, {
      status: 200,
      headers: {
        "Content-Type": "application/yaml; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "OpenAPI specification unavailable" },
      { status: 500 },
    );
  }
}
