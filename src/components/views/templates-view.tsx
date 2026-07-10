"use client";

import { motion } from "framer-motion";
import { useUI } from "@/lib/store";
import { useTemplates } from "@/hooks/use-diaries";
import type { Template } from "@/hooks/use-diaries";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, Sparkles } from "lucide-react";

export function TemplatesView() {
  const { templates, loading } = useTemplates();
  const { openEditor, setPresetTemplate } = useUI();

  const handleUse = (t: Template) => {
    setPresetTemplate(t.id);
    openEditor("mood");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">心情模板</h1>
          <p className="text-sm text-muted-foreground">
            不知道写什么? 选一个模板, 跟着引导把心情写下来
          </p>
        </div>
        <Button
          onClick={() => {
            setPresetTemplate(null);
            openEditor("mood");
          }}
          className="gap-1.5 rounded-full"
        >
          <Heart className="h-4 w-4" />
          自由书写
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[200px] animate-pulse rounded-2xl border bg-card/50"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t, i) => {
            const prompts = t.prompts.split("|").filter(Boolean);
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.06, 0.4) }}
                whileHover={{ y: -4 }}
                className="group flex flex-col overflow-hidden rounded-3xl border bg-card shadow-sm transition-shadow hover:shadow-md"
                style={{ borderColor: t.color + "55" }}
              >
                <div
                  className="flex items-center gap-3 px-5 py-4"
                  style={{ background: t.color + "33" }}
                >
                  <span className="text-3xl transition-transform group-hover:scale-110">
                    {t.emoji}
                  </span>
                  <div>
                    <h3 className="text-base font-bold" style={{ color: "#5a4a3a" }}>
                      {t.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {t.description}
                    </p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="mb-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Sparkles className="h-3.5 w-3.5" />
                    引导提示
                  </div>
                  <ul className="mb-5 flex-1 space-y-2">
                    {prompts.map((p, idx) => (
                      <li
                        key={idx}
                        className="flex gap-2 text-sm leading-relaxed text-foreground/80"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                          style={{ background: t.color }}
                        />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    onClick={() => handleUse(t)}
                    className="gap-1.5 rounded-full"
                    style={{ background: t.color, color: "#3a2a1a" }}
                  >
                    用这个模板写
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
