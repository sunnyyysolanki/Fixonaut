import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  acceptServiceRequest,
  assignTechnician,
  cancelServiceRequest,
  completeServiceRequest,
  createServiceRequest,
  getServiceRequest,
  getServiceRequests,
  startServiceRequest,
  waitForPart,
} from "./service-request-api";

import type {
  AssignTechnicianValues,
  ChangeStatusValues,
  CreateServiceRequestValues,
  ServiceRequest,
  ServiceRequestFilters,
} from "../types";

const serviceRequestKeys = {
  all: ["service-requests"] as const,

  list: (filters: ServiceRequestFilters) =>
    [...serviceRequestKeys.all, "list", filters] as const,

  detail: (requestId: string) =>
    [...serviceRequestKeys.all, "detail", requestId] as const,
};

export function useServiceRequests(filters: ServiceRequestFilters) {
  return useQuery({
    queryKey: serviceRequestKeys.list(filters),
    queryFn: () => getServiceRequests(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useServiceRequest(requestId: string) {
  return useQuery({
    queryKey: serviceRequestKeys.detail(requestId),
    queryFn: () => getServiceRequest(requestId),
    enabled: Boolean(requestId),
  });
}

function refreshServiceRequests(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  queryClient.invalidateQueries({
    queryKey: serviceRequestKeys.all,
  });
}

export function useCreateServiceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateServiceRequestValues) =>
      createServiceRequest(values),

    onSuccess: () => {
      refreshServiceRequests(queryClient);
    },
  });
}

export function useAssignTechnician() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      values,
    }: {
      requestId: string;
      values: AssignTechnicianValues;
    }) => assignTechnician(requestId, values),

    onSuccess: (request: ServiceRequest) => {
      refreshServiceRequests(queryClient);

      queryClient.setQueryData(serviceRequestKeys.detail(request.id), request);
    },
  });
}

function createStatusMutation(
  mutationFn: (
    requestId: string,
    values: ChangeStatusValues,
  ) => Promise<ServiceRequest>,
) {
  return function useStatusMutation() {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: ({
        requestId,
        values,
      }: {
        requestId: string;
        values?: ChangeStatusValues;
      }) => mutationFn(requestId, values ?? {}),

      onSuccess: (request: ServiceRequest) => {
        refreshServiceRequests(queryClient);

        queryClient.setQueryData(
          serviceRequestKeys.detail(request.id),
          request,
        );
      },
    });
  };
}

export const useAcceptServiceRequest =
  createStatusMutation(acceptServiceRequest);

export const useStartServiceRequest = createStatusMutation(startServiceRequest);

export const useWaitForPart = createStatusMutation(waitForPart);

export const useCompleteServiceRequest = createStatusMutation(
  completeServiceRequest,
);

export const useCancelServiceRequest =
  createStatusMutation(cancelServiceRequest);
