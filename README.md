# 💌 心情日记 · 写给大海的一封信

一款温柔的心情日记应用 —— 写下今天的心情，让它漂流到一个陌生人的手中。完全匿名，随机相遇。

## ✨ 功能特性

### 三种日记模式
- **📖 每日日记** — 记录今天发生的点滴，无论平淡或惊喜
- **🌸 心情日记** — 跟着心情写一写，8 种心情模板带引导提示（今日小确幸、深夜独白、雨天心情、阳光灿烂、旅行记忆、成长手记、思念的信、自由书写）
- **🌊 漂流日记** — 把心事装进信封，让它漂流到一个陌生人手中

### 漂流交换（核心特色）
- 写好的日记投入"大海"，随机漂流到一个陌生人手中
- 同时会收到一封陌生人的漂流信
- 可选择 **交换日记**（双方互看）或 **送回大海**
- 交换后的日记保存在各自的日记库中
- **完全匿名**：不暴露作者任何身份信息，除非信中自己透露

### 其他
- 🔍 全文搜索自己的日记（标题 + 内容）
- 🏷️ 多维筛选（类型 / 心情）
- 📚 日记库（我写的 / 交换来的 / 全部）
- 🎨 温柔治愈的视觉设计 + 漂浮信纸动画
- 📱 完全响应式，支持移动端

## 🛠️ 技术栈

- **框架**：Next.js 16 (App Router) + TypeScript 5
- **样式**：Tailwind CSS 4 + shadcn/ui
- **数据库**：Prisma ORM + SQLite
- **动画**：Framer Motion
- **状态管理**：Zustand

## 🚀 本地运行

```bash
# 1. 安装依赖
bun install

# 2. 初始化数据库（推送 schema）
bun run db:push

# 3. 播种数据（心情模板 + 示例漂流日记池）
bun run prisma/seed.ts

# 4. 启动开发服务器
bun run dev
```

访问 http://localhost:3000 即可。

## 📁 项目结构

```
src/
├── app/
│   ├── api/                  # 后端 API 路由
│   │   ├── diaries/          # 日记 CRUD + 搜索
│   │   ├── drift/            # 漂流发送 / 收件箱 / 交换
│   │   ├── templates/        # 心情模板
│   │   └── session/          # 匿名会话
│   ├── page.tsx              # 主页面（单路由）
│   ├── layout.tsx
│   └── globals.css           # 温柔配色 + 漂浮动画
├── components/
│   ├── app-sidebar.tsx       # 可折叠侧边栏
│   ├── diary-editor.tsx      # 日记编辑器（含漂流结果）
│   ├── diary-viewer.tsx      # 日记阅读弹窗
│   ├── drift-inbox.tsx       # 漂流收件箱
│   ├── floating-letters.tsx  # 漂浮信纸动画
│   ├── mood-picker.tsx       # 心情选择器
│   └── views/                # 主页 / 日记库 / 模板视图
├── lib/
│   ├── constants.ts          # 心情选项 / 匿名昵称生成
│   ├── db.ts                 # Prisma 客户端
│   ├── session.ts            # 匿名会话管理
│   └── store.ts              # Zustand 全局状态
└── hooks/
    └── use-diaries.ts        # 日记数据 hook

prisma/
├── schema.prisma             # 数据模型：Session / Diary / DriftExchange / MoodTemplate
└── seed.ts                   # 种子数据
```

## 🔒 隐私说明

- 基于 cookie 的匿名会话，自动生成随机昵称（如"远方小鹿""听风鲸鱼"）
- 漂流日记的 API 响应**完全不包含作者 ID 或任何身份字段**
- 交换来的日记标注"来自远方 · 漂流而来 · 完全匿名"
- 除非日记内容中自己透露，否则无法得知对方身份

## 📝 数据模型

- **Session** — 匿名会话（昵称 + avatarSeed）
- **Diary** — 日记（标题/内容/心情/类型/状态/作者）
- **DriftExchange** — 漂流交换记录（diaryA 发起方 + diaryB 陌生人方 + 状态）
- **MoodTemplate** — 心情模板

---

> 愿这封信温柔地陪伴你 🌿
