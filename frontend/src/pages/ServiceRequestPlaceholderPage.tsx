import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  useAssignTechnician,
  useAcceptServiceRequest,
  useCancelServiceRequest,
  useCompleteServiceRequest,
  useServiceRequest,
  useStartServiceRequest,
  useWaitForPart,
} from "@/features/service-requests/api/use-service-requests";
import type {
  ServiceRequestPriority,
  ServiceRequestStatus,
} from "@/features/service-requests/types";
import { useTechnicians } from "@/features/technicians/api/use-technicians";

function ServiceRequestDetailPage() {
  const { requestId } = useParams<{
    requestId: string;
  }>();

  const navigate = useNavigate();

  const [selectedTechnician, setSelectedTechnician] = useState("");

  const [actionError, setActionError] = useState<string | null>(null);

  const requestQuery = useServiceRequest(requestId ?? "");

  const techniciansQuery = useTechnicians({
    page: 0,
    size: 100,
    search: "",
  });

  const assignMutation = useAssignTechnician();
  const acceptMutation = useAcceptServiceRequest();
  const startMutation = useStartServiceRequest();
  const waitForPartMutation = useWaitForPart();
  const completeMutation = useCompleteServiceRequest();
  const cancelMutation = useCancelServiceRequest();

  if (requestQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading service request...
      </div>
    );
  }

  if (requestQuery.isError || !requestQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">
            Service request not found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            The request may have been removed or you may not have access.
          </p>

          <Link
            to="/service-requests"
            className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
          >
            ← Back to service requests
          </Link>
        </CardContent>
      </Card>
    );
  }

  const request = requestQuery.data;
  const technicians = techniciansQuery.data?.content ?? [];

  const isBusy =
    assignMutation.isPending ||
    acceptMutation.isPending ||
    startMutation.isPending ||
    waitForPartMutation.isPending ||
    completeMutation.isPending ||
    cancelMutation.isPending;

  async function handleAssign() {
    if (!requestId || !selectedTechnician) {
      return;
    }

    setActionError(null);

    try {
      await assignMutation.mutateAsync({
        requestId,
        values: {
          technicianId: selectedTechnician,
        },
      });

      setSelectedTechnician("");
    } catch {
      setActionError("Unable to assign technician.");
    }
  }

  async function handleAccept() {
    await runAction(() =>
      acceptMutation.mutateAsync({
        requestId: requestId ?? "",
        values: {},
      }),
    );
  }

  async function handleStart() {
    await runAction(() =>
      startMutation.mutateAsync({
        requestId: requestId ?? "",
        values: {},
      }),
    );
  }

  async function handleWaitForPart() {
    await runAction(() =>
      waitForPartMutation.mutateAsync({
        requestId: requestId ?? "",
        values: {
          note: "Waiting for required spare part",
        },
      }),
    );
  }

  async function handleComplete() {
    const confirmed = window.confirm("Mark this service request as completed?");

    if (!confirmed) {
      return;
    }

    await runAction(() =>
      completeMutation.mutateAsync({
        requestId: requestId ?? "",
        values: {
          note: "Service completed",
        },
      }),
    );
  }

  async function handleCancel() {
    const confirmed = window.confirm("Cancel this service request?");

    if (!confirmed) {
      return;
    }

    await runAction(async () => {
      await cancelMutation.mutateAsync({
        requestId: requestId ?? "",
        values: {
          note: "Request cancelled from the detail page",
        },
      });

      navigate("/service-requests");
    });
  }

  async function runAction(action: () => Promise<unknown>) {
    setActionError(null);

    try {
      await action();
    } catch {
      setActionError(
        "This action could not be completed. Check the request status and your permissions.",
      );
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <Link
          to="/service-requests"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to service requests
        </Link>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{request.title}</h1>

              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Request ID: {request.id}
            </p>
          </div>

          <Link
            to="/service-requests"
            className="text-sm text-orange-400 hover:text-orange-300"
          >
            View all requests
          </Link>
        </div>
      </header>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Request details
            </h2>
          </CardHeader>

          <CardContent className="space-y-5">
            <DetailRow label="Customer" value={request.customerName} />

            <DetailRow
              label="Scheduled"
              value={formatDate(request.scheduledAt)}
            />

            <DetailRow
              label="Assigned technician"
              value={request.assignedTechnicianName ?? "Not assigned"}
            />

            <div className="border-t border-slate-800 pt-5">
              <p className="text-sm font-medium text-slate-300">Description</p>

              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">
                {request.description}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Assign technician
            </h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <select
              value={selectedTechnician}
              onChange={(event) => setSelectedTechnician(event.target.value)}
              disabled={
                request.status !== "NEW" || techniciansQuery.isLoading || isBusy
              }
              className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {techniciansQuery.isLoading
                  ? "Loading technicians..."
                  : "Select technician"}
              </option>

              {technicians.map((technician) => (
                <option key={technician.userId} value={technician.userId}>
                  {technician.name} — {technician.serviceArea ?? "No area"}
                </option>
              ))}
            </select>

            <Button
              type="button"
              className="w-full"
              onClick={handleAssign}
              disabled={
                !selectedTechnician || request.status !== "NEW" || isBusy
              }
            >
              {assignMutation.isPending ? "Assigning..." : "Assign technician"}
            </Button>

            {request.status !== "NEW" && (
              <p className="text-xs leading-5 text-slate-500">
                Only new requests can be assigned.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Workflow actions</h2>

          <p className="mt-1 text-sm text-slate-400">
            Available actions depend on the current request status.
          </p>
        </CardHeader>

        <CardContent className="flex flex-wrap gap-3">
          {request.status === "ASSIGNED" && (
            <Button type="button" onClick={handleAccept} disabled={isBusy}>
              {acceptMutation.isPending ? "Accepting..." : "Accept request"}
            </Button>
          )}

          {request.status === "ACCEPTED" && (
            <Button type="button" onClick={handleStart} disabled={isBusy}>
              {startMutation.isPending ? "Starting..." : "Start work"}
            </Button>
          )}

          {request.status === "IN_PROGRESS" && (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={handleWaitForPart}
                disabled={isBusy}
              >
                {waitForPartMutation.isPending
                  ? "Updating..."
                  : "Waiting for part"}
              </Button>

              <Button type="button" onClick={handleComplete} disabled={isBusy}>
                {completeMutation.isPending
                  ? "Completing..."
                  : "Complete request"}
              </Button>
            </>
          )}

          {request.status === "WAITING_FOR_PART" && (
            <Button type="button" onClick={handleStart} disabled={isBusy}>
              {startMutation.isPending ? "Resuming..." : "Resume work"}
            </Button>
          )}

          {!["COMPLETED", "CANCELLED"].includes(request.status) && (
            <Button
              type="button"
              variant="danger"
              onClick={handleCancel}
              disabled={isBusy}
            >
              {cancelMutation.isPending ? "Cancelling..." : "Cancel request"}
            </Button>
          )}

          {["COMPLETED", "CANCELLED"].includes(request.status) && (
            <p className="text-sm text-slate-500">
              No further workflow actions are available.
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-800 pb-4 sm:flex-row sm:justify-between sm:gap-6">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="break-words text-sm text-slate-200 sm:text-right">
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ status }: { status: ServiceRequestStatus }) {
  const variant = {
    NEW: "info",
    ASSIGNED: "neutral",
    ACCEPTED: "info",
    IN_PROGRESS: "orange",
    WAITING_FOR_PART: "warning",
    COMPLETED: "success",
    CANCELLED: "danger",
  } as const;

  return <Badge variant={variant[status]}>{formatLabel(status)}</Badge>;
}

function PriorityBadge({ priority }: { priority: ServiceRequestPriority }) {
  const variant = {
    LOW: "neutral",
    NORMAL: "info",
    HIGH: "warning",
    URGENT: "danger",
  } as const;

  return <Badge variant={variant[priority]}>{formatLabel(priority)}</Badge>;
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default ServiceRequestDetailPage;
