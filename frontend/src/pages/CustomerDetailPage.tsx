import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import {
  useCustomer,
  useDeactivateCustomer,
} from "@/features/customers/api/use-customers";
import { useServiceRequests } from "@/features/service-requests/api/use-service-requests";
import type { ServiceRequestStatus } from "@/features/service-requests/types";

function CustomerDetailPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [actionError, setActionError] = useState<string | null>(null);

  const customerQuery = useCustomer(customerId ?? "");
  const deactivateMutation = useDeactivateCustomer();

  if (customerQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8">
        Loading customer...
      </div>
    );
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">
            Customer not found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            The customer may have been removed or you may not have access.
          </p>

          <Link
            to="/customers"
            className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
          >
            ← Back to customers
          </Link>
        </CardContent>
      </Card>
    );
  }

  const customer = customerQuery.data;

  async function handleDeactivate() {
    const confirmed = window.confirm(
      "Are you sure you want to deactivate this customer?",
    );

    if (!confirmed) {
      return;
    }

    setActionError(null);

    try {
      await deactivateMutation.mutateAsync(customer.id);
      navigate("/customers");
    } catch {
      setActionError("Unable to deactivate customer.");
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/customers"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to customers
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-white">{customer.name}</h1>

            <Badge variant={customer.active ? "success" : "neutral"}>
              {customer.active ? "Active" : "Inactive"}
            </Badge>
          </div>

          <p className="mt-2 text-slate-400">
            Customer profile and service information.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            to={`/customers/${customer.id}/edit`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
          >
            Edit
          </Link>
          {customer.active && (
            <Button
              type="button"
              variant="danger"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
        >
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Contact information
            </h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <DetailRow label="Name" value={customer.name} />
            <DetailRow label="Phone" value={customer.phone} />
            <DetailRow label="Email" value={customer.email ?? "Not provided"} />

            <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-4">
              <a
                href={`tel:${customer.phone}`}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                📞 Call
              </a>

              {customer.email && (
                <a
                  href={`mailto:${customer.email}`}
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  ✉️ Email
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Address</h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <DetailRow
              label="Address"
              value={customer.address ?? "Not provided"}
            />
            <DetailRow label="City" value={customer.city ?? "Not provided"} />
            <DetailRow label="State" value={customer.state ?? "Not provided"} />
            <DetailRow
              label="Postal code"
              value={customer.postalCode ?? "Not provided"}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Notes</h2>
        </CardHeader>

        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-6 text-slate-400">
            {customer.notes || "No notes added."}
          </p>
        </CardContent>
      </Card>

      <CustomerServiceHistory customerId={customer.id} />
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-800 pb-3 last:border-0 last:pb-0 sm:flex-row sm:justify-between sm:gap-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="break-words text-sm text-slate-200 sm:text-right">
        {value}
      </span>
    </div>
  );
}

function CustomerServiceHistory({
  customerId,
}: {
  customerId: string;
}) {
  const requestsQuery = useServiceRequests({
    page: 0,
    size: 5,
    search: "",
    customerId,
  });

  const requests = requestsQuery.data?.content ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Service history</h2>

          <p className="mt-1 text-sm text-slate-400">
            Recent service requests for this customer.
          </p>
        </div>

        <Link
          to={`/service-requests/new?customerId=${customerId}`}
          className="inline-flex min-h-9 items-center justify-center rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          + New request
        </Link>
      </CardHeader>

      <CardContent>
        {requestsQuery.isLoading && (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-14 animate-pulse rounded-xl bg-slate-950"
              />
            ))}
          </div>
        )}

        {requestsQuery.isError && (
          <p className="text-sm text-red-400">
            Unable to load service history.
          </p>
        )}

        {!requestsQuery.isLoading &&
          !requestsQuery.isError &&
          requests.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 px-6 py-8 text-center">
              <p className="text-sm text-slate-500">
                No service requests found for this customer.
              </p>
            </div>
          )}

        {!requestsQuery.isLoading &&
          !requestsQuery.isError &&
          requests.length > 0 && (
            <div className="space-y-3">
              {requests.map((request) => (
                <Link
                  key={request.id}
                  to={`/service-requests/${request.id}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {request.title}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {formatServiceDate(request.createdAt)}
                    </p>
                  </div>

                  <ServiceStatusBadge status={request.status} />
                </Link>
              ))}
            </div>
          )}
      </CardContent>
    </Card>
  );
}

function ServiceStatusBadge({ status }: { status: ServiceRequestStatus }) {
  const variant = {
    NEW: "info",
    ASSIGNED: "neutral",
    ACCEPTED: "info",
    IN_PROGRESS: "orange",
    WAITING_FOR_PART: "warning",
    COMPLETED: "success",
    CANCELLED: "danger",
  } as const;

  const label = status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  return <Badge variant={variant[status]}>{label}</Badge>;
}

function formatServiceDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default CustomerDetailPage;
