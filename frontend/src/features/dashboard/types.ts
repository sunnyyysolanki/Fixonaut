import type { ServiceRequestStatus } from "../service-requests/types";

export type DashboardSummary = {
  openRequests: number;
  assignedToday: number;
  completedThisWeek: number;
  pendingPayments: number;
};

export type DashboardActivity = {
  id: string;
  serviceRequestId: string;
  serviceRequestTitle: string;
  fromStatus: ServiceRequestStatus | null;
  toStatus: ServiceRequestStatus;
  note: string | null;
  changedByUserName: string;
  changedAt: string;
};
