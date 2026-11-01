"use client";

import { useAuthStore } from "@/stores/authStore";
import { useMe } from "@/features/auth/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/Spinner";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const accessToken = useAuthStore((s) => s.accessToken);
  const status = useAuthStore((s) => s.status);
  const { isLoading, isError } = useMe(!!accessToken);

  useEffect(() => {
    if (!accessToken) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [accessToken, pathname, router]);

  if (!accessToken) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isLoading && status !== "authenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return null;
  }

  return <>{children}</>;
}
