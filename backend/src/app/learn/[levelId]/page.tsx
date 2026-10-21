"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { useScenarios } from "@/features/learning/hooks";
import { toPersianNumber } from "@/lib/utils/number";
import { Lock, CheckCircle2, PlayCircle, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LevelScenariosPage() {
  const params = useParams();
  const levelId = params.levelId as string;
  const { data, isLoading, isError, refetch } = useScenarios(levelId);

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto max-w-4xl space-y-8 pb-10">
          
          <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-2xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">سناریوهای آموزشی</h1>
              <p className="text-gray-500 mt-1">برای شروع تمرین، روی هر سناریو کلیک کنید</p>
            </div>
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-3xl" />)}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && data.length === 0 && (
            <EmptyState title="سناریویی برای این سطح تعریف نشده" />
          )}

          {data && data.length > 0 && (
            <div className="space-y-4">
              {data.map((item, index) => {
                const isCompleted = item.status === "completed";
                const isInProgress = item.status === "in_progress";
                const isLocked = !item.unlocked;

                return (
                  <Link
                    key={item.id}
                    href={isLocked ? "#" : `/practice/${item.id}`}
                    className={cn(isLocked && "pointer-events-none")}
                  >
                    <Card
                      className={cn(
                        "group flex flex-col md:flex-row items-center justify-between gap-6 p-6 md:p-8 rounded-3xl transition-all duration-300",
                        isLocked 
                          ? "opacity-60 bg-gray-50 border border-gray-100" 
                          : "bg-white border border-gray-100 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(99,102,241,0.12)] hover:-translate-y-1 cursor-pointer"
                      )}
                    >
                      <div className="flex items-center gap-5 w-full md:w-auto">
                        <div className={cn(
                          "flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold transition-transform group-hover:scale-105",
                          isLocked ? "bg-gray-200 text-gray-400" :
                          isCompleted ? "bg-green-50 text-green-600" :
                          "bg-indigo-50 text-indigo-600"
                        )}>
                          {isLocked ? <Lock className="w-7 h-7" /> :
                           isCompleted ? <CheckCircle2 className="w-8 h-8" /> :
                           <span>{toPersianNumber(index + 1)}</span>}
                        </div>
                        <div>
                          <h3 className={cn(
                            "text-lg font-bold mb-1",
                            isLocked ? "text-gray-500" : "text-gray-900"
                          )}>
                            {item.title_fa}
                          </h3>
                          {item.description_fa && (
                            <p className="text-sm text-gray-500 line-clamp-1">{item.description_fa}</p>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-3 mt-4 md:mt-0">
                        {isLocked && <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">قفل</span>}
                        {isInProgress && <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-3 py-1.5 rounded-full">در حال یادگیری</span>}
                        {isCompleted && <span className="text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-full">تکمیل شده</span>}
                        
                        {!isLocked && !isCompleted && (
                          <div className="flex items-center gap-2 text-sm font-bold text-indigo-600 group-hover:gap-3 transition-all">
                            <PlayCircle className="w-5 h-5" />
                            شروع
                          </div>
                        )}
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}