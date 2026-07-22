import { useState } from "react";
import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useInvoices } from "@/features/billing/api/use-billing";

import type {
  InvoiceStatus,
  PaymentStatus,
  InvoiceSummary,
} from "@/features/billing/types";

import { useDebounce } from "@/hooks/use-debounce";

function InvoicesPage() {
  const [searchInput, setSearchInput] = useState("");
  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | "">("");
  const [page, setPage] = useState(0);

  const debouncedSearch = useDebounce(searchInput);

  const { data, isLoading, isError, error } = useInvoices({
    page,
    size: 10,
    search: debouncedSearch,
    status: status || undefined,
    paymentStatus: paymentStatus || undefined,
  });

  const invoices = data?.content ?? [];

  function resetPage() {
    setPage(0);
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    resetPage();
  }

  function handleStatusChange(value: string) {
    setStatus(value as InvoiceStatus | "");
    resetPage();
  }

  function handlePaymentStatusChange(value: string) {
    setPaymentStatus(value as PaymentStatus | "");
    resetPage();
  }

  return (
    <section className="space-y-6">
      <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-400">Billing</p>

          <h1 className="mt-1 text-3xl font-bold text-white">Invoices</h1>

          <p className="mt-2 text-slate-400">
            Track invoices, payment status, and outstanding balances.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="w-full sm:w-64">
            <Input
              label="Search invoices"
              placeholder="Search number or request..."
              value={searchInput}
              onChange={(event) => handleSearchChange(event.target.value)}
            />
          </div>

          <FilterSelect
            label="Status"
            value={status}
            options={["DRAFT", "ISSUED", "CANCELLED"]}
            onChange={handleStatusChange}
          />

          <FilterSelect
            label="Payment"
            value={paymentStatus}
            options={["UNPAID", "PARTIALLY_PAID", "PAID"]}
            onChange={handlePaymentStatusChange}
          />
        </div>
      </header>

      {isLoading && <InvoicesLoading />}

      {isError && (
        <Card>
          <CardContent className="py-10 text-center">
            <p className="font-medium text-red-400">Unable to load invoices.</p>

            <p className="mt-2 text-sm text-slate-400">
              {getErrorMessage(error)}
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && invoices.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-semibold text-white">
              No invoices found
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Invoices will appear here after service work is billed.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && invoices.length > 0 && (
        <>
          <InvoiceDesktopTable invoices={invoices} />
          <InvoiceMobileCards invoices={invoices} />

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
        <option value="">All {label.toLowerCase()}</option>

        {options.map((option) => (
          <option key={option} value={option}>
            {formatLabel(option)}
          </option>
        ))}
      </select>
    </div>
  );
}

function InvoiceDesktopTable({ invoices }: { invoices: InvoiceSummary[] }) {
  return (
    <Card className="hidden overflow-hidden md:block">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-800 bg-slate-900">
            <tr>
              <th className="px-6 py-4 text-slate-400">Invoice</th>

              <th className="px-6 py-4 text-slate-400">Service request</th>

              <th className="px-6 py-4 text-slate-400">Status</th>

              <th className="px-6 py-4 text-slate-400">Payment</th>

              <th className="px-6 py-4 text-right text-slate-400">Total</th>

              <th className="px-6 py-4 text-slate-400">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800">
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="hover:bg-slate-800/50">
                <td className="px-6 py-4">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="font-medium text-white hover:text-orange-400"
                  >
                    {invoice.invoiceNumber}
                  </Link>

                  <p className="mt-1 text-xs text-slate-500">
                    {formatDate(invoice.createdAt)}
                  </p>
                </td>

                <td className="max-w-xs px-6 py-4">
                  <p className="truncate text-slate-300">
                    {invoice.serviceRequestTitle}
                  </p>
                </td>

                <td className="px-6 py-4">
                  <InvoiceStatusBadge status={invoice.status} />
                </td>

                <td className="px-6 py-4">
                  <PaymentStatusBadge status={invoice.paymentStatus} />
                </td>

                <td className="px-6 py-4 text-right font-medium text-white">
                  ₹{invoice.totalAmount.toFixed(2)}
                </td>

                <td className="px-6 py-4">
                  <Link
                    to={`/invoices/${invoice.id}`}
                    className="text-orange-400 hover:text-orange-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InvoiceMobileCards({ invoices }: { invoices: InvoiceSummary[] }) {
  return (
    <div className="grid gap-4 md:hidden">
      {invoices.map((invoice) => (
        <Card key={invoice.id}>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Link
                  to={`/invoices/${invoice.id}`}
                  className="block truncate font-semibold text-white hover:text-orange-400"
                >
                  {invoice.invoiceNumber}
                </Link>

                <p className="mt-1 truncate text-sm text-slate-400">
                  {invoice.serviceRequestTitle}
                </p>
              </div>

              <PaymentStatusBadge status={invoice.paymentStatus} />
            </div>

            <div className="flex items-center justify-between">
              <InvoiceStatusBadge status={invoice.status} />

              <p className="text-lg font-bold text-white">
                ₹{invoice.totalAmount.toFixed(2)}
              </p>
            </div>

            <Link
              to={`/invoices/${invoice.id}`}
              className="inline-flex text-sm text-orange-400 hover:text-orange-300"
            >
              View invoice →
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const variant = {
    DRAFT: "neutral",
    ISSUED: "info",
    CANCELLED: "danger",
  } as const;

  return <Badge variant={variant[status]}>{formatLabel(status)}</Badge>;
}

function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const variant = {
    UNPAID: "warning",
    PARTIALLY_PAID: "orange",
    PAID: "success",
  } as const;

  return <Badge variant={variant[status]}>{formatLabel(status)}</Badge>;
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

function InvoicesLoading() {
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
  }).format(new Date(value));
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Please try again.";
}

export default InvoicesPage;
