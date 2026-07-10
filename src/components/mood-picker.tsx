"use client";

import { MOODS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface MoodPickerProps {
  value: string;
  onChange: (mood: string) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {MOODS.map((m) => {
        const active = value === m.key;
        return (
          <button
            key={m.key}
            type="button"
            onClick={() => onChange(m.key)}
            className={cn(
              "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
              active
                ? "border-transparent text-foreground shadow-sm"
                : "border-border bg-card/50 text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
            style={
              active
                ? { backgroundColor: m.color + "55", borderColor: m.color }
                : undefined
            }
          >
            <span className="text-base">{m.emoji}</span>
            <span className="font-medium">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}
