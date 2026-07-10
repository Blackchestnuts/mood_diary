"use client";

import { useUI, type ViewKey, type EditorMode } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  Home,
  Waves,
  BookOpen,
  Heart,
  Library,
  LayoutTemplate,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
} from "lucide-react";

type NavAction =
  | { type: "view"; key: ViewKey; label: string; desc: string; icon: React.ComponentType<{ className?: string }> }
  | { type: "editor"; mode: EditorMode; label: string; desc: string; icon: React.ComponentType<{ className?: string }> };

const NAV_ITEMS: NavAction[] = [
  { type: "view", key: "home", label: "主页", desc: "回到温暖的家", icon: Home },
  { type: "editor", mode: "drift", label: "漂流日记", desc: "把心事放进大海", icon: Waves },
  { type: "editor", mode: "daily", label: "每日日记", desc: "记录今天的故事", icon: BookOpen },
  { type: "editor", mode: "mood", label: "心情日记", desc: "跟着心情写一写", icon: Heart },
  { type: "view", key: "library", label: "我的日记库", desc: "你写的与收到的", icon: Library },
  { type: "view", key: "templates", label: "心情模板", desc: "找一种写法", icon: LayoutTemplate },
];

export function AppSidebar() {
  const {
    sidebarOpen,
    toggleSidebar,
    view,
    setView,
    openEditor,
    session,
    openDriftInbox,
  } = useUI();

  return (
    <aside
      className={cn(
        "relative z-20 flex h-full flex-col bg-sidebar/80 backdrop-blur-xl transition-all duration-300 ease-out",
        sidebarOpen ? "w-64" : "w-[68px]"
      )}
    >
      {/* 顶部 Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/90 to-accent text-primary-foreground shadow-sm">
          <Sparkles className="h-5 w-5" />
        </div>
        {sidebarOpen && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-base font-semibold leading-tight text-gradient-warm">
              心情日记
            </span>
            <span className="text-[11px] text-muted-foreground">
              写给大海的一封信
            </span>
          </div>
        )}
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-7 z-30 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:text-primary hover:shadow-md"
        aria-label={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="h-3.5 w-3.5" />
        ) : (
          <PanelLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* 导航 */}
      <nav className="flex-1 space-y-1 px-2 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = item.type === "view" && view === item.key;
          const handleClick = () => {
            if (item.type === "view") setView(item.key);
            else openEditor(item.mode);
          };
          return (
            <button
              key={item.label}
              onClick={handleClick}
              title={sidebarOpen ? undefined : item.label}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                active
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform",
                  active && "scale-110"
                )}
              />
              {sidebarOpen && (
                <span className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium leading-tight">
                    {item.label}
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {item.desc}
                  </span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* 漂流收件箱快捷入口 */}
      <div className="px-2 pb-2">
        <button
          onClick={openDriftInbox}
          title={sidebarOpen ? undefined : "漂流收件箱"}
          className="flex w-full items-center gap-3 rounded-xl border border-dashed border-primary/30 bg-primary/5 px-3 py-2.5 text-left text-primary transition hover:bg-primary/10"
        >
          <Waves className="h-5 w-5 shrink-0 animate-gentle-sway" />
          {sidebarOpen && (
            <span className="flex flex-col">
              <span className="text-sm font-medium">漂流收件箱</span>
              <span className="text-[11px] text-primary/70">
                看看谁给你写了信
              </span>
            </span>
          )}
        </button>
      </div>

      {/* 匿名身份卡 */}
      <div className="border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-xl bg-card/60 p-2.5",
            !sidebarOpen && "justify-center"
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-primary/60 text-sm">
            🦌
          </div>
          {sidebarOpen && (
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs text-muted-foreground">
                你是
              </span>
              <span className="truncate text-sm font-medium">
                {session?.nickname ?? "匿名旅人"}
              </span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
