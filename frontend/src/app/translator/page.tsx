"use client";

import { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { useAuthStore } from '@/stores/authStore';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export default function LiveTranslatorPage() {
  const [mode, setMode] = useState<'fa-to-ar' | 'ar-to-fa'>('fa-to-ar');
  const [isListening, setIsListening] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const modeRef = useRef<'fa-to-ar' | 'ar-to-fa'>('fa-to-ar');

  useEffect(() => {
    isListeningRef.current = isListening;
    modeRef.current = mode;
  }, [isListening, mode]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        
        recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          if (interimTranscript) {
            setSourceText(interimTranscript);
          }

          if (finalTranscript) {
            setSourceText(finalTranscript);
            handleTranslation(finalTranscript, modeRef.current);
          }
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          if (event.error === 'not-allowed') {
            alert('دسترسی به میکروفون مسدود شده است. لطفاً از تنظیمات مرورگر اجازه دهید.');
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          if (isListeningRef.current && !window.speechSynthesis.speaking) {
            try { recognition.start(); } catch (e) {}
          }
        };

        recognitionRef.current = recognition;
      } else {
        alert("مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. لطفاً از Google Chrome استفاده کنید.");
      }
    }
  }, []);

  const speakText = (text: string, lang: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang; 
      utterance.rate = 0.95; 
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        recognitionRef.current?.stop();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        if (isListeningRef.current) {
          try { recognitionRef.current?.start(); } catch(e) {}
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTranslation = async (text: string, currentMode: 'fa-to-ar' | 'ar-to-fa') => {
    setIsTranslating(true);
    setErrorMessage('');
    recognitionRef.current?.stop();

    try {
      // استخراج توکن از authStore (Zustand)
      const accessToken = useAuthStore.getState().accessToken;

      if (!accessToken) {
        throw new Error('لطفاً ابتدا وارد حساب کاربری شوید.');
      }

      const direction = currentMode === 'fa-to-ar' ? 'fa_to_iq' : 'iq_to_fa';

      const response = await fetch(`${BASE_URL}/api/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ text, direction }),
      });

      if (!response.ok) {
        // اگه 401 بود، یعنی توکن منقضی شده — کاربر باید لاگین کنه
        if (response.status === 401) {
          throw new Error('نشست شما منقضی شده است. لطفاً دوباره وارد شوید.');
        }
        // اگه 502 بود، یعنی سرویس AI خطا داده
        if (response.status === 502) {
          throw new Error('سرویس ترجمه در حال حاضر در دسترس نیست. لطفاً دوباره تلاش کنید.');
        }
        throw new Error(`خطای سرور: ${response.status}`);
      }

      const data = await response.json();
      const translated = data.translated_text || '';
      
      if (!translated) {
        throw new Error('ترجمه‌ای دریافت نشد.');
      }
      
      setTranslatedText(translated);
      setIsTranslating(false);
      
      const targetLang = currentMode === 'fa-to-ar' ? 'ar-IQ' : 'fa-IR';
      speakText(translated, targetLang);
    } catch (error: any) {
      console.error('Translation error:', error);
      setIsTranslating(false);
      setErrorMessage(error.message || 'خطا در ترجمه. لطفاً دوباره تلاش کنید.');
      setTranslatedText('');
      // دوباره ضبط رو شروع کن اگه در حال گوش دادن بود
      if (isListeningRef.current) {
        try { recognitionRef.current?.start(); } catch(e) {}
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      setSourceText('');
      setTranslatedText('');
      setErrorMessage('');
      window.speechSynthesis.cancel();
    } else {
      setSourceText('');
      setTranslatedText('');
      setErrorMessage('');
      const lang = mode === 'fa-to-ar' ? 'fa-IR' : 'ar-IQ';
      if (recognitionRef.current) {
        recognitionRef.current.lang = lang;
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch(e) {}
      }
    }
  };

  const switchMode = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    window.speechSynthesis.cancel();
    setSourceText('');
    setTranslatedText('');
    setErrorMessage('');
    setMode(mode === 'fa-to-ar' ? 'ar-to-fa' : 'fa-to-ar');
  };

  return (
    <AppShell>
      <div className="max-w-4xl w-full mx-auto flex flex-col items-center justify-center gap-6 mt-4">
        
        {/* انتخاب زبان */}
        <div className="glass-panel p-2 rounded-full flex items-center gap-2 shadow-lg">
          <button 
            onClick={() => mode === 'ar-to-fa' && switchMode()}
            className={`px-6 py-2 rounded-full font-medium transition-all ${mode === 'fa-to-ar' ? 'bg-[var(--primary)] text-white shadow-md' : 'hover:bg-white/10'}`}
          >
            فارسی 🇮🇷
          </button>
          <button className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[var(--foreground)]/50">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </button>
          <button 
            onClick={() => mode === 'fa-to-ar' && switchMode()}
            className={`px-6 py-2 rounded-full font-medium transition-all ${mode === 'ar-to-fa' ? 'bg-[#10b981] text-white shadow-md' : 'hover:bg-white/10'}`}
          >
            عراقی 🇮🇶
          </button>
        </div>

        {/* دکمه میکروفون */}
        <div className="relative mt-4 mb-2 flex flex-col items-center">
          <div className="relative">
            {isListening && !isSpeaking && (
              <>
                <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 scale-150"></div>
                <div className="absolute inset-0 bg-red-500 rounded-full animate-pulse opacity-40 scale-125"></div>
              </>
            )}
            {isSpeaking && (
              <div className="absolute inset-0 bg-[var(--accent)] rounded-full animate-pulse opacity-30 scale-125"></div>
            )}

            <button 
              onClick={toggleListening}
              className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
                isSpeaking 
                  ? 'bg-[var(--accent)] shadow-[0_0_50px_rgba(16,185,129,0.6)] scale-105 cursor-not-allowed'
                  : isListening 
                    ? 'bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.6)] scale-110' 
                    : 'bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] hover:scale-105 shadow-[0_0_30px_rgba(139,92,246,0.4)]'
              }`}
              disabled={isSpeaking}
            >
              {isSpeaking ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-14 h-14 animate-pulse">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-12 h-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
            </button>
          </div>
          
          <p className={`mt-6 text-sm font-medium transition-colors ${
            isSpeaking ? 'text-[var(--accent)]' 
            : isListening ? 'text-red-400 animate-pulse' 
            : 'text-[var(--foreground)]/50'
          }`}>
            {isSpeaking ? 'در حال پخش ترجمه صوتی...' 
             : isListening ? 'در حال گوش دادن... (صحبت کنید و مکث کنید)' 
             : 'برای شروع مکالمه زنده، دکمه را بزنید'}
          </p>
        </div>

        {/* نمایش متن‌ها */}
        <div className="w-full grid grid-cols-1 gap-4 mt-4">
          <div className="glass-panel p-6 rounded-2xl border-r-4 border-r-[var(--primary)] transition-all">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-[var(--primary)]">
                {mode === 'fa-to-ar' ? 'شما (فارسی)' : 'شما (عراقی)'}
              </span>
              {isListening && <span className="text-xs text-red-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span> ضبط زنده</span>}
            </div>
            <p className={`text-lg leading-relaxed min-h-[3rem] transition-colors ${sourceText ? 'text-[var(--foreground)]' : 'text-[var(--foreground)]/30'}`}>
              {sourceText || 'متن گفتار شما اینجا ظاهر می‌شود...'}
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-r-4 border-r-[var(--accent)] relative overflow-hidden transition-all">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] rounded-full filter blur-[80px] opacity-10 pointer-events-none"></div>
            <div className="flex justify-between items-center mb-2 relative z-10">
              <span className="text-xs font-bold text-[var(--accent)]">
                {mode === 'fa-to-ar' ? 'ترجمه عراقی' : 'ترجمه فارسی'}
              </span>
              {translatedText && !isTranslating && (
                <button onClick={() => speakText(translatedText, mode === 'fa-to-ar' ? 'ar-IQ' : 'fa-IR')} className="text-xs flex items-center gap-1 text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                  </svg>
                  پخش دوباره
                </button>
              )}
            </div>
            <p className={`text-lg leading-relaxed min-h-[3rem] relative z-10 transition-colors ${translatedText ? 'text-[var(--foreground)] font-medium' : 'text-[var(--foreground)]/30'}`}>
              {isTranslating ? 'در حال ترجمه...' : (translatedText || 'ترجمه اینجا ظاهر می‌شود...')}
            </p>
          </div>
        </div>

        {/* نمایش خطا */}
        {errorMessage && (
          <div className="w-full glass-panel p-4 rounded-xl border-r-4 border-r-red-500 bg-red-500/10">
            <p className="text-sm text-red-400 font-medium">⚠️ {errorMessage}</p>
          </div>
        )}

      </div>
    </AppShell>
  );
}