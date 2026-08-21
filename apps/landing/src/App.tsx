import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/roles/admin/components/Layout";

// Landing pages — small, always needed on first paint.
import LandingPage from "@/pages/LandingPage";
import PortalPage from "@/pages/PortalPage";
import LoginPage from "@/pages/LoginPage";

// Role layouts stay eager so the dashboard shell renders instantly;
// individual pages below load on demand.
import PassengerLayout from "@/roles/passenger/Layout";
import DriverLayout from "@/roles/driver/Layout";

function Loading() {
  return (
    <div className="min-h-dvh flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

// ── Passenger pages (lazy) ──
const PassengerHomePage = lazy(() => import("@/roles/passenger/pages/HomePage"));
const PassengerLoginPage = lazy(() => import("@/roles/passenger/pages/auth/LoginPage"));
const PassengerRegisterPage = lazy(() => import("@/roles/passenger/pages/auth/RegisterPage"));
const PassengerMapBookingPage = lazy(() => import("@/roles/passenger/pages/booking/MapBookingPage"));
const PassengerFareEstimatePage = lazy(() => import("@/roles/passenger/pages/booking/FareEstimatePage"));
const PassengerSearchingDriverPage = lazy(() => import("@/roles/passenger/pages/booking/SearchingDriverPage"));
const PassengerDriverAcceptedPage = lazy(() => import("@/roles/passenger/pages/booking/DriverAcceptedPage"));
const PassengerActiveTripPage = lazy(() => import("@/roles/passenger/pages/booking/ActiveTripPage"));
const PassengerTripCompletedPage = lazy(() => import("@/roles/passenger/pages/booking/TripCompletedPage"));
const PassengerPaymentConfirmationPage = lazy(() => import("@/roles/passenger/pages/booking/PaymentConfirmationPage"));
const PassengerRatingPage = lazy(() => import("@/roles/passenger/pages/rating/RatingPage"));
const PassengerTripHistoryPage = lazy(() => import("@/roles/passenger/pages/history/TripHistoryPage"));
const PassengerProfilePage = lazy(() => import("@/roles/passenger/pages/profile/ProfilePage"));
const PassengerNotificationsPage = lazy(() => import("@/roles/passenger/pages/notifications/NotificationsPage"));

// ── Driver pages (lazy) ──
const DriverHomePage = lazy(() => import("@/roles/driver/pages/HomePage"));
const DriverLoginPage = lazy(() => import("@/roles/driver/pages/auth/LoginPage"));
const DriverRegisterPage = lazy(() => import("@/roles/driver/pages/auth/RegisterPage"));
const DriverVerificationPage = lazy(() => import("@/roles/driver/pages/verification/VerificationStatusPage"));
const DriverBookingRequestPage = lazy(() => import("@/roles/driver/pages/booking/BookingRequestPage"));
const DriverNavigateToPickupPage = lazy(() => import("@/roles/driver/pages/booking/NavigateToPickupPage"));
const DriverActiveTripPage = lazy(() => import("@/roles/driver/pages/booking/ActiveTripPage"));
const DriverTripCompletedPage = lazy(() => import("@/roles/driver/pages/booking/TripCompletedPage"));
const DriverEarningsPage = lazy(() => import("@/roles/driver/pages/earnings/EarningsPage"));
const DriverTripHistoryPage = lazy(() => import("@/roles/driver/pages/history/TripHistoryPage"));
const DriverProfilePage = lazy(() => import("@/roles/driver/pages/profile/ProfilePage"));
const DriverNotificationsPage = lazy(() => import("@/roles/driver/pages/notifications/NotificationsPage"));

// ── Admin pages (lazy — keeps chart.js out of the main bundle) ──
const AdminLoginPage = lazy(() => import("@/roles/admin/pages/auth/LoginPage"));
const AdminDashboardPage = lazy(() => import("@/roles/admin/pages/DashboardPage"));
const AdminDriversPage = lazy(() => import("@/roles/admin/pages/drivers/DriversPage"));
const AdminDriverDetailPage = lazy(() => import("@/roles/admin/pages/drivers/DriverDetailPage"));
const AdminVerificationQueuePage = lazy(() => import("@/roles/admin/pages/drivers/VerificationQueuePage"));
const AdminPassengersPage = lazy(() => import("@/roles/admin/pages/passengers/PassengersPage"));
const AdminBookingsPage = lazy(() => import("@/roles/admin/pages/bookings/BookingsPage"));
const AdminServiceAreasPage = lazy(() => import("@/roles/admin/pages/geography/ServiceAreasPage"));
const AdminFareManagementPage = lazy(() => import("@/roles/admin/pages/pricing/FareManagementPage"));
const AdminReportsPage = lazy(() => import("@/roles/admin/pages/reports/ReportsPage"));

/** Admin shell with a suspense boundary so the sidebar stays mounted while page chunks stream. */
function AdminPage({ children }: { children: React.ReactNode }) {
  return <AdminLayout><Suspense fallback={<Loading />}>{children}</Suspense></AdminLayout>;
}

/** Auth pages get their own centered spinner. */
function AuthPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Loading />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      {/* Landing (public) */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* ── Passenger ── */}
      <Route path="/user/passenger/login" element={<AuthPage><PassengerLoginPage /></AuthPage>} />
      <Route path="/user/passenger/register" element={<AuthPage><PassengerRegisterPage /></AuthPage>} />
      <Route path="/user/passenger" element={<ProtectedRoute role="PASSENGER"><PassengerLayout /></ProtectedRoute>}>
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
      <Route path="/user/driver/login" element={<AuthPage><DriverLoginPage /></AuthPage>} />
      <Route path="/user/driver/register" element={<AuthPage><DriverRegisterPage /></AuthPage>} />
      <Route path="/user/driver" element={<ProtectedRoute role="DRIVER"><DriverLayout /></ProtectedRoute>}>
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
      <Route path="/user/admin/login" element={<AuthPage><AdminLoginPage /></AuthPage>} />
      <Route path="/user/admin" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminDashboardPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/drivers" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminDriversPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/drivers/verification" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminVerificationQueuePage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/drivers/:id" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminDriverDetailPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/passengers" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminPassengersPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/bookings" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminBookingsPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/geography" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminServiceAreasPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/pricing" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminFareManagementPage /></AdminPage></ProtectedRoute>} />
      <Route path="/user/admin/reports" element={<ProtectedRoute role="ADMIN"><AdminPage><AdminReportsPage /></AdminPage></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
