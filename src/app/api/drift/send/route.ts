import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 把自己的一篇日记投入漂流瓶, 同时随机收到一篇陌生人的日记
// 完全匿名: 不暴露任何作者信息
export async function POST(req: NextRequest) {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);

  const body = await req.json();
  const { title, content, mood, type, templateId } = body as {
    title?: string;
    content?: string;
    mood?: string;
    type?: string;
    templateId?: string;
  };

  if (!content || !content.trim()) {
    return NextResponse.json({ error: "日记内容不能为空" }, { status: 400 });
  }

  // 1. 创建我的日记, 标记为漂流中
  const myDiary = await db.diary.create({
    data: {
      title: (title || "").trim() || "无题",
      content: content.trim(),
      mood: mood || "calm",
      type: type || "drift",
      templateId: templateId || null,
      authorId: session.id,
      status: "drifting",
    },
  });

  // 2. 从漂流池中随机取一篇"陌生人的日记"
  //    优先取其他用户漂流的日记, 其次取示例日记
  //    完全不返回作者信息
  const otherDrifting = await db.diary.findMany({
    where: {
      status: "drifting",
      authorId: { not: session.id },
      id: { not: myDiary.id },
    },
    select: { id: true },
  });

  const sampleDrifting = await db.diary.findMany({
    where: {
      status: "drifting",
      isSample: true,
      id: { not: myDiary.id },
    },
    select: { id: true },
  });

  const pool = [...otherDrifting, ...sampleDrifting];
  let strangerDiary = null;

  if (pool.length > 0) {
    const randomIndex = Math.floor(Math.random() * pool.length);
    const pickedId = pool[randomIndex].id;
    strangerDiary = await db.diary.findUnique({
      where: { id: pickedId },
      // 不返回 authorId, 完全匿名
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
  }

  // 3. 创建待处理的漂流交换记录
  //    diaryA = 我的日记(发起方), diaryB = 陌生人的日记(被漂流过来的)
  let exchange = null;
  if (strangerDiary) {
    exchange = await db.driftExchange.create({
      data: {
        diaryAId: myDiary.id,
        diaryBId: strangerDiary.id,
        requesterId: session.id,
        status: "pending",
      },
    });
  }

  return NextResponse.json({
    myDiary: { ...myDiary, owner: "me" },
    strangerDiary: strangerDiary
      ? { ...strangerDiary, owner: "other" }
      : null,
    exchange: exchange
      ? { id: exchange.id, status: exchange.status }
      : null,
    message: strangerDiary
      ? "你的日记已投入大海, 一封陌生人的日记漂流到了你手中"
      : "你的日记已投入大海, 等待有缘人拾起",
  });
}
