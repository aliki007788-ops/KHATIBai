"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/features/auth/hooks";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--background)]/80 backdrop-blur-md px-4 py-3 md:px-6">
      {/* سمت راست: خوش آمدید */}
      <div className="text-sm text-[var(--foreground)]/60">
        خوش آمدید،{" "}
        <span className="font-semibold text-[var(--foreground)]">
          {user?.name || user?.email || "کاربر"}
        </span>
      </div>

      {/* سمت چپ: دکمه تم، آواتار و خروج */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium hidden md:block">
          پلن: <span className="text-[var(--accent)]">{user?.plan || "رایگان"}</span>
        </span>
        
        <ThemeToggle />

        <Link href="/settings">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:scale-105 transition-transform text-sm">
            {(user?.name?.charAt(0) || user?.email?.charAt(0) || "U").toUpperCase()}
          </div>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => logout.mutate()}
          loading={logout.isPending}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
          خروج
        </Button>
      </div>
    </header>
  );
}