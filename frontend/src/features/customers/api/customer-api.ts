import { apiClient } from "@/lib/api-client";
import type {
  Customer,
  CustomerFilters,
  CustomerFormValues,
  PageResponse,
} from "../types";

export async function getCustomers(
  filters: CustomerFilters,
): Promise<PageResponse<Customer>> {
  const response = await apiClient.get<PageResponse<Customer>>("/customers", {
    params: {
      page: filters.page,
      size: filters.size,
      search: filters.search || undefined,
    },
  });

  return response.data;
}

export async function createCustomer(
  values: CustomerFormValues,
): Promise<Customer> {
  const response = await apiClient.post<Customer>("/customers", values);

  return response.data;
}

export async function updateCustomer(
  customerId: string,
  values: CustomerFormValues,
): Promise<Customer> {
  const response = await apiClient.patch<Customer>(
    `/customers/${customerId}`,
    values,
  );

  return response.data;
}

export async function deactivateCustomer(
  customerId: string,
): Promise<Customer> {
  const response = await apiClient.patch<Customer>(
    `/customers/${customerId}/deactivate`,
  );

  return response.data;
}

export async function getCustomer(customerId: string): Promise<Customer> {
  const response = await apiClient.get<Customer>(`/customers/${customerId}`);

  return response.data;
}
