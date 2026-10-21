export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900">حریم خصوصی</h1>
      <p className="mt-2 text-sm text-gray-400">آخرین به‌روزرسانی: ۱۴۰۴/۰۱/۰۱</p>
      <div className="mt-8 space-y-6 text-sm leading-loose text-gray-600">
        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">۱. مقدمه</h2>
          <p>
            حریم خصوصی شما برای ما اهمیت بالایی دارد. این سند توضیح می‌دهد که
            خطیب چه اطلاعاتی جمع‌آوری می‌کند و چگونه از آن‌ها استفاده می‌کند.
          </p>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">
            ۲. اطلاعاتی که جمع‌آوری می‌کنیم
          </h2>
          <ul className="list-inside list-disc space-y-1">
            <li>اطلاعات حساب کاربری شامل نام و ایمیل</li>
            <li>فایل‌های صوتی و متنی ارسالی برای تحلیل گفتار</li>
            <li>سوابق تمرین‌ها و مکالمات با مربی هوش مصنوعی</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 text-lg font-bold text-gray-900">۳. حقوق شما</h2>
          <p>
            شما در هر زمان می‌توانید از طریق بخش تنظیمات &gt; حریم خصوصی، خروجی
            کاملی از اطلاعات خود دریافت کنید یا درخواست حذف دائمی حساب را ثبت
            کنید.
          </p>
        </section>
      </div>
    </div>
  );
}
