"use client";

import { useEffect, useState } from "react";
import { useLanguageStore } from "@/stores/languageStore";
import { tUI } from "@/lib/i18n/ui";

export function RegisterSW() {
  const [deferred, setDeferred] = useState<Event | null>(null);
  const [show, setShow] = useState(false);
  const [offline, setOffline] = useState(false);
  const lang = useLanguageStore((s) => s.language);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    setOffline(!navigator.onLine);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  const install = async () => {
    const e = deferred as unknown as {
      prompt: () => Promise<void>;
      userChoice: Promise<{ outcome: string }>;
    };
    if (!e?.prompt) return;
    await e.prompt();
    setShow(false);
    setDeferred(null);
  };

  return (
    <>
      {offline && (
        <div className="fixed top-0 inset-x-0 z-[100] bg-amber-600 text-white text-center text-xs py-1">
          {tUI("offlineHint", lang)}
        </div>
      )}
      {show && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0b0f1a]/95 backdrop-blur px-4 py-3 shadow-xl">
          <span className="text-sm">{tUI("installApp", lang)}</span>
          <button
            type="button"
            onClick={install}
            className="text-xs rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#10b981] px-3 py-1.5"
          >
            {tUI("installApp", lang)}
          </button>
          <button type="button" onClick={() => setShow(false)} className="text-xs text-white/50">
            ×
          </button>
        </div>
      )}
    </>
  );
}
