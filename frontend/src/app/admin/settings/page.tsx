"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Sidebar } from '@/components/layout/Sidebar';

interface Gateway {
  id: number;
  name: string;
  merchantCode: string;
  isActive: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'payment' | 'security'>('payment');
  const [saved, setSaved] = useState(false);

  // ================= تنظیمات ظاهری =================
  const [theme, setTheme] = useState({
    primaryColor: '#ff7b54',
    secondaryColor: '#ffd56b',
    accentColor: '#10b981',
    headerBg: '#ffffff',
    headerText: '#2d2421',
    fontFamily: 'Vazirmatn',
    siteName: 'خطیب',
  });

  // ================= درگاه‌های پرداخت =================
  const [gateways, setGateways] = useState<Gateway[]>([
    { id: 1, name: 'زرین‌پال', merchantCode: 'zarinpal-merchant-xxxx', isActive: true },
    { id: 2, name: 'آیدی‌پی', merchantCode: 'idpay-merchant-yyyy', isActive: false },
  ]);

  // ================= مدیریت مودال ویرایش =================
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [isGatewayModalOpen, setIsGatewayModalOpen] = useState(false);
  
  // ================= مدیریت مودال افزودن =================
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newGateway, setNewGateway] = useState({ name: '', merchantCode: '' });

  // ================= کارت به کارت =================
  const [cardToCard, setCardToCard] = useState({
    isActive: true,
    cardNumber: '6037-9977-1234-5678',
    accountHolder: 'شرکت خطیب',
    bankName: 'بانک ملی ایران',
    iban: 'IR123456789012345678901234',
  });

  // ================= امنیت =================
  const [security, setSecurity] = useState({
    twoFactor: true,
    autoBlock: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // توابع درگاه
  const toggleActive = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setGateways(gateways.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
  };

  const openEditModal = (gateway: Gateway) => {
    setEditingGateway({ ...gateway }); // کپی از درگاه برای ویرایش
    setIsGatewayModalOpen(true);
  };

  const saveEditedGateway = () => {
    if (editingGateway) {
      setGateways(gateways.map(g => g.id === editingGateway.id ? editingGateway : g));
      setIsGatewayModalOpen(false);
      setEditingGateway(null);
      alert('تغییرات درگاه با موفقیت ذخیره شد.');
    }
  };

  const deleteGateway = (id: number) => {
    if (confirm('آیا از حذف این درگاه مطمئن هستید؟')) {
      setGateways(gateways.filter(g => g.id !== id));
    }
  };

  const addGateway = () => {
    if (!newGateway.name || !newGateway.merchantCode) {
      alert('لطفاً نام درگاه و مرچنت کد را وارد کنید.');
      return;
    }
    const newId = Math.max(...gateways.map(g => g.id), 0) + 1;
    setGateways([...gateways, { id: newId, ...newGateway, isActive: true }]);
    setNewGateway({ name: '', merchantCode: '' });
    setIsAddModalOpen(false);
  };

  const toggleSecurity = (key: 'twoFactor' | 'autoBlock') => {
    setSecurity({ ...security, [key]: !security[key] });
  };

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      
      <Sidebar role="admin" />

      <div className="flex-1 p-6 md:p-8 overflow-x-hidden">
        
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-l from-[#8b5cf6] to-[#10b981]">
              تنظیمات سیستم
            </h1>
            <p className="text-[var(--foreground)]/50 mt-1">پیکربندی کامل و شخصی‌سازی زنده پلتفرم</p>
          </div>
          <div className="flex gap-4 items-center">
            <ThemeToggle />
            <Link href="/admin"><Button variant="glass">← بازگشت</Button></Link>
          </div>
        </header>

        {/* تب‌ها */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'general', label: 'تنظیمات عمومی', icon: '⚙️' },
            { id: 'appearance', label: 'شخصی‌سازی ظاهر', icon: '🎨' },
            { id: 'payment', label: 'درگاه پرداخت', icon: '💳' },
            { id: 'security', label: 'امنیت', icon: '🔒' },
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

        {/* ================= تب شخصی‌سازی ظاهر ================= */}
        {activeTab === 'appearance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><span>📐</span> تنظیمات هدر</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">نام سایت</label><input type="text" value={theme.siteName} onChange={(e) => setTheme({...theme, siteName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">فونت سایت</label><select value={theme.fontFamily} onChange={(e) => setTheme({...theme, fontFamily: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]"><option value="Vazirmatn">وزیرمتن</option><option value="IRANSans">ایران‌سنس</option><option value="Yekan">یکان</option></select></div>
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">رنگ پس‌زمینه هدر</label><div className="flex gap-2"><input type="color" value={theme.headerBg} onChange={(e) => setTheme({...theme, headerBg: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer border-none" /><input type="text" value={theme.headerBg} onChange={(e) => setTheme({...theme, headerBg: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-sm" /></div></div>
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">رنگ متن هدر</label><div className="flex gap-2"><input type="color" value={theme.headerText} onChange={(e) => setTheme({...theme, headerText: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer border-none" /><input type="text" value={theme.headerText} onChange={(e) => setTheme({...theme, headerText: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-sm" /></div></div>
                </div>
              </div>
              <div className="glass-panel p-8 rounded-3xl">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><span>🎨</span> رنگ‌بندی اصلی</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">رنگ اصلی</label><div className="flex gap-2"><input type="color" value={theme.primaryColor} onChange={(e) => setTheme({...theme, primaryColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer border-none" /><input type="text" value={theme.primaryColor} onChange={(e) => setTheme({...theme, primaryColor: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-sm" /></div></div>
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">رنگ ثانویه</label><div className="flex gap-2"><input type="color" value={theme.secondaryColor} onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer border-none" /><input type="text" value={theme.secondaryColor} onChange={(e) => setTheme({...theme, secondaryColor: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-sm" /></div></div>
                  <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">رنگ تاکید</label><div className="flex gap-2"><input type="color" value={theme.accentColor} onChange={(e) => setTheme({...theme, accentColor: e.target.value})} className="w-12 h-12 rounded-lg cursor-pointer border-none" /><input type="text" value={theme.accentColor} onChange={(e) => setTheme({...theme, accentColor: e.target.value})} className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-sm" /></div></div>
                </div>
              </div>
              <div className="flex justify-end"><Button onClick={handleSave} size="lg">{saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}</Button></div>
            </div>
            <div className="lg:col-span-1">
              <div className="glass-panel p-6 rounded-3xl sticky top-6">
                <h3 className="text-sm font-bold mb-4 text-[var(--foreground)]/50 flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>پیش‌نمایش زنده</h3>
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl">
                  <div style={{ backgroundColor: theme.headerBg, color: theme.headerText }} className="p-4 flex justify-between items-center backdrop-blur-md">
                    <span style={{ fontFamily: theme.fontFamily }} className="font-black text-lg">{theme.siteName}</span>
                    <div className="flex gap-2"><div className="w-6 h-2 rounded-full bg-current opacity-30"></div><div className="w-6 h-2 rounded-full bg-current opacity-30"></div></div>
                  </div>
                  <div className="p-6 bg-[var(--background)]" style={{ fontFamily: theme.fontFamily }}>
                    <div className="text-center">
                      <h4 className="font-bold mb-2">صدای خود را متحول کنید</h4>
                      <p className="text-xs opacity-50 mb-4">استودیوی هوشمند سخنرانی</p>
                      <button style={{ backgroundColor: theme.primaryColor }} className="text-white px-4 py-2 rounded-lg text-xs font-bold w-full mb-2">شروع رایگان</button>
                      <button style={{ borderColor: theme.accentColor, color: theme.accentColor }} className="border px-4 py-2 rounded-lg text-xs font-bold w-full">مشاهده پلن‌ها</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= تب تنظیمات عمومی ================= */}
        {activeTab === 'general' && (
          <div className="glass-panel p-8 rounded-3xl animate-fade-in">
            <h2 className="text-xl font-bold mb-6">اطلاعات تماس و SEO</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">ایمیل پشتیبانی</label><input defaultValue="support@khatib.com" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
              <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">شماره تماس</label><input defaultValue="021-12345678" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
            </div>
            <div className="mt-6"><label className="block text-sm text-[var(--foreground)]/70 mb-2">توضیحات متا (SEO)</label><textarea defaultValue="مربی سخنرانی هوشمند، آموزش زبان عراقی و مترجم آنلاین" rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
            <div className="mt-8 flex justify-end"><Button onClick={handleSave}>{saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}</Button></div>
          </div>
        )}

        {/* ================= تب درگاه پرداخت ================= */}
        {activeTab === 'payment' && (
          <div className="space-y-6 animate-fade-in">
            
            <div className="glass-panel p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">درگاه‌های پرداخت آنلاین</h2>
                <Button size="sm" onClick={() => setIsAddModalOpen(true)} className="gap-2"><span>+</span> افزودن درگاه جدید</Button>
              </div>
              
              <div className="space-y-3">
                {gateways.map((gateway) => (
                  <div key={gateway.id} className="flex items-center justify-between p-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors">
                    <div className="flex-1">
                      <div className="font-bold">{gateway.name}</div>
                      <div className="text-sm text-[var(--foreground)]/50 font-mono">{gateway.merchantCode}</div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${gateway.isActive ? 'bg-[var(--accent)]/10 text-[var(--accent)]' : 'bg-gray-500/10 text-gray-500'}`}>
                        {gateway.isActive ? 'فعال' : 'غیرفعال'}
                      </span>
                      <button 
                        onClick={(e) => toggleActive(gateway.id, e)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${gateway.isActive ? 'bg-[var(--accent)]' : 'bg-gray-600'}`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${gateway.isActive ? 'right-0.5' : 'left-0.5'}`}></span>
                      </button>
                      <button onClick={() => openEditModal(gateway)} className="text-sm text-[var(--primary)] hover:underline flex items-center gap-1">
                        ویرایش
                      </button>
                      <button onClick={() => deleteGateway(gateway.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400" title="حذف">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* کارت به کارت */}
            <div className="glass-panel p-8 rounded-3xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">پرداخت کارت به کارت</h2>
                <button 
                  onClick={() => setCardToCard({...cardToCard, isActive: !cardToCard.isActive})}
                  className={`w-12 h-6 rounded-full relative transition-colors ${cardToCard.isActive ? 'bg-[var(--accent)]' : 'bg-gray-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${cardToCard.isActive ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
              
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity ${cardToCard.isActive ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">شماره کارت</label><input type="text" value={cardToCard.cardNumber} onChange={(e) => setCardToCard({...cardToCard, cardNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-center" dir="ltr" /></div>
                <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">نام صاحب حساب</label><input type="text" value={cardToCard.accountHolder} onChange={(e) => setCardToCard({...cardToCard, accountHolder: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
                <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">نام بانک</label><input type="text" value={cardToCard.bankName} onChange={(e) => setCardToCard({...cardToCard, bankName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
                <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">شماره شبا (IBAN)</label><input type="text" value={cardToCard.iban} onChange={(e) => setCardToCard({...cardToCard, iban: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono text-center" dir="ltr" /></div>
              </div>
            </div>

            <div className="flex justify-end"><Button onClick={handleSave} size="lg">{saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}</Button></div>

          </div>
        )}

        {/* ================= تب امنیت ================= */}
        {activeTab === 'security' && (
          <div className="glass-panel p-8 rounded-3xl animate-fade-in">
            <h2 className="text-xl font-bold mb-6">تنظیمات امنیتی</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">حداقل طول رمز عبور</label><input type="number" defaultValue={8} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
              <div><label className="block text-sm text-[var(--foreground)]/70 mb-2">مدت انقضای کد تایید (دقیقه)</label><input type="number" defaultValue={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" /></div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                <div><div className="font-bold">تایید دو مرحله‌ای اجباری</div><div className={`text-sm ${security.twoFactor ? 'text-[var(--accent)]' : 'text-[var(--foreground)]/50'}`}>{security.twoFactor ? 'فعال' : 'غیرفعال'}</div></div>
                <button onClick={() => toggleSecurity('twoFactor')} className={`w-12 h-6 rounded-full relative transition-colors ${security.twoFactor ? 'bg-[var(--accent)]' : 'bg-gray-600'}`}><span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${security.twoFactor ? 'right-1' : 'left-1'}`}></span></button>
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl border border-white/10">
                <div><div className="font-bold">مسدودسازی خودکار پس از ۵ تلاش ناموفق</div><div className={`text-sm ${security.autoBlock ? 'text-[var(--accent)]' : 'text-[var(--foreground)]/50'}`}>{security.autoBlock ? 'فعال' : 'غیرفعال'}</div></div>
                <button onClick={() => toggleSecurity('autoBlock')} className={`w-12 h-6 rounded-full relative transition-colors ${security.autoBlock ? 'bg-[var(--accent)]' : 'bg-gray-600'}`}><span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${security.autoBlock ? 'right-1' : 'left-1'}`}></span></button>
              </div>
            </div>
            <div className="mt-8 flex justify-end"><Button onClick={handleSave}>{saved ? '✓ ذخیره شد' : 'ذخیره تغییرات'}</Button></div>
          </div>
        )}

        {/* ================= مودال ویرایش درگاه ================= */}
        {isGatewayModalOpen && editingGateway && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-3xl w-full max-w-md animate-fade-in border border-[var(--border-color)]">
              <h3 className="text-2xl font-bold mb-6">ویرایش درگاه: {editingGateway.name}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-2 text-[var(--foreground)]/70">نام درگاه</label>
                  <input type="text" value={editingGateway.name} onChange={(e) => setEditingGateway({...editingGateway, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" />
                </div>
                <div>
                  <label className="block text-sm mb-2 text-[var(--foreground)]/70">مرچنت کد</label>
                  <input type="text" value={editingGateway.merchantCode} onChange={(e) => setEditingGateway({...editingGateway, merchantCode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono" dir="ltr" />
                </div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={saveEditedGateway} className="flex-1">ذخیره تغییرات</Button>
                <Button onClick={() => { setIsGatewayModalOpen(false); setEditingGateway(null); }} variant="glass" className="flex-1">انصراف</Button>
              </div>
            </div>
          </div>
        )}

        {/* ================= مودال افزودن درگاه ================= */}
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel p-8 rounded-3xl w-full max-w-md animate-fade-in border border-[var(--border-color)]">
              <h3 className="text-2xl font-bold mb-6">افزودن درگاه پرداخت جدید</h3>
              <div className="space-y-4">
                <div><label className="block text-sm mb-2 text-[var(--foreground)]/70">نام درگاه</label><input type="text" value={newGateway.name} onChange={(e) => setNewGateway({...newGateway, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)]" placeholder="مثلاً: پی‌پینگ" /></div>
                <div><label className="block text-sm mb-2 text-[var(--foreground)]/70">مرچنت کد</label><input type="text" value={newGateway.merchantCode} onChange={(e) => setNewGateway({...newGateway, merchantCode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--primary)] font-mono" placeholder="merchant-xxxx-xxxx" dir="ltr" /></div>
              </div>
              <div className="flex gap-4 mt-8">
                <Button onClick={addGateway} className="flex-1">افزودن درگاه</Button>
                <Button onClick={() => setIsAddModalOpen(false)} variant="glass" className="flex-1">انصراف</Button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}