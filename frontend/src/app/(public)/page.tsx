import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { PublicHeader } from '@/components/public/PublicHeader';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen relative overflow-hidden bg-[var(--background)]">
      
      {/* ================= نورپردازی پس‌زمینه ================= */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] bg-[#8b5cf6] rounded-full filter blur-[250px] animate-pulse-glow"
          style={{ opacity: 'var(--bg-glow-opacity, 0.3)' as any, mixBlendMode: 'screen' }}
        ></div>
        <div 
          className="absolute top-[10%] right-[-10%] w-[700px] h-[700px] bg-[#3b82f6] rounded-full filter blur-[200px] animate-pulse-glow"
         style={{ opacity: 'var(--bg-glow-opacity, 0.3)' as any, mixBlendMode: 'screen', animationDelay: '2s' }}
        ></div>
        <div 
          className="absolute bottom-[0%] left-[-10%] w-[500px] h-[500px] bg-[#10b981] rounded-full filter blur-[200px] animate-pulse-glow"
          style={{ opacity: 'var(--bg-glow-opacity, 0.2)' as any, mixBlendMode: 'var(--bg-glow-blend, screen)' as any, animationDelay: '4s' }}
        ></div>
        
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>
      </div>

      <PublicHeader />
      
      {/* ================= ۱. بخش قهرمان (Hero Section) - لوکس و نرم ================= */}
      <section className="relative pt-56 pb-40 px-4 sm:px-6 lg:px-8 z-10">
        <div className="relative max-w-4xl mx-auto text-center">
          <span className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-white/5 text-[var(--primary)] text-sm font-medium mb-12 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-pulse"></span>
            نسل جدید آموزش زبان و سخنرانی
          </span>
          
          {/* تیتر با فونت نرم‌تر و گرادیانت یکپارچه */}
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight mb-8 leading-[1.2] text-[var(--foreground)]">
            صدای خود را با <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c4b5fd] via-[#a78bfa] to-[#60a5fa] drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              استودیوی خطیب
            </span>
            <br />
            متحول کنید
          </h1>
          
          <p className="mt-8 text-lg md:text-xl text-[var(--foreground)]/50 max-w-2xl mx-auto mb-16 leading-relaxed font-light">
            مربی سخنرانی هوشمند، آموزش زبان عراقی و مترجم آنلاین. تجربه‌ای کاملاً تعاملی و انتزاعی برای رشد مهارت‌های کلامی شما.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto px-10 py-4 text-lg rounded-full font-medium shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                شروع رایگان استودیو
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="glass" size="lg" className="w-full sm:w-auto px-10 py-4 text-lg rounded-full font-medium bg-white/5 hover:bg-white/10 border-white/10">
                مشاهده پلن‌ها
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= ۲. بخش دموی زنده ================= */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto glass-panel p-12 rounded-[3rem] text-center border-white/5 shadow-2xl">
          <h2 className="text-3xl font-semibold mb-4">همین حالا امتحان کنید</h2>
          <p className="text-[var(--foreground)]/50 mb-12 font-light">یک جمله بگویید و ببینید هوش مصنوعی ما چگونه آن را تحلیل می‌کند.</p>
          
          <div className="flex items-center justify-center gap-2 mb-12 h-20">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-1.5 bg-gradient-to-t from-[#8b5cf6] to-[#3b82f6] rounded-full animate-pulse" style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s`, opacity: 0.4 + Math.random() * 0.6 }}></div>
            ))}
          </div>
          
          <Button size="lg" className="rounded-full px-12 py-5 text-lg font-medium shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            🎤 شروع ضبط و تحلیل زنده
          </Button>
        </div>
      </section>

      {/* ================= ۳. بخش امکانات ================= */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">یک اکوسیستم کامل</h2>
            <p className="text-[var(--foreground)]/50 text-lg font-light">هر آنچه برای تبدیل شدن به یک سخنران حرفه‌ای نیاز دارید.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-10 rounded-[2rem] group hover:-translate-y-2 transition-all duration-500 hover:bg-white/5 border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🎙️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">مربی سخنرانی</h3>
              <p className="text-[var(--foreground)]/50 leading-relaxed font-light">صحبت کنید و در همان لحظه بازخورد دقیق درباره لحن و اعتماد به نفس خود دریافت کنید.</p>
            </div>

            <div className="glass-panel p-10 rounded-[2rem] group hover:-translate-y-2 transition-all duration-500 hover:bg-white/5 border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#3b82f6] flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🗣️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">آموزش عراقی</h3>
              <p className="text-[var(--foreground)]/50 leading-relaxed font-light">مکالمه با لهجه اصیل عراقی. با سناریوهای واقعی، زبان را طبیعی یاد بگیرید.</p>
            </div>

            <div className="glass-panel p-10 rounded-[2rem] group hover:-translate-y-2 transition-all duration-500 hover:bg-white/5 border-white/5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center mb-8 shadow-[0_0_20px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl">🌐</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">مترجم آنلاین</h3>
              <p className="text-[var(--foreground)]/50 leading-relaxed font-light">ترجمه همزمان و دقیق بین فارسی و عراقی. با درک لحن و اصطلاحات محلی.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ۴. بخش آمار ================= */}
      <section className="py-24 border-y border-white/5 relative z-10 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-4xl font-semibold text-[#a78bfa] mb-2">+۱۰,۰۰۰</div>
              <div className="text-[var(--foreground)]/50 font-light">کاربر فعال</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-[#10b981] mb-2">۹۴٪</div>
              <div className="text-[var(--foreground)]/50 font-light">رضایت کاربران</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-[#60a5fa] mb-2">+۵۰,۰۰۰</div>
              <div className="text-[var(--foreground)]/50 font-light">تمرین انجام شده</div>
            </div>
            <div>
              <div className="text-4xl font-semibold text-[#a78bfa] mb-2">۲۴/۷</div>
              <div className="text-[var(--foreground)]/50 font-light">پشتیبانی هوشمند</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= ۵. فوتر ================= */}
      <footer className="py-16 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 text-center md:text-right">
            <div className="col-span-1 md:col-span-2">
              <span className="text-2xl font-bold text-[var(--foreground)] mb-4 block">خطیب</span>
              <p className="text-[var(--foreground)]/40 max-w-sm mx-auto md:mx-0 font-light">استودیوی هوشمند سخنرانی، آموزش زبان عراقی و مترجم آنلاین.</p>
            </div>
            <div>
              <h4 className="font-medium mb-4">محصولات</h4>
              <ul className="space-y-3 text-[var(--foreground)]/50 font-light">
                <li><Link href="/pricing" className="hover:text-white transition-colors">تعرفه‌ها</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">درباره ما</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">قانونی</h4>
              <ul className="space-y-3 text-[var(--foreground)]/50 font-light">
                <li><Link href="/privacy" className="hover:text-white transition-colors">حریم خصوصی</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">قوانین</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center text-[var(--foreground)]/30 text-sm border-t border-white/5 pt-8 font-light">
            © {new Date().getFullYear()} خطیب. تمامی حقوق محفوظ است.
          </div>
        </div>
      </footer>
    </div>
  );
}