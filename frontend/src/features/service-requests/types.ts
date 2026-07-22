export type ServiceRequestStatus =
  | "NEW"
  | "ASSIGNED"
  | "ACCEPTED"
  | "IN_PROGRESS"
  | "WAITING_FOR_PART"
  | "COMPLETED"
  | "CANCELLED";

export type ServiceRequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

export type ServiceRequest = {
  id: string;
  customerId: string;
  customerName: string;
  assignedTechnicianId: string | null;
  assignedTechnicianName: string | null;
  title: string;
  description: string;
  priority: ServiceRequestPriority;
  status: ServiceRequestStatus;
  scheduledAt: string | null;
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type ServiceRequestFilters = {
  page: number;
  size: number;
  search: string;
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
};

export type ServiceRequestPageResponse = {
  content: ServiceRequest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
};

export type CreateServiceRequestValues = {
  customerId: string;
  title: string;
  description: string;
  priority: ServiceRequestPriority;
  scheduledAt: string | null;
};

export type AssignTechnicianValues = {
  technicianId: string;
};

export type ChangeStatusValues = {
  note?: string;
};
