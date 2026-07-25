import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import {
  useDeactivateTechnician,
  useTechnicians,
  useUpdateTechnician,
} from "@/features/technicians/api/use-technicians";
import type { UpdateTechnicianValues } from "@/features/technicians/types";
import { useHasAnyRole } from "@/hooks/use-roles";

function EditTechnicianPage() {
  const { technicianId } = useParams<{ technicianId: string }>();
  const navigate = useNavigate();

  const techniciansQuery = useTechnicians({ page: 0, size: 100, search: "" });
  const updateMutation = useUpdateTechnician();
  const deactivateMutation = useDeactivateTechnician();

  const canManageTechnicians = useHasAnyRole("OWNER", "ADMIN");

  const technician = techniciansQuery.data?.content.find(
    (item) => item.id === technicianId,
  );

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [skills, setSkills] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (technician && !seeded) {
      setName(technician.name);
      setPhone(technician.phone);
      setSkills(technician.skills ?? "");
      setServiceArea(technician.serviceArea ?? "");
      setSeeded(true);
    }
  }, [technician, seeded]);

  if (!canManageTechnicians) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">Not authorized</h1>

          <p className="mt-2 text-sm text-slate-400">
            You do not have permission to edit technicians.
          </p>

          <Link
            to="/technicians"
            className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
          >
            ← Back to technicians
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (techniciansQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading technician...
      </div>
    );
  }

  if (techniciansQuery.isError || !technician) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">
            Technician not found
          </h1>

          <Link
            to="/technicians"
            className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
          >
            ← Back to technicians
          </Link>
        </CardContent>
      </Card>
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!technicianId) {
      return;
    }

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    if (!phone.trim()) {
      setError("Phone is required.");
      return;
    }

    const values: UpdateTechnicianValues = {
      name: name.trim(),
      phone: phone.trim(),
      skills: skills.trim(),
      serviceArea: serviceArea.trim(),
    };

    try {
      await updateMutation.mutateAsync({ technicianId, values });
      navigate("/technicians");
    } catch (requestError) {
      setError(getMessage(requestError, "Unable to update technician."));
    }
  }

  async function handleDeactivate() {
    if (!technicianId) {
      return;
    }

    if (
      !window.confirm(
        "Deactivate this technician? They will no longer be assignable.",
      )
    ) {
      return;
    }

    setError(null);

    try {
      await deactivateMutation.mutateAsync(technicianId);
      navigate("/technicians");
    } catch (requestError) {
      setError(getMessage(requestError, "Unable to deactivate technician."));
    }
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <header>
        <Link
          to="/technicians"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to technicians
        </Link>

        <h1 className="mt-6 text-3xl font-bold text-white">Edit technician</h1>

        <p className="mt-2 text-slate-400">
          Update details for {technician.name}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Details</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />

            <Input
              label="Phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />

            <Input
              label="Skills"
              hint="Comma-separated, optional."
              value={skills}
              onChange={(event) => setSkills(event.target.value)}
            />

            <Input
              label="Service area"
              hint="Optional."
              value={serviceArea}
              onChange={(event) => setServiceArea(event.target.value)}
            />

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              {technician.active ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleDeactivate}
                  disabled={deactivateMutation.isPending}
                >
                  {deactivateMutation.isPending
                    ? "Deactivating..."
                    : "Deactivate"}
                </Button>
              ) : (
                <span className="self-center text-sm text-slate-500">
                  This technician is inactive.
                </span>
              )}

              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function getMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
}

export default EditTechnicianPage;
