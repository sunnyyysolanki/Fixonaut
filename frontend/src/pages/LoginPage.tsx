import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { login } from "@/features/auth/api/auth-api";
import { useAuthStore } from "@/stores/auth-store";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const sessionExpired = useAuthStore((state) => state.sessionExpired);
  const [serverError, setServerError] = useState<string | null>(null);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/dashboard";

  const justRegistered =
    (location.state as { registered?: boolean })?.registered === true;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);

    try {
      const response = await login(values);

      setAuth(response.user, response.accessToken);

      navigate(from, {
        replace: true,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;

        setServerError(message ?? "Email or password is incorrect");
      } else {
        setServerError("Unable to log in. Please try again.");
      }
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Fixonaut
          </p>

          <h1 className="mt-3 text-2xl font-bold text-white">Welcome back</h1>

          <p className="mt-2 text-sm text-slate-400">
            Sign in to manage your service operations.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {sessionExpired && (
              <div
                role="alert"
                className="rounded-lg border border-amber-800 bg-amber-950/50 px-4 py-3 text-sm text-amber-300"
              >
                Your session has expired. Please sign in again.
              </div>
            )}

            {justRegistered && (
              <div
                role="status"
                className="rounded-lg border border-emerald-800 bg-emerald-950/50 px-4 py-3 text-sm text-emerald-300"
              >
                Account created successfully. Sign in to get started.
              </div>
            )}

            <Input
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              error={errors.password?.message}
              {...register("password")}
            />

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {serverError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-orange-400 hover:text-orange-300"
              >
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default LoginPage;
