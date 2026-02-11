import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "./Layout/FrontLayout";
import LoginSuccess from "./Pages/LoginSuccess";

import MainLayout from "./Layout/DashboardLayout";
import Dashboard from "./Pages/Dashboard";
import Rooms from "./Pages/Rooms";
import Bookings from "./Pages/Bookings";
import HotelImages from "./Pages/HotelImages";
import DiningImages from "./Pages/DiningImages";
import Offers from "./Pages/Offers";
import Settings from "./Pages/Settings";

const AdminProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("adminToken");


  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC ROUTE */}
        <Route element={<Layout />}>
          <Route path="/login-success" element={<LoginSuccess />} />
        </Route>

        {/* PROTECTED DASHBOARD ROOT */}
        <Route
          path="/"
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
          <Route path="offers" element={<Offers />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login-success" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
