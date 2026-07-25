import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { QuickPicks } from "@/components/ui/QuickPicks";

import {
  useAppointment,
  useCancelAppointment,
  useCompleteAppointment,
  useConfirmAppointment,
  useStartAppointment,
  useUpdateAppointment,
} from "@/features/scheduling/api/use-scheduling";
import type { AppointmentStatus } from "@/features/scheduling/types";
import { addHours, nextHour, toDateTimeLocalValue } from "@/lib/datetime";
import { useHasAnyRole } from "@/hooks/use-roles";
import { useAuthStore } from "@/stores/auth-store";

function AppointmentDetailPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();

  const appointmentQuery = useAppointment(appointmentId ?? "");

  const confirmMutation = useConfirmAppointment();
  const startMutation = useStartAppointment();
  const completeMutation = useCompleteAppointment();
  const cancelMutation = useCancelAppointment();
  const updateMutation = useUpdateAppointment();

  const isOwnerOrAdmin = useHasAnyRole("OWNER", "ADMIN");
  const isDispatcher = useHasAnyRole("DISPATCHER");
  const isTechnician = useHasAnyRole("TECHNICIAN");
  const currentUserId = useAuthStore((state) => state.user?.id);

  const [actionError, setActionError] = useState<string | null>(null);

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [notes, setNotes] = useState("");
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  const appointment = appointmentQuery.data;

  // Seed the reschedule form from the loaded appointment once.
  useEffect(() => {
    if (appointment && !seeded) {
      setStartsAt(toDateTimeLocalValue(new Date(appointment.startsAt)));
      setEndsAt(toDateTimeLocalValue(new Date(appointment.endsAt)));
      setNotes(appointment.notes ?? "");
      setSeeded(true);
    }
  }, [appointment, seeded]);

  if (appointmentQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading appointment...
      </div>
    );
  }

  if (appointmentQuery.isError || !appointment) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">
            Appointment not found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            It may have been removed or you may not have access.
          </p>

          <Link
            to="/schedule"
            className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
          >
            ← Back to schedule
          </Link>
        </CardContent>
      </Card>
    );
  }

  const isFinal =
    appointment.status === "COMPLETED" ||
    appointment.status === "CANCELLED" ||
    appointment.status === "NO_SHOW";

  const isAssignedTechnician =
    isTechnician && appointment.technicianId === currentUserId;

  const canConfirm = isOwnerOrAdmin || isDispatcher;
  const canStartComplete = isOwnerOrAdmin || isAssignedTechnician;
  const canCancel = isOwnerOrAdmin || isDispatcher || isAssignedTechnician;
  const canReschedule = (isOwnerOrAdmin || isDispatcher) && !isFinal;

  const isBusy =
    confirmMutation.isPending ||
    startMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending ||
    updateMutation.isPending;

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null);
    try {
      await action();
    } catch (error) {
      setActionError(getMessage(error, "This action could not be completed."));
    }
  }

  async function handleReschedule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRescheduleError(null);

    if (!appointmentId) {
      return;
    }

    if (!startsAt || !endsAt) {
      setRescheduleError("Start and end time are required.");
      return;
    }

    if (new Date(startsAt).getTime() >= new Date(endsAt).getTime()) {
      setRescheduleError("End time must be after start time.");
      return;
    }

    try {
      await updateMutation.mutateAsync({
        appointmentId,
        values: {
          startsAt: new Date(startsAt).toISOString(),
          endsAt: new Date(endsAt).toISOString(),
          notes,
        },
      });
    } catch (error) {
      setRescheduleError(getMessage(error, "Unable to reschedule appointment."));
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link
          to="/schedule"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to schedule
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-white">
            {appointment.serviceRequestTitle}
          </h1>

          <AppointmentStatusBadge status={appointment.status} />
        </div>

        <Link
          to={`/service-requests/${appointment.serviceRequestId}`}
          className="mt-2 inline-flex text-sm text-orange-400 hover:text-orange-300"
        >
          View service request →
        </Link>
      </header>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Details</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <DetailRow label="Technician" value={appointment.technicianName} />
          <DetailRow label="Starts" value={formatDate(appointment.startsAt)} />
          <DetailRow label="Ends" value={formatDate(appointment.endsAt)} />
          <DetailRow label="Notes" value={appointment.notes ?? "—"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Actions</h2>

          <p className="mt-1 text-sm text-slate-400">
            Available actions depend on the current status.
          </p>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          {canConfirm && appointment.status === "SCHEDULED" && (
            <Button
              type="button"
              disabled={isBusy}
              onClick={() =>
                runAction(() => confirmMutation.mutateAsync(appointment.id))
              }
            >
              {confirmMutation.isPending ? "Confirming..." : "Confirm"}
            </Button>
          )}

          {canStartComplete && appointment.status === "CONFIRMED" && (
            <Button
              type="button"
              disabled={isBusy}
              onClick={() =>
                runAction(() => startMutation.mutateAsync(appointment.id))
              }
            >
              {startMutation.isPending ? "Starting..." : "Start work"}
            </Button>
          )}

          {canStartComplete && appointment.status === "IN_PROGRESS" && (
            <Button
              type="button"
              disabled={isBusy}
              onClick={() =>
                runAction(() => completeMutation.mutateAsync(appointment.id))
              }
            >
              {completeMutation.isPending ? "Completing..." : "Complete"}
            </Button>
          )}

          {canCancel && !isFinal && (
            <Button
              type="button"
              variant="danger"
              disabled={isBusy}
              onClick={() => {
                if (window.confirm("Cancel this appointment?")) {
                  runAction(() => cancelMutation.mutateAsync(appointment.id));
                }
              }}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel"}
            </Button>
          )}

          {isFinal && (
            <p className="text-sm text-slate-500">
              No further actions are available.
            </p>
          )}
        </CardContent>
      </Card>

      {canReschedule && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Reschedule</h2>

            <p className="mt-1 text-sm text-slate-400">
              Update the time window or notes. Overlaps are rejected.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleReschedule} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Input
                    label="Start time"
                    type="datetime-local"
                    min={toDateTimeLocalValue(new Date())}
                    hint="When the technician should arrive."
                    value={startsAt}
                    onChange={(event) => setStartsAt(event.target.value)}
                  />

                  <QuickPicks
                    options={[
                      {
                        label: "Next hour",
                        value: toDateTimeLocalValue(nextHour()),
                      },
                    ]}
                    onPick={(value) => setStartsAt(value)}
                  />
                </div>

                <div className="space-y-2">
                  <Input
                    label="End time"
                    type="datetime-local"
                    min={startsAt || toDateTimeLocalValue(new Date())}
                    hint="Must be after the start time."
                    value={endsAt}
                    onChange={(event) => setEndsAt(event.target.value)}
                  />

                  <QuickPicks
                    label="Duration:"
                    options={[
                      { label: "+1 hour", value: "1" },
                      { label: "+2 hours", value: "2" },
                    ]}
                    onPick={(value) => {
                      const base = startsAt ? new Date(startsAt) : nextHour();
                      if (!startsAt) {
                        setStartsAt(toDateTimeLocalValue(base));
                      }
                      setEndsAt(
                        toDateTimeLocalValue(addHours(base, Number(value))),
                      );
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="appointment-notes"
                  className="block text-sm font-medium text-slate-200"
                >
                  Notes
                </label>

                <textarea
                  id="appointment-notes"
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {rescheduleError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
                >
                  {rescheduleError}
                </div>
              )}

              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm text-slate-200">{value}</span>
    </div>
  );
}

function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const variant = {
    SCHEDULED: "info",
    CONFIRMED: "success",
    IN_PROGRESS: "orange",
    COMPLETED: "success",
    CANCELLED: "danger",
    NO_SHOW: "warning",
  } as const;

  return <Badge variant={variant[status]}>{formatLabel(status)}</Badge>;
}

function getMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default AppointmentDetailPage;
