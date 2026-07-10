import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 删除日记(仅作者本人)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);
  const { id } = await params;

  const diary = await db.diary.findUnique({ where: { id } });
  if (!diary) {
    return NextResponse.json({ error: "日记不存在" }, { status: 404 });
  }
  if (diary.authorId !== session.id) {
    return NextResponse.json({ error: "无权操作" }, { status: 403 });
  }

  await db.diary.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
