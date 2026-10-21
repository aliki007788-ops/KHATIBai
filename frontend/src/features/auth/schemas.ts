import { z } from "zod";

/** Backend: password min 8, must contain letter + digit */
export const loginSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
  password: z.string().min(1, "رمز عبور را وارد کنید"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(2, "نام را وارد کنید").max(255).optional().or(z.literal("")),
    email: z.string().email("ایمیل معتبر وارد کنید"),
    password: z
      .string()
      .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
      .regex(/[A-Za-z]/, "رمز عبور باید شامل حداقل یک حرف باشد")
      .regex(/[0-9]/, "رمز عبور باید شامل حداقل یک عدد باشد"),
    password_confirmation: z.string(),
    accept_terms: z.literal(true, {
      errorMap: () => ({ message: "پذیرش قوانین الزامی است" }),
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "رمز عبور و تکرار آن یکسان نیستند",
    path: ["password_confirmation"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("ایمیل معتبر وارد کنید"),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
