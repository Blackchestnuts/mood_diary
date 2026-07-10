"use client";

import { useEffect, useState, useCallback } from "react";
import { useUI, type DiarySnippet } from "@/lib/store";

export interface Template {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
  prompts: string;
  category: string;
  sortOrder: number;
}

interface DiariesData {
  myDiaries: DiarySnippet[];
  exchangedDiaries: DiarySnippet[];
}

export function useDiaries() {
  const { refreshTick, searchQuery } = useUI();
  const [data, setData] = useState<DiariesData>({
    myDiaries: [],
    exchangedDiaries: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<DiarySnippet[] | null>(
    null
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/diaries");
      const d = (await res.json()) as DiariesData;
      setData(d);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshTick]);

  // 搜索
  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/diaries/search?q=${encodeURIComponent(q)}`
        );
        const d = await res.json();
        setSearchResults(d.results ?? []);
      } catch {
        setSearchResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [searchQuery, refreshTick]);

  return {
    myDiaries: data.myDiaries,
    exchangedDiaries: data.exchangedDiaries,
    allDiaries: [...data.myDiaries, ...data.exchangedDiaries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ),
    loading,
    searchResults,
  };
}

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/templates")
      .then((r) => r.json())
      .then((d) => {
        setTemplates(d.templates ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return { templates, loading };
}
