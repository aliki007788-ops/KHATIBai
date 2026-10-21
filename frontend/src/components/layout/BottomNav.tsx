"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const ITEMS = [
  { href: "/dashboard", label: "خانه", icon: "🏠" },
  { href: "/practice", label: "تمرین", icon: "🎙️" },
  { href: "/coach", label: "مربی", icon: "💬" },
  { href: "/learn", label: "یادگیری", icon: "📚" },
  { href: "/settings", label: "پروفایل", icon: "👤" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-gray-200 bg-white py-2 md:hidden">
      {ITEMS.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-0.5 text-xs",
              active ? "text-blue-600" : "text-gray-500"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
