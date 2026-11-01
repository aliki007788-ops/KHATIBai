"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useLanguageStore } from "@/stores/languageStore";
import { tUI } from "@/lib/i18n/ui";

export function BottomNav() {
  const pathname = usePathname();
  const lang = useLanguageStore((s) => s.language);

  const ITEMS = [
    { href: "/dashboard", label: tUI("home", lang), icon: "🏠" },
    { href: "/practice", label: tUI("practice", lang), icon: "🎙️" },
    { href: "/practice/audience", label: tUI("audience", lang), icon: "👥" },
    { href: "/progress", label: tUI("progress", lang), icon: "📈" },
    { href: "/settings", label: tUI("profile", lang), icon: "👤" },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-[var(--border-color)] bg-[var(--background)]/95 backdrop-blur py-2 md:hidden pb-[env(safe-area-inset-bottom)]">
      {ITEMS.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-[10px] min-w-[3.2rem] px-0.5",
              active ? "text-[#8b5cf6]" : "text-[var(--foreground)]/50"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="truncate max-w-[4.2rem] text-center leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
