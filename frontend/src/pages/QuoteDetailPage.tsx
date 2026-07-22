import { useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

import {
  useApproveQuote,
  useQuote,
  useRejectQuote,
  useSendQuote,
} from "@/features/billing/api/use-billing";

import type { QuoteStatus } from "@/features/billing/types";

function QuoteDetailPage() {
  const { quoteId } = useParams<{
    quoteId: string;
  }>();

  const [error, setError] = useState<string | null>(null);

  const quoteQuery = useQuote(quoteId ?? "");

  const sendMutation = useSendQuote();
  const approveMutation = useApproveQuote();
  const rejectMutation = useRejectQuote();

  if (quoteQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading quote...
      </div>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">Quote not found</h1>

          <p className="mt-2 text-sm text-slate-400">
            The quote may have been removed or you may not have access.
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

  const quote = quoteQuery.data;

  const isBusy =
    sendMutation.isPending ||
    approveMutation.isPending ||
    rejectMutation.isPending;

  async function handleSend() {
    if (!quoteId) {
      return;
    }

    setError(null);

    try {
      await sendMutation.mutateAsync(quoteId);
    } catch {
      setError("Unable to send quote.");
    }
  }

  async function handleApprove() {
    if (!quoteId) {
      return;
    }

    setError(null);

    try {
      await approveMutation.mutateAsync(quoteId);
    } catch {
      setError("Unable to approve quote.");
    }
  }

  async function handleReject() {
    if (!quoteId) {
      return;
    }

    const confirmed = window.confirm("Reject this quote?");

    if (!confirmed) {
      return;
    }

    setError(null);

    try {
      await rejectMutation.mutateAsync(quoteId);
    } catch {
      setError("Unable to reject quote.");
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link
          to={`/service-requests/${quote.serviceRequestId}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to service request
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-white">
                {quote.quoteNumber}
              </h1>

              <QuoteStatusBadge status={quote.status} />
            </div>

            <p className="mt-2 text-sm text-slate-400">
              Service request: {quote.serviceRequestId}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {quote.status === "DRAFT" && (
              <Button type="button" onClick={handleSend} disabled={isBusy}>
                {sendMutation.isPending ? "Sending..." : "Send quote"}
              </Button>
            )}

            {quote.status === "SENT" && (
              <>
                <Button type="button" onClick={handleApprove} disabled={isBusy}>
                  {approveMutation.isPending ? "Approving..." : "Approve"}
                </Button>

                <Button
                  type="button"
                  variant="danger"
                  onClick={handleReject}
                  disabled={isBusy}
                >
                  {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                </Button>
              </>
            )}
            {quote.status === "APPROVED" && (
              <Link
                to={`/invoices/new?serviceRequestId=${quote.serviceRequestId}&quoteId=${quote.id}`}
                className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
              >
                Create invoice
              </Link>
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
          <h2 className="text-lg font-semibold text-white">Quote items</h2>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3 text-slate-400">Type</th>

                  <th className="px-4 py-3 text-slate-400">Description</th>

                  <th className="px-4 py-3 text-right text-slate-400">
                    Quantity
                  </th>

                  <th className="px-4 py-3 text-right text-slate-400">
                    Unit price
                  </th>

                  <th className="px-4 py-3 text-right text-slate-400">Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {quote.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4 text-slate-400">
                      {formatLabel(item.itemType)}
                    </td>

                    <td className="px-4 py-4 text-white">{item.description}</td>

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

      <Card>
        <CardContent className="space-y-3 pt-6">
          <SummaryRow label="Subtotal" value={quote.subtotal} />

          <SummaryRow label="Discount" value={-quote.discountAmount} />

          <SummaryRow label="Tax" value={quote.taxAmount} />

          <div className="border-t border-slate-800 pt-3">
            <SummaryRow label="Total" value={quote.totalAmount} strong />
          </div>

          {quote.validUntil && (
            <p className="pt-3 text-sm text-slate-500">
              Valid until {formatDate(quote.validUntil)}
            </p>
          )}

          {quote.notes && (
            <p className="border-t border-slate-800 pt-4 text-sm text-slate-400">
              {quote.notes}
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  const variant = {
    DRAFT: "neutral",
    SENT: "info",
    APPROVED: "success",
    REJECTED: "danger",
    EXPIRED: "warning",
  } as const;

  return <Badge variant={variant[status]}>{formatLabel(status)}</Badge>;
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
        strong ? "text-lg font-bold text-white" : "text-sm text-slate-400",
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
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default QuoteDetailPage;
