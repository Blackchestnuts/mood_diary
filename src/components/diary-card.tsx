"use client";

import { motion } from "framer-motion";
import { moodMeta } from "@/lib/constants";
import { useUI, type DiarySnippet } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Waves, BookOpen, Heart, Mail } from "lucide-react";
import type { ComponentType } from "react";

const TYPE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  daily: BookOpen,
  mood: Heart,
  drift: Waves,
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const min = Math.floor(diff / 60000);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min}分钟前`;
  if (hr < 24) return `${hr}小时前`;
  if (day < 7) return `${day}天前`;
  return d.toLocaleDateString("zh-CN", { month: "long", day: "numeric" });
}

interface DiaryCardProps {
  diary: DiarySnippet;
  index?: number;
  compact?: boolean;
}

export function DiaryCard({ diary, index = 0, compact = false }: DiaryCardProps) {
  const { openViewer } = useUI();
  const mood = moodMeta(diary.mood);
  const Icon = TYPE_ICON[diary.type] ?? BookOpen;
  const isOther = diary.owner === "other";

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.4) }}
      whileHover={{ y: -3 }}
      onClick={() => openViewer(diary)}
      className={cn(
        "group relative flex w-full flex-col overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md",
        compact ? "min-h-[140px]" : "min-h-[180px]"
      )}
      style={{
        borderColor: mood.color + "40",
      }}
    >
      {/* 左侧心情色条 */}
      <div
        className="absolute left-0 top-0 h-full w-1"
        style={{ background: mood.color }}
      />

      {/* 顶部: 类型 + 心情 + 时间 */}
      <div className="mb-2 flex items-center gap-2 pl-1.5">
        <span
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ backgroundColor: mood.color + "33", color: "#5a4a3a" }}
        >
          <Icon className="h-3 w-3" />
          {isOther ? "来自远方" : "我的日记"}
        </span>
        <span className="text-base">{mood.emoji}</span>
        <span className="ml-auto text-[11px] text-muted-foreground">
          {formatDate(diary.createdAt)}
        </span>
      </div>

      {/* 标题 */}
      <h3 className="mb-1 line-clamp-1 pl-1.5 text-base font-semibold text-foreground">
        {diary.title}
      </h3>

      {/* 内容预览 */}
      <p
        className={cn(
          "flex-1 whitespace-pre-line pl-1.5 text-sm leading-relaxed text-muted-foreground",
          compact ? "line-clamp-2" : "line-clamp-3"
        )}
      >
        {diary.content}
      </p>

      {/* 底部标识 */}
      {isOther && (
        <div className="mt-2 flex items-center gap-1 pl-1.5 text-[11px] text-primary/70">
          <Mail className="h-3 w-3" />
          <span>漂流而来 · 完全匿名</span>
        </div>
      )}
    </motion.button>
  );
}
