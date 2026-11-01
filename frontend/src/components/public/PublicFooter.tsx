import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-gray-100 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-gray-500 md:flex-row md:px-6">
        <p>© ۱۴۰۵ خطیب — همه حقوق محفوظ است</p>
        <div className="flex gap-4">
          <Link href="/privacy" className="hover:text-blue-600">
            حریم خصوصی
          </Link>
          <Link href="/terms" className="hover:text-blue-600">
            شرایط استفاده
          </Link>
          <Link href="/help" className="hover:text-blue-600">
            راهنما
          </Link>
        </div>
      </div>
    </footer>
  );
}
