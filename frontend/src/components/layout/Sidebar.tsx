"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  role?: 'user' | 'admin';
}

export function Sidebar({ role = 'user' }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const userMenu = [
    { name: 'داشبورد', icon: '📊', href: '/dashboard' },
    { name: 'استودیوی سخنرانی', icon: '🎙️', href: '/practice' },
    { name: 'مترجم زنده', icon: '🌐', href: '/translator' },
    { name: 'آموزش عراقی', icon: '🗣️', href: '/learn' },
    { name: 'تاریخچه', icon: '🕒', href: '/history' },
    { name: 'پیشرفت من', icon: '📈', href: '/progress' },
    { name: 'تنظیمات', icon: '⚙️', href: '/settings' },
  ];

  const adminMenu = [
    { name: 'داشبورد ادمین', icon: '🛡️', href: '/admin' },
    { name: 'مدیریت کاربران', icon: '👥', href: '/admin/users' },
    { name: 'مدیریت مالی', icon: '💰', href: '/admin/finance' },
    { name: 'مدیریت محتوا', icon: '📝', href: '/admin/content' },
    { name: 'تنظیمات سیستم', icon: '⚙️', href: '/admin/settings' },
  ];

  const menuItems = role === 'admin' ? adminMenu : userMenu;

  return (
    <aside 
      // استفاده از sticky به جای fixed تا محتوا را هل دهد
      className={`h-screen sticky top-0 z-40 transition-all duration-300 ease-in-out navbar-glass border-l border-[var(--border-color)] flex flex-col flex-shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="h-16 flex items-center justify-between px-4 border-b border-[var(--border-color)]">
        {!isCollapsed && (
          <Link href={role === 'admin' ? '/admin' : '/dashboard'} className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
            خطیب {role === 'admin' && '(مدیر)'}
          </Link>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-6 h-6 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-l from-[#8b5cf6]/20 to-transparent border-r-4 border-r-[#8b5cf6] text-[#8b5cf6]' 
                  : 'text-[var(--foreground)]/60 hover:bg-white/5 hover:text-[var(--foreground)]'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[var(--border-color)]">
        <Link href="/" className="flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors">
          <span className="text-xl">🚪</span>
          {!isCollapsed && <span className="font-medium">خروج از حساب</span>}
        </Link>
      </div>
    </aside>
  );
}