/** Mirrors backend PLAN_CATALOG in app/core/plans.py */
import type { PlanDefinition, PlanId } from "@/types/billing";

export const PLANS: PlanDefinition[] = [
  {
    id: "free",
    name: "رایگان",
    tagline: "شروع بدون هزینه",
    price_toman: 0,
    practiceLimit: "۳ تمرین در ماه",
    audioLimit: "۳ دقیقه صوت",
    features: [
      { label: "تحلیل متن پایه", included: true },
      { label: "مربی AI محدود", included: true },
      { label: "سناریوهای ابتدایی", included: true },
      { label: "تمرین نامحدود", included: false },
      { label: "تحلیل صوت پیشرفته", included: false },
      { label: "پشتیبانی اولویت‌دار", included: false },
    ],
  },
  {
    id: "base",
    name: "پایه",
    tagline: "برای تمرین منظم",
    price_toman: 99_000,
    practiceLimit: "۳۰ تمرین در ماه",
    audioLimit: "۳۰ دقیقه صوت",
    features: [
      { label: "تحلیل متن کامل", included: true },
      { label: "مربی AI", included: true },
      { label: "تمام سناریوها", included: true },
      { label: "پیگیری پیشرفت", included: true },
      { label: "تحلیل صوت پیشرفته", included: false },
      { label: "پشتیبانی اولویت‌دار", included: false },
    ],
    highlighted: true,
  },
  {
    id: "pro",
    name: "حرفه‌ای",
    tagline: "بدون محدودیت",
    price_toman: 249_000,
    practiceLimit: "نامحدود",
    audioLimit: "نامحدود",
    features: [
      { label: "تحلیل متن کامل", included: true },
      { label: "مربی AI نامحدود", included: true },
      { label: "تمام سناریوها", included: true },
      { label: "پیگیری پیشرفت", included: true },
      { label: "تحلیل صوت پیشرفته", included: true },
      { label: "پشتیبانی اولویت‌دار", included: false },
    ],
  },
  {
    id: "enterprise",
    name: "سازمانی",
    tagline: "برای تیم‌ها و سازمان‌ها",
    price_toman: 499_000,
    practiceLimit: "نامحدود",
    audioLimit: "نامحدود",
    isEnterprise: true,
    features: [
      { label: "همه امکانات حرفه‌ای", included: true },
      { label: "مدیریت چند کاربر", included: true },
      { label: "گزارش سازمانی", included: true },
      { label: "پشتیبانی اختصاصی", included: true },
      { label: "سفارشی‌سازی", included: true },
      { label: "SLA", included: true },
    ],
  },
];

export function getPlanById(id: PlanId): PlanDefinition | undefined {
  return PLANS.find((p) => p.id === id);
}
