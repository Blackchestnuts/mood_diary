import { randomBytes } from "crypto";

// 随机匿名昵称素材
const ANON_PREFIXES = [
  "匿名", "远方", "路过的", "沉默的", "温柔的", "迷路的", "听风的",
  "看云的", "数星星的", "等雨的", "拾光的", "漫游的", "发呆的", "散步的",
  "梦里", "云端的", "森林里的", "海边", "夜空下的",
];
const ANON_CREATURES = [
  "小鹿", "鲸鱼", "猫咪", "狐狸", "海豚", "考拉", "刺猬", "水母",
  "萤火虫", "蝴蝶", "猫头鹰", "企鹅", "小熊", "兔子", "燕子", "海龟",
  "松鼠", "柴犬", "鹦鹉", "锦鲤",
];

export function randomNickname(): string {
  const p = ANON_PREFIXES[Math.floor(Math.random() * ANON_PREFIXES.length)];
  const c = ANON_CREATURES[Math.floor(Math.random() * ANON_CREATURES.length)];
  return `${p}${c}`;
}

export function randomAvatarSeed(): string {
  return randomBytes(8).toString("hex");
}

// 心情选项
export const MOODS = [
  { key: "happy", label: "开心", emoji: "😊", color: "#FCD34D" },
  { key: "calm", label: "平静", emoji: "🌿", color: "#86EFAC" },
  { key: "grateful", label: "感恩", emoji: "🙏", color: "#FBBF24" },
  { key: "excited", label: "兴奋", emoji: "✨", color: "#F472B6" },
  { key: "thoughtful", label: "深思", emoji: "💭", color: "#C4B5FD" },
  { key: "sad", label: "难过", emoji: "🌧️", color: "#93C5FD" },
  { key: "anxious", label: "焦虑", emoji: "🍂", color: "#FCA5A5" },
  { key: "angry", label: "生气", emoji: "🔥", color: "#F87171" },
] as const;

export type MoodKey = (typeof MOODS)[number]["key"];

export function moodMeta(key: string) {
  return MOODS.find((m) => m.key === key) ?? MOODS[1];
}

// 日记类型
export const DIARY_TYPES = {
  daily: { label: "每日日记", emoji: "📖" },
  mood: { label: "心情日记", emoji: "🌸" },
  drift: { label: "漂流日记", emoji: "漂流瓶" },
} as const;
