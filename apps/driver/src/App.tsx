import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import HomePage from "@/pages/HomePage";
import VerificationStatusPage from "@/pages/verification/VerificationStatusPage";
import BookingRequestPage from "@/pages/booking/BookingRequestPage";
import NavigateToPickupPage from "@/pages/booking/NavigateToPickupPage";
import ActiveTripPage from "@/pages/booking/ActiveTripPage";
import TripCompletedPage from "@/pages/booking/TripCompletedPage";
import EarningsPage from "@/pages/earnings/EarningsPage";
import TripHistoryPage from "@/pages/history/TripHistoryPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<HomePage />} />
        <Route path="/verification" element={<VerificationStatusPage />} />
        <Route path="/booking/request" element={<BookingRequestPage />} />
        <Route path="/booking/navigate" element={<NavigateToPickupPage />} />
        <Route path="/booking/active" element={<ActiveTripPage />} />
        <Route path="/booking/completed" element={<TripCompletedPage />} />
        <Route path="/earnings" element={<EarningsPage />} />
        <Route path="/history" element={<TripHistoryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
