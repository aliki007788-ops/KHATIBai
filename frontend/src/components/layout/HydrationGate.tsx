"use client";

import { useEffect, useState } from "react";
import { Spinner } from "@/components/ui/Spinner";

/**
 * Avoids SSR/client mismatch from zustand persist (localStorage).
 * Renders children only after client hydration.
 */
export function HydrationGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
}
