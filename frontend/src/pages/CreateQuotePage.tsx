import { useMemo, useState } from "react";
import { isAxiosError } from "axios";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useServiceRequests } from "@/features/service-requests/api/use-service-requests";

import { useCreateQuote } from "@/features/billing/api/use-billing";

import type {
  BillingItemType,
  CreateQuoteValues,
} from "@/features/billing/types";

const quoteItemSchema = z.object({
  itemType: z.enum(["LABOR", "PART", "OTHER"]),
  description: z.string().trim().min(2, "Description is required"),
  quantity: z.coerce.number().positive("Quantity must be greater than zero"),
  unitPrice: z.coerce.number().nonnegative("Unit price cannot be negative"),
});

const quoteSchema = z.object({
  serviceRequestId: z.string().min(1, "Select a service request"),

  validUntil: z.string(),

  discountAmount: z.coerce.number().nonnegative("Discount cannot be negative"),

  taxAmount: z.coerce.number().nonnegative("Tax cannot be negative"),

  notes: z.string(),

  items: z.array(quoteItemSchema).min(1, "Add at least one quote item"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

function CreateQuotePage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const createQuoteMutation = useCreateQuote();

  const requestsQuery = useServiceRequests({
    page: 0,
    size: 100,
    search: "",
  });

  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      serviceRequestId: "",
      validUntil: "",
      discountAmount: 0,
      taxAmount: 0,
      notes: "",
      items: [
        {
          itemType: "LABOR",
          description: "",
          quantity: 1,
          unitPrice: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const discountAmount = Number(watch("discountAmount") || 0);
  const taxAmount = Number(watch("taxAmount") || 0);

  const subtotal = useMemo(() => {
    return watchedItems.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);

      return total + quantity * unitPrice;
    }, 0);
  }, [watchedItems]);

  const total = Math.max(0, subtotal - discountAmount + taxAmount);

  async function onSubmit(values: QuoteFormValues) {
    setServerError(null);

    const request: CreateQuoteValues = {
      serviceRequestId: values.serviceRequestId,
      validUntil: values.validUntil || null,
      discountAmount: values.discountAmount,
      taxAmount: values.taxAmount,
      notes: values.notes,
      items: values.items.map((item) => ({
        itemType: item.itemType as BillingItemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      const createdQuote = await createQuoteMutation.mutateAsync(request);

      navigate(`/quotes/${createdQuote.id}`);

      navigate(`/service-requests/${values.serviceRequestId}`);
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create quote",
        );
      } else {
        setServerError("Unable to create quote");
      }
    }
  }

  const requests = requestsQuery.data?.content ?? [];

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <header>
        <Link
          to="/service-requests"
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to service requests
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">Billing</p>

        <h1 className="mt-1 text-3xl font-bold text-white">Create quote</h1>

        <p className="mt-2 text-slate-400">
          Prepare a labor and parts estimate for customer approval.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-white">Quote details</h2>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label
                htmlFor="serviceRequestId"
                className="block text-sm font-medium text-slate-200"
              >
                Service request
              </label>

              <select
                id="serviceRequestId"
                disabled={requestsQuery.isLoading}
                className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                {...register("serviceRequestId")}
              >
                <option value="">
                  {requestsQuery.isLoading
                    ? "Loading requests..."
                    : "Select service request"}
                </option>

                {requests.map((request) => (
                  <option key={request.id} value={request.id}>
                    {request.title} — {request.customerName}
                  </option>
                ))}
              </select>

              {errors.serviceRequestId && (
                <p className="text-sm text-red-400">
                  {errors.serviceRequestId.message}
                </p>
              )}
            </div>

            <Input
              label="Valid until"
              type="date"
              error={errors.validUntil?.message}
              {...register("validUntil")}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-white">Quote items</h3>

                  <p className="mt-1 text-sm text-slate-400">
                    Add labor, parts, or other charges.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    append({
                      itemType: "PART",
                      description: "",
                      quantity: 1,
                      unitPrice: 0,
                    })
                  }
                >
                  + Add item
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                    <div className="space-y-2 lg:col-span-2">
                      <label
                        htmlFor={`items.${index}.itemType`}
                        className="block text-sm font-medium text-slate-200"
                      >
                        Type
                      </label>

                      <select
                        id={`items.${index}.itemType`}
                        className="min-h-10 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                        {...register(`items.${index}.itemType`)}
                      >
                        <option value="LABOR">Labor</option>
                        <option value="PART">Part</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div className="lg:col-span-5">
                      <Input
                        label="Description"
                        placeholder="RO repair labor"
                        error={errors.items?.[index]?.description?.message}
                        {...register(`items.${index}.description`)}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Input
                        label="Quantity"
                        type="number"
                        min={0.01}
                        step="0.01"
                        error={errors.items?.[index]?.quantity?.message}
                        {...register(`items.${index}.quantity`)}
                      />
                    </div>

                    <div className="lg:col-span-2">
                      <Input
                        label="Unit price"
                        type="number"
                        min={0}
                        step="0.01"
                        error={errors.items?.[index]?.unitPrice?.message}
                        {...register(`items.${index}.unitPrice`)}
                      />
                    </div>

                    <div className="flex items-end lg:col-span-1">
                      <button
                        type="button"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                        className="min-h-10 w-full rounded-lg border border-red-900 px-3 py-2 text-sm text-red-400 hover:bg-red-950 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <p className="mt-3 text-right text-sm text-slate-400">
                    Line total: ₹
                    {(
                      Number(watchedItems[index]?.quantity || 0) *
                      Number(watchedItems[index]?.unitPrice || 0)
                    ).toFixed(2)}
                  </p>
                </div>
              ))}

              {errors.items?.root && (
                <p className="text-sm text-red-400">
                  {errors.items.root.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Input
                label="Discount"
                type="number"
                min={0}
                step="0.01"
                error={errors.discountAmount?.message}
                {...register("discountAmount")}
              />

              <Input
                label="Tax"
                type="number"
                min={0}
                step="0.01"
                error={errors.taxAmount?.message}
                {...register("taxAmount")}
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-slate-200"
              >
                Notes
              </label>

              <textarea
                id="notes"
                rows={4}
                placeholder="Quote notes..."
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                {...register("notes")}
              />
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {serverError}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 pt-6">
            <SummaryRow label="Subtotal" value={subtotal} />

            <SummaryRow label="Discount" value={-discountAmount} />

            <SummaryRow label="Tax" value={taxAmount} />

            <div className="border-t border-slate-800 pt-3">
              <SummaryRow label="Estimated total" value={total} strong />
            </div>

            <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
              <Link
                to="/service-requests"
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  createQuoteMutation.isPending ||
                  requestsQuery.isLoading
                }
              >
                {isSubmitting || createQuoteMutation.isPending
                  ? "Creating..."
                  : "Create quote"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </section>
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
        strong ? "text-lg font-bold text-white" : "text-sm text-slate-400",
      ].join(" ")}
    >
      <span>{label}</span>
      <span>₹{value.toFixed(2)}</span>
    </div>
  );
}

export default CreateQuotePage;
