"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/store";
import { moodMeta } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { X, Trash2, Waves, BookOpen, Heart, Mail, Sparkles } from "lucide-react";
import { useState } from "react";
import type { ComponentType } from "react";

const TYPE_ICON: Record<string, ComponentType<{ className?: string }>> = {
  daily: BookOpen,
  mood: Heart,
  drift: Waves,
};

function formatFull(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "long",
  });
}

export function DiaryViewer() {
  const { viewingDiary, closeViewer, triggerRefresh } = useUI();
  const { toast } = useToast();
  const [deleting, setDeleting] = useState(false);

  if (!viewingDiary) return null;
  const mood = moodMeta(viewingDiary.mood);
  const Icon = TYPE_ICON[viewingDiary.type] ?? BookOpen;
  const isOther = viewingDiary.owner === "other";

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/diaries/${viewingDiary.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      triggerRefresh();
      toast({ title: "日记已删除", description: "这页故事被轻轻翻过去了" });
      closeViewer();
    } catch (e) {
      toast({
        title: "删除失败",
        description: e instanceof Error ? e.message : "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AnimatePresence>
      {viewingDiary && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeViewer}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[85vh] max-h-[720px] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl"
          >
            {/* 顶部心情色带 */}
            <div className="h-1.5 w-full" style={{ background: mood.color }} />

            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                  style={{ background: mood.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{mood.emoji}</span>
                    <span className="text-sm font-medium text-muted-foreground">
                      {mood.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFull(viewingDiary.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeViewer}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 scrollbar-gentle">
              <div className="px-6 pb-6">
                {isOther && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-primary/5 px-4 py-2.5 text-xs text-primary/80">
                    <Mail className="h-3.5 w-3.5" />
                    <span>
                      这是一封漂流而来的信 · 来自完全匿名的旅人 · 除非Ta在信中透露
                    </span>
                  </div>
                )}
                <h1 className="mb-4 text-2xl font-bold leading-tight">
                  {viewingDiary.title}
                </h1>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-line text-[15px] leading-8 text-foreground/90">
                    {viewingDiary.content}
                  </p>
                </div>

                {/* 装饰 */}
                <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground/40">
                  <div className="h-px w-12 bg-current" />
                  <Sparkles className="h-3 w-3" />
                  <div className="h-px w-12 bg-current" />
                </div>
              </div>
            </ScrollArea>

            {/* 底部操作 */}
            {!isOther && (
              <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3">
                <span className="text-xs text-muted-foreground">
                  这是你的日记
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  删除
                </Button>
              </div>
            )}
            {isOther && (
              <div className="flex items-center justify-center gap-1.5 border-t border-border/60 bg-muted/20 px-6 py-3 text-xs text-muted-foreground">
                <Sparkles className="h-3 w-3" />
                <span>愿这封信温柔地陪伴你</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
