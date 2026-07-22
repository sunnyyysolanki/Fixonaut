import { useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCustomers } from "@/features/customers/api/use-customers";
import { useCreateServiceRequest } from "@/features/service-requests/api/use-service-requests";
import type {
  CreateServiceRequestValues,
  ServiceRequestPriority,
} from "@/features/service-requests/types";

const serviceRequestSchema = z.object({
  customerId: z.string().min(1, "Select a customer"),

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(180, "Title must not exceed 180 characters"),

  description: z
    .string()
    .trim()
    .min(5, "Description must be at least 5 characters")
    .max(5000, "Description must not exceed 5000 characters"),

  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]),

  scheduledAt: z.string(),
});

type ServiceRequestFormValues = z.infer<typeof serviceRequestSchema>;

function CreateServiceRequestPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateServiceRequest();

  const customersQuery = useCustomers({
    page: 0,
    size: 100,
    search: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      customerId: "",
      title: "",
      description: "",
      priority: "NORMAL",
      scheduledAt: "",
    },
  });

  async function onSubmit(values: ServiceRequestFormValues) {
    setServerError(null);

    const scheduledAt = values.scheduledAt
      ? new Date(values.scheduledAt).toISOString()
      : null;

    const request: CreateServiceRequestValues = {
      customerId: values.customerId,
      title: values.title,
      description: values.description,
      priority: values.priority as ServiceRequestPriority,
      scheduledAt,
    };

    try {
      await createMutation.mutateAsync(request);
      navigate("/service-requests");
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create service request",
        );
      } else {
        setServerError("Unable to create service request");
      }
    }
  }

  const customers = customersQuery.data?.content ?? [];

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          to="/service-requests"
          className="text-sm text-slate-400 transition hover:text-white"
        >
          ← Back to service requests
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">
          Service Requests
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Create service request
        </h1>

        <p className="mt-2 text-slate-400">
          Record a new customer issue for your service team.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Request details</h2>

          <p className="mt-1 text-sm text-slate-400">
            Add enough information for the technician to understand the job.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="customerId"
                className="block text-sm font-medium text-slate-200"
              >
                Customer
              </label>

              <select
                id="customerId"
                className={[
                  "min-h-10 w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500",
                  errors.customerId ? "border-red-500" : "border-slate-700",
                ].join(" ")}
                disabled={customersQuery.isLoading}
                {...register("customerId")}
              >
                <option value="">
                  {customersQuery.isLoading
                    ? "Loading customers..."
                    : "Select a customer"}
                </option>

                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} — {customer.phone}
                  </option>
                ))}
              </select>

              {errors.customerId && (
                <p className="text-sm text-red-400">
                  {errors.customerId.message}
                </p>
              )}

              {!customersQuery.isLoading && customers.length === 0 && (
                <p className="text-sm text-amber-400">
                  No active customers exist. Create a customer first.
                </p>
              )}
            </div>

            <Input
              label="Title"
              placeholder="RO purifier is leaking"
              error={errors.title?.message}
              {...register("title")}
            />

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-slate-200"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={5}
                placeholder="Describe the customer issue..."
                className={[
                  "w-full resize-y rounded-lg border bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500",
                  errors.description ? "border-red-500" : "border-slate-700",
                ].join(" ")}
                {...register("description")}
              />

              {errors.description && (
                <p className="text-sm text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-slate-200"
                >
                  Priority
                </label>

                <select
                  id="priority"
                  className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                  {...register("priority")}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              <Input
                label="Scheduled date and time"
                type="datetime-local"
                error={errors.scheduledAt?.message}
                {...register("scheduledAt")}
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
                to="/service-requests"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  customersQuery.isLoading ||
                  customers.length === 0
                }
              >
                {isSubmitting || createMutation.isPending
                  ? "Creating..."
                  : "Create request"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default CreateServiceRequestPage;
