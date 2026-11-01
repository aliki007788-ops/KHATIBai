import { cn } from "@/lib/utils/cn";
import { HTMLAttributes } from "react";

export function Card({ className, style, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-xl border p-5 shadow-sm", className)}
      style={{ backgroundColor: "var(--card-bg-solid)", borderColor: "var(--border-color)", ...style }}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)} {...props} />;
}

export function CardTitle({
  className,
  style,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold", className)}
      style={{ color: "var(--foreground)", ...style }}
      {...props}
    />
  );
}
