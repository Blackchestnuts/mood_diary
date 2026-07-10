import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { randomNickname, randomAvatarSeed } from "@/lib/constants";

export const SESSION_COOKIE = "md_session";

// 获取或创建匿名会话 —— 完全匿名,不收集任何个人信息
export async function getOrCreateSession() {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;

  if (existing) {
    const session = await db.session.findUnique({ where: { id: existing } });
    if (session) {
      // 更新最后访问时间
      await db.session.update({
        where: { id: session.id },
        data: { lastSeen: new Date() },
      }).catch(() => {});
      return session;
    }
  }

  // 创建新会话
  const session = await db.session.create({
    data: {
      nickname: randomNickname(),
      avatarSeed: randomAvatarSeed(),
    },
  });

  return session;
}

// 仅在响应阶段设置 cookie
export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365, // 一年
    path: "/",
  });
}
