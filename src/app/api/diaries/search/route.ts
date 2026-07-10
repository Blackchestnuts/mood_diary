import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 搜索我的日记(标题+内容)
export async function GET(req: NextRequest) {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);

  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
  const type = req.nextUrl.searchParams.get("type") || "all";
  const mood = req.nextUrl.searchParams.get("mood") || "all";

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  // SQLite 不支持 ILIKE, 用 contains + mode insensitive
  const whereClause = {
    authorId: session.id,
    OR: [
      { title: { contains: q } },
      { content: { contains: q } },
    ],
    ...(type !== "all" ? { type } : {}),
    ...(mood !== "all" ? { mood } : {}),
  };

  const myResults = await db.diary.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  // 同时搜索已交换来的对方日记
  const exchangesAsA = await db.driftExchange.findMany({
    where: { requesterId: session.id, status: "accepted" },
    include: { diaryB: true },
  });

  const exchangedResults = exchangesAsA
    .map((e) => e.diaryB)
    .filter((d) => {
      const matchText =
        d.title.toLowerCase().includes(q.toLowerCase()) ||
        d.content.toLowerCase().includes(q.toLowerCase());
      const matchType = type === "all" || d.type === type;
      const matchMood = mood === "all" || d.mood === mood;
      return matchText && matchType && matchMood;
    });

  return NextResponse.json({
    results: [
      ...myResults.map((d) => ({ ...d, owner: "me" })),
      ...exchangedResults.map((d) => ({ ...d, owner: "other" })),
    ],
  });
}
