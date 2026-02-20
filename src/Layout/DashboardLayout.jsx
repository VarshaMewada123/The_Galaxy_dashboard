import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../Common/DashboardHeader";
import AdminSidebar from "../Common/DashboardSideBar";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`
          bg-white border-r border-gray-100 shadow-xl
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? "w-64" : "w-0"}
        `}
      >
        {isSidebarOpen && (
          <div className="h-full">
            <AdminSidebar />
          </div>
        )}
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        <AdminHeader
          onSidebarToggle={() => setIsSidebarOpen((p) => !p)}
          admin={{ name: "Hotel Admin" }}
        />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
