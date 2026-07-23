import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { register as registerOwner } from "@/features/auth/api/auth-api";

const registerSchema = z.object({
  organizationName: z
    .string()
    .trim()
    .min(2, "Organization name must be at least 2 characters")
    .max(150, "Organization name must not exceed 150 characters"),

  organizationSlug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must not exceed 100 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug may contain only lowercase letters, numbers, and hyphens",
    ),

  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must not exceed 120 characters"),

  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address")
    .max(255, "Email must not exceed 255 characters"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must not exceed 72 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      organizationSlug: "",
      name: "",
      email: "",
      password: "",
    },
  });

  function handleOrgNameChange(value: string) {
    setValue("organizationSlug", slugify(value), { shouldValidate: true });
  }

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);

    try {
      await registerOwner(values);

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message;

        setServerError(
          message ?? "Unable to create account. Please try again.",
        );
      } else {
        setServerError("Unable to create account. Please try again.");
      }
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-400">
            Fixonaut
          </p>

          <h1 className="mt-3 text-2xl font-bold text-white">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Register your organization to get started with Fixonaut.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <fieldset className="space-y-5">
              <legend className="mb-3 text-sm font-semibold text-slate-300">
                Organization
              </legend>

              <Input
                label="Organization name"
                placeholder="Umreth Home Services"
                autoComplete="organization"
                error={errors.organizationName?.message}
                {...register("organizationName", {
                  onChange: (event) => handleOrgNameChange(event.target.value),
                })}
              />

              <Input
                label="Organization slug"
                placeholder="umreth-home-services"
                error={errors.organizationSlug?.message}
                {...register("organizationSlug")}
              />
            </fieldset>

            <fieldset className="space-y-5">
              <legend className="mb-3 text-sm font-semibold text-slate-300">
                Owner account
              </legend>

              <Input
                label="Full name"
                placeholder="Rajesh Patel"
                autoComplete="name"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Email"
                type="email"
                autoComplete="email"
                placeholder="rajesh@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="At least 8 characters"
                error={errors.password?.message}
                {...register("password")}
              />
            </fieldset>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {serverError}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-orange-400 hover:text-orange-300"
              >
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default RegisterPage;
