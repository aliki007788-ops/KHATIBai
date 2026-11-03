"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguageStore } from "@/stores/languageStore";
import { tUI } from "@/lib/i18n/ui";

interface SidebarProps {
  role?: "user" | "admin";
}

export function Sidebar({ role = "user" }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const lang = useLanguageStore((s) => s.language);

  const userMenu = [
    { name: tUI("dashboard", lang), icon: "📊", href: "/dashboard" },
    { name: tUI("practice", lang), icon: "🎙️", href: "/practice" },
    { name: tUI("video", lang), icon: "🎥", href: "/practice/video" },
    { name: tUI("audience", lang), icon: "👥", href: "/practice/audience" },
    { name: tUI("meeting", lang), icon: "💻", href: "/practice/meeting" },
    { name: tUI("translator", lang), icon: "🌐", href: "/translator" },
    { name: tUI("learn", lang), icon: "🗣️", href: "/learn" },
    { name: tUI("history", lang), icon: "🕒", href: "/history" },
    { name: tUI("progress", lang), icon: "📈", href: "/progress" },
    { name: tUI("paths", lang), icon: "🎓", href: "/paths" },
    { name: tUI("team", lang), icon: "🧑‍🤝‍🧑", href: "/team" },
    { name: tUI("settings", lang), icon: "⚙️", href: "/settings" },
  ];

  const adminMenu = [
    { name: tUI("adminDash", lang), icon: "🛡️", href: "/admin" },
    { name: tUI("adminUsers", lang), icon: "👥", href: "/admin/users" },
    { name: tUI("adminFinance", lang), icon: "💰", href: "/admin/finance" },
    { name: "مدیریت پلن‌ها", icon: "🧩", href: "/admin/plans" },
    { name: "گزارش فعالیت‌ها", icon: "🧾", href: "/admin/audit" },
    { name: tUI("adminContent", lang), icon: "📝", href: "/admin/content" },
    { name: tUI("adminSettings", lang), icon: "⚙️", href: "/admin/settings" },
    { name: tUI("practice", lang), icon: "🎙️", href: "/practice" },
    { name: tUI("dashboard", lang), icon: "📊", href: "/dashboard" },
    { name: tUI("paths", lang), icon: "🎓", href: "/paths" },
    { name: tUI("team", lang), icon: "🧑‍🤝‍🧑", href: "/team" },
  ];

  const menuItems = role === "admin" ? adminMenu : userMenu;
  const currentPath = pathname ?? "";
  const matchingItems = menuItems.filter(
    (item) => currentPath === item.href || currentPath.startsWith(item.href + "/")
  );
  const activeHref = matchingItems.reduce<string | null>(
    (best, item) => (best === null || item.href.length > best.length ? item.href : best),
    null
  );

  return (
    <aside
      className={`h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out navbar-glass border-l border-[var(--border-color)] flex flex-col flex-shrink-0 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        {!isCollapsed && (
          <Link
            href={role === "admin" ? "/admin" : "/dashboard"}
            className="font-bold text-lg bg-gradient-to-l from-[#8b5cf6] to-[#10b981] bg-clip-text text-transparent"
          >
            {tUI("appName", lang)}
          </Link>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((v) => !v)}
          className="p-2 rounded-lg hover:bg-white/5 text-[var(--foreground)]/60"
          aria-label="toggle"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = item.href === activeHref;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-l from-[#8b5cf6]/20 to-transparent border-r-4 border-r-[#8b5cf6] text-[#8b5cf6]"
                  : "text-[var(--foreground)]/60 hover:bg-white/5 hover:text-[var(--foreground)]"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium whitespace-nowrap text-sm">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span className="font-medium text-sm">{tUI("logout", lang)}</span>}
        </Link>
      </div>
    </aside>
  );
}
