import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  consumePart,
  createPart,
  getPart,
  getPartTransactions,
  getParts,
  getServiceRequestParts,
  stockIn,
  updatePart,
} from "./inventory-api";

import type {
  ConsumePartValues,
  CreatePartValues,
  Part,
  PartFilters,
  StockInValues,
  UpdatePartValues,
} from "../types";

const inventoryKeys = {
  all: ["inventory"] as const,

  parts: (filters: PartFilters) =>
    [...inventoryKeys.all, "parts", filters] as const,

  part: (partId: string) => [...inventoryKeys.all, "part", partId] as const,

  transactions: (partId: string) =>
    [...inventoryKeys.all, "transactions", partId] as const,

  serviceRequestParts: (serviceRequestId: string) =>
    [...inventoryKeys.all, "service-request-parts", serviceRequestId] as const,
};

export function useParts(filters: PartFilters) {
  return useQuery({
    queryKey: inventoryKeys.parts(filters),
    queryFn: () => getParts(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function usePart(partId: string) {
  return useQuery({
    queryKey: inventoryKeys.part(partId),
    queryFn: () => getPart(partId),
    enabled: Boolean(partId),
  });
}

export function usePartTransactions(partId: string) {
  return useQuery({
    queryKey: inventoryKeys.transactions(partId),
    queryFn: () => getPartTransactions(partId),
    enabled: Boolean(partId),
  });
}

export function useServiceRequestParts(serviceRequestId: string) {
  return useQuery({
    queryKey: inventoryKeys.serviceRequestParts(serviceRequestId),
    queryFn: () => getServiceRequestParts(serviceRequestId),
    enabled: Boolean(serviceRequestId),
  });
}

export function useCreatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreatePartValues) => createPart(values),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.all,
      });
    },
  });
}

export function useUpdatePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      partId,
      values,
    }: {
      partId: string;
      values: UpdatePartValues;
    }) => updatePart(partId, values),

    onSuccess: (part: Part) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.all,
      });

      queryClient.setQueryData(inventoryKeys.part(part.id), part);
    },
  });
}

export function useStockIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      partId,
      values,
    }: {
      partId: string;
      values: StockInValues;
    }) => stockIn(partId, values),

    onSuccess: (part: Part) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.all,
      });

      queryClient.setQueryData(inventoryKeys.part(part.id), part);

      queryClient.invalidateQueries({
        queryKey: inventoryKeys.transactions(part.id),
      });
    },
  });
}

export function useConsumePart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ConsumePartValues) => consumePart(values),

    onSuccess: (_, values) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.all,
      });

      queryClient.invalidateQueries({
        queryKey: inventoryKeys.serviceRequestParts(values.serviceRequestId),
      });
    },
  });
}
