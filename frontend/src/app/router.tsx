import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import CustomersPage from "@/pages/CustomersPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import InvoicesPage from "@/pages/InvoicesPage";
import ServiceRequestsPage from "@/pages/ServiceRequestsPage";
import TechniciansPage from "@/pages/TechniciansPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
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
        path: "service-requests",
        element: <ServiceRequestsPage />,
      },
      {
        path: "technicians",
        element: <TechniciansPage />,
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