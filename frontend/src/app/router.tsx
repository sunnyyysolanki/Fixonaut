import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";

import { ProtectedRoute } from "@/app/ProtectedRoute";
import { PublicOnlyRoute } from "@/app/PublicOnlyRoute";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuthStore } from "@/stores/auth-store";
import CustomersPage from "@/pages/CustomersPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import InvoicesPage from "@/pages/InvoicesPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ServiceRequestsPage from "@/pages/ServiceRequestsPage";
import TechniciansPage from "@/pages/TechniciansPage";
import CreateCustomerPage from "@/pages/CreateCustomerPage";
import CustomerDetailPage from "@/pages/CustomerDetailPage";
import EditCustomerPage from "@/pages/EditCustomerPage";
import CreateTechnicianPage from "@/pages/CreateTechnicianPage";
import EditTechnicianPage from "@/pages/EditTechnicianPage";
import ServiceRequestDetailPage from "@/pages/ServiceRequestPlaceholderPage";
import CreateServiceRequestPage from "@/pages/CreateServiceRequestPage";
import SchedulePage from "@/pages/SchedulePage";
import CreateAppointmentPage from "@/pages/CreateAppointmentPage";
import AppointmentDetailPage from "@/pages/AppointmentDetailPage";
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
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicOnlyRoute>
        <RegisterPage />
      </PublicOnlyRoute>
    ),
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
        element: <HomeRedirect />,
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
        path: "technicians/:technicianId/edit",
        element: <EditTechnicianPage />,
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
        path: "appointments/:appointmentId",
        element: <AppointmentDetailPage />,
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

// Technicians can't access the dashboard endpoints, so send them to the
// screen they actually work from instead of a page full of 403 errors.
function HomeRedirect() {
  const roles = useAuthStore((state) => state.user?.roles ?? []);

  const isStaff =
    roles.includes("OWNER") ||
    roles.includes("ADMIN") ||
    roles.includes("DISPATCHER");

  return <Navigate to={isStaff ? "/dashboard" : "/service-requests"} replace />;
}

export function AppRouter() {
  return <RouterProvider router={router} />;
}
