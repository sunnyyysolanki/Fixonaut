import { useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useServiceRequests } from "@/features/service-requests/api/use-service-requests";

import { useTechnicians } from "@/features/technicians/api/use-technicians";

import { useCreateAppointment } from "@/features/scheduling/api/use-scheduling";

import type { CreateAppointmentValues } from "@/features/scheduling/types";

const appointmentSchema = z
  .object({
    serviceRequestId: z.string().min(1, "Select a service request"),

    technicianId: z.string().min(1, "Select a technician"),

    startsAt: z.string().min(1, "Start time is required"),

    endsAt: z.string().min(1, "End time is required"),

    notes: z.string().max(1000, "Notes must not exceed 1000 characters"),
  })
  .refine(
    (values) =>
      new Date(values.startsAt).getTime() < new Date(values.endsAt).getTime(),
    {
      message: "End time must be after start time",
      path: ["endsAt"],
    },
  );

type AppointmentFormValues = z.infer<typeof appointmentSchema>;

function CreateAppointmentPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const createMutation = useCreateAppointment();

  const requestQuery = useServiceRequests({
    page: 0,
    size: 100,
    search: "",
  });

  const techniciansQuery = useTechnicians({
    page: 0,
    size: 100,
    search: "",
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      serviceRequestId: "",
      technicianId: "",
      startsAt: "",
      endsAt: "",
      notes: "",
    },
  });

  async function onSubmit(values: AppointmentFormValues) {
    setServerError(null);

    const request: CreateAppointmentValues = {
      serviceRequestId: values.serviceRequestId,
      technicianId: values.technicianId,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      notes: values.notes,
    };

    try {
      await createMutation.mutateAsync(request);
      navigate("/schedule");
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create appointment",
        );
      } else {
        setServerError("Unable to create appointment");
      }
    }
  }

  const requests = requestQuery.data?.content ?? [];
  const technicians = techniciansQuery.data?.content ?? [];

  const isLoading = requestQuery.isLoading || techniciansQuery.isLoading;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <Link
          to="/schedule"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to schedule
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">Scheduling</p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Create appointment
        </h1>

        <p className="mt-2 text-slate-400">
          Schedule a service request with an available technician.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Appointment details
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            The system will reject overlapping appointments.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="serviceRequestId"
                className="block text-sm font-medium text-slate-200"
              >
                Service request
              </label>

              <select
                id="serviceRequestId"
                disabled={isLoading}
                className={[
                  "min-h-10 w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500",
                  errors.serviceRequestId
                    ? "border-red-500"
                    : "border-slate-700",
                ].join(" ")}
                {...register("serviceRequestId")}
              >
                <option value="">
                  {isLoading ? "Loading requests..." : "Select service request"}
                </option>

                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.title} — {request.customerName}
                  </option>
                ))}
              </select>

              {errors.serviceRequestId && (
                <p className="text-sm text-red-400">
                  {errors.serviceRequestId.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label
                htmlFor="technicianId"
                className="block text-sm font-medium text-slate-200"
              >
                Technician
              </label>

              <select
                id="technicianId"
                disabled={isLoading}
                className={[
                  "min-h-10 w-full rounded-lg border bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500",
                  errors.technicianId ? "border-red-500" : "border-slate-700",
                ].join(" ")}
                {...register("technicianId")}
              >
                <option value="">
                  {isLoading ? "Loading technicians..." : "Select technician"}
                </option>

                {technicians.map((technician) => (
                  <option key={technician.userId} value={technician.userId}>
                    {technician.name} — {technician.serviceArea ?? "No area"}
                  </option>
                ))}
              </select>

              {errors.technicianId && (
                <p className="text-sm text-red-400">
                  {errors.technicianId.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                label="Start time"
                type="datetime-local"
                error={errors.startsAt?.message}
                {...register("startsAt")}
              />

              <Input
                label="End time"
                type="datetime-local"
                error={errors.endsAt?.message}
                {...register("endsAt")}
              />
            </div>

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
                placeholder="Add scheduling notes..."
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                {...register("notes")}
              />

              {errors.notes && (
                <p className="text-sm text-red-400">{errors.notes.message}</p>
              )}
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
                to="/schedule"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createMutation.isPending ||
                  isLoading ||
                  requests.length === 0 ||
                  technicians.length === 0
                }
              >
                {isSubmitting || createMutation.isPending
                  ? "Scheduling..."
                  : "Create appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

export default CreateAppointmentPage;
