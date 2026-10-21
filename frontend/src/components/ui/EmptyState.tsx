import { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      {icon && <div className="text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action}
    </div>
  );
}
