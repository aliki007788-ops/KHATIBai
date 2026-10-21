"use client";

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { useAuthStore } from '@/stores/authStore';

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  
  // تشخیص خودکار: اگر مسیر با /admin شروع شود یا کاربر نقش ادمین داشته باشد
  const isAdminPath = pathname.startsWith('/admin');
  const role = (user?.role === 'admin' || isAdminPath) ? 'admin' : 'user';

  return (
    <div className="flex min-h-screen bg-[var(--background)]" dir="rtl">
      <Sidebar role={role} />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}