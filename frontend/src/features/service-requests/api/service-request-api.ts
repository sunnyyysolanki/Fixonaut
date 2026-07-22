import { apiClient } from "@/lib/api-client";

import type {
  AssignTechnicianValues,
  ChangeStatusValues,
  CreateServiceRequestValues,
  ServiceRequest,
  ServiceRequestFilters,
  ServiceRequestPageResponse,
  ServiceRequestStatusHistory,
} from "../types";

export async function getServiceRequests(
  filters: ServiceRequestFilters,
): Promise<ServiceRequestPageResponse> {
  const response = await apiClient.get<ServiceRequestPageResponse>(
    "/service-requests",
    {
      params: {
        page: filters.page,
        size: filters.size,
        search: filters.search || undefined,
        status: filters.status || undefined,
        priority: filters.priority || undefined,
      },
    },
  );

  return response.data;
}

export async function getServiceRequest(
  requestId: string,
): Promise<ServiceRequest> {
  const response = await apiClient.get<ServiceRequest>(
    `/service-requests/${requestId}`,
  );

  return response.data;
}

export async function createServiceRequest(
  values: CreateServiceRequestValues,
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    "/service-requests",
    values,
  );

  return response.data;
}

export async function assignTechnician(
  requestId: string,
  values: AssignTechnicianValues,
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    `/service-requests/${requestId}/assign`,
    values,
  );

  return response.data;
}

export async function acceptServiceRequest(
  requestId: string,
  values: ChangeStatusValues = {},
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    `/service-requests/${requestId}/accept`,
    values,
  );

  return response.data;
}

export async function startServiceRequest(
  requestId: string,
  values: ChangeStatusValues = {},
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    `/service-requests/${requestId}/start`,
    values,
  );

  return response.data;
}

export async function waitForPart(
  requestId: string,
  values: ChangeStatusValues = {},
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    `/service-requests/${requestId}/waiting-for-part`,
    values,
  );

  return response.data;
}

export async function completeServiceRequest(
  requestId: string,
  values: ChangeStatusValues = {},
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    `/service-requests/${requestId}/complete`,
    values,
  );

  return response.data;
}

export async function cancelServiceRequest(
  requestId: string,
  values: ChangeStatusValues = {},
): Promise<ServiceRequest> {
  const response = await apiClient.post<ServiceRequest>(
    `/service-requests/${requestId}/cancel`,
    values,
  );

  return response.data;
}

export async function getServiceRequestHistory(
  requestId: string,
): Promise<ServiceRequestStatusHistory[]> {
  const response = await apiClient.get<ServiceRequestStatusHistory[]>(
    `/service-requests/${requestId}/history`,
  );

  return response.data;
}
