import { cn } from "@/lib/utils/cn";

export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        { sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8" }[size]
      )}
      role="status"
      aria-label="در حال بارگذاری"
    />
  );
}
