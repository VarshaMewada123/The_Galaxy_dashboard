/* eslint-disable no-unused-vars */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosClient from "./api/axiosClient";
import MainLayout from "./Layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Rooms from "./Pages/Rooms";
import Bookings from "./Pages/Bookings";
import HotelImages from "./Pages/HotelImages";
import DiningImages from "./Pages/DiningImages";
import Offers from "./Pages/Offers";
import Settings from "./Pages/Settings";
import Categories from "./Pages/Categories";
import AddItem from "./Pages/AddItem";
import KitchenStaff from "./Pages/KitchenStaff";
import DailyRoster from "./Pages/DailyRoster";
import ComboPage from "./Pages/ComboPage";
import AdminOrdersPage from "./Pages/AdminOrdersPage";
import OffersPage from "./Pages/CreateOffer";
import OffersList from "./Pages/OfferList";
import Riders from "./Pages/Riders";
import SubCategories from "./Pages/Subcategories";
import Availability from "./Pages/Availability";

const ADMIN_LOGIN = import.meta.env.VITE_ADMIN_LOGIN;

const AdminProtectedRoute = ({ children }) => {
  const [authStatus, setAuthStatus] = useState("loading");

  useEffect(() => {
    const isVerified = sessionStorage.getItem("admin_verified");
    if (isVerified === "true") {
      setAuthStatus("authorized");
      return;
    }

    const checkAuth = async () => {
      try {
        await axiosClient.get("/admin/me");
        sessionStorage.setItem("admin_verified", "true");
        setAuthStatus("authorized");
      } catch (err) {
        console.error("Auth failed");
        setAuthStatus("unauthorized");

        sessionStorage.setItem("admin_verified", "false");
      }
    };

    checkAuth();
  }, []);

  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-t-[#C4A15A] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authStatus === "unauthorized") {
    if (window.location.href !== ADMIN_LOGIN) {
      window.location.href = ADMIN_LOGIN;
    }
    return null;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <MainLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="hotel-images" element={<HotelImages />} />
          <Route path="dining-images" element={<DiningImages />} />
          <Route path="categories" element={<Categories />} />
          <Route path="offers" element={<Offers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="add-item" element={<AddItem />} />
          <Route path="kitchen-staff" element={<KitchenStaff />} />
          <Route path="daily-roster" element={<DailyRoster />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="combos" element={<ComboPage />} />
          <Route path="offersdining" element={<OffersPage />} />
          <Route path="offerslist" element={<OffersList />} />
          <Route path="riders" element={<Riders />} />
  <Route path="availability" element={<Availability />} />
          <Route path="subcategories" element={<SubCategories />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
