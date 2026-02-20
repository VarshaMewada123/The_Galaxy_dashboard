import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axiosClient from "@/api/axiosClient";

export default function ProtectedRoute({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await axiosClient.get("/admin/me");
        setIsAuthorized(true);
      } catch (err) {
        setIsAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  if (isAuthorized === null) {
    return null;
  }

  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return children;
}
