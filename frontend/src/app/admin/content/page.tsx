"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sidebar } from "@/components/layout/Sidebar";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Skeleton } from "@/components/ui/Skeleton";
import { apiClient } from "@/lib/api/client";
import { endpoints } from "@/lib/api/endpoints";
import { toPersianNumber } from "@/lib/utils/number";
import { BookOpen, MessageSquare, Languages, RefreshCw } from "lucide-react";

interface Level {
  id: string;
  code?: string;
  title?: string;
  name?: string;
  order_index?: number;
  description?: string | null;
}

interface Scenario {
  id: string;
  title: string;
  description?: string | null;
  level_id?: string;
}

const VOCAB_KEY = "khatib_admin_vocab_v1";

type VocabItem = { id: string; word: string; meaning: string; category: string; status: string };

function loadVocab(): VocabItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VOCAB_KEY);
    if (raw) return JSON.parse(raw) as VocabItem[];
  } catch {
    /* ignore */
  }
  return [
    { id: "1", word: "شلونک؟", meaning: "چطوری؟", category: "احوالپرسی", status: "فعال" },
    { id: "2", word: "عافیة", meaning: "سلامتی (بعد از غذا)", category: "اصطلاحات", status: "فعال" },
    { id: "3", word: "چم ساعة؟", meaning: "ساعت چنده؟", category: "سوالات", status: "فعال" },
    { id: "4", word: "هواية", meaning: "خیلی زیاد", category: "قیدها", status: "فعال" },
  ];
}

