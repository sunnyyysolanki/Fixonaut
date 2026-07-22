import { useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import {
  useTechnicians,
} from "@/features/technicians/api/use-technicians";

import {
  useCreateTechnicianAvailability,
  useTechnicianAvailability,
} from "@/features/scheduling/api/use-scheduling";

const days = [
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
  { value: 7, label: "Sunday" },
];

function TechnicianAvailabilityPage() {
  const { technicianId } = useParams<{
    technicianId: string;
  }>();

  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [error, setError] = useState<string | null>(null);

  const techniciansQuery = useTechnicians({
    page: 0,
    size: 100,
    search: "",
  });

  const availabilityQuery = useTechnicianAvailability(
    technicianId ?? "",
  );

  const createMutation =
    useCreateTechnicianAvailability();

  const technician = techniciansQuery.data?.content.find(
    (item) => item.id === technicianId,
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError(null);

    if (!technicianId) {
      setError("Technician ID is missing.");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time.");
      return;
    }

    try {
      await createMutation.mutateAsync({
        technicianId,
        dayOfWeek: Number(dayOfWeek),
        startTime: `${startTime}:00`,
        endTime: `${endTime}:00`,
      });
    } catch (requestError) {
      if (isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Unable to save availability.",
        );
      } else {
        setError("Unable to save availability.");
      }
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link
          to="/technicians"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to technicians
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">
          Scheduling
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Technician availability
        </h1>

        <p className="mt-2 text-slate-400">
          {technician
            ? `Configure working hours for ${technician.name}.`
            : "Configure weekly working hours."}
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Add availability window
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            You can create multiple windows per day.
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor="dayOfWeek"
                  className="block text-sm font-medium text-slate-200"
                >
                  Day
                </label>

                <select
                  id="dayOfWeek"
                  value={dayOfWeek}
                  onChange={(event) =>
                    setDayOfWeek(event.target.value)
                  }
                  className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {days.map((day) => (
                    <option
                      key={day.value}
                      value={day.value}
                    >
                      {day.label}
                    </option>
                  ))}
                </select>
              </div>

              <Input
                label="Start time"
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
              />

              <Input
                label="End time"
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending
                ? "Saving..."
                : "Add availability"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Current availability
          </h2>
        </CardHeader>

        <CardContent>
          {availabilityQuery.isLoading && (
            <p className="text-sm text-slate-400">
              Loading availability...
            </p>
          )}

          {!availabilityQuery.isLoading &&
            availabilityQuery.data?.length === 0 && (
              <p className="text-sm text-slate-400">
                No availability windows configured.
              </p>
            )}

          <div className="space-y-3">
            {availabilityQuery.data?.map((availability) => (
              <div
                key={availability.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-white">
                    {getDayName(availability.dayOfWeek)}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {availability.startTime.slice(0, 5)}
                    {" – "}
                    {availability.endTime.slice(0, 5)}
                  </p>
                </div>

                <Badge
                  variant={
                    availability.active
                      ? "success"
                      : "neutral"
                  }
                >
                  {availability.active
                    ? "Active"
                    : "Inactive"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function getDayName(dayOfWeek: number) {
  return (
    days.find((day) => day.value === dayOfWeek)?.label ??
    "Unknown day"
  );
}

export default TechnicianAvailabilityPage;