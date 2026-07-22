import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { ProtectedRoute } from "@/app/ProtectedRoute";
import { AppLayout } from "@/layouts/AppLayout";
import CustomersPage from "@/pages/CustomersPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import InvoicesPage from "@/pages/InvoicesPage";
import LoginPage from "@/pages/LoginPage";
import ServiceRequestsPage from "@/pages/ServiceRequestsPage";
import TechniciansPage from "@/pages/TechniciansPage";
import CreateCustomerPage from "@/pages/CreateCustomerPage";
import CustomerDetailPage from "@/pages/CustomerDetailPage";
import EditCustomerPage from "@/pages/EditCustomerPage";
import CreateTechnicianPage from "@/pages/CreateTechnicianPage";
import ServiceRequestDetailPage from "@/pages/ServiceRequestPlaceholderPage";
import CreateServiceRequestPage from "@/pages/CreateServiceRequestPage";
import SchedulePage from "@/pages/SchedulePage";
import CreateAppointmentPage from "@/pages/CreateAppointmentPage";
import TechnicianAvailabilityPage from "@/pages/TechnicianAvailabilityPage";
import CreatePartPage from "@/pages/CreatePartPage";
import PartDetailPage from "@/pages/PartDetailPage";
import CreateQuotePage from "@/pages/CreateQuotePage";
import QuoteDetailPage from "@/pages/QuoteDetailPage";
import CreateInvoicePage from "@/pages/CreateInvoicePage";
import InvoiceDetailPage from "@/pages/InvoiceDetailPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "customers",
        element: <CustomersPage />,
      },
      {
        path: "customers/new",
        element: <CreateCustomerPage />,
      },
      {
        path: "customers/:customerId/edit",
        element: <EditCustomerPage />,
      },
      {
        path: "customers/:customerId",
        element: <CustomerDetailPage />,
      },
      {
        path: "service-requests",
        element: <ServiceRequestsPage />,
      },
      {
        path: "service-requests/new",
        element: <CreateServiceRequestPage />,
      },
      {
        path: "service-requests/:requestId",
        element: <ServiceRequestDetailPage />,
      },
      {
        path: "technicians",
        element: <TechniciansPage />,
      },
      {
        path: "technicians/new",
        element: <CreateTechnicianPage />,
      },
      {
        path: "technicians/:technicianId/availability",
        element: <TechnicianAvailabilityPage />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "inventory/new",
        element: <CreatePartPage />,
      },
      {
        path: "inventory/:partId",
        element: <PartDetailPage />,
      },
      {
        path: "schedule",
        element: <SchedulePage />,
      },
      {
        path: "appointments/new",
        element: <CreateAppointmentPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "invoices/new",
        element: <CreateInvoicePage />,
      },
      {
        path: "invoices/:invoiceId",
        element: <InvoiceDetailPage />,
      },
      {
        path: "quotes/new",
        element: <CreateQuotePage />,
      },
      {
        path: "quotes/:quoteId",
        element: <QuoteDetailPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
