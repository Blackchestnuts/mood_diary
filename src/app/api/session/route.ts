import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getOrCreateSession, setSessionCookie } from "@/lib/session";

// 获取当前会话信息(匿名昵称等)
export async function GET() {
  const session = await getOrCreateSession();
  await setSessionCookie(session.id);

  return NextResponse.json({
    id: session.id,
    nickname: session.nickname,
    avatarSeed: session.avatarSeed,
  });
}
