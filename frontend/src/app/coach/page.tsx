"use client";

import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  useConversations,
  useCreateConversation,
} from "@/features/chat/hooks";
import Link from "next/link";
import { MessageCircle, Plus } from "lucide-react";

export default function CoachPage() {
  const { data, isLoading, isError, refetch } = useConversations();
  const create = useCreateConversation();

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">مربی AI</h1>
              <p className="text-sm text-gray-500">
                با مربی هوشمند درباره سخنرانی صحبت کنید
              </p>
            </div>
            <Button
              size="sm"
              loading={create.isPending}
              onClick={() => create.mutate(undefined)}
            >
              <Plus className="h-4 w-4" /> گفتگوی جدید
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>گفتگوها</CardTitle>
            </CardHeader>
            {isLoading && <Skeleton className="h-32 w-full" />}
            {isError && <ErrorState onRetry={() => refetch()} />}
            {!isLoading && !isError && (!data || data.length === 0) && (
              <EmptyState
                icon={<MessageCircle className="h-10 w-10" />}
                title="هنوز گفتگویی ندارید"
                description="یک گفتگوی جدید شروع کنید"
                action={
                  <Button
                    size="sm"
                    loading={create.isPending}
                    onClick={() => create.mutate(undefined)}
                  >
                    شروع گفتگو
                  </Button>
                }
              />
            )}
            {data && data.length > 0 && (
              <ul className="divide-y divide-gray-100">
                {data.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/coach/${c.id}`}
                      className="flex items-center justify-between py-3 hover:bg-gray-50"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.title || "گفتگوی بدون عنوان"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(c.updated_at).toLocaleDateString("fa-IR")}
                        </p>
                      </div>
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
