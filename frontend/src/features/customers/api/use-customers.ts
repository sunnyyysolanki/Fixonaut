import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCustomer,
  deactivateCustomer,
  getCustomers,
  updateCustomer,
} from "./customer-api";
import type { Customer, CustomerFilters, CustomerFormValues } from "../types";

const customerKeys = {
  all: ["customers"] as const,

  list: (filters: CustomerFilters) =>
    [...customerKeys.all, "list", filters] as const,

  detail: (customerId: string) =>
    [...customerKeys.all, "detail", customerId] as const,
};

export function useCustomers(filters: CustomerFilters) {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => getCustomers(filters),
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      customerId,
      values,
    }: {
      customerId: string;
      values: CustomerFormValues;
    }) => updateCustomer(customerId, values),

    onSuccess: (customer: Customer) => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });

      queryClient.setQueryData(customerKeys.detail(customer.id), customer);
    },
  });
}

export function useDeactivateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deactivateCustomer,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: customerKeys.all,
      });
    },
  });
}
