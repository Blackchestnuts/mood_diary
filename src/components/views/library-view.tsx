"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { useDiaries } from "@/hooks/use-diaries";
import { DiaryCard } from "@/components/diary-card";
import { MOODS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Search, BookOpen, Heart, Waves, Inbox, Sparkles, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Tab = "all" | "mine" | "exchanged";
type TypeFilter = "all" | "daily" | "mood" | "drift";

export function LibraryView() {
  const { searchQuery, setSearchQuery, openEditor, openDriftInbox } = useUI();
  const { allDiaries, myDiaries, exchangedDiaries, searchResults, loading } =
    useDiaries();
  const [tab, setTab] = useState<Tab>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");
  const [moodFilter, setMoodFilter] = useState<string>("all");

  const base =
    tab === "mine"
      ? myDiaries
      : tab === "exchanged"
      ? exchangedDiaries
      : allDiaries;

  const filtered = base.filter((d) => {
    if (typeFilter !== "all" && d.type !== typeFilter) return false;
    if (moodFilter !== "all" && d.mood !== moodFilter) return false;
    return true;
  });

  const showingSearch = searchQuery.trim().length > 0 && searchResults;
  const display = showingSearch ? searchResults : filtered;

  const tabs: { key: Tab; label: string; count: number; icon: typeof BookOpen }[] = [
    { key: "all", label: "全部", count: allDiaries.length, icon: Sparkles },
    { key: "mine", label: "我写的", count: myDiaries.length, icon: BookOpen },
    {
      key: "exchanged",
      label: "交换来的",
      count: exchangedDiaries.length,
      icon: Inbox,
    },
  ];

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div>
        <h1 className="text-2xl font-bold">我的日记库</h1>
        <p className="text-sm text-muted-foreground">
          你写下的每一个字, 和漂流而来的每一封信
        </p>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索你的日记标题或内容..."
          className="h-12 rounded-2xl border-border/60 bg-card pl-11 pr-11 text-base shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* 搜索结果提示 */}
      {showingSearch && (
        <div className="flex items-center justify-between rounded-xl bg-primary/5 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">
            搜索 “<span className="font-medium text-foreground">{searchQuery}</span>” 找到{" "}
            <span className="font-medium text-primary">{searchResults?.length ?? 0}</span> 篇日记
          </span>
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-primary hover:underline"
          >
            清除搜索
          </button>
        </div>
      )}

      {/* 标签 + 类型筛选 */}
      {!showingSearch && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {t.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 text-[10px]",
                      active ? "bg-primary-foreground/20" : "bg-muted"
                    )}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 类型 + 心情筛选 */}
      {!showingSearch && (
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5">
            {([
              { k: "all", label: "全部类型" },
              { k: "daily", label: "每日", icon: BookOpen },
              { k: "mood", label: "心情", icon: Heart },
              { k: "drift", label: "漂流", icon: Waves },
            ] as const).map((t) => (
              <button
                key={t.k}
                onClick={() => setTypeFilter(t.k)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition",
                  typeFilter === t.k
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setMoodFilter("all")}
              className={cn(
                "rounded-full border px-2.5 py-1 text-xs transition",
                moodFilter === "all"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              全部心情
            </button>
            {MOODS.map((m) => (
              <button
                key={m.key}
                onClick={() => setMoodFilter(m.key)}
                className={cn(
                  "flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition",
                  moodFilter === m.key
                    ? "border-transparent text-foreground shadow-sm"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
                style={
                  moodFilter === m.key
                    ? { backgroundColor: m.color + "55", borderColor: m.color }
                    : undefined
                }
              >
                <span>{m.emoji}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 日记列表 */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] animate-pulse rounded-2xl border bg-card/50"
            />
          ))}
        </div>
      ) : display.length === 0 ? (
        <EmptyState
          isSearch={!!showingSearch}
          onWrite={() => openEditor("daily")}
          onInbox={openDriftInbox}
        />
      ) : (
        <motion.div
          layout
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {display.map((d, i) => (
            <DiaryCard key={d.id + d.owner} diary={d} index={i} />
          ))}
        </motion.div>
      )}
    </div>
  );
}

function EmptyState({
  isSearch,
  onWrite,
  onInbox,
}: {
  isSearch: boolean;
  onWrite: () => void;
  onInbox: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 py-16 text-center">
      <div className="mb-3 text-6xl animate-gentle-sway">
        {isSearch ? "🔍" : "📭"}
      </div>
      <h3 className="mb-1 text-lg font-semibold">
        {isSearch ? "没有找到相关日记" : "这里还很空"}
      </h3>
      <p className="mb-5 max-w-sm text-sm text-muted-foreground">
        {isSearch
          ? "换个关键词试试, 或者清空搜索看看全部日记"
          : "写第一篇日记吧, 或者看看有没有漂流而来的信"}
      </p>
      <div className="flex gap-2">
        <Button onClick={onWrite} className="gap-1.5 rounded-full">
          <BookOpen className="h-4 w-4" />
          写一篇日记
        </Button>
        <Button
          variant="outline"
          onClick={onInbox}
          className="gap-1.5 rounded-full"
        >
          <Inbox className="h-4 w-4" />
          漂流收件箱
        </Button>
      </div>
    </div>
  );
}
