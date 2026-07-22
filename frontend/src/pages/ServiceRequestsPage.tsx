import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useServiceRequests } from "@/features/service-requests/api/use-service-requests";
import type {
  ServiceRequest,
  ServiceRequestPriority,
  ServiceRequestStatus,
} from "@/features/service-requests/types";
import { useDebounce } from "@/hooks/use-debounce";

function ServiceRequestsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<ServiceRequestStatus | "">("");
  const [priority, setPriority] = useState<ServiceRequestPriority | "">("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchInput);

  const filters = {
    page,
    size: 10,
    search: debouncedSearch,
    status: status || undefined,
    priority: priority || undefined,
  };

  const { data, isLoading, isError, error } = useServiceRequests(filters);

  const requests = data?.content ?? [];

  function resetPage() {
    setPage(0);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    resetPage();
  }

  function handleStatusChange(value: string) {
    setStatus(value as ServiceRequestStatus | "");
    resetPage();
  }

  function handlePriorityChange(value: string) {
    setPriority(value as ServiceRequestPriority | "");
    resetPage();
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">Operations</p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Service Requests
          </h1>

          <p className="mt-2 text-slate-400">
            Track and manage active customer service work.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-64">
            <Input
              label="Search requests"
              placeholder="Search title or description..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <FilterSelect
            label="Status"
            value={status}
            onChange={handleStatusChange}
            options={[
              "NEW",
              "ASSIGNED",
              "ACCEPTED",
              "IN_PROGRESS",
              "WAITING_FOR_PART",
              "COMPLETED",
              "CANCELLED",
            ]}
          />

          <FilterSelect
            label="Priority"
            value={priority}
            onChange={handlePriorityChange}
            options={["LOW", "NORMAL", "HIGH", "URGENT"]}
          />

          <Link
            to="/service-requests/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            + New request
          </Link>
        </div>
      </header>

      {isLoading && <ServiceRequestsLoading />}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-400">
              Unable to load service requests.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {getErrorMessage(error)}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && requests.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-semibold text-white">
              No service requests found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Create a request to begin tracking service work.
            </p>

            <Link
              to="/service-requests/new"
              className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
            >
              + Create request
            </Link>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <>
          <ServiceRequestTable requests={requests} />
          <ServiceRequestCards requests={requests} />

          <Pagination
            page={page}
            totalPages={data?.totalPages ?? 0}
            hasPrevious={page > 0}
            hasNext={data ? !data.last : false}
            onPrevious={() => setPage((currentPage) => currentPage - 1)}
            onNext={() => setPage((currentPage) => currentPage + 1)}
          />
        </>
      )}
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="w-full sm:w-44">
      <label
        htmlFor={label}
        className="mb-2 block text-sm font-medium text-slate-200"
      >
        {label}
      </label>

      <select
        id={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
      >
        <option value="">All {label.toLowerCase()}s</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function ServiceRequestTable({ requests }: { requests: ServiceRequest[] }) {
  return (
    <Card className="hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-slate-400">Request</th>

              <th className="px-6 py-4 text-slate-400">Customer</th>

              <th className="px-6 py-4 text-slate-400">Priority</th>

              <th className="px-6 py-4 text-slate-400">Status</th>

              <th className="px-6 py-4 text-slate-400">Technician</th>

              <th className="px-6 py-4 text-slate-400">Scheduled</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {requests.map((request) => (
              <tr key={request.id} className="hover:bg-slate-800/50">
                <td className="max-w-xs px-6 py-4">
                  <Link
                    to={`/service-requests/${request.id}`}
                    className="font-medium text-white hover:text-orange-400"
                  >
                    {request.title}
                  </Link>

                  <p className="mt-1 truncate text-xs text-slate-500">
                    {request.description}
                  </p>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                  {request.customerName}
                </td>

                <td className="px-6 py-4">
                  <PriorityBadge priority={request.priority} />
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={request.status} />
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {request.assignedTechnicianName ?? "Unassigned"}
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-slate-400">
                  {formatDate(request.scheduledAt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function ServiceRequestCards({ requests }: { requests: ServiceRequest[] }) {
  return (
    <div className="grid gap-4 md:hidden">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/service-requests/${request.id}`}
                  className="block truncate font-semibold text-white hover:text-orange-400"
                >
                  {request.title}
                </Link>

                <p className="mt-1 text-sm text-slate-400">
                  {request.customerName}
                </p>
              </div>

              <StatusBadge status={request.status} />
            </div>

            <p className="text-sm leading-6 text-slate-400">
              {request.description}
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <PriorityBadge priority={request.priority} />

              <span className="text-xs text-slate-500">
                {request.assignedTechnicianName ?? "Unassigned"}
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Scheduled: {formatDate(request.scheduledAt)}
            </p>
          </CardContent>
        </Card>
      ))}
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

function Pagination({
  page,
  totalPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        Page {page + 1} of {Math.max(totalPages, 1)}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ServiceRequestsLoading() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-24 animate-pulse rounded-2xl bg-slate-900"
        />
      ))}
    </div>
  );
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Please try again.";
}

export default ServiceRequestsPage;
