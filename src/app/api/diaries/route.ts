import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 获取我的日记列表 (含已交换的对方日记)
export async function GET(req: NextRequest) {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);

  const type = req.nextUrl.searchParams.get("type"); // daily / mood / drift / all
  const status = req.nextUrl.searchParams.get("status"); // personal / exchanged / all

  // 1. 我自己写的日记
  const where: Record<string, unknown> = { authorId: session.id };
  if (type && type !== "all") where.type = type;
  if (status && status !== "all") where.status = status;

  const myDiaries = await db.diary.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  // 2. 我已接受交换的对方日记 (通过 DriftExchange)
  // diaryA 是我的日记, diaryB 是对方漂流过来的; 接受后我能看 diaryB
  const exchangesAsA = await db.driftExchange.findMany({
    where: {
      requesterId: session.id,
      status: "accepted",
    },
    include: { diaryB: true },
  });

  const exchangedFromOthers = exchangesAsA
    .map((e) => e.diaryB)
    .filter((d) => {
      if (type && type !== "all" && d.type !== type) return false;
      return true;
    });

  return NextResponse.json({
    myDiaries: myDiaries.map((d) => ({ ...d, owner: "me" })),
    exchangedDiaries: exchangedFromOthers.map((d) => ({
      ...d,
      owner: "other",
    })),
  });
}

// 创建新日记
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
    return NextResponse.json(
      { error: "日记内容不能为空" },
      { status: 400 }
    );
  }

  const diary = await db.diary.create({
    data: {
      title: (title || "").trim() || "无题",
      content: content.trim(),
      mood: mood || "calm",
      type: type || "daily",
      templateId: templateId || null,
      authorId: session.id,
      status: "personal",
    },
  });

  return NextResponse.json(diary);
}
