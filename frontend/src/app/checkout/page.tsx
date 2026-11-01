"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function CheckoutPage() {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const plans = {
    monthly: { title: 'اشتراک ماهانه', price: '۲۹۹,۰۰۰', period: 'ماه', discount: 0, total: '۲۹۹,۰۰۰' },
    yearly: { title: 'اشتراک سالانه', price: '۲,۸۷۰,۰۰۰', period: 'سال', discount: 20, total: '۲,۲۹۶,۰۰۰' },
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // شبیه‌سازی ارتباط با درگاه پرداخت
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      // هدایت به صفحه نتیجه پس از ۳ ثانیه
      setTimeout(() => {
        window.location.href = '/payment-result';
      }, 3000);
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
        <div className="glass-panel p-12 rounded-[3rem] text-center max-w-md w-full animate-fade-in border-t-4 border-t-[var(--accent)]">
          <div className="w-24 h-24 bg-[var(--accent)]/20 rounded-full flex items-center justify-center mx-auto mb-8 text-[var(--accent)]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-12 h-12">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">پرداخت موفق!</h2>
          <p className="text-[var(--foreground)]/60 mb-8">اشتراک شما با موفقیت فعال شد. در حال انتقال به داشبورد...</p>
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[var(--accent)] animate-[width_3s_ease-in-out_forwards]" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col">
      
      {/* هدر */}
      <header className="w-full navbar-glass sticky top-0 z-50 px-6 h-16 flex items-center justify-between border-b border-[var(--border-color)]">
        <Link href="/pricing" className="text-sm text-[var(--foreground)]/50 hover:text-[var(--primary)] transition-colors">
          → بازگشت به تعرفه‌ها
        </Link>
        <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
          تکمیل خرید
        </h1>
        <ThemeToggle />
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8 mt-8">
        
        {/* ستون راست: انتخاب پلن */}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-6">۱. انتخاب پلن</h2>
          <div className="space-y-4">
            {Object.entries(plans).map(([key, plan]) => (
              <div 
                key={key}
                onClick={() => setSelectedPlan(key as 'monthly' | 'yearly')}
                className={`glass-panel p-6 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden ${
                  selectedPlan === key ? 'border-2 border-[var(--primary)] shadow-[0_0_20px_rgba(139,92,246,0.2)]' : 'border border-[var(--border-color)] hover:border-white/20'
                }`}
              >
                {key === 'yearly' && (
                  <div className="absolute top-0 right-0 bg-[var(--accent)] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                    ۲۰٪ تخفیف
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedPlan === key ? 'border-[var(--primary)]' : 'border-white/30'}`}>
                      {selectedPlan === key && <div className="w-3 h-3 rounded-full bg-[var(--primary)]"></div>}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">{plan.title}</h3>
                      <p className="text-sm text-[var(--foreground)]/50">دسترسی کامل به تمام امکانات استودیو</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold">{plan.price} <span className="text-sm font-normal text-[var(--foreground)]/50">تومان / {plan.period}</span></div>
                    {plan.discount > 0 && <div className="text-sm text-[var(--accent)] line-through">{plan.price} تومان</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <h2 className="text-2xl font-bold mb-6 mt-12">۲. اطلاعات پرداخت</h2>
          <form onSubmit={handlePayment} className="glass-panel p-8 rounded-3xl space-y-6">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">شماره کارت</label>
              <input 
                type="text" 
                placeholder="XXXX - XXXX - XXXX - XXXX" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-[var(--primary)] transition-colors font-mono tracking-widest"
                required
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">تاریخ انقضا</label>
                <input 
                  type="text" 
                  placeholder="MM/YY" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
                  required
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)]/70 mb-2">CVV2</label>
                <input 
                  type="password" 
                  placeholder="***" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center focus:outline-none focus:border-[var(--primary)] transition-colors font-mono"
                  required
                  maxLength={4}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              size="lg" 
              className="w-full mt-4 py-4 rounded-xl text-lg shadow-[0_0_30px_rgba(139,92,246,0.3)]"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  در حال اتصال به درگاه...
                </span>
              ) : (
                `پرداخت امن ${plans[selectedPlan].total} تومان`
              )}
            </Button>
            <p className="text-center text-xs text-[var(--foreground)]/40 flex items-center justify-center gap-1 mt-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              پرداخت امن با رمزنگاری SSL
            </p>
          </form>
        </div>

        {/* ستون چپ: خلاصه سفارش */}
        <div className="w-full lg:w-96">
          <div className="glass-panel p-8 rounded-3xl sticky top-24 border-t-4 border-t-[var(--primary)]">
            <h3 className="text-xl font-bold mb-6">خلاصه سفارش</h3>
            <div className="space-y-4 text-sm mb-6 border-b border-white/10 pb-6">
              <div className="flex justify-between">
                <span className="text-[var(--foreground)]/60">پلن انتخابی</span>
                <span className="font-medium">{plans[selectedPlan].title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--foreground)]/60">قیمت پایه</span>
                <span className="font-medium">{plans[selectedPlan].price} تومان</span>
              </div>
              {plans[selectedPlan].discount > 0 && (
                <div className="flex justify-between text-[var(--accent)]">
                  <span>تخفیف</span>
                  <span>{plans[selectedPlan].discount}٪</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--foreground)]/60">مالیات (۹٪)</span>
                <span className="font-medium">۰ تومان</span>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold">مبلغ قابل پرداخت</span>
              <span className="text-2xl font-black text-[var(--primary)]">{plans[selectedPlan].total} <span className="text-sm font-normal text-[var(--foreground)]/50">تومان</span></span>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 text-xs text-[var(--foreground)]/60 leading-relaxed">
              با تکمیل این خرید، شما با <Link href="/terms" className="text-[var(--primary)] hover:underline">قوانین و مقررات</Link> خطیب موافقت می‌کنید. اشتراک شما به صورت خودکار تمدید نخواهد شد.
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}