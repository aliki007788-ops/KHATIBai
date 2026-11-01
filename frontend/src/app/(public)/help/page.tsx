"use client";

import { useMemo, useState } from "react";
import { Accordion } from "@/components/ui/Accordion";
import { FAQ_CATEGORIES } from "@/lib/config/faq";
import { Search } from "lucide-react";

export default function HelpPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].id);

  const filteredItems = useMemo(() => {
    const category = FAQ_CATEGORIES.find((c) => c.id === activeCategory);
    if (!category) return [];
    if (!search) return category.items;
    return category.items.filter(
      (item) => item.question.includes(search) || item.answer.includes(search)
    );
  }, [activeCategory, search]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">راهنما</h1>
        <p className="mt-2 text-sm text-gray-500">
          پاسخ سؤالات متداول را جستجو کنید
        </p>
        <div className="relative mx-auto mt-6 max-w-md">
          <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجو در راهنما..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-3 pr-12 pl-4 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {FAQ_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-xl border px-4 py-2 text-sm ${
              activeCategory === cat.id
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 bg-white text-gray-600"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      {filteredItems.length > 0 ? (
        <Accordion items={filteredItems} />
      ) : (
        <p className="py-10 text-center text-sm text-gray-400">نتیجه‌ای یافت نشد</p>
      )}
    </div>
  );
}
