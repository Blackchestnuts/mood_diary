"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/store";
import { moodMeta } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  X,
  Waves,
  Mail,
  Check,
  RotateCcw,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";

interface Exchange {
  id: string;
  status: string;
  createdAt: string;
  resolvedAt: string | null;
  strangerDiary: {
    id: string;
    title: string;
    content: string;
    mood: string;
    type: string;
    isSample: boolean;
    createdAt: string;
    owner: "other";
  };
  myDiary: {
    id: string;
    title: string;
    mood: string;
    type: string;
    createdAt: string;
    owner: "me";
  };
}

export function DriftInbox() {
  const { driftInboxOpen, closeDriftInbox, openViewer, triggerRefresh } = useUI();
  const { toast } = useToast();
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [loading, setLoading] = useState(false);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/drift/inbox");
      const data = await res.json();
      setExchanges(data.exchanges ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (driftInboxOpen) load();
  }, [driftInboxOpen, load]);

  const handleAction = async (exchangeId: string, action: "accept" | "reject") => {
    setActingId(exchangeId);
    try {
      const res = await fetch(`/api/drift/exchange/${exchangeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      triggerRefresh();
      toast({
        title: action === "accept" ? "交换成功" : "已送回大海",
        description: data.message,
      });
      await load();
    } catch (e) {
      toast({
        title: "操作失败",
        description: e instanceof Error ? e.message : "请稍后再试",
        variant: "destructive",
      });
    } finally {
      setActingId(null);
    }
  };

  const pending = exchanges.filter((e) => e.status === "pending");
  const accepted = exchanges.filter((e) => e.status === "accepted");
  const rejected = exchanges.filter((e) => e.status === "rejected");

  return (
    <AnimatePresence>
      {driftInboxOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeDriftInbox}
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
            <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary/60" />

            {/* 头部 */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-sm">
                  <Inbox className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">漂流收件箱</h2>
                  <p className="text-xs text-muted-foreground">
                    {pending.length > 0
                      ? `${pending.length} 封信等待你的回应`
                      : "暂无待处理的漂流信"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeDriftInbox}
                className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 scrollbar-gentle">
              <div className="space-y-6 px-6 pb-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    <span className="text-sm">正在打捞漂流瓶...</span>
                  </div>
                ) : exchanges.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <Waves className="h-8 w-8 animate-gentle-sway text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">大海很安静</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      写一封漂流日记, 投入大海看看
                    </p>
                  </div>
                ) : (
                  <>
                    {pending.length > 0 && (
                      <Section
                        title="等待回应"
                        icon={<Mail className="h-3.5 w-3.5" />}
                      >
                        {pending.map((e) => (
                          <ExchangeCard
                            key={e.id}
                            exchange={e}
                            onAction={handleAction}
                            acting={actingId === e.id}
                            onRead={() =>
                              openViewer({
                                ...e.strangerDiary,
                                type: "drift",
                              })
                            }
                          />
                        ))}
                      </Section>
                    )}

                    {accepted.length > 0 && (
                      <Section
                        title="已交换的信"
                        icon={<Check className="h-3.5 w-3.5" />}
                      >
                        {accepted.map((e) => (
                          <ExchangeCard
                            key={e.id}
                            exchange={e}
                            onAction={handleAction}
                            acting={actingId === e.id}
                            onRead={() =>
                              openViewer({
                                ...e.strangerDiary,
                                type: "drift",
                              })
                            }
                          />
                        ))}
                      </Section>
                    )}

                    {rejected.length > 0 && (
                      <Section
                        title="已送回大海"
                        icon={<RotateCcw className="h-3.5 w-3.5" />}
                        muted
                      >
                        {rejected.map((e) => (
                          <ExchangeCard
                            key={e.id}
                            exchange={e}
                            onAction={handleAction}
                            acting={actingId === e.id}
                            onRead={() =>
                              openViewer({
                                ...e.strangerDiary,
                                type: "drift",
                              })
                            }
                          />
                        ))}
                      </Section>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  icon,
  children,
  muted,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div>
      <div
        className={cn(
          "mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide",
          muted ? "text-muted-foreground/60" : "text-primary"
        )}
      >
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function ExchangeCard({
  exchange,
  onAction,
  acting,
  onRead,
}: {
  exchange: Exchange;
  onAction: (id: string, a: "accept" | "reject") => void;
  acting: boolean;
  onRead: () => void;
}) {
  const mood = moodMeta(exchange.strangerDiary.mood);
  const isPending = exchange.status === "pending";
  const isAccepted = exchange.status === "accepted";
  const isRejected = exchange.status === "rejected";

  return (
    <div
      className="rounded-2xl border p-4 transition"
      style={{
        borderColor: isRejected ? undefined : mood.color + "40",
        background: isRejected ? undefined : mood.color + "0d",
        opacity: isRejected ? 0.55 : 1,
      }}
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-lg">{mood.emoji}</span>
        <h4 className="flex-1 truncate text-sm font-semibold">
          {exchange.strangerDiary.title}
        </h4>
        {isAccepted && (
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
            <Check className="h-3 w-3" /> 已交换
          </span>
        )}
        {isRejected && (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            <RotateCcw className="h-3 w-3" /> 已送回
          </span>
        )}
      </div>
      <p
        className={cn(
          "mb-3 line-clamp-2 whitespace-pre-line text-xs leading-relaxed text-muted-foreground"
        )}
      >
        {exchange.strangerDiary.content}
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onRead}
          className="h-7 gap-1 text-xs"
        >
          <Sparkles className="h-3 w-3" />
          读全文
        </Button>
        {isPending && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction(exchange.id, "reject")}
              disabled={acting}
              className="h-7 gap-1 text-xs"
            >
              <RotateCcw className="h-3 w-3" />
              送回大海
            </Button>
            <Button
              size="sm"
              onClick={() => onAction(exchange.id, "accept")}
              disabled={acting}
              className="ml-auto h-7 gap-1 bg-primary text-primary-foreground text-xs hover:bg-primary/90"
            >
              <Check className="h-3 w-3" />
              交换日记
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
