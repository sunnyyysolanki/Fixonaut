import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useCustomers } from "@/features/customers/api/use-customers";
import type { Customer } from "@/features/customers/types";
import { useDebounce } from "@/hooks/use-debounce";

function CustomersPage() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchInput);

  const filters = {
    page,
    size: 10,
    search: debouncedSearch,
  };

  const { data, isLoading, isError, error } = useCustomers(filters);

  const customers = data?.content ?? [];

  function handleSearchChange(value: string) {
    setSearchInput(value);
    setPage(0);
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">Operations</p>

          <h1 className="mt-1 text-3xl font-bold text-white">Customers</h1>

          <p className="mt-2 text-slate-400">
            Manage customers and their service history.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-full sm:w-72">
            <Input
              label="Search customers"
              placeholder="Search by name or phone..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <Link
            to="/customers/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            + New customer
          </Link>
        </div>
      </header>

      {isLoading && <CustomersLoading />}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-400">
              Unable to load customers.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {getErrorMessage(error)}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && customers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-xl text-slate-400">
              +
            </div>

            <h2 className="mt-4 text-lg font-semibold text-white">
              No customers found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              {searchInput
                ? "Try a different search term."
                : "Create your first customer to get started."}
            </p>

            {!searchInput && (
              <Link
                to="/customers/new"
                className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                + Create first customer
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && customers.length > 0 && (
        <>
          <CustomerDesktopTable customers={customers} />

          <CustomerMobileCards customers={customers} />

          <Pagination
            currentPage={page}
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

function CustomerDesktopTable({ customers }: { customers: Customer[] }) {
  return (
    <Card className="hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900">
            <tr>
              <th className="px-6 py-4 font-medium text-slate-400">Customer</th>

              <th className="px-6 py-4 font-medium text-slate-400">Phone</th>

              <th className="px-6 py-4 font-medium text-slate-400">Email</th>

              <th className="px-6 py-4 font-medium text-slate-400">Location</th>

              <th className="px-6 py-4 font-medium text-slate-400">Status</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="transition hover:bg-slate-800/50"
              >
                <td className="whitespace-nowrap px-6 py-4 font-medium">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="text-white hover:text-orange-400"
                  >
                    {customer.name}
                  </Link>
                </td>

                <td className="whitespace-nowrap px-6 py-4 text-slate-300">
                  {customer.phone}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {customer.email ?? "—"}
                </td>

                <td className="px-6 py-4 text-slate-400">
                  {formatLocation(customer.city, customer.state)}
                </td>

                <td className="px-6 py-4">
                  <CustomerStatus active={customer.active} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CustomerMobileCards({ customers }: { customers: Customer[] }) {
  return (
    <div className="grid gap-4 md:hidden">
      {customers.map((customer) => (
        <Card key={customer.id}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/customers/${customer.id}`}
                  className="block truncate font-semibold text-white hover:text-orange-400"
                >
                  {customer.name}
                </Link>

                <p className="mt-1 text-sm text-slate-400">{customer.phone}</p>
              </div>

              <CustomerStatus active={customer.active} />
            </div>

            <div className="space-y-2 text-sm">
              <p className="break-words text-slate-400">
                {customer.email ?? "No email provided"}
              </p>

              <p className="text-slate-400">
                {formatLocation(customer.city, customer.state)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CustomerStatus({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Active" : "Inactive"}
    </Badge>
  );
}

function Pagination({
  currentPage,
  totalPages,
  hasPrevious,
  hasNext,
  onPrevious,
  onNext,
}: {
  currentPage: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-400">
        Page {currentPage + 1} of {Math.max(totalPages, 1)}
      </p>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={onPrevious}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        <button
          type="button"
          disabled={!hasNext}
          onClick={onNext}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function CustomersLoading() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-2xl bg-slate-900"
        />
      ))}
    </div>
  );
}

function formatLocation(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(", ") || "—";
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Please try again.";
}

export default CustomersPage;
