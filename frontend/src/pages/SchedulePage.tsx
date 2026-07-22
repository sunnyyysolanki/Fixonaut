import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAppointments } from "@/features/scheduling/api/use-scheduling";
import type {
  Appointment,
  AppointmentStatus,
} from "@/features/scheduling/types";

function SchedulePage() {
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => getWeekStart(weekOffset), [weekOffset]);

  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart]);

  const from = weekStart.toISOString();
  const to = weekEnd.toISOString();

  const appointmentsQuery = useAppointments(from, to);

  const appointments = appointmentsQuery.data ?? [];

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">Operations</p>

          <h1 className="mt-1 text-3xl font-bold text-white">Schedule</h1>

          <p className="mt-2 text-slate-400">
            Plan technician appointments and monitor daily work.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setWeekOffset((value) => value - 1)}
          >
            ← Previous
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => setWeekOffset(0)}
          >
            This week
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setWeekOffset((value) => value + 1)}
          >
            Next →
          </Button>
        </div>

        <Link
          to="/appointments/new"
          className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          + New appointment
        </Link>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            {formatWeekRange(weekStart, weekEnd)}
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {appointments.length} appointment
            {appointments.length === 1 ? "" : "s"} scheduled
          </p>
        </CardHeader>

        <CardContent>
          {appointmentsQuery.isLoading && (
            <div className="grid gap-4 md:grid-cols-7">
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="h-48 animate-pulse rounded-xl bg-slate-800"
                />
              ))}
            </div>
          )}

          {appointmentsQuery.isError && (
            <div className="rounded-lg border border-red-900 bg-red-950/50 p-4 text-sm text-red-300">
              Unable to load appointments.
            </div>
          )}

          {!appointmentsQuery.isLoading && !appointmentsQuery.isError && (
            <div className="overflow-x-auto pb-2">
              <div className="grid min-w-[980px] grid-cols-7 gap-3">
                {days.map((day) => (
                  <DayColumn
                    key={day.toISOString()}
                    day={day}
                    appointments={getAppointmentsForDay(appointments, day)}
                  />
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function DayColumn({
  day,
  appointments,
}: {
  day: Date;
  appointments: Appointment[];
}) {
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={[
        "min-h-56 rounded-xl border p-3",
        isToday
          ? "border-orange-500/60 bg-orange-950/20"
          : "border-slate-800 bg-slate-950/60",
      ].join(" ")}
    >
      <div className="mb-4 border-b border-slate-800 pb-3">
        <p
          className={[
            "text-xs font-medium uppercase tracking-wide",
            isToday ? "text-orange-400" : "text-slate-500",
          ].join(" ")}
        >
          {new Intl.DateTimeFormat("en-IN", {
            weekday: "short",
          }).format(day)}
        </p>

        <p className="mt-1 text-lg font-semibold text-white">{day.getDate()}</p>
      </div>

      {appointments.length === 0 ? (
        <p className="text-xs text-slate-600">No appointments</p>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Link
      to={`/service-requests/${appointment.serviceRequestId}`}
      className="block rounded-lg border border-slate-700 bg-slate-900 p-3 transition hover:border-orange-500/60 hover:bg-slate-800"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-orange-400">
          {formatTime(appointment.startsAt)}
        </p>

        <AppointmentStatusBadge status={appointment.status} />
      </div>

      <p className="mt-2 line-clamp-2 text-sm font-medium text-white">
        {appointment.serviceRequestTitle}
      </p>

      <p className="mt-2 truncate text-xs text-slate-400">
        {appointment.technicianName}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {formatTime(appointment.startsAt)} – {formatTime(appointment.endsAt)}
      </p>
    </Link>
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

function getAppointmentsForDay(appointments: Appointment[], day: Date) {
  return appointments
    .filter((appointment) => isSameDay(new Date(appointment.startsAt), day))
    .sort(
      (first, second) =>
        new Date(first.startsAt).getTime() -
        new Date(second.startsAt).getTime(),
    );
}

function getWeekStart(offset: number) {
  const today = new Date();
  const day = today.getDay();
  const difference = day === 0 ? -6 : 1 - day;

  const monday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + difference + offset * 7,
  );

  monday.setHours(0, 0, 0, 0);

  return monday;
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function isSameDay(first: Date, second: Date) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function formatWeekRange(start: Date, end: Date) {
  const lastDay = addDays(end, -1);

  const formatter = new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(start)} – ${formatter.format(lastDay)}`;
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default SchedulePage;
