import { useState } from "react";
import { isAxiosError } from "axios";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useConsumePart } from "@/features/inventory/api/use-inventory";

import { useParts } from "@/features/inventory/api/use-inventory";

import { useServiceRequestParts } from "@/features/inventory/api/use-inventory";

import type { ServiceRequestStatus } from "./types";

type ServiceRequestPartsCardProps = {
  serviceRequestId: string;
  status: ServiceRequestStatus;
};

export function ServiceRequestPartsCard({
  serviceRequestId,
  status,
}: ServiceRequestPartsCardProps) {
  const [partId, setPartId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const partsQuery = useParts({
    page: 0,
    size: 100,
    search: "",
  });

  const usedPartsQuery = useServiceRequestParts(serviceRequestId);

  const consumeMutation = useConsumePart();

  const parts = partsQuery.data?.content ?? [];
  const usedParts = usedPartsQuery.data ?? [];

  const canConsume = !["COMPLETED", "CANCELLED"].includes(status);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsedQuantity = Number(quantity);
    const parsedUnitCost = Number(unitCost);

    if (!partId) {
      setError("Select a part.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      setError("Quantity must be a positive whole number.");
      return;
    }

    if (!Number.isFinite(parsedUnitCost) || parsedUnitCost < 0) {
      setError("Unit cost must be zero or greater.");
      return;
    }

    try {
      await consumeMutation.mutateAsync({
        partId,
        serviceRequestId,
        quantity: parsedQuantity,
        unitCost: parsedUnitCost,
        note,
      });

      setPartId("");
      setQuantity("1");
      setUnitCost("");
      setNote("");
    } catch (requestError) {
      if (isAxiosError(requestError)) {
        setError(
          requestError.response?.data?.message ?? "Unable to consume part.",
        );
      } else {
        setError("Unable to consume part.");
      }
    }
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-white">Parts used</h2>

        <p className="mt-1 text-sm text-slate-400">
          Record spare parts consumed during this service job.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          {usedParts.length === 0 && (
            <p className="text-sm text-slate-500">
              No parts have been recorded for this request.
            </p>
          )}

          {usedParts.map((usedPart) => (
            <div
              key={usedPart.id}
              className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-white">{usedPart.partName}</p>

                <p className="mt-1 text-sm text-slate-400">
                  {usedPart.quantity} × ₹{usedPart.unitCost.toFixed(2)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Added by {usedPart.addedByUserName}
                </p>
              </div>

              <Badge variant="orange">₹{usedPart.totalCost.toFixed(2)}</Badge>
            </div>
          ))}
        </div>

        {canConsume ? (
          <form
            onSubmit={handleSubmit}
            className="space-y-4 border-t border-slate-800 pt-6"
          >
            <h3 className="font-medium text-white">Add part usage</h3>

            <div className="space-y-2">
              <label
                htmlFor="service-request-part"
                className="block text-sm font-medium text-slate-200"
              >
                Part
              </label>

              <select
                id="service-request-part"
                value={partId}
                onChange={(event) => setPartId(event.target.value)}
                disabled={partsQuery.isLoading || consumeMutation.isPending}
                className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">
                  {partsQuery.isLoading ? "Loading parts..." : "Select part"}
                </option>

                {parts.map((part) => (
                  <option
                    key={part.id}
                    value={part.id}
                    disabled={!part.active || part.quantityOnHand === 0}
                  >
                    {part.name} — {part.quantityOnHand} {part.unit} available
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Quantity"
                type="number"
                min={1}
                step={1}
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
            </div>

            <div className="space-y-2">
              <label
                htmlFor="service-request-part-note"
                className="block text-sm font-medium text-slate-200"
              >
                Note
              </label>

              <textarea
                id="service-request-part-note"
                rows={3}
                placeholder="Sediment filter replaced"
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

            <Button
              type="submit"
              disabled={consumeMutation.isPending || parts.length === 0}
            >
              {consumeMutation.isPending ? "Recording..." : "Record part usage"}
            </Button>
          </form>
        ) : (
          <p className="border-t border-slate-800 pt-6 text-sm text-slate-500">
            Parts can no longer be added to a completed or cancelled request.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
