import { apiClient } from "@/lib/api-client";

import type {
  CreateInvoiceValues,
  CreateQuoteValues,
  Invoice,
  InvoiceFilters,
  InvoicePageResponse,
  Quote,
  RecordPaymentValues,
} from "../types";

export async function getQuote(quoteId: string): Promise<Quote> {
  const response = await apiClient.get<Quote>(`/quotes/${quoteId}`);

  return response.data;
}

export async function createQuote(values: CreateQuoteValues): Promise<Quote> {
  const response = await apiClient.post<Quote>("/quotes", values);

  return response.data;
}

export async function sendQuote(quoteId: string): Promise<Quote> {
  const response = await apiClient.post<Quote>(`/quotes/${quoteId}/send`);

  return response.data;
}

export async function approveQuote(quoteId: string): Promise<Quote> {
  const response = await apiClient.post<Quote>(`/quotes/${quoteId}/approve`);

  return response.data;
}

export async function rejectQuote(quoteId: string): Promise<Quote> {
  const response = await apiClient.post<Quote>(`/quotes/${quoteId}/reject`);

  return response.data;
}

export async function getInvoice(invoiceId: string): Promise<Invoice> {
  const response = await apiClient.get<Invoice>(`/invoices/${invoiceId}`);

  return response.data;
}

export async function createInvoice(
  values: CreateInvoiceValues,
): Promise<Invoice> {
  const response = await apiClient.post<Invoice>("/invoices", values);

  return response.data;
}

export async function issueInvoice(invoiceId: string): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(
    `/invoices/${invoiceId}/issue`,
  );

  return response.data;
}

export async function cancelInvoice(invoiceId: string): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(
    `/invoices/${invoiceId}/cancel`,
  );

  return response.data;
}

export async function recordPayment(
  invoiceId: string,
  values: RecordPaymentValues,
): Promise<Invoice> {
  const response = await apiClient.post<Invoice>(
    `/invoices/${invoiceId}/payments`,
    values,
  );

  return response.data;
}
export async function getInvoices(
  filters: InvoiceFilters,
): Promise<InvoicePageResponse> {
  const response = await apiClient.get<InvoicePageResponse>("/invoices", {
    params: {
      page: filters.page,
      size: filters.size,
      search: filters.search || undefined,
      status: filters.status || undefined,
      paymentStatus: filters.paymentStatus || undefined,
    },
  });

  return response.data;
}
