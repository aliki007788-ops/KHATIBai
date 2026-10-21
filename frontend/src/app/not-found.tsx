import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 p-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900">صفحه پیدا نشد</h1>
      <p className="text-sm text-gray-500">مسیر مورد نظر وجود ندارد.</p>
      <Link href="/">
        <Button>بازگشت به خانه</Button>
      </Link>
    </div>
  );
}
