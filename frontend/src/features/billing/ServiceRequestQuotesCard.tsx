import { Link } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

import { useServiceRequestQuotes } from "@/features/billing/api/use-billing";
import type { QuoteStatus } from "@/features/billing/types";
import { useAuthStore } from "@/stores/auth-store";

type ServiceRequestQuotesCardProps = {
  serviceRequestId: string;
};

export function ServiceRequestQuotesCard({
  serviceRequestId,
}: ServiceRequestQuotesCardProps) {
  const quotesQuery = useServiceRequestQuotes(serviceRequestId);

  const userRoles = useAuthStore((state) => state.user?.roles ?? []);

  const canManageBilling =
    userRoles.includes("OWNER") ||
    userRoles.includes("ADMIN") ||
    userRoles.includes("DISPATCHER");

  const quotes = quotesQuery.data ?? [];

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-white">Quotes</h2>

          <p className="mt-1 text-sm text-slate-400">
            Estimates prepared for this service job.
          </p>
        </div>

        {canManageBilling && (
          <Link
            to={`/quotes/new?serviceRequestId=${serviceRequestId}`}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            + New quote
          </Link>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {quotesQuery.isLoading && (
          <p className="text-sm text-slate-400">Loading quotes...</p>
        )}

        {quotesQuery.isError && (
          <p className="text-sm text-red-400">Unable to load quotes.</p>
        )}

        {!quotesQuery.isLoading &&
          !quotesQuery.isError &&
          quotes.length === 0 && (
            <p className="text-sm text-slate-500">
              No quotes yet for this request.
            </p>
          )}

        {quotes.map((quote) => (
          <Link
            key={quote.id}
            to={`/quotes/${quote.id}`}
            className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 transition hover:border-slate-700 hover:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-medium text-white">{quote.quoteNumber}</p>

              <p className="mt-1 text-xs text-slate-500">
                Total ₹{quote.totalAmount.toFixed(2)}
              </p>
            </div>

            <QuoteStatusBadge status={quote.status} />
          </Link>
        ))}
      </CardContent>
    </Card>
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

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
