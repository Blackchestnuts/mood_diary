import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 随机获取一篇漂流日记 (用于"捡一个漂流瓶"功能, 不创建交换)
// 仅返回内容, 不暴露作者信息
export async function GET() {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);

  // 随机取一篇别人的漂流中日记(包括示例)
  const pool = await db.diary.findMany({
    where: {
      status: "drifting",
      authorId: { not: session.id },
    },
    select: { id: true },
  });

  if (pool.length === 0) {
    return NextResponse.json({
      diary: null,
      message: "大海此刻很安静, 没有漂流瓶",
    });
  }

  const picked = pool[Math.floor(Math.random() * pool.length)];
  const diary = await db.diary.findUnique({
    where: { id: picked.id },
    select: {
      id: true,
      title: true,
      content: true,
      mood: true,
      type: true,
      isSample: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    diary: diary ? { ...diary, owner: "other" } : null,
    message: diary ? "你捡到了一个漂流瓶" : "大海此刻很安静",
  });
}
