"use client";

import { use } from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Spinner } from "@/components/ui/Spinner";
import { useSpeech, useDeleteSpeech } from "@/features/speech/hooks";
import { toPersianNumber } from "@/lib/utils/number";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PracticeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, isError, refetch } = useSpeech(id);
  const del = useDeleteSpeech();

  const isProcessing =
    data?.status === "pending" || data?.status === "processing";

  return (
    <AuthGuard>
      <AppShell>
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <Link
              href="/practice"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
            >
              <ArrowRight className="h-4 w-4" /> بازگشت
            </Link>
            {data && (
              <Button
                variant="danger"
                size="sm"
                loading={del.isPending}
                onClick={() => {
                  if (confirm("این تمرین حذف شود؟")) del.mutate(id);
                }}
              >
                حذف
              </Button>
            )}
          </div>

          {isLoading && <Skeleton className="h-64 w-full" />}
          {isError && <ErrorState onRetry={() => refetch()} />}

          {data && (
            <>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {data.topic_label || "تمرین"}
                </h1>
                <p className="text-sm text-gray-500">
                  {data.mode === "audio" ? "صوتی" : "متنی"} · وضعیت: {data.status}
                </p>
              </div>

              {isProcessing && (
                <Card className="flex items-center gap-3">
                  <Spinner />
                  <p className="text-sm text-gray-600">
                    در حال تحلیل... نتیجه به‌صورت خودکار نمایش داده می‌شود.
                  </p>
                </Card>
              )}

              {data.overall_score != null && (
                <Card className="text-center">
                  <p className="text-sm text-gray-500">امتیاز کلی</p>
                  <p className="mt-1 text-4xl font-extrabold text-blue-600">
                    {toPersianNumber(data.overall_score)}
                  </p>
                </Card>
              )}

              {data.dimension_scores &&
                Object.keys(data.dimension_scores).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>ابعاد تحلیل</CardTitle>
                    </CardHeader>
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                      {Object.entries(data.dimension_scores).map(([key, val]) => (
                        <div
                          key={key}
                          className="rounded-lg bg-gray-50 px-3 py-2 text-center"
                        >
                          <p className="text-xs text-gray-500">{key}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {toPersianNumber(Math.round(Number(val)))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

              {data.strengths && data.strengths.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>نقاط قوت</CardTitle>
                  </CardHeader>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {data.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {data.weaknesses && data.weaknesses.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>نقاط ضعف</CardTitle>
                  </CardHeader>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {data.weaknesses.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {data.improvements && data.improvements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>پیشنهاد بهبود</CardTitle>
                  </CardHeader>
                  <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                    {data.improvements.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </Card>
              )}

              {(data.structure_notes || data.next_practice) && (
                <Card>
                  {data.structure_notes && (
                    <>
                      <CardHeader>
                        <CardTitle>یادداشت ساختار</CardTitle>
                      </CardHeader>
                      <p className="text-sm leading-relaxed text-gray-600">
                        {data.structure_notes}
                      </p>
                    </>
                  )}
                  {data.next_practice && (
                    <p className="mt-3 text-sm text-blue-700">
                      تمرین بعدی: {data.next_practice}
                    </p>
                  )}
                </Card>
              )}

              {(data.input_text || data.transcript) && (
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {data.transcript ? "رونوشت صوت" : "متن ارسالی"}
                    </CardTitle>
                  </CardHeader>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {data.transcript || data.input_text}
                  </p>
                </Card>
              )}
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
