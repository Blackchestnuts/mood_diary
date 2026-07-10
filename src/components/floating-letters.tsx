"use client";

import { useMemo } from "react";

const LETTER_EMOJIS = ["💌", "📝", "🍃", "🌸", "✉️", "📜", "🌿", "💭"];
const PAPER_COLORS = [
  "oklch(0.95 0.04 55 / 0.5)",
  "oklch(0.93 0.04 150 / 0.45)",
  "oklch(0.94 0.05 25 / 0.5)",
  "oklch(0.95 0.03 80 / 0.4)",
];

interface Letter {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  rotate: number;
  opacity: number;
  kind: "emoji" | "paper";
  emoji?: string;
  color?: string;
}

export function FloatingLetters() {
  const letters = useMemo<Letter[]>(() => {
    const arr: Letter[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const kind: "emoji" | "paper" = Math.random() > 0.55 ? "emoji" : "paper";
      arr.push({
        id: i,
        left: Math.random() * 100,
        size: 20 + Math.random() * 36,
        duration: 22 + Math.random() * 28,
        delay: -Math.random() * 30,
        drift: (Math.random() - 0.5) * 120,
        rotate: (Math.random() - 0.5) * 40,
        opacity: 0.25 + Math.random() * 0.35,
        kind,
        emoji: kind === "emoji" ? LETTER_EMOJIS[Math.floor(Math.random() * LETTER_EMOJIS.length)] : undefined,
        color: kind === "paper" ? PAPER_COLORS[Math.floor(Math.random() * PAPER_COLORS.length)] : undefined,
      });
    }
    return arr;
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 overflow-hidden z-0"
    >
      {letters.map((l) => (
        <div
          key={l.id}
          className="absolute bottom-0"
          style={{
            left: `${l.left}%`,
            // @ts-expect-error custom props
            "--letter-drift": `${l.drift}px`,
            "--letter-rotate": `${l.rotate}deg`,
            "--letter-opacity": l.opacity,
            animation: `float-letter ${l.duration}s linear ${l.delay}s infinite`,
          }}
        >
          {l.kind === "emoji" ? (
            <span
              style={{ fontSize: `${l.size}px`, filter: "grayscale(0.1)" }}
            >
              {l.emoji}
            </span>
          ) : (
            <div
              style={{
                width: `${l.size * 0.7}px`,
                height: `${l.size}px`,
                background: l.color,
                borderRadius: "2px",
                boxShadow: "0 4px 12px oklch(0.5 0.05 50 / 0.1)",
              }}
              className="relative"
            >
              {/* 信纸折痕 */}
              <div className="absolute inset-x-1 top-2 h-px bg-current opacity-20" />
              <div className="absolute inset-x-1 top-4 h-px bg-current opacity-15" />
              <div className="absolute inset-x-1 top-6 h-px bg-current opacity-10" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
