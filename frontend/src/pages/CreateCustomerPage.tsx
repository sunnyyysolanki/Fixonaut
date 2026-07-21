import { useNavigate } from "react-router-dom";

import { CustomerForm } from "@/features/customers/CustomerForm";
import { useCreateCustomer } from "@/features/customers/api/use-customers";
import type { CustomerFormValues } from "@/features/customers/types";

const emptyCustomer: CustomerFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
  notes: "",
};

function CreateCustomerPage() {
  const navigate = useNavigate();
  const createCustomerMutation = useCreateCustomer();

  async function handleSubmit(values: CustomerFormValues) {
    await createCustomerMutation.mutateAsync(values);
    navigate("/customers");
  }

  return (
    <CustomerForm
      title="Add customer"
      description="Create a customer profile for your organization."
      submitLabel="Create customer"
      defaultValues={emptyCustomer}
      onSubmit={handleSubmit}
      isSubmitting={createCustomerMutation.isPending}
    />
  );
}

export default CreateCustomerPage;
