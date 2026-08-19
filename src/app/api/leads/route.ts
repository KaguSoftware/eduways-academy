import { NextResponse } from "next/server";
import { getRepo } from "@/lib/repo";
import { leadSchema } from "@/lib/lead-schema";
import { toEnglishDigits } from "@/lib/utils";

// Naive in-memory rate limit per IP (per serverless instance). Good enough as a first line; Supabase RLS + honeypot cover the rest.
const hits = new Map<string, { n: number; t: number }>();
function limited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 10 * 60_000) {
    hits.set(ip, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > 8;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (limited(ip)) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false, error: "invalid", issues: parsed.error.flatten() }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true, id: "ignored" }); // honeypot

  const { website: _hp, ...lead } = parsed.data;
  void _hp;
  const repo = await getRepo();
  const res = await repo.createLead({
    ...lead,
    phone: toEnglishDigits(lead.phone).replace(/[\s()-]/g, ""),
    email: lead.email || null,
    status: "new",
  });
  if (!res) return NextResponse.json({ ok: false, error: "store_failed" }, { status: 500 });
  return NextResponse.json({ ok: true, id: res.id });
}
