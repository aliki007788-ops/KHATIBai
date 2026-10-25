"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLevels } from "@/features/learning/hooks";
import Link from "next/link";
import { toPersianNumber } from "@/lib/utils/number";
import { Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LearnPage() {
  const { data, isLoading, isError, refetch } = useLevels();

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">مسیر یادگیری</h1>
            <p className="text-sm text-[var(--foreground)]/60">
              سطوح و سناریوهای تمرین گویش و سخنرانی
            </p>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && data.length === 0 && (
            <EmptyState title="سطحی تعریف نشده" />
          )}
          {data && data.length > 0 && (
            <div className="space-y-3">
              {data.map((level) => (
                <Link
                  key={level.id}
                  href={level.unlocked ? `/learn/${level.id}` : "#"}
                  className={cn(!level.unlocked && "pointer-events-none")}
                >
                  <Card
                    className={cn(
                      "flex items-center gap-4 transition hover:border-[var(--primary)]",
                      !level.unlocked && "opacity-60"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#8b5cf6]/10 text-[#8b5cf6]">
                      {level.unlocked ? (
                        level.completed_count >= level.total_count &&
                        level.total_count > 0 ? (
                          <CheckCircle2 className="h-6 w-6 text-green-500" />
                        ) : (
                          <span className="text-lg font-bold">
                            {toPersianNumber(level.order_index)}
                          </span>
                        )
                      ) : (
                        <Lock className="h-5 w-5 text-[var(--foreground)]/40" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-[var(--foreground)]">
                        {level.name_fa}
                      </h3>
                      {level.description_fa && (
                        <p className="text-xs text-[var(--foreground)]/60">
                          {level.description_fa}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-[var(--foreground)]/40">
                        {toPersianNumber(level.completed_count)} /{" "}
                        {toPersianNumber(level.total_count)} سناریو
                      </p>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}