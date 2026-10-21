"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'lessons' | 'scenarios' | 'vocabulary'>('lessons');

  // داده‌های نمونه
  const lessons = [
    { id: 1, title: 'درس ۱: احوالپرسی عراقی', level: 'مبتدی', duration: '۱۵ دقیقه', status: 'منتشر شده', icon: '👋' },
    { id: 2, title: 'درس ۲: خرید و بازار', level: 'مبتدی', duration: '۲۰ دقیقه', status: 'منتشر شده', icon: '🛒' },
    { id: 3, title: 'درس ۳: مکالمات تجاری', level: 'پیشرفته', duration: '۳۰ دقیقه', status: 'پیش‌نویس', icon: '💼' },
    { id: 4, title: 'درس ۴: اصطلاحات رایج', level: 'متوسط', duration: '۲۵ دقیقه', status: 'منتشر شده', icon: '🗣️' },
  ];

  const scenarios = [
    { id: 1, title: 'ارائه شغلی در مصاحبه', category: 'سخنرانی حرفه‌ای', duration: '۵ دقیقه', status: 'فعال' },
    { id: 2, title: 'سخنرانی در همایش', category: 'سخنرانی عمومی', duration: '۱۰ دقیقه', status: 'فعال' },
    { id: 3, title: 'مکالمه در رستوران', category: 'زبان عراقی', duration: '۳ دقیقه', status: 'غیرفعال' },
  ];

  const vocabulary = [
    { id: 1, word: 'شلونک؟', meaning: 'چطوری؟', category: 'احوالپرسی', status: 'فعال' },
    { id: 2, word: 'عافیة', meaning: 'سلامتی (بعد از غذا)', category: 'اصطلاحات', status: 'فعال' },
    { id: 3, word: 'چم ساعة؟', meaning: 'ساعت چنده؟', category: 'سوالات', status: 'فعال' },
    { id: 4, word: 'هواية', meaning: 'خیلی زیاد', category: 'قیدها', status: 'فعال' },
  ];

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      {/* سایدبار اول (در RTL سمت راست) */}
      <Sidebar role="admin" />

      {/* محتوای اصلی */}
      <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
              مدیریت محتوا
            </h1>
            <p className="text-[var(--foreground)]/50 mt-1">مدیریت دروس، سناریوهای سخنرانی و واژگان</p>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/admin"><Button variant="glass">← بازگشت</Button></Link>
          </div>
        </header>

        {/* تب‌ها */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'lessons', label: 'دروس زبان عراقی', icon: '📚' },
            { id: 'scenarios', label: 'سناریوهای سخنرانی', icon: '🎙️' },
            { id: 'vocabulary', label: 'واژگان مترجم', icon: '📖' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-2xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-[var(--primary)] text-white shadow-lg' 
                  : 'glass-panel hover:bg-white/10 text-[var(--foreground)]/70'
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ============ تب دروس ============ */}
        {activeTab === 'lessons' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">دروس زبان عراقی</h2>
              <Button size="sm" className="gap-2"><span>+</span> افزودن درس</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => (
                <div key={lesson.id} className="glass-panel p-6 rounded-2xl hover:border-[var(--primary)] transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-2xl shadow-lg">
                      {lesson.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{lesson.title}</h3>
                      <div className="flex gap-3 text-xs text-[var(--foreground)]/50 mb-3">
                        <span>📊 {lesson.level}</span>
                        <span>⏱️ {lesson.duration}</span>
                        <span className={lesson.status === 'منتشر شده' ? 'text-[var(--accent)]' : 'text-yellow-500'}>
                          ● {lesson.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">ویرایش</button>
                        <button className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">حذف</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============ تب سناریوها ============ */}
        {activeTab === 'scenarios' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">سناریوهای سخنرانی</h2>
              <Button size="sm" className="gap-2"><span>+</span> افزودن سناریو</Button>
            </div>
            <div className="glass-panel rounded-3xl p-8 overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="border-b border-white/10 text-[var(--foreground)]/50 text-sm">
                    <th className="pb-4 font-medium">عنوان</th>
                    <th className="pb-4 font-medium">دسته‌بندی</th>
                    <th className="pb-4 font-medium">مدت</th>
                    <th className="pb-4 font-medium">وضعیت</th>
                    <th className="pb-4 font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {scenarios.map((sc) => (
                    <tr key={sc.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 font-medium">{sc.title}</td>
                      <td className="py-4 text-[var(--foreground)]/60">{sc.category}</td>
                      <td className="py-4 text-[var(--foreground)]/60">{sc.duration}</td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs ${sc.status === 'فعال' ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-red-500/10 text-red-400'}`}>
                          {sc.status}
                        </span>
                      </td>
                      <td className="py-4">
                        <button className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 ml-2 transition-colors">ویرایش</button>
                        <button className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">حذف</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============ تب واژگان ============ */}
        {activeTab === 'vocabulary' && (
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">واژگان مترجم عراقی</h2>
              <Button size="sm" className="gap-2"><span>+</span> افزودن کلمه</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {vocabulary.map((word) => (
                <div key={word.id} className="glass-panel p-6 rounded-2xl text-center hover:border-[var(--primary)] transition-all">
                  <div className="text-2xl font-bold mb-2 text-[#8b5cf6]">{word.word}</div>
                  <div className="text-sm text-[var(--foreground)]/70 mb-3">{word.meaning}</div>
                  <div className="text-xs text-[var(--foreground)]/40 mb-4">{word.category}</div>
                  <div className="flex gap-2 justify-center">
                    <button className="text-xs px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">ویرایش</button>
                    <button className="text-xs px-3 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}