function saveVocab(items: VocabItem[]) {
  try {
    localStorage.setItem(VOCAB_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<"levels" | "scenarios" | "vocabulary">("levels");
  const [vocab, setVocab] = useState<VocabItem[]>(() => loadVocab());
  const [newWord, setNewWord] = useState({ word: "", meaning: "", category: "" });
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);

  const {
    data: levels,
    isLoading: levelsLoading,
    isError: levelsError,
    refetch: refetchLevels,
  } = useQuery<Level[]>({
    queryKey: ["admin", "learning", "levels"],
    queryFn: async () => (await apiClient.get(endpoints.learning.levels)).data,
  });

  const levelId = selectedLevelId || levels?.[0]?.id || null;

  const {
    data: scenarios,
    isLoading: scenariosLoading,
    refetch: refetchScenarios,
  } = useQuery<Scenario[]>({
    queryKey: ["admin", "learning", "scenarios", levelId],
    queryFn: async () => (await apiClient.get(endpoints.learning.scenarios(levelId!))).data,
    enabled: !!levelId,
  });

  const addVocab = () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) return;
    const next = [
      ...vocab,
      {
        id: String(Date.now()),
        word: newWord.word.trim(),
        meaning: newWord.meaning.trim(),
        category: newWord.category.trim() || "عمومی",
        status: "فعال",
      },
    ];
    setVocab(next);
    saveVocab(next);
    setNewWord({ word: "", meaning: "", category: "" });
  };

  const toggleVocab = (id: string) => {
    const next = vocab.map((v) =>
      v.id === id ? { ...v, status: v.status === "فعال" ? "غیرفعال" : "فعال" } : v
    );
    setVocab(next);
    saveVocab(next);
  };

  const removeVocab = (id: string) => {
    const next = vocab.filter((v) => v.id !== id);
    setVocab(next);
    saveVocab(next);
  };

  const tabs = [
    { id: "levels" as const, label: "سطوح یادگیری", icon: BookOpen },
    { id: "scenarios" as const, label: "سناریوها", icon: MessageSquare },
    { id: "vocabulary" as const, label: "واژگان عراقی", icon: Languages },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar role="admin" />

      <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
              مدیریت محتوا
            </h1>
            <p className="text-[var(--foreground)]/50 mt-1">
              سطوح و سناریوها از دیتابیس واقعی · واژگان فعلاً محلی
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                activeTab === tab.id
                  ? "border-[#8b5cf6] bg-[#8b5cf6]/15 text-[#c4b5fd]"
                  : "border-[var(--border-color)] hover:bg-white/5"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "levels" && (
          <div className="glass-panel rounded-2xl border border-[var(--border-color)] p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">سطوح یادگیری (API واقعی)</h2>
              <button
                type="button"
                onClick={() => refetchLevels()}
                className="text-xs flex items-center gap-1 text-[var(--foreground)]/50 hover:text-[var(--foreground)]"
              >
                <RefreshCw className="w-3.5 h-3.5" /> بروزرسانی
              </button>
            </div>
            {levelsLoading && <Skeleton className="h-32 rounded-xl" />}
            {levelsError && (
              <p className="text-sm text-red-400">بارگذاری سطوح ممکن نشد. دسترسی ادمین و بک‌اند را بررسی کنید.</p>
            )}
            {levels && levels.length === 0 && (
              <p className="text-sm text-[var(--foreground)]/50">هنوز سطحی در دیتابیس ثبت نشده است.</p>
            )}
            <div className="grid gap-3">
              {levels?.map((lv, i) => (
                <div
                  key={lv.id}
                  className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                >
                  <div>
                    <div className="font-medium">
                      {lv.title || lv.name || lv.code || lv.id}
                    </div>
                    {lv.description && (
                      <p className="text-xs text-[var(--foreground)]/50 mt-0.5">{lv.description}</p>
                    )}
                  </div>
                  <span className="text-xs text-[var(--foreground)]/40">
                    #{toPersianNumber(lv.order_index ?? i + 1)}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-[var(--foreground)]/40 mt-4">
              ویرایش/افزودن سطح نیاز به endpoint ادمین دارد و در مرحله بعد اضافه می‌شود.
            </p>
          </div>
        )}

        {activeTab === "scenarios" && (
          <div className="glass-panel rounded-2xl border border-[var(--border-color)] p-6 space-y-4">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <h2 className="font-bold">سناریوها (API واقعی)</h2>
              <div className="flex items-center gap-2">
                <select
                  value={levelId ?? ""}
                  onChange={(e) => setSelectedLevelId(e.target.value || null)}
                  className="rounded-lg bg-white/10 border border-white/10 px-3 py-1.5 text-sm"
                >
                  {(levels ?? []).map((lv) => (
                    <option key={lv.id} value={lv.id}>
                      {lv.title || lv.name || lv.code || lv.id}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => refetchScenarios()}
                  className="text-xs flex items-center gap-1 text-[var(--foreground)]/50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            {scenariosLoading && <Skeleton className="h-24 rounded-xl" />}
            {!scenariosLoading && (!scenarios || scenarios.length === 0) && (
              <p className="text-sm text-[var(--foreground)]/50">برای این سطح سناریویی نیست.</p>
            )}
            <div className="grid gap-3">
              {scenarios?.map((sc) => (
                <div
                  key={sc.id}
                  className="rounded-xl bg-white/5 border border-white/10 px-4 py-3"
                >
                  <div className="font-medium">{sc.title}</div>
                  {sc.description && (
                    <p className="text-xs text-[var(--foreground)]/50 mt-1">{sc.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "vocabulary" && (
          <div className="glass-panel rounded-2xl border border-[var(--border-color)] p-6 space-y-4">
            <h2 className="font-bold">واژگان عراقی (ذخیره محلی مرورگر)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                placeholder="کلمه"
                value={newWord.word}
                onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              />
              <input
                placeholder="معنی"
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              />
              <input
                placeholder="دسته"
                value={newWord.category}
                onChange={(e) => setNewWord({ ...newWord, category: e.target.value })}
                className="rounded-lg bg-white/10 border border-white/10 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={addVocab}
                className="rounded-lg bg-[#8b5cf6]/20 border border-[#8b5cf6]/40 text-sm px-3 py-2"
              >
                افزودن
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[var(--foreground)]/50 text-right border-b border-white/10">
                    <th className="pb-2 font-medium">کلمه</th>
                    <th className="pb-2 font-medium">معنی</th>
                    <th className="pb-2 font-medium">دسته</th>
                    <th className="pb-2 font-medium">وضعیت</th>
                    <th className="pb-2 font-medium"></th>
                  </tr>
                </thead>
                <tbody>
                  {vocab.map((v) => (
                    <tr key={v.id} className="border-b border-white/5">
                      <td className="py-2">{v.word}</td>
                      <td className="py-2 text-[var(--foreground)]/70">{v.meaning}</td>
                      <td className="py-2 text-xs">{v.category}</td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => toggleVocab(v.id)}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            v.status === "فعال"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-white/10 text-[var(--foreground)]/40"
                          }`}
                        >
                          {v.status}
                        </button>
                      </td>
                      <td className="py-2">
                        <button
                          type="button"
                          onClick={() => removeVocab(v.id)}
                          className="text-xs text-red-400/80 hover:text-red-400"
                        >
                          حذف
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-[var(--foreground)]/40">
              واژگان فعلاً فقط در مرورگر ذخیره می‌شود. برای همگام‌سازی بین ادمین‌ها نیاز به API جدا است.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
