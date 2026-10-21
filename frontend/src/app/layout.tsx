import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const vazirmatn = Vazirmatn({ 
  subsets: ["arabic"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "خطیب | استودیوی سخنرانی هوشمند",
  description: "تمرین سخنرانی فارسی با بازخورد هوش مصنوعی در سطح جهانی",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" className="scroll-smooth">
      <body className={`antialiased overflow-x-hidden ${vazirmatn.variable} font-sans bg-[var(--background)] text-[var(--foreground)]`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}