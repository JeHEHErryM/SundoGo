import { Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import HomePage from "@/pages/HomePage";
import MapBookingPage from "@/pages/booking/MapBookingPage";
import FareEstimatePage from "@/pages/booking/FareEstimatePage";
import SearchingDriverPage from "@/pages/booking/SearchingDriverPage";
import DriverAcceptedPage from "@/pages/booking/DriverAcceptedPage";
import ActiveTripPage from "@/pages/booking/ActiveTripPage";
import TripCompletedPage from "@/pages/booking/TripCompletedPage";
import PaymentConfirmationPage from "@/pages/booking/PaymentConfirmationPage";
import RatingPage from "@/pages/rating/RatingPage";
import TripHistoryPage from "@/pages/history/TripHistoryPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import NotificationsPage from "@/pages/notifications/NotificationsPage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking"
          element={
            <ProtectedRoute>
              <MapBookingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/fare"
          element={
            <ProtectedRoute>
              <FareEstimatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/searching"
          element={
            <ProtectedRoute>
              <SearchingDriverPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/driver-accepted"
          element={
            <ProtectedRoute>
              <DriverAcceptedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/active"
          element={
            <ProtectedRoute>
              <ActiveTripPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/completed"
          element={
            <ProtectedRoute>
              <TripCompletedPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/payment"
          element={
            <ProtectedRoute>
              <PaymentConfirmationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:id/rate"
          element={
            <ProtectedRoute>
              <RatingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <TripHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}
