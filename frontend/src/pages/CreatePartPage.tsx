import { useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useCreatePart } from "@/features/inventory/api/use-inventory";

import type { CreatePartValues } from "@/features/inventory/types";

const partSchema = z.object({
  sku: z
    .string()
    .trim()
    .min(1, "SKU is required")
    .max(80, "SKU must not exceed 80 characters"),

  name: z
    .string()
    .trim()
    .min(2, "Part name must be at least 2 characters")
    .max(180, "Part name must not exceed 180 characters"),

  unit: z.string().trim().max(30, "Unit must not exceed 30 characters"),

  reorderLevel: z.coerce
    .number()
    .int("Reorder level must be a whole number")
    .min(0, "Reorder level cannot be negative"),
});

function CreatePartPage() {
  const navigate = useNavigate();
  const createMutation = useCreatePart();

  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePartValues>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      sku: "",
      name: "",
      unit: "piece",
      reorderLevel: 0,
    },
  });

  async function onSubmit(values: CreatePartValues) {
    setServerError(null);

    try {
      await createMutation.mutateAsync(values);
      navigate("/inventory");
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create part",
        );
      } else {
        setServerError("Unable to create part");
      }
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link
          to="/inventory"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to inventory
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">Inventory</p>

        <h1 className="mt-1 text-3xl font-bold text-white">Add part</h1>

        <p className="mt-2 text-slate-400">
          Create a spare-part record for your organization.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Part details</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="SKU"
              placeholder="RO-FILTER-001"
              error={errors.sku?.message}
              {...register("sku")}
            />

            <Input
              label="Part name"
              placeholder="Sediment Filter"
              error={errors.name?.message}
              {...register("name")}
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Unit"
                placeholder="piece"
                error={errors.unit?.message}
                {...register("unit")}
              />

              <Input
                label="Reorder level"
                type="number"
                min={0}
                error={errors.reorderLevel?.message}
                {...register("reorderLevel")}
              />
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {serverError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to="/inventory"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
              >
                {isSubmitting || createMutation.isPending
                  ? "Creating..."
                  : "Create part"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default CreatePartPage;
