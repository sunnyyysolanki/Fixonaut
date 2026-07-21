import { useState } from "react";
import { isAxiosError } from "axios";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { CustomerFormValues } from "./types";

export const customerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must not exceed 120 characters"),

  phone: z
    .string()
    .trim()
    .min(7, "Phone number is too short")
    .max(20, "Phone number is too long")
    .regex(/^[+]?[0-9 ()-]+$/, "Enter a valid phone number"),

  email: z.string().trim().email("Enter a valid email").or(z.literal("")),

  address: z.string().trim().max(300, "Address must not exceed 300 characters"),

  city: z.string().trim().max(100, "City must not exceed 100 characters"),

  state: z.string().trim().max(100, "State must not exceed 100 characters"),

  postalCode: z
    .string()
    .trim()
    .max(20, "Postal code must not exceed 20 characters"),

  notes: z.string().trim().max(2000, "Notes must not exceed 2000 characters"),
});

type CustomerFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues: CustomerFormValues;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  isSubmitting: boolean;
  serverError?: string | null;
};

export function CustomerForm({
  title,
  description,
  submitLabel,
  defaultValues,
  onSubmit,
  isSubmitting,
  serverError,
}: CustomerFormProps) {
  const [internalError, setInternalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues,
  });

  async function submitForm(values: CustomerFormValues) {
    setInternalError(null);

    try {
      await onSubmit(values);
    } catch (error) {
      if (isAxiosError(error)) {
        setInternalError(
          error.response?.data?.message ?? "Unable to save customer",
        );
      } else {
        setInternalError("Unable to save customer");
      }
    }
  }

  const displayedError = serverError ?? internalError;

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link
          to="/customers"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to customers
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">Customers</p>

        <h1 className="mt-1 text-3xl font-bold text-white">{title}</h1>

        <p className="mt-2 text-slate-400">{description}</p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Customer details</h2>

          <p className="mt-1 text-sm text-slate-400">
            Enter the customer contact and address information.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(submitForm)} className="space-y-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Full name"
                placeholder="Rajesh Patel"
                error={errors.name?.message}
                {...register("name")}
              />

              <Input
                label="Phone number"
                type="tel"
                placeholder="+91 9876543210"
                error={errors.phone?.message}
                {...register("phone")}
              />

              <Input
                label="Email"
                type="email"
                placeholder="rajesh@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <Input
                label="Postal code"
                placeholder="363310"
                error={errors.postalCode?.message}
                {...register("postalCode")}
              />

              <Input
                label="City"
                placeholder="Dhrangadhra"
                error={errors.city?.message}
                {...register("city")}
              />

              <Input
                label="State"
                placeholder="Gujarat"
                error={errors.state?.message}
                {...register("state")}
              />
            </div>

            <Input
              label="Address"
              placeholder="12 Main Road"
              error={errors.address?.message}
              {...register("address")}
            />

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-200"
              >
                Notes
              </label>

              <textarea
                id="notes"
                rows={4}
                placeholder="Preferences or additional information..."
                className={[
                  "w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition",
                  "placeholder:text-slate-600 focus:ring-2 focus:ring-orange-500",
                  errors.notes ? "border-red-500 focus:ring-red-500" : "",
                ].join(" ")}
                {...register("notes")}
              />

              {errors.notes && (
                <p className="text-sm text-red-400">{errors.notes.message}</p>
              )}
            </div>

            {displayedError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {displayedError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/customers"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : submitLabel}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}
