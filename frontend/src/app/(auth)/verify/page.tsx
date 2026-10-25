"use client";

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function VerifyPage() {
  const [verifyMethod, setVerifyMethod] = useState<'email' | 'phone'>('email');
  const [step, setStep] = useState<1 | 2>(1); // مرحله ۱: وارد کردن شماره، مرحله ۲: وارد کردن کد
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState<string[]>(Array(6).fill(''));
  const [isVerifying, setIsVerifying] = useState(false);
  const [timer, setTimer] = useState(120);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // شروع تایمر
  const startTimer = () => {
    setTimer(120);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // ارسال کد
  const handleSendCode = () => {
    if (verifyMethod === 'phone' && phone.length < 10) {
      alert('لطفاً یک شماره موبایل معتبر وارد کنید.');
      return;
    }
    setStep(2);
    startTimer();
  };

  const handleChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.join('').length !== 6) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      window.location.href = '/dashboard';
    }, 1500);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'var(--primary)' }}>
          خطیب
        </Link>
      </header>

      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        
        <div style={{
          width: '100%',
          maxWidth: '450px',
          backgroundColor: 'var(--card-bg)',
          backdropFilter: 'blur(10px)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          padding: '40px 30px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--foreground)' }}>تایید حساب کاربری</h1>
            <p style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.6 }}>
              {step === 1 ? 'برای دریافت کد تایید، شماره یا ایمیل خود را وارد کنید.' : 'کد ۶ رقمی ارسال شده را وارد کنید.'}
            </p>
          </div>

          {/* تب‌ها */}
          <div style={{ display: 'flex', backgroundColor: 'var(--card-bg-solid)', borderRadius: '10px', padding: '4px', marginBottom: '30px' }}>
            <button
              onClick={() => { setVerifyMethod('email'); setStep(1); setCode(Array(6).fill('')); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: verifyMethod === 'email' ? 'var(--primary)' : 'transparent', color: verifyMethod === 'email' ? 'white' : 'var(--foreground)', transition: 'all 0.3s' }}
            >
              تایید با ایمیل
            </button>
            <button
              onClick={() => { setVerifyMethod('phone'); setStep(1); setCode(Array(6).fill('')); }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: verifyMethod === 'phone' ? 'var(--primary)' : 'transparent', color: verifyMethod === 'phone' ? 'white' : 'var(--foreground)', transition: 'all 0.3s' }}
            >
              تایید با موبایل
            </button>
          </div>

          {step === 1 ? (
            /* ================= مرحله ۱: دریافت شماره/ایمیل ================= */
            <div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--foreground)' }}>
                  {verifyMethod === 'phone' ? 'شماره موبایل' : 'آدرس ایمیل'}
                </label>
                
                {verifyMethod === 'phone' ? (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input 
                      type="text" 
                      placeholder="912 345 6789" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      style={{ flex: 1, padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', fontSize: '16px', textAlign: 'center' }}
                    />
                    <div style={{ padding: '12px 16px', borderRadius: '10px', backgroundColor: 'var(--card-bg-solid)', color: 'var(--foreground)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                      +98
                    </div>
                  </div>
                ) : (
                  <input 
                    type="email" 
                    placeholder="example@email.com" 
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--input-bg)', color: 'var(--input-text)', fontSize: '16px', textAlign: 'center' }}
                  />
                )}
              </div>

              <button 
                onClick={handleSendCode}
                style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'opacity 0.3s' }}
              >
                ارسال کد تایید
              </button>
            </div>
          ) : (
            /* ================= مرحله ۲: وارد کردن کد ================= */
            <form onSubmit={handleVerify}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px', direction: 'ltr' }}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    style={{
                      width: '50px',
                      height: '60px',
                      borderRadius: '12px',
                      border: '2px solid var(--border-color)',
                      backgroundColor: 'var(--input-bg)',
                      color: 'var(--input-text)',
                      fontSize: '26px',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      outline: 'none',
                      display: 'block',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      padding: 0,
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.2)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-color)'; e.target.style.boxShadow = 'none'; }}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={isVerifying || code.join('').length !== 6}
                style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--primary)', color: 'white', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', opacity: (isVerifying || code.join('').length !== 6) ? 0.5 : 1, transition: 'opacity 0.3s' }}
              >
                {isVerifying ? 'در حال تایید...' : 'تایید و ورود'}
              </button>

              {/* ارسال مجدد و بازگشت */}
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                {timer > 0 ? (
                  <p style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.6 }}>ارسال مجدد تا {formatTime(timer)}</p>
                ) : (
                  <button onClick={startTimer} style={{ fontSize: '14px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>ارسال مجدد کد</button>
                )}
              </div>
              <div style={{ marginTop: '10px', textAlign: 'center' }}>
                <button onClick={() => setStep(1)} style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.6, background: 'none', border: 'none', cursor: 'pointer' }}>← تغییر شماره/ایمیل</button>
              </div>
            </form>
          )}

          <div style={{ marginTop: '30px', textAlign: 'center' }}>
            <Link href="/login" style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.6, textDecoration: 'none' }}>
              بازگشت به صفحه ورود
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}