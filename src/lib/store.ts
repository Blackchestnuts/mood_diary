import { create } from "zustand";

export type ViewKey =
  | "home"
  | "drift"
  | "daily"
  | "mood"
  | "library"
  | "templates";

export type EditorMode = "daily" | "mood" | "drift" | null;

interface SessionInfo {
  id: string;
  nickname: string;
  avatarSeed: string;
}

interface DiarySnippet {
  id: string;
  title: string;
  content: string;
  mood: string;
  type: string;
  status?: string;
  isSample?: boolean;
  templateId?: string | null;
  owner: "me" | "other";
  createdAt: string;
}

interface UIState {
  // 侧边栏
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebar: (open: boolean) => void;

  // 当前主视图
  view: ViewKey;
  setView: (v: ViewKey) => void;

  // 编辑器弹窗
  editorMode: EditorMode;
  openEditor: (mode: EditorMode) => void;
  closeEditor: () => void;

  // 选中的模板 (写心情日记时预设)
  presetTemplateId: string | null;
  setPresetTemplate: (id: string | null) => void;

  // 阅读弹窗
  viewingDiary: DiarySnippet | null;
  openViewer: (d: DiarySnippet) => void;
  closeViewer: () => void;

  // 漂流收件箱弹窗
  driftInboxOpen: boolean;
  openDriftInbox: () => void;
  closeDriftInbox: () => void;

  // 搜索
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // 会话信息
  session: SessionInfo | null;
  setSession: (s: SessionInfo) => void;

  // 刷新触发器(写完日记后刷新列表)
  refreshTick: number;
  triggerRefresh: () => void;
}

export const useUI = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebar: (open) => set({ sidebarOpen: open }),

  view: "home",
  setView: (v) => set({ view: v }),

  editorMode: null,
  openEditor: (mode) => set({ editorMode: mode }),
  closeEditor: () => set({ editorMode: null }),

  presetTemplateId: null,
  setPresetTemplate: (id) => set({ presetTemplateId: id }),

  viewingDiary: null,
  openViewer: (d) => set({ viewingDiary: d }),
  closeViewer: () => set({ viewingDiary: null }),

  driftInboxOpen: false,
  openDriftInbox: () => set({ driftInboxOpen: true }),
  closeDriftInbox: () => set({ driftInboxOpen: false }),

  searchQuery: "",
  setSearchQuery: (q) => set({ searchQuery: q }),

  session: null,
  setSession: (s) => set({ session: s }),

  refreshTick: 0,
  triggerRefresh: () => set((s) => ({ refreshTick: s.refreshTick + 1 })),
}));
