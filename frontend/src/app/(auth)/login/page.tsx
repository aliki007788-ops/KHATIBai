"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authService } from '@/features/auth/auth.service';
import { useAuthStore } from '@/stores/authStore';
import { getErrorMessage } from '@/lib/api/errors';

export default function LoginPage() {
  // اطلاعات پیش‌فرض برای تست (بعداً می‌توانید پاک کنید)
  const [email, setEmail] = useState('test@khatib.com');
  const [password, setPassword] = useState('Test1234!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ۱. ارسال درخواست لاگین به بک‌اند
      const tokenResponse = await authService.login({ email, password });
      
      // ۲. ذخیره موقت توکن برای دریافت اطلاعات کاربر
      useAuthStore.getState().setAccessToken(tokenResponse.access_token);
      const user = await authService.me();
      
      // ۳. ذخیره اطلاعات در استور
      setSession(user, tokenResponse.access_token);
      
      // ۴. هدایت به داشبورد
      router.push('/dashboard');
      
    } catch (err: any) {
      // ۵. استفاده از تابع getErrorMessage برای نمایش پیام خطای مناسب
      setError(getErrorMessage(err));
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', color: 'var(--foreground)', display: 'flex', flexDirection: 'column' }}>
      
      <header style={{ padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', textDecoration: 'none', color: 'var(--primary)' }}>
          خطیب
        </Link>
        <Link href="/register" style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.6, textDecoration: 'none' }}>
          حساب ندارید؟ ثبت‌نام کنید
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
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>خوش آمدید</h1>
            <p style={{ fontSize: '14px', color: 'var(--foreground)', opacity: 0.6 }}>برای ورود به استودیو، اطلاعات خود را وارد کنید.</p>
          </div>

          {/* نمایش خطا */}
          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              border: '1px solid var(--danger-border)',
              color: 'var(--danger)',
              padding: '12px',
              borderRadius: '10px',
              marginBottom: '20px',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--foreground)' }}>ایمیل</label>
              <input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  fontSize: '16px',
                  outline: 'none',
                }}
                required
                dir="ltr"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--foreground)' }}>رمز عبور</label>

              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    paddingLeft: '45px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--input-text)',
                    fontSize: '16px',
                    outline: 'none',
                  }}
                  required
                  dir="ltr"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--foreground-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                  }}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', fontSize: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" style={{ width: '16px', height: '16px' }} />
                مرا به خاطر بسپار
              </label>
              <Link href="/forgot-password" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                فراموشی رمز عبور؟
              </Link>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.3s',
              }}
            >
              {isLoading ? 'در حال ورود...' : 'ورود به استودیو'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 10px', fontSize: '14px', color: 'var(--foreground)', opacity: 0.5 }}>یا</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>

          <button
            type="button"
            disabled
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--foreground)',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              opacity: 0.5
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            ورود با حساب گوگل (به زودی)
          </button>

        </div>
      </main>
    </div>
  );
}