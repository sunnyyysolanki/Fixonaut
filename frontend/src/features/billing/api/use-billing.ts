import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  approveQuote,
  cancelInvoice,
  createInvoice,
  createQuote,
  getInvoice,
  getQuote,
  issueInvoice,
  recordPayment,
  rejectQuote,
  sendQuote,
} from "./billing-api";

import type {
  CreateInvoiceValues,
  CreateQuoteValues,
  Invoice,
  Quote,
  RecordPaymentValues,
} from "../types";

const billingKeys = {
  all: ["billing"] as const,

  quote: (quoteId: string) => [...billingKeys.all, "quote", quoteId] as const,

  invoice: (invoiceId: string) =>
    [...billingKeys.all, "invoice", invoiceId] as const,
};

export function useQuote(quoteId: string) {
  return useQuery({
    queryKey: billingKeys.quote(quoteId),
    queryFn: () => getQuote(quoteId),
    enabled: Boolean(quoteId),
  });
}

export function useInvoice(invoiceId: string) {
  return useQuery({
    queryKey: billingKeys.invoice(invoiceId),
    queryFn: () => getInvoice(invoiceId),
    enabled: Boolean(invoiceId),
  });
}

export function useCreateQuote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateQuoteValues) => createQuote(values),

    onSuccess: (quote: Quote) => {
      queryClient.setQueryData(billingKeys.quote(quote.id), quote);

      queryClient.invalidateQueries({
        queryKey: billingKeys.all,
      });
    },
  });
}

function createQuoteAction(mutationFn: (quoteId: string) => Promise<Quote>) {
  return function useQuoteAction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,

      onSuccess: (quote: Quote) => {
        queryClient.setQueryData(billingKeys.quote(quote.id), quote);

        queryClient.invalidateQueries({
          queryKey: billingKeys.all,
        });
      },
    });
  };
}

export const useSendQuote = createQuoteAction(sendQuote);

export const useApproveQuote = createQuoteAction(approveQuote);

export const useRejectQuote = createQuoteAction(rejectQuote);

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateInvoiceValues) => createInvoice(values),

    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(billingKeys.invoice(invoice.id), invoice);

      queryClient.invalidateQueries({
        queryKey: billingKeys.all,
      });
    },
  });
}

function createInvoiceAction(
  mutationFn: (invoiceId: string) => Promise<Invoice>,
) {
  return function useInvoiceAction() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn,

      onSuccess: (invoice: Invoice) => {
        queryClient.setQueryData(billingKeys.invoice(invoice.id), invoice);

        queryClient.invalidateQueries({
          queryKey: billingKeys.all,
        });
      },
    });
  };
}

export const useIssueInvoice = createInvoiceAction(issueInvoice);

export const useCancelInvoice = createInvoiceAction(cancelInvoice);

export function useRecordPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      values,
    }: {
      invoiceId: string;
      values: RecordPaymentValues;
    }) => recordPayment(invoiceId, values),

    onSuccess: (invoice: Invoice) => {
      queryClient.setQueryData(billingKeys.invoice(invoice.id), invoice);

      queryClient.invalidateQueries({
        queryKey: billingKeys.all,
      });
    },
  });
}
