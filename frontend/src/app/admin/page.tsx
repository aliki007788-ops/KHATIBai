"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AdminDashboard() {
  // استایل مشترک برای کارت‌ها با استفاده از متغیرهای CSS
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--card-bg)',
    backdropFilter: 'blur(16px)',
    border: '1px solid var(--border-color)',
    borderRadius: '1.5rem',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      <Sidebar role="admin" />

      <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
        <header className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
            پنل مدیریت خطیب
          </h1>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/dashboard"><Button variant="glass">مشاهده سایت</Button></Link>
            <Button className="bg-red-500/20 text-red-500 hover:bg-red-500/30">خروج</Button>
          </div>
        </header>

        {/* کارت‌های آمار با استایل مستقیم */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          {[
            { title: 'کل کاربران', value: '۱۲,۴۵۰', color: 'text-[#8b5cf6]' },
            { title: 'اشتراک فعال', value: '۳,۲۰۰', color: 'text-[#10b981]' },
            { title: 'درآمد ماهانه', value: '۴۵۰,۰۰۰,۰۰۰', color: 'text-[#3b82f6]' },
            { title: 'تمرین امروز', value: '۸۵۰', color: 'text-[#ffd56b]' },
          ].map((stat, i) => (
            <div key={i} style={cardStyle} className="p-6 rounded-2xl">
              <h3 className="text-sm text-[var(--foreground)]/50 mb-2">{stat.title}</h3>
              <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* جدول کاربران با استایل مستقیم */}
        <div style={cardStyle} className="rounded-3xl p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">آخرین کاربران ثبت‌نام شده</h2>
            <Button size="sm" variant="glass">مشاهده همه</Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--foreground)]/50 text-sm">
                  <th className="pb-4 font-medium">نام کاربر</th>
                  <th className="pb-4 font-medium">ایمیل</th>
                  <th className="pb-4 font-medium">نوع اشتراک</th>
                  <th className="pb-4 font-medium">تاریخ عضویت</th>
                  <th className="pb-4 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { name: 'علی رضایی', email: 'ali@example.com', plan: 'حرفه‌ای', date: '۱۴۰۵/۰۷/۲۰', status: 'فعال' },
                  { name: 'سارا محمدی', email: 'sara@example.com', plan: 'رایگان', date: '۱۴۰۵/۰۷/۱۹', status: 'فعال' },
                  { name: 'رضا کریمی', email: 'reza@example.com', plan: 'حرفه‌ای', date: '۱۴۰۵/۰۷/۱۸', status: 'در انتظار پرداخت' },
                  { name: 'مریم حسینی', email: 'maryam@example.com', plan: 'سازمانی', date: '۱۴۰۵/۰۷/۱۵', status: 'فعال' },
                ].map((user, i) => (
                  <tr key={i} className="border-b border-[var(--border-color)]/50 hover:bg-[var(--foreground)]/5 transition-colors">
                    <td className="py-4 font-medium">{user.name}</td>
                    <td className="py-4 text-[var(--foreground)]/60">{user.email}</td>
                    <td className="py-4"><span className="px-3 py-1 rounded-full bg-[#8b5cf6]/20 text-[#8b5cf6] text-xs">{user.plan}</span></td>
                    <td className="py-4 text-[var(--foreground)]/60">{user.date}</td>
                    <td className="py-4"><span className="text-[var(--accent)]">{user.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* دو کارت پایین (مدیریت کاربران و مالی) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <Link href="/admin/users" style={cardStyle} className="p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">مدیریت کاربران</h3>
              <p className="text-sm text-[var(--foreground)]/50">مشاهده و ویرایش کاربران</p>
            </div>
          </Link>

          <Link href="/admin/finance" style={cardStyle} className="p-6 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>
            </div>
            <div>
              <h3 className="text-lg font-bold">مدیریت مالی</h3>
              <p className="text-sm text-[var(--foreground)]/50">تراکنش‌ها و اشتراک‌ها</p>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
}