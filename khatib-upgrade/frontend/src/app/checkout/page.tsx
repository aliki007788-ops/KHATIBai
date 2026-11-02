import { redirect } from 'next/navigation';
import CheckoutClient from './CheckoutClient';

// Server Component: در Next.js 15 مقدار searchParams یک Promise است.
export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; period?: string | string[] }>;
}) {
  const params = await searchParams;
  const first = (v?: string | string[]) => (Array.isArray(v) ? v[0] : v);
  const plan = first(params.plan) ?? '';
  const period = first(params.period) === 'yearly' ? 'yearly' : 'monthly';

  // پلن رایگان پرداخت ندارد
  if (plan === 'free') redirect('/dashboard');

  // key باعث می‌شود با تغییر آدرس، وضعیت کامپوننت از نو ساخته شود
  return <CheckoutClient key={`${plan}:${period}`} initialPlan={plan} initialPeriod={period} />;
}
