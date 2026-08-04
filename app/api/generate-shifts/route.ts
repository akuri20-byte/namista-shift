import { generateShifts } from "@/lib/shift-generator";
import type { DayPlan, Staff } from "@/lib/types";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json() as { days?: DayPlan[]; staff?: Staff[]; requests?: Record<string, string[]> };
  if (!body.days || !body.staff || !body.requests) return NextResponse.json({ error: "入力が不足しています" }, { status: 400 });
  return NextResponse.json({ shifts: generateShifts(body.days, body.staff, body.requests) });
}
