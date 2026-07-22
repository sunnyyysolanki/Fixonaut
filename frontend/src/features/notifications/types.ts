export type NotificationType =
  | "SERVICE_REQUEST_ASSIGNED"
  | "SERVICE_REQUEST_STATUS_CHANGED"
  | "APPOINTMENT_CREATED"
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CANCELLED"
  | "QUOTE_SENT"
  | "QUOTE_APPROVED"
  | "QUOTE_REJECTED"
  | "INVOICE_ISSUED"
  | "PAYMENT_RECORDED";

export type Notification = {
  id: string;
  notificationType: NotificationType;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  read: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationPageResponse = {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};
