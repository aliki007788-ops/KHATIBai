"use client";

import { use } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useScenarios,
  useStartScenario,
  useCompleteScenario,
} from "@/features/learning/hooks";
import Link from "next/link";
import { ArrowRight, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function LevelScenariosPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = use(params);
  const { data, isLoading, isError, refetch } = useScenarios(levelId);
  const start = useStartScenario();
  const complete = useCompleteScenario();

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <Link
            href="/learn"
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            <ArrowRight className="h-4 w-4" /> سطوح
          </Link>

          <div>
            <h1 className="text-xl font-bold text-gray-900">سناریوها</h1>
            <p className="text-sm text-gray-500">یک سناریو انتخاب و تمرین کنید</p>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-28" />
              ))}
            </div>
          )}
          {isError && <ErrorState onRetry={() => refetch()} />}
          {data && data.length === 0 && (
            <EmptyState title="سناریویی در این سطح نیست" />
          )}
          {data && data.length > 0 && (
            <div className="space-y-3">
              {data.map((s) => (
                <Card
                  key={s.id}
                  className={cn(!s.unlocked && "opacity-60")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {s.title_fa}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {s.description_fa}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {s.category} · {s.status}
                      </p>
                    </div>
                    {!s.unlocked ? (
                      <Lock className="h-5 w-5 shrink-0 text-gray-400" />
                    ) : (
                      <div className="flex shrink-0 flex-col gap-2">
                        <Button
                          size="sm"
                          loading={start.isPending}
                          onClick={() => start.mutate(s.id)}
                        >
                          <Play className="h-3 w-3" /> شروع
                        </Button>
                        {s.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="secondary"
                            loading={complete.isPending}
                            onClick={() => complete.mutate(s.id)}
                          >
                            تکمیل
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
