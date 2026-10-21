import { Button } from "./Button";

export function ErrorState({
  message = "دریافت اطلاعات با خطا مواجه شد.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <p className="text-sm text-red-600">{message}</p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          تلاش مجدد
        </Button>
      )}
    </div>
  );
}
