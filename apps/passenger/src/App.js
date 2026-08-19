import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(Routes, { children: _jsxs(Route, { element: _jsx(Layout, {}), children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }), _jsx(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(HomePage, {}) }) }), _jsx(Route, { path: "/booking", element: _jsx(ProtectedRoute, { children: _jsx(MapBookingPage, {}) }) }), _jsx(Route, { path: "/booking/fare", element: _jsx(ProtectedRoute, { children: _jsx(FareEstimatePage, {}) }) }), _jsx(Route, { path: "/booking/searching", element: _jsx(ProtectedRoute, { children: _jsx(SearchingDriverPage, {}) }) }), _jsx(Route, { path: "/booking/driver-accepted", element: _jsx(ProtectedRoute, { children: _jsx(DriverAcceptedPage, {}) }) }), _jsx(Route, { path: "/booking/active", element: _jsx(ProtectedRoute, { children: _jsx(ActiveTripPage, {}) }) }), _jsx(Route, { path: "/booking/completed", element: _jsx(ProtectedRoute, { children: _jsx(TripCompletedPage, {}) }) }), _jsx(Route, { path: "/booking/payment", element: _jsx(ProtectedRoute, { children: _jsx(PaymentConfirmationPage, {}) }) }), _jsx(Route, { path: "/booking/:id/rate", element: _jsx(ProtectedRoute, { children: _jsx(RatingPage, {}) }) }), _jsx(Route, { path: "/history", element: _jsx(ProtectedRoute, { children: _jsx(TripHistoryPage, {}) }) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(ProfilePage, {}) }) }), _jsx(Route, { path: "/notifications", element: _jsx(ProtectedRoute, { children: _jsx(NotificationsPage, {}) }) })] }) }));
}
