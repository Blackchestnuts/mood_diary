"use client";

import { motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { useDiaries, useTemplates } from "@/hooks/use-diaries";
import { DiaryCard } from "@/components/diary-card";
import { Button } from "@/components/ui/button";
import {
  Waves,
  BookOpen,
  Heart,
  ArrowRight,
  Sparkles,
  Mail,
  Library,
} from "lucide-react";

export function HomeView() {
  const { openEditor, setView, openDriftInbox } = useUI();
  const { allDiaries, exchangedDiaries } = useDiaries();
  const { templates } = useTemplates();

  const recent = allDiaries.slice(0, 4);
  const hour = new Date().getHours();
  const greeting =
    hour < 6
      ? "夜深了, 还没睡吗"
      : hour < 12
      ? "早安, 今天也要好好开始"
      : hour < 14
      ? "午安, 记得吃饭"
      : hour < 18
      ? "下午好, 给自己一杯茶吧"
      : hour < 22
      ? "晚上好, 今天辛苦了"
      : "夜安, 把心事放下吧";

  const cards = [
    {
      key: "drift" as const,
      title: "漂流日记",
      desc: "把心事装进信封, 让它漂流到一个陌生人手中",
      icon: Waves,
      gradient: "from-emerald-200/60 via-teal-100/40 to-cyan-100/30",
      accent: "#10b981",
      onClick: () => openEditor("drift"),
    },
    {
      key: "daily" as const,
      title: "每日日记",
      desc: "今天的故事, 值得被温柔地记下来",
      icon: BookOpen,
      gradient: "from-amber-200/60 via-orange-100/40 to-yellow-100/30",
      accent: "#f59e0b",
      onClick: () => openEditor("daily"),
    },
    {
      key: "mood" as const,
      title: "心情日记",
      desc: "此刻的心情是什么颜色? 选个模板写下来",
      icon: Heart,
      gradient: "from-rose-200/60 via-pink-100/40 to-fuchsia-100/30",
      accent: "#ec4899",
      onClick: () => openEditor("mood"),
    },
  ];

  return (
    <div className="space-y-10">
      {/* Hero 问候 */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/8 via-accent/15 to-secondary/40 p-8 paper-texture"
      >
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-card/70 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" />
            <span>这里是一个安全的角落, 一切都匿名</span>
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {greeting}
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            写下今天的心情, 让它漂流到大海的某个角落。
            也许是某个陌生人在某个夜晚, 拾起了你的一封信。
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button
              onClick={() => openEditor("daily")}
              className="gap-1.5 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <BookOpen className="h-4 w-4" />
              开始今天的日记
            </Button>
            <Button
              variant="outline"
              onClick={openDriftInbox}
              className="gap-1.5 rounded-full border-primary/30 bg-card/60 backdrop-blur"
            >
              <Mail className="h-4 w-4 text-primary" />
              漂流收件箱
              {exchangedDiaries.length > 0 && (
                <span className="ml-1 rounded-full bg-primary px-1.5 text-[10px] text-primary-foreground">
                  {exchangedDiaries.length}
                </span>
              )}
            </Button>
          </div>
        </div>
        {/* 装饰大字 */}
        <div className="pointer-events-none absolute -right-4 -top-4 select-none text-[120px] opacity-[0.06] sm:text-[160px]">
          💌
        </div>
      </motion.section>

      {/* 三大入口 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">写点什么吧</h2>
            <p className="text-sm text-muted-foreground">
              三种方式, 选择此刻最想表达的那一种
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.button
                key={c.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                onClick={c.onClick}
                className={`group relative overflow-hidden rounded-3xl border bg-gradient-to-br ${c.gradient} p-6 text-left transition-shadow hover:shadow-lg`}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-card/80 shadow-sm backdrop-blur transition-transform group-hover:scale-110"
                  style={{ color: c.accent }}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-1.5 text-lg font-bold text-foreground">
                  {c.title}
                </h3>
                <p className="mb-4 text-sm leading-relaxed text-foreground/70">
                  {c.desc}
                </p>
                <div
                  className="flex items-center gap-1 text-sm font-medium transition-transform group-hover:translate-x-1"
                  style={{ color: c.accent }}
                >
                  <span>开始写</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
                {/* 装饰图标 */}
                <div className="pointer-events-none absolute -bottom-3 -right-3 text-7xl opacity-10 transition-transform group-hover:rotate-12">
                  {c.key === "drift" ? "🌊" : c.key === "daily" ? "📖" : "🌸"}
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* 最近的日记 */}
      {recent.length > 0 && (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="text-xl font-semibold">最近的故事</h2>
              <p className="text-sm text-muted-foreground">
                你写下的, 和漂流而来的
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("library")}
              className="gap-1 text-muted-foreground"
            >
              <Library className="h-4 w-4" />
              查看全部
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((d, i) => (
              <DiaryCard key={d.id} diary={d} index={i} compact />
            ))}
          </div>
        </section>
      )}

      {/* 心情模板预览 */}
      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold">心情模板</h2>
            <p className="text-sm text-muted-foreground">
              不知从何写起? 选一个模板试试
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setView("templates")}
            className="gap-1 text-muted-foreground"
          >
            查看全部
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {templates.slice(0, 4).map((t) => (
            <TemplateMiniCard key={t.id} template={t} />
          ))}
        </div>
      </section>
    </div>
  );
}

function TemplateMiniCard({ template }: { template: { id: string; name: string; emoji: string; color: string; description: string } }) {
  const { openEditor, setPresetTemplate } = useUI();
  return (
    <button
      onClick={() => {
        setPresetTemplate(template.id);
        openEditor("mood");
      }}
      className="group flex flex-col items-start rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:border-primary/40 hover:shadow-md"
      style={{ backgroundColor: template.color + "22" }}
    >
      <span className="mb-2 text-3xl transition-transform group-hover:scale-110">
        {template.emoji}
      </span>
      <span className="text-sm font-semibold">{template.name}</span>
      <span className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
        {template.description}
      </span>
    </button>
  );
}
