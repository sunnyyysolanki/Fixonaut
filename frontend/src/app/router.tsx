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
        path: "technicians",
        element: <TechniciansPage />,
      },
      {
        path: "technicians/new",
        element: <CreateTechnicianPage />,
      },
      {
        path: "inventory",
        element: <InventoryPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
