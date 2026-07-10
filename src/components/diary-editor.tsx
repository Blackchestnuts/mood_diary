"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/store";
import { MOODS, moodMeta } from "@/lib/constants";
import { MoodPicker } from "@/components/mood-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  X,
  BookOpen,
  Heart,
  Waves,
  Send,
  Sparkles,
  Check,
  RotateCcw,
  Mail,
} from "lucide-react";
import type { ComponentType } from "react";

interface Template {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  prompts: string;
}

const MODE_META: Record<
  string,
  {
    label: string;
    desc: string;
    icon: ComponentType<{ className?: string }>;
    placeholder: string;
    accent: string;
  }
> = {
  daily: {
    label: "每日日记",
    desc: "记录今天发生的点滴, 无论平淡或惊喜",
    icon: BookOpen,
    placeholder: "今天发生了什么? 让文字替你记住这一天的温度...",
    accent: "#FBBF24",
  },
  mood: {
    label: "心情日记",
    desc: "此刻的心情是什么颜色? 把它写下来",
    icon: Heart,
    placeholder: "此刻的你, 想说什么就说什么...",
    accent: "#F472B6",
  },
  drift: {
    label: "漂流日记",
    desc: "这封信会漂流到一个陌生人手中, Ta 可以选择与你交换",
    icon: Waves,
    placeholder: "给远方的陌生人写一封信吧, 也许你们会因此相遇...",
    accent: "#86EFAC",
  },
};

interface DriftResult {
  myDiary: { id: string; title: string };
  strangerDiary: {
    id: string;
    title: string;
    content: string;
    mood: string;
  } | null;
  exchange: { id: string; status: string } | null;
  message: string;
}

