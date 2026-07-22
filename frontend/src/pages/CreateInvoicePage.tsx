import { useEffect, useState } from "react";
import { isAxiosError } from "axios";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

import { useQuote, useCreateInvoice } from "@/features/billing/api/use-billing";

import type {
  BillingItemType,
  CreateInvoiceValues,
} from "@/features/billing/types";

const invoiceSchema = z.object({
  discountAmount: z.coerce.number().nonnegative("Discount cannot be negative"),

  taxAmount: z.coerce.number().nonnegative("Tax cannot be negative"),

  notes: z.string(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

function CreateInvoicePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const quoteId = searchParams.get("quoteId");
  const serviceRequestId = searchParams.get("serviceRequestId");

  const [serverError, setServerError] = useState<string | null>(null);

  const quoteQuery = useQuote(quoteId ?? "");
  const createMutation = useCreateInvoice();

  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      discountAmount: 0,
      taxAmount: 0,
      notes: "",
    },
  });

  useEffect(() => {
    if (quoteQuery.data) {
      reset({
        discountAmount: quoteQuery.data.discountAmount,
        taxAmount: quoteQuery.data.taxAmount,
        notes: quoteQuery.data.notes ?? "",
      });
    }
  }, [quoteQuery.data, reset]);

  if (!quoteId || !serviceRequestId) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">
            Invoice information is incomplete
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            An invoice must be created from a service request and quote.
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

  if (quoteQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading approved quote...
      </div>
    );
  }

  if (quoteQuery.isError || !quoteQuery.data) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <h1 className="text-xl font-semibold text-white">Quote not found</h1>

          <p className="mt-2 text-sm text-slate-400">
            The quote could not be loaded.
          </p>
        </CardContent>
      </Card>
    );
  }

  const quote = quoteQuery.data;

  const discountAmount = Number(watch("discountAmount") || 0);

  const taxAmount = Number(watch("taxAmount") || 0);

  const totalAmount = Math.max(0, quote.subtotal - discountAmount + taxAmount);

  async function onSubmit(values: InvoiceFormValues) {
    setServerError(null);

    const request: CreateInvoiceValues = {
      serviceRequestId,
      quoteId,
      discountAmount: values.discountAmount,
      taxAmount: values.taxAmount,
      notes: values.notes,
      items: quote.items.map((item) => ({
        itemType: item.itemType as BillingItemType,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
    };

    try {
      const invoice = await createMutation.mutateAsync(request);

      navigate(`/invoices/${invoice.id}`);
    } catch (error) {
      if (isAxiosError(error)) {
        setServerError(
          error.response?.data?.message ?? "Unable to create invoice",
        );
      } else {
        setServerError("Unable to create invoice");
      }
    }
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <Link
          to={`/quotes/${quote.id}`}
          className="text-sm text-slate-400 hover:text-white"
        >
          ← Back to quote
        </Link>

        <p className="mt-6 text-sm font-medium text-orange-400">Billing</p>

        <h1 className="mt-1 text-3xl font-bold text-white">Create invoice</h1>

        <p className="mt-2 text-slate-400">
          Create an invoice from quote {quote.quoteNumber}.
        </p>
      </header>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">Invoice items</h2>
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
        <CardHeader>
          <h2 className="text-lg font-semibold text-white">
            Invoice adjustments
          </h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                placeholder="Invoice notes..."
                className="w-full resize-y rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-orange-500"
                {...register("notes")}
              />
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <SummaryRow label="Subtotal" value={quote.subtotal} />

              <SummaryRow label="Discount" value={-discountAmount} />

              <SummaryRow label="Tax" value={taxAmount} />

              <div className="mt-3 border-t border-slate-800 pt-3">
                <SummaryRow label="Invoice total" value={totalAmount} strong />
              </div>
            </div>

            {serverError && (
              <div
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/50 px-4 py-3 text-sm text-red-300"
              >
                {serverError}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                to={`/quotes/${quote.id}`}
                className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting || createMutation.isPending}
              >
                {isSubmitting || createMutation.isPending
                  ? "Creating..."
                  : "Create invoice"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
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

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default CreateInvoicePage;
