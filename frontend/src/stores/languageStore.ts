"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Language } from "@/features/practice/constants";

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: "fa",
      setLanguage: (language) => set({ language }),
    }),
    { name: "khatib-language" }
  )
);
