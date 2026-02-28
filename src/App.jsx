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
import LiveOrders from "./Pages/LiveOrders";
import KitchenStaff from "./Pages/KitchenStaff";
import Inventory from "./Pages/Inventory";
import Stock from "./Pages/Stock";
import DailyRoster from "./Pages/DailyRoster";

const ADMIN_LOGIN = import.meta.env.VITE_ADMIN_LOGIN;

const AdminProtectedRoute = ({ children }) => {
  // States: 'idle' | 'loading' | 'authorized' | 'unauthorized'
  const [authStatus, setAuthStatus] = useState("loading");

  useEffect(() => {
    // 1. Pehle hi check kar chuke hain toh dobara API hit na karein
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
        // Loop rokne ke liye mark karein ki check ho gaya
        sessionStorage.setItem("admin_verified", "false"); 
      }
    };

    checkAuth();
  }, []);

  // 2. Loading State: Jab tak API result na aaye
  if (authStatus === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="w-10 h-10 border-4 border-t-[#C4A15A] border-gray-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  // 3. Unauthorized State: Loop se bachne ke liye direct redirection
  if (authStatus === "unauthorized") {
    // Agar current URL pehle se hi login page hai toh redirect na karein (Loop protection)
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
          <Route path="live-orders" element={<LiveOrders />} />
          <Route path="kitchen-staff" element={<KitchenStaff />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="stock" element={<Stock />} />
          <Route path="daily-roster" element={<DailyRoster />} />
        </Route>

        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}