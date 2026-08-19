import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import DriversPage from "@/pages/drivers/DriversPage";
import DriverDetailPage from "@/pages/drivers/DriverDetailPage";
import VerificationQueuePage from "@/pages/drivers/VerificationQueuePage";
import PassengersPage from "@/pages/passengers/PassengersPage";
import BookingsPage from "@/pages/bookings/BookingsPage";
import ServiceAreasPage from "@/pages/geography/ServiceAreasPage";
import FareManagementPage from "@/pages/pricing/FareManagementPage";
import ReportsPage from "@/pages/reports/ReportsPage";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Layout>{children}</Layout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedLayout>
            <DashboardPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/drivers"
        element={
          <ProtectedLayout>
            <DriversPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/drivers/verification"
        element={
          <ProtectedLayout>
            <VerificationQueuePage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/drivers/:id"
        element={
          <ProtectedLayout>
            <DriverDetailPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/passengers"
        element={
          <ProtectedLayout>
            <PassengersPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/bookings"
        element={
          <ProtectedLayout>
            <BookingsPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/geography"
        element={
          <ProtectedLayout>
            <ServiceAreasPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedLayout>
            <FareManagementPage />
          </ProtectedLayout>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedLayout>
            <ReportsPage />
          </ProtectedLayout>
        }
      />
    </Routes>
  );
}
