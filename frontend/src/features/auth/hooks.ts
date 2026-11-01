"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "./auth.service";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import { getErrorMessage } from "@/lib/api/errors";
import type { LoginFormValues, RegisterFormValues } from "./schemas";

export function useLogin() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const addToast = useUIStore((s) => s.addToast);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const tokens = await authService.login({
        email: values.email,
        password: values.password,
      });
      setAccessToken(tokens.access_token);
      const user = await authService.me();
      return { tokens, user };
    },
    onSuccess: ({ tokens, user }) => {
      setSession(user, tokens.access_token);
      addToast("success", "خوش آمدید!");
      queryClient.invalidateQueries();

      const plan = searchParams.get("plan");
      const redirect = searchParams.get("redirect");

      if (plan && plan !== "free") {
        router.push(`/checkout?plan=${plan}`);
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      addToast("error", getErrorMessage(error));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: (values: RegisterFormValues) =>
      authService.register({
        email: values.email,
        password: values.password,
        name: values.name || undefined,
      }),
    onSuccess: () => {
      addToast("success", "ثبت‌نام موفق بود. اکنون وارد شوید.");
      const plan = searchParams.get("plan");
      const qs = plan ? `?plan=${plan}` : "";
      // Backend does not auto-login on register — redirect to login
      router.push(`/login${qs}`);
    },
    onError: (error) => {
      addToast("error", getErrorMessage(error));
    },
  });
}

export function useMe(enabled = true) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const me = await authService.me();
      setUser(me);
      return me;
    },
    enabled: enabled && !!accessToken,
    initialData: user ?? undefined,
    staleTime: 60_000,
  });
}

export function useLogout() {
  const router = useRouter();
  const logoutLocal = useAuthStore((s) => s.logoutLocal);
  const queryClient = useQueryClient();
  const addToast = useUIStore((s) => s.addToast);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logoutLocal();
      queryClient.clear();
      addToast("info", "از حساب خود خارج شدید");
      router.push("/login");
    },
  });
}
