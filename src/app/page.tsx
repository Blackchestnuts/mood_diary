"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "@/lib/store";
import { FloatingLetters } from "@/components/floating-letters";
import { AppSidebar } from "@/components/app-sidebar";
import { DiaryEditor } from "@/components/diary-editor";
import { DiaryViewer } from "@/components/diary-viewer";
import { DriftInbox } from "@/components/drift-inbox";
import { HomeView } from "@/components/views/home-view";
import { LibraryView } from "@/components/views/library-view";
import { TemplatesView } from "@/components/views/templates-view";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Search,
  Sparkles,
  Heart,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const {
    view,
    session,
    setSession,
    sidebarOpen,
    searchQuery,
    setSearchQuery,
    setView,
  } = useUI();

  // 初始化匿名会话
  useEffect(() => {
    fetch("/api/session")
      .then((r) => r.json())
      .then((d) => setSession(d))
      .catch(() => {});
  }, [setSession]);

  return (
    <div className="relative flex min-h-screen flex-col bg-background">
      <FloatingLetters />

      {/* 顶部栏(移动端) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">导航菜单</SheetTitle>
            <SheetDescription className="sr-only">
              选择要访问的功能页面
            </SheetDescription>
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-base font-semibold text-gradient-warm">
            心情日记
          </span>
        </div>
        <button
          onClick={() => setView("library")}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <Search className="h-4 w-4" />
        </button>
      </header>

      <div className="relative z-10 flex flex-1">
        {/* 桌面端侧边栏 */}
        <div className="hidden lg:block">
          <AppSidebar />
        </div>

        {/* 主内容区 */}
        <main className="flex-1 overflow-x-hidden">
          {/* 桌面端顶部搜索栏 */}
          <div className="hidden items-center gap-3 border-b border-border/40 bg-background/60 px-8 py-4 backdrop-blur lg:flex">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value && view !== "library") setView("library");
                }}
                onFocus={() => {
                  if (searchQuery && view !== "library") setView("library");
                }}
                placeholder="搜索你的日记..."
                className="h-10 rounded-full border-border/50 bg-card/70 pl-10 pr-4 text-sm shadow-sm"
              />
            </div>
            <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-primary animate-soft-pulse" />
              <span className="hidden xl:inline">
                你是 <span className="font-medium text-foreground">{session?.nickname ?? "匿名旅人"}</span>
              </span>
            </div>
          </div>

          {/* 视图内容 */}
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                {view === "home" && <HomeView />}
                {view === "library" && <LibraryView />}
                {view === "templates" && <TemplatesView />}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* 页脚 */}
      <footer className="relative z-10 mt-auto border-t border-border/40 bg-background/60 px-4 py-5 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 text-center sm:flex-row sm:text-left">
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="animate-gentle-sway">💌</span>
            <span>心情日记 · 写给大海的一封信</span>
          </p>
          <p className="text-xs text-muted-foreground">
            完全匿名 · 你的心事只属于你和那个有缘人
          </p>
        </div>
      </footer>

      {/* 弹窗 */}
      <DiaryEditor />
      <DiaryViewer />
      <DriftInbox />
    </div>
  );
}
