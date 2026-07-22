import { useState } from "react";
import { isAxiosError } from "axios";
import { Link, useParams } from "react-router-dom";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import {
  usePart,
  usePartTransactions,
  useStockIn,
} from "@/features/inventory/api/use-inventory";

function PartDetailPage() {
  const { partId } = useParams<{ partId: string }>();

  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const partQuery = usePart(partId ?? "");
  const transactionsQuery = usePartTransactions(partId ?? "");
  const stockInMutation = useStockIn();

  if (partQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading part...
      </div>
    );
  }

  if (partQuery.isError || !partQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">Part not found</h1>

          <p className="mt-2 text-sm text-slate-400">
            The part may have been removed or you may not have access.
          </p>

          <Link
            to="/inventory"
            className="mt-6 inline-flex text-sm text-orange-400 hover:text-orange-300"
          >
            ← Back to inventory
          </Link>
        </CardContent>
      </Card>
    );
  }

  const part = partQuery.data;

  async function handleStockIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!partId) {
      setError("Part ID is missing.");
      return;
    }

    const parsedQuantity = Number(quantity);
    const parsedUnitCost = Number(unitCost);

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!Number.isFinite(parsedUnitCost) || parsedUnitCost < 0) {
      setError("Unit cost must be zero or greater.");
      return;
    }

    try {
      await stockInMutation.mutateAsync({
        partId,
        values: {
          quantity: parsedQuantity,
          unitCost: parsedUnitCost,
          note,
        },
      });

      setQuantity("");
      setUnitCost("");
      setNote("");
    } catch (requestError) {
      if (isAxiosError(requestError)) {
        setError(requestError.response?.data?.message ?? "Unable to add stock");
      } else {
        setError("Unable to add stock");
      }
    }
  }

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <Link
          to="/inventory"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to inventory
        </Link>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-white">{part.name}</h1>

          <PartStatus active={part.active} lowStock={part.lowStock} />
        </div>

        <p className="mt-2 text-sm text-slate-400">SKU: {part.sku}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StockCard
          label="Available stock"
          value={`${part.quantityOnHand} ${part.unit}`}
        />

        <StockCard
          label="Reorder level"
          value={`${part.reorderLevel} ${part.unit}`}
        />

        <StockCard label="Unit" value={part.unit} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Add stock</h2>

            <p className="mt-1 text-sm text-slate-400">
              Stock-in creates an auditable inventory transaction.
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleStockIn} className="space-y-5">
              <Input
                label="Quantity"
                type="number"
                min={1}
                step={1}
                placeholder="10"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
              />

              <Input
                label="Unit cost"
                type="number"
                min={0}
                step="0.01"
                placeholder="120.50"
                value={unitCost}
                onChange={(event) => setUnitCost(event.target.value)}
              />

              <div className="space-y-2">
                <label
                  htmlFor="stock-note"
                  className="block text-sm font-medium text-slate-200"
                >
                  Note
                </label>

                <textarea
                  id="stock-note"
                  rows={3}
                  placeholder="Received from supplier"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
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

              <Button type="submit" disabled={stockInMutation.isPending}>
                {stockInMutation.isPending ? "Adding stock..." : "Add stock"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Part summary</h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <DetailRow label="SKU" value={part.sku} />
            <DetailRow label="Unit" value={part.unit} />
            <DetailRow
              label="Current quantity"
              value={String(part.quantityOnHand)}
            />
            <DetailRow
              label="Reorder level"
              value={String(part.reorderLevel)}
            />
            <DetailRow label="Created" value={formatDate(part.createdAt)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Transaction history
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Every stock movement is recorded here.
          </p>
        </CardHeader>

        <CardContent>
          {transactionsQuery.isLoading && (
            <p className="text-sm text-slate-400">Loading transactions...</p>
          )}

          {!transactionsQuery.isLoading &&
            transactionsQuery.data?.length === 0 && (
              <p className="text-sm text-slate-400">
                No transactions recorded yet.
              </p>
            )}

          <div className="space-y-3">
            {transactionsQuery.data?.map((transaction) => (
              <div
                key={transaction.id}
                className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <TransactionBadge type={transaction.transactionType} />

                    <span className="font-medium text-white">
                      {transaction.quantity} {part.unit}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {transaction.note ?? "No note"}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    By {transaction.createdByUserName} on{" "}
                    {formatDate(transaction.createdAt)}
                  </p>
                </div>

                <p className="text-sm font-medium text-slate-300">
                  ₹{transaction.unitCost.toFixed(2)} / {part.unit}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

function StockCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="mt-3 text-2xl font-bold text-white">{value}</p>
      </CardContent>
    </Card>
  );
}

function PartStatus({
  active,
  lowStock,
}: {
  active: boolean;
  lowStock: boolean;
}) {
  if (!active) {
    return <Badge variant="neutral">Inactive</Badge>;
  }

  if (lowStock) {
    return <Badge variant="warning">Low stock</Badge>;
  }

  return <Badge variant="success">Healthy</Badge>;
}

function TransactionBadge({ type }: { type: string }) {
  const variant = {
    STOCK_IN: "success",
    STOCK_OUT: "orange",
    ADJUSTMENT: "warning",
  } as const;

  return (
    <Badge variant={variant[type as keyof typeof variant] ?? "neutral"}>
      {formatLabel(type)}
    </Badge>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm text-slate-200">{value}</span>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default PartDetailPage;
