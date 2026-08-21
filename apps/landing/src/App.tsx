import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";

// Landing pages
import LandingPage from "@/pages/LandingPage";
import PortalPage from "@/pages/PortalPage";
import LoginPage from "@/pages/LoginPage";

// Passenger
import PassengerLayout from "@/roles/passenger/Layout";
import PassengerHomePage from "@/roles/passenger/pages/HomePage";
import PassengerLoginPage from "@/roles/passenger/pages/auth/LoginPage";
import PassengerRegisterPage from "@/roles/passenger/pages/auth/RegisterPage";
import PassengerMapBookingPage from "@/roles/passenger/pages/booking/MapBookingPage";
import PassengerFareEstimatePage from "@/roles/passenger/pages/booking/FareEstimatePage";
import PassengerSearchingDriverPage from "@/roles/passenger/pages/booking/SearchingDriverPage";
import PassengerDriverAcceptedPage from "@/roles/passenger/pages/booking/DriverAcceptedPage";
import PassengerActiveTripPage from "@/roles/passenger/pages/booking/ActiveTripPage";
import PassengerTripCompletedPage from "@/roles/passenger/pages/booking/TripCompletedPage";
import PassengerPaymentConfirmationPage from "@/roles/passenger/pages/booking/PaymentConfirmationPage";
import PassengerRatingPage from "@/roles/passenger/pages/rating/RatingPage";
import PassengerTripHistoryPage from "@/roles/passenger/pages/history/TripHistoryPage";
import PassengerProfilePage from "@/roles/passenger/pages/profile/ProfilePage";
import PassengerNotificationsPage from "@/roles/passenger/pages/notifications/NotificationsPage";

// Driver
import DriverLayout from "@/roles/driver/Layout";
import DriverHomePage from "@/roles/driver/pages/HomePage";
import DriverLoginPage from "@/roles/driver/pages/auth/LoginPage";
import DriverRegisterPage from "@/roles/driver/pages/auth/RegisterPage";
import DriverVerificationPage from "@/roles/driver/pages/verification/VerificationStatusPage";
import DriverBookingRequestPage from "@/roles/driver/pages/booking/BookingRequestPage";
import DriverNavigateToPickupPage from "@/roles/driver/pages/booking/NavigateToPickupPage";
import DriverActiveTripPage from "@/roles/driver/pages/booking/ActiveTripPage";
import DriverTripCompletedPage from "@/roles/driver/pages/booking/TripCompletedPage";
import DriverEarningsPage from "@/roles/driver/pages/earnings/EarningsPage";
import DriverTripHistoryPage from "@/roles/driver/pages/history/TripHistoryPage";
import DriverProfilePage from "@/roles/driver/pages/profile/ProfilePage";
import DriverNotificationsPage from "@/roles/driver/pages/notifications/NotificationsPage";

// Admin
import AdminLayout from "@/roles/admin/components/Layout";
import AdminLoginPage from "@/roles/admin/pages/auth/LoginPage";
import AdminDashboardPage from "@/roles/admin/pages/DashboardPage";
import AdminDriversPage from "@/roles/admin/pages/drivers/DriversPage";
import AdminDriverDetailPage from "@/roles/admin/pages/drivers/DriverDetailPage";
import AdminVerificationQueuePage from "@/roles/admin/pages/drivers/VerificationQueuePage";
import AdminPassengersPage from "@/roles/admin/pages/passengers/PassengersPage";
import AdminBookingsPage from "@/roles/admin/pages/bookings/BookingsPage";
import AdminServiceAreasPage from "@/roles/admin/pages/geography/ServiceAreasPage";
import AdminFareManagementPage from "@/roles/admin/pages/pricing/FareManagementPage";
import AdminReportsPage from "@/roles/admin/pages/reports/ReportsPage";

function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Landing (public) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/portal" element={<PortalPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* ── Passenger ── */}
        <Route path="/user/passenger/login" element={<PassengerLoginPage />} />
        <Route path="/user/passenger/register" element={<PassengerRegisterPage />} />
        <Route path="/user/passenger" element={<ProtectedRoute><PassengerLayout /></ProtectedRoute>}>
          <Route index element={<PassengerHomePage />} />
          <Route path="booking" element={<PassengerMapBookingPage />} />
          <Route path="booking/fare" element={<PassengerFareEstimatePage />} />
          <Route path="booking/searching" element={<PassengerSearchingDriverPage />} />
          <Route path="booking/driver-accepted" element={<PassengerDriverAcceptedPage />} />
          <Route path="booking/active" element={<PassengerActiveTripPage />} />
          <Route path="booking/completed" element={<PassengerTripCompletedPage />} />
          <Route path="booking/payment" element={<PassengerPaymentConfirmationPage />} />
          <Route path="booking/:id/rate" element={<PassengerRatingPage />} />
          <Route path="history" element={<PassengerTripHistoryPage />} />
          <Route path="profile" element={<PassengerProfilePage />} />
          <Route path="notifications" element={<PassengerNotificationsPage />} />
        </Route>

        {/* ── Driver ── */}
        <Route path="/user/driver/login" element={<DriverLoginPage />} />
        <Route path="/user/driver/register" element={<DriverRegisterPage />} />
        <Route path="/user/driver" element={<ProtectedRoute><DriverLayout /></ProtectedRoute>}>
          <Route index element={<DriverHomePage />} />
          <Route path="verification" element={<DriverVerificationPage />} />
          <Route path="booking/request" element={<DriverBookingRequestPage />} />
          <Route path="booking/navigate" element={<DriverNavigateToPickupPage />} />
          <Route path="booking/active" element={<DriverActiveTripPage />} />
          <Route path="booking/completed" element={<DriverTripCompletedPage />} />
          <Route path="earnings" element={<DriverEarningsPage />} />
          <Route path="history" element={<DriverTripHistoryPage />} />
          <Route path="profile" element={<DriverProfilePage />} />
          <Route path="notifications" element={<DriverNotificationsPage />} />
        </Route>

        {/* ── Admin ── */}
        <Route path="/user/admin/login" element={<AdminLoginPage />} />
        <Route path="/user/admin" element={<ProtectedRoute><AdminLayout><AdminDashboardPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/drivers" element={<ProtectedRoute><AdminLayout><AdminDriversPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/drivers/verification" element={<ProtectedRoute><AdminLayout><AdminVerificationQueuePage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/drivers/:id" element={<ProtectedRoute><AdminLayout><AdminDriverDetailPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/passengers" element={<ProtectedRoute><AdminLayout><AdminPassengersPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/bookings" element={<ProtectedRoute><AdminLayout><AdminBookingsPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/geography" element={<ProtectedRoute><AdminLayout><AdminServiceAreasPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/pricing" element={<ProtectedRoute><AdminLayout><AdminFareManagementPage /></AdminLayout></ProtectedRoute>} />
        <Route path="/user/admin/reports" element={<ProtectedRoute><AdminLayout><AdminReportsPage /></AdminLayout></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
