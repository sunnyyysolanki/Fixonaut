import { useNavigate, useParams } from "react-router-dom";

import { CustomerForm } from "@/features/customers/CustomerForm";
import {
  useCustomer,
  useUpdateCustomer,
} from "@/features/customers/api/use-customers";
import type { CustomerFormValues } from "@/features/customers/types";

function EditCustomerPage() {
  const { customerId } = useParams<{
    customerId: string;
  }>();

  const navigate = useNavigate();

  const customerQuery = useCustomer(customerId ?? "");
  const updateCustomerMutation = useUpdateCustomer();

  if (customerQuery.isLoading) {
    return (
      <div className="animate-pulse rounded-2xl bg-slate-900 p-8 text-slate-400">
        Loading customer...
      </div>
    );
  }

  if (customerQuery.isError || !customerQuery.data) {
    return (
      <div className="rounded-2xl border border-red-900 bg-red-950/40 p-8 text-red-300">
        Customer could not be loaded.
      </div>
    );
  }

  const customer = customerQuery.data;

  const defaultValues: CustomerFormValues = {
    name: customer.name,
    phone: customer.phone,
    email: customer.email ?? "",
    address: customer.address ?? "",
    city: customer.city ?? "",
    state: customer.state ?? "",
    postalCode: customer.postalCode ?? "",
    notes: customer.notes ?? "",
  };

  async function handleSubmit(values: CustomerFormValues) {
    if (!customerId) {
      return;
    }

    await updateCustomerMutation.mutateAsync({
      customerId,
      values,
    });

    navigate(`/customers/${customerId}`);
  }

  return (
    <CustomerForm
      title="Edit customer"
      description="Update customer contact and address information."
      submitLabel="Save changes"
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      isSubmitting={updateCustomerMutation.isPending}
    />
  );
}

export default EditCustomerPage;
