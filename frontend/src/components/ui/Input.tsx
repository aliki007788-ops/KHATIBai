import { cn } from "@/lib/utils/cn";
import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex w-full flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn("input-field text-sm", error ? "input-error" : "", className)}
          {...props}
        />
        {error && <span className="text-xs" style={{ color: "var(--danger)" }}>{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