export function DiaryEditor() {
  const {
    editorMode,
    closeEditor,
    presetTemplateId,
    setPresetTemplate,
    triggerRefresh,
    openDriftInbox,
    openViewer,
  } = useUI();
  const { toast } = useToast();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [mood, setMood] = useState("calm");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null
  );
  const [submitting, setSubmitting] = useState(false);
  const [driftResult, setDriftResult] = useState<DriftResult | null>(null);

  // 加载模板
  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []))
      .catch(() => {});
  }, []);

  // 打开编辑器时重置
  useEffect(() => {
    if (editorMode) {
      setTitle("");
      setContent("");
      setMood("calm");
      setSelectedTemplateId(presetTemplateId);
      setDriftResult(null);
    }
  }, [editorMode, presetTemplateId]);

  // 关闭时清空预设模板
  useEffect(() => {
    if (!editorMode) {
      setPresetTemplate(null);
    }
  }, [editorMode, setPresetTemplate]);

  if (!editorMode) return null;
  const meta = MODE_META[editorMode];
  const Icon = meta.icon;

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "内容不能为空",
        description: "先写点什么再寄出吧",
        variant: "destructive",
      });
      return;
    }
    setSubmitting(true);
    try {
      if (editorMode === "drift") {
        const res = await fetch("/api/drift/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            mood,
            type: "drift",
            templateId: selectedTemplateId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setDriftResult(data);
        triggerRefresh();
        toast({
          title: "漂流瓶已投入大海",
          description: data.message,
        });
      } else {
        const res = await fetch("/api/diaries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            content,
            mood,
            type: editorMode,
            templateId: selectedTemplateId,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        triggerRefresh();
        toast({
          title: "日记已保存",
          description: "这天的故事被你温柔地记下了",
        });
        closeEditor();
      }
    } catch (e) {
      toast({
        title: "保存失败",
        description: e instanceof Error ? e.message : "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleExchangeAction = async (action: "accept" | "reject") => {
    if (!driftResult?.exchange) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/drift/exchange/${driftResult.exchange.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      triggerRefresh();
      toast({
        title: action === "accept" ? "交换成功" : "已送回大海",
        description: data.message,
      });
      if (action === "accept" && driftResult.strangerDiary) {
        openViewer({
          ...driftResult.strangerDiary,
          owner: "other",
          type: "drift",
          createdAt: new Date().toISOString(),
        });
      }
      closeEditor();
      openDriftInbox();
    } catch (e) {
      toast({
        title: "操作失败",
        description: e instanceof Error ? e.message : "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const activeTemplate = templates.find((t) => t.id === selectedTemplateId);
  const promptList = activeTemplate
    ? activeTemplate.prompts.split("|").filter(Boolean)
    : [];

  return (
    <AnimatePresence>
      {editorMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4"
          onClick={closeEditor}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88vh] max-h-[760px] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border bg-card shadow-2xl"
          >
            {/* 顶部色带 */}
            <div
              className="h-1.5 w-full"
              style={{ background: meta.accent }}
            />

            {/* 头部 */}
            <div className="flex items-start gap-3 border-b border-border/60 px-6 py-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ background: meta.accent }}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{meta.label}</h2>
                <p className="text-xs text-muted-foreground">{meta.desc}</p>
              </div>
              <button
                onClick={closeEditor}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {driftResult ? (
              /* 漂流结果展示 */
              <DriftResultView
                result={driftResult}
                onAction={handleExchangeAction}
                submitting={submitting}
              />
            ) : (
              /* 编辑器主体 */
              <ScrollArea className="flex-1 scrollbar-gentle">
                <div className="space-y-5 px-6 py-5">
                  {/* 模板选择(仅心情日记) */}
                  {editorMode === "mood" && (
                    <div>
                      <label className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        选择心情模板
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedTemplateId(null)}
                          className={cn(
                            "rounded-full border px-3 py-1.5 text-xs transition",
                            !selectedTemplateId
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-muted-foreground hover:text-foreground"
                          )}
                        >
                          ✍️ 自由书写
                        </button>
                        {templates.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setSelectedTemplateId(t.id)}
                            className={cn(
                              "flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs transition",
                              selectedTemplateId === t.id
                                ? "border-transparent text-foreground shadow-sm"
                                : "border-border text-muted-foreground hover:text-foreground"
                            )}
                            style={
                              selectedTemplateId === t.id
                                ? { backgroundColor: t.color + "66", borderColor: t.color }
                                : undefined
                            }
                          >
                            <span>{t.emoji}</span>
                            <span>{t.name}</span>
                          </button>
                        ))}
                      </div>
                      {activeTemplate && (
                        <div
                          className="mt-3 rounded-xl p-3 text-sm"
                          style={{ backgroundColor: activeTemplate.color + "33" }}
                        >
                          <p className="mb-2 font-medium" style={{ color: "#5a4a3a" }}>
                            {activeTemplate.emoji} {activeTemplate.description}
                          </p>
                          <ul className="space-y-1 text-xs text-muted-foreground">
                            {promptList.map((p, i) => (
                              <li key={i} className="flex gap-1.5">
                                <span style={{ color: meta.accent }}>·</span>
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 心情选择 */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-muted-foreground">
                      此刻的心情
                    </label>
                    <MoodPicker value={mood} onChange={setMood} />
                  </div>

                  {/* 标题 */}
                  <div>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="给这篇日记起个名字(可选)"
                      className="border-none bg-muted/40 px-0 text-lg font-medium shadow-none focus-visible:bg-muted/60 focus-visible:ring-0"
                    />
                  </div>

                  {/* 内容 */}
                  <div>
                    <Textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder={meta.placeholder}
                      className="min-h-[280px] resize-none border-none bg-transparent px-0 text-[15px] leading-7 shadow-none focus-visible:ring-0"
                    />
                  </div>
                </div>
              </ScrollArea>
            )}

            {/* 底部操作栏 */}
            {!driftResult && (
              <div className="flex items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-6 py-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="text-base">{moodMeta(mood).emoji}</span>
                  <span>{content.length} 字</span>
                  {editorMode === "drift" && (
                    <span className="flex items-center gap-1 text-primary/70">
                      <Mail className="h-3 w-3" /> 完全匿名
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={closeEditor} size="sm">
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !content.trim()}
                    size="sm"
                    className="gap-1.5"
                    style={{ background: meta.accent, color: "#3a2a1a" }}
                  >
                    {submitting ? (
                      <>
                        <Sparkles className="h-3.5 w-3.5 animate-spin" />
                        寄出中...
                      </>
                    ) : (
                      <>
                        <Send className="h-3.5 w-3.5" />
                        {editorMode === "drift" ? "投入大海" : "保存日记"}
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DriftResultView({
  result,
  onAction,
  submitting,
}: {
  result: DriftResult;
  onAction: (a: "accept" | "reject") => void;
  submitting: boolean;
}) {
  const stranger = result.strangerDiary;
  return (
    <ScrollArea className="flex-1 scrollbar-gentle">
      <div className="space-y-6 px-6 py-6">
        {/* 成功提示 */}
        <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-accent/30 p-5 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
            <Waves className="h-6 w-6 animate-gentle-sway text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">{result.message}</p>
        </div>

        {stranger ? (
          <>
            <div>
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold">
                  一封陌生人的信漂流到了你手中
                </h3>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-card to-accent/10 p-5">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-2xl">
                    {moodMeta(stranger.mood).emoji}
                  </span>
                  <h4 className="text-lg font-semibold">{stranger.title}</h4>
                </div>
                <p className="whitespace-pre-line text-sm leading-7 text-foreground/80">
                  {stranger.content}
                </p>
                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  <span>来自匿名的旅人 · 不透露任何身份信息</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-muted/40 p-4 text-center">
              <p className="mb-3 text-sm font-medium">
                想和Ta交换日记吗?
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                选择交换后, 你们就能读到彼此的日记, 保存在各自的日记库中
              </p>
              <div className="flex justify-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => onAction("reject")}
                  disabled={submitting}
                  className="gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  送回大海
                </Button>
                <Button
                  onClick={() => onAction("accept")}
                  disabled={submitting}
                  className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Check className="h-4 w-4" />
                  交换日记
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
            大海此刻很安静, 你的信将等待下一位旅人拾起。
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
