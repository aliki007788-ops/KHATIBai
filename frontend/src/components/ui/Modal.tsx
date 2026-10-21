"use client";

import { cn } from "@/lib/utils/cn";
import { ReactNode, useEffect } from "react";
import { createPortal } from "react-dom";

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className={cn(
          "relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && <h2 className="mb-4 text-lg font-semibold">{title}</h2>}
        {children}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="بستن"
          type="button"
        >
          ✕
        </button>
      </div>
    </div>,
    document.body
  );
}
