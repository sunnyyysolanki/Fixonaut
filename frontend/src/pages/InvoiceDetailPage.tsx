import { useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/Card";

import {
  useCancelInvoice,
  useInvoice,
  useIssueInvoice,
  useRecordPayment,
} from "@/features/billing/api/use-billing";

import type {
  InvoiceStatus,
  PaymentStatus,
} from "@/features/billing/types";

function InvoiceDetailPage() {
  const { invoiceId } = useParams<{
    invoiceId: string;
  }>();

  const [paymentAmount, setPaymentAmount] = useState("");
  const [error, setError] = useState<string | null>(null);

  const invoiceQuery = useInvoice(invoiceId ?? "");

  const issueMutation = useIssueInvoice();
  const cancelMutation = useCancelInvoice();
  const paymentMutation = useRecordPayment();

  if (invoiceQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading invoice...
      </div>
    );
  }

  if (invoiceQuery.isError || !invoiceQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">
            Invoice not found
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            The invoice may have been removed or you may not have
            access.
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

  const invoice = invoiceQuery.data;

  const isBusy =
    issueMutation.isPending ||
    cancelMutation.isPending ||
    paymentMutation.isPending;

  const remainingAmount = Math.max(
    0,
    invoice.totalAmount - invoice.amountPaid,
  );

  async function handleIssue() {
    if (!invoiceId) {
      return;
    }

    setError(null);

    try {
      await issueMutation.mutateAsync(invoiceId);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function handleCancel() {
    if (!invoiceId) {
      return;
    }

    const confirmed = window.confirm(
      "Cancel this invoice?",
    );

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await cancelMutation.mutateAsync(invoiceId);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  async function handlePayment(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!invoiceId) {
      return;
    }

    const amount = Number(paymentAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }

    if (amount > remainingAmount) {
      setError(
        "Payment cannot exceed the remaining invoice amount.",
      );
      return;
    }

    setError(null);

    try {
      await paymentMutation.mutateAsync({
        invoiceId,
        values: {
          amount,
        },
      });

      setPaymentAmount("");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <Link
          to={`/service-requests/${invoice.serviceRequestId}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to service request
        </Link>

        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                {invoice.invoiceNumber}
              </h1>

              <InvoiceStatusBadge
                status={invoice.status}
              />

              <PaymentStatusBadge
                status={invoice.paymentStatus}
              />
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Service request: {invoice.serviceRequestId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {invoice.status === "DRAFT" && (
              <Button
                type="button"
                onClick={handleIssue}
                disabled={isBusy}
              >
                {issueMutation.isPending
                  ? "Issuing..."
                  : "Issue invoice"}
              </Button>
            )}

            {invoice.status !== "CANCELLED" &&
              invoice.paymentStatus !== "PAID" && (
                <Button
                  type="button"
                  variant="danger"
                  onClick={handleCancel}
                  disabled={isBusy}
                >
                  {cancelMutation.isPending
                    ? "Cancelling..."
                    : "Cancel invoice"}
                </Button>
              )}
          </div>
        </div>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
        >
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Invoice items
          </h2>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-slate-400">
                    Type
                  </th>

                  <th className="px-4 py-3 text-slate-400">
                    Description
                  </th>

                  <th className="px-4 py-3 text-right text-slate-400">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right text-slate-400">
                    Unit price
                  </th>

                  <th className="px-4 py-3 text-right text-slate-400">
                    Total
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {invoice.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-slate-400">
                      {formatLabel(item.itemType)}
                    </td>

                    <td className="px-4 py-4 text-white">
                      {item.description}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-300">
                      {item.quantity}
                    </td>

                    <td className="px-4 py-4 text-right text-slate-300">
                      ₹{item.unitPrice.toFixed(2)}
                    </td>

                    <td className="px-4 py-4 text-right font-medium text-white">
                      ₹{item.lineTotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Invoice summary
            </h2>
          </CardHeader>

          <CardContent className="space-y-3">
            <SummaryRow
              label="Subtotal"
              value={invoice.subtotal}
            />

            <SummaryRow
              label="Discount"
              value={-invoice.discountAmount}
            />

            <SummaryRow
              label="Tax"
              value={invoice.taxAmount}
            />

            <div className="border-t border-slate-800 pt-3">
              <SummaryRow
                label="Total"
                value={invoice.totalAmount}
                strong
              />
            </div>

            <SummaryRow
              label="Amount paid"
              value={invoice.amountPaid}
            />

            <div className="border-t border-slate-800 pt-3">
              <SummaryRow
                label="Remaining"
                value={remainingAmount}
                strong
              />
            </div>

            {invoice.issuedAt && (
              <p className="pt-3 text-sm text-slate-500">
                Issued on {formatDate(invoice.issuedAt)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">
              Record payment
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Remaining balance: ₹
              {remainingAmount.toFixed(2)}
            </p>
          </CardHeader>

          <CardContent>
            {invoice.status !== "ISSUED" && (
              <p className="text-sm text-slate-500">
                The invoice must be issued before recording payment.
              </p>
            )}

            {invoice.paymentStatus === "PAID" && (
              <p className="text-sm text-emerald-400">
                This invoice is fully paid.
              </p>
            )}

            {invoice.status === "ISSUED" &&
              invoice.paymentStatus !== "PAID" && (
                <form
                  onSubmit={handlePayment}
                  className="space-y-5"
                >
                  <label
                    htmlFor="paymentAmount"
                    className="block text-sm font-medium text-slate-200"
                  >
                    Payment amount
                  </label>

                  <input
                    id="paymentAmount"
                    type="number"
                    min={0.01}
                    max={remainingAmount}
                    step="0.01"
                    value={paymentAmount}
                    onChange={(event) =>
                      setPaymentAmount(event.target.value)
                    }
                    placeholder={remainingAmount.toFixed(2)}
                    className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                  />

                  <Button
                    type="submit"
                    disabled={isBusy}
                  >
                    {paymentMutation.isPending
                      ? "Recording..."
                      : "Record payment"}
                  </Button>
                </form>
              )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  const variant = {
    DRAFT: "neutral",
    ISSUED: "info",
    CANCELLED: "danger",
  } as const;

  return (
    <Badge variant={variant[status]}>
      {formatLabel(status)}
    </Badge>
  );
}

function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const variant = {
    UNPAID: "warning",
    PARTIALLY_PAID: "orange",
    PAID: "success",
  } as const;

  return (
    <Badge variant={variant[status]}>
      {formatLabel(status)}
    </Badge>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center justify-between",
        strong
          ? "text-lg font-bold text-white"
          : "text-sm text-slate-400",
      ].join(" ")}
    >
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function getApiErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    return (
      error.response?.data?.message ??
      "The billing operation failed."
    );
  }

  return "The billing operation failed.";
}

export default InvoiceDetailPage;