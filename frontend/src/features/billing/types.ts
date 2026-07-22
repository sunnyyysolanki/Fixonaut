export type BillingItemType = "LABOR" | "PART" | "OTHER";

export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type InvoiceStatus = "DRAFT" | "ISSUED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";

export type QuoteItem = {
  id: string;
  itemType: BillingItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type InvoiceItem = {
  id: string;
  itemType: BillingItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type Quote = {
  id: string;
  quoteNumber: string;
  serviceRequestId: string;
  status: QuoteStatus;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  validUntil: string | null;
  notes: string | null;
  items: QuoteItem[];
  createdAt: string;
  updatedAt: string;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  serviceRequestId: string;
  quoteId: string | null;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  currency: string;
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  totalAmount: number;
  amountPaid: number;
  notes: string | null;
  items: InvoiceItem[];
  issuedAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type BillingItemInput = {
  itemType: BillingItemType;
  description: string;
  quantity: number;
  unitPrice: number;
};

export type CreateQuoteValues = {
  serviceRequestId: string;
  validUntil: string | null;
  discountAmount: number;
  taxAmount: number;
  notes: string;
  items: BillingItemInput[];
};

export type CreateInvoiceValues = {
  serviceRequestId: string;
  quoteId: string | null;
  discountAmount: number;
  taxAmount: number;
  notes: string;
  items: BillingItemInput[];
};

export type RecordPaymentValues = {
  amount: number;
};
