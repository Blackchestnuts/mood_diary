import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// 获取所有心情模板
export async function GET() {
  const templates = await db.moodTemplate.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json({ templates });
}
