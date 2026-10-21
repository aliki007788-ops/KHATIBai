import type { ApiErrorBody } from "@/types/api";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function extractDetail(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "خطایی رخ داد.";
  const body = payload as ApiErrorBody;
  if (typeof body.detail === "string") return body.detail;
  if (Array.isArray(body.detail) && body.detail.length > 0) {
    return body.detail.map((e) => e.msg).join(" — ");
  }
  return "خطایی رخ داد.";
}

export function mapAxiosError(error: unknown): ApiError {
  // axios-like shape without importing axios types here
  const err = error as {
    response?: { status: number; data?: unknown };
    message?: string;
    code?: string;
  };

  if (!err.response) {
    const msg =
      err.message === "Network Error" || err.code === "ERR_NETWORK"
        ? "اتصال اینترنت برقرار نیست."
        : err.message || "خطای شبکه";
    return new ApiError(0, "NETWORK_ERROR", msg);
  }

  const status = err.response.status;
  const message = extractDetail(err.response.data);

  const codeMap: Record<number, string> = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "VALIDATION_ERROR",
    423: "LOCKED",
    429: "RATE_LIMITED",
    500: "SERVER_ERROR",
  };

  return new ApiError(status, codeMap[status] ?? `HTTP_${status}`, message, err.response.data);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 401:
        return error.message || "لازم است دوباره وارد شوید.";
      case 403:
        return error.message || "دسترسی به این بخش برای شما مجاز نیست.";
      case 404:
        return error.message || "منبع موردنظر یافت نشد.";
      case 409:
        return error.message || "این اطلاعات قبلاً ثبت شده است.";
      case 422:
        return error.message || "اطلاعات ارسالی معتبر نیست.";
      case 423:
        return error.message || "حساب کاربری موقتاً قفل شده است.";
      case 429:
        return error.message || "تعداد درخواست‌ها بیش از حد مجاز است. کمی صبر کنید.";
      case 500:
        return "خطای سرور. لطفاً بعداً تلاش کنید.";
      default:
        return error.message || "خطایی رخ داد.";
    }
  }
  if (error instanceof Error) return error.message;
  return "خطای ناشناخته‌ای رخ داد.";
}
