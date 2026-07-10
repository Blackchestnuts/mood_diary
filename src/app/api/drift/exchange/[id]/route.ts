import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 接受 / 拒绝交换
// 接受后: 双方都能看到对方日记, 我的日记状态改为 exchanged
// 拒绝后: 该次漂流结束, 我的日记恢复为 personal (不再漂流)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);
  const { id } = await params;

  const body = await req.json();
  const action = body.action as "accept" | "reject";

  const exchange = await db.driftExchange.findUnique({
    where: { id },
    include: { diaryA: true, diaryB: true },
  });

  if (!exchange) {
    return NextResponse.json({ error: "漂流记录不存在" }, { status: 404 });
  }
  if (exchange.requesterId !== session.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }
  if (exchange.status !== "pending") {
    return NextResponse.json({ error: "该漂流已处理" }, { status: 400 });
  }

  if (action === "accept") {
    // 接受: 双方日记标记为 exchanged
    await db.$transaction([
      db.driftExchange.update({
        where: { id },
        data: { status: "accepted", resolvedAt: new Date() },
      }),
      db.diary.update({
        where: { id: exchange.diaryAId },
        data: { status: "exchanged" },
      }),
      // 对方的示例日记保持 exchanged, 真实日记也更新
      ...(exchange.diaryB.isSample
        ? []
        : [
            db.diary.update({
              where: { id: exchange.diaryBId },
              data: { status: "exchanged" },
            }),
          ]),
    ]);

    return NextResponse.json({
      ok: true,
      status: "accepted",
      message: "交换成功! 现在你们可以读到彼此的日记了",
    });
  } else {
    // 拒绝: 漂流结束, 我的日记恢复为 personal
    await db.$transaction([
      db.driftExchange.update({
        where: { id },
        data: { status: "rejected", resolvedAt: new Date() },
      }),
      db.diary.update({
        where: { id: exchange.diaryAId },
        data: { status: "personal" },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      status: "rejected",
      message: "已将这封信送回大海",
    });
  }
}
