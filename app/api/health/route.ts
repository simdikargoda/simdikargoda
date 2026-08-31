import { NextResponse } from "next/server";

/**
 * Uptime/monitoring health endpoint'i.
 * Secret, env değeri, DB URL, provider credential veya stack trace
 * ASLA döndürmez; yalnızca minimum `{ status: "ok" }` bilgisini içerir.
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
