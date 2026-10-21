"use client";

import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

export default function DashboardPage() {
  const user = { name: 'علی', plan: 'حرفه‌ای' };

  return (
    <AppShell>
      <section className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">سلام {user.name} عزیز 👋</h1>
        <p className="text-[var(--foreground)]/60 text-lg">آماده‌ای تا امروز صدای خودت رو متحول کنی؟</p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/practice" className="glass-panel p-8 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] border border-[var(--border-color)]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-3xl">🎙️</span>
          </div>
          <h3 className="text-xl font-bold mb-2">استودیوی سخنرانی</h3>
          <p className="text-sm text-[var(--foreground)]/60">شروع یک جلسه تمرین زنده با بازخورد هوش مصنوعی</p>
        </Link>

        <Link href="/translator" className="glass-panel p-8 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] border border-[var(--border-color)]">
          <div className="w-16 h-16 rounded-2xl bg-[#10b981] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-3xl">🌐</span>
          </div>
          <h3 className="text-xl font-bold mb-2">مترجم زنده</h3>
          <p className="text-sm text-[var(--foreground)]/60">ترجمه همزمان صوتی بین فارسی و عراقی</p>
        </Link>

        <Link href="/learn" className="glass-panel p-8 rounded-[2rem] group hover:-translate-y-2 transition-all duration-300 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] border border-[var(--border-color)]">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#10b981] flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
            <span className="text-3xl">🗣️</span>
          </div>
          <h3 className="text-xl font-bold mb-2">آموزش عراقی</h3>
          <p className="text-sm text-[var(--foreground)]/60">ادامه یادگیری لهجه اصیل عراقی</p>
        </Link>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-8 rounded-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">پیشرفت سخنرانی</h3>
            <span className="text-sm text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full">+۵٪ این هفته</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-white/10" />
                <circle cx="64" cy="64" r="56" stroke="url(#gradient)" strokeWidth="12" fill="transparent" strokeDasharray="351.8" strokeDashoffset="70.3" className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute text-2xl font-bold">۸۰٪</div>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--foreground)]/60">اعتماد به نفس</span><span className="text-[#8b5cf6]">عالی</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#8b5cf6] w-[85%]"></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="text-[var(--foreground)]/60">وضوح کلام</span><span className="text-[#3b82f6]">خوب</span></div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-[#3b82f6] w-[75%]"></div></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-[2rem]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">آخرین فعالیت‌ها</h3>
            <Link href="/history" className="text-sm text-[var(--primary)] hover:underline">مشاهده همه</Link>
          </div>
          <div className="space-y-4">
            {[
              { icon: '🎙️', title: 'تمرین سخنرانی: ارائه شغلی', time: '۲ ساعت پیش', score: '۹۰' },
              { icon: '🌐', title: 'ترجمه زنده: مکالمه تجاری', time: 'دیروز', score: 'عالی' },
              { icon: '🗣️', title: 'درس ۵: احوالپرسی عراقی', time: '۲ روز پیش', score: '۸۵' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xl">{item.icon}</div>
                  <div>
                    <div className="font-medium text-sm">{item.title}</div>
                    <div className="text-xs text-[var(--foreground)]/40">{item.time}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-[var(--accent)]">{item.score}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}