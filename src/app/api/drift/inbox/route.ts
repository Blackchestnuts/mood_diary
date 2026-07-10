import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 获取我收到的漂流日记(待处理 + 已交换)
export async function GET(req: NextRequest) {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);

  const only = req.nextUrl.searchParams.get("only"); // pending / accepted / all

  const where: Record<string, unknown> = { requesterId: session.id };
  if (only === "pending") where.status = "pending";
  if (only === "accepted") where.status = "accepted";

  const exchanges = await db.driftExchange.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      diaryB: {
        // 不返回 diaryB 的 authorId, 保持匿名
        select: {
          id: true,
          title: true,
          content: true,
          mood: true,
          type: true,
          isSample: true,
          createdAt: true,
        },
      },
      diaryA: {
        select: {
          id: true,
          title: true,
          mood: true,
          type: true,
          createdAt: true,
        },
      },
    },
  });

  return NextResponse.json({
    exchanges: exchanges.map((e) => ({
      id: e.id,
      status: e.status,
      createdAt: e.createdAt,
      resolvedAt: e.resolvedAt,
      strangerDiary: { ...e.diaryB, owner: "other" },
      myDiary: { ...e.diaryA, owner: "me" },
    })),
  });
}
