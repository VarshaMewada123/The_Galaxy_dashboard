import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "../Common/DashboardHeader";
import AdminSidebar from "../Common/DashboardSideBar";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative">
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-100 shadow-xl
          transition-all duration-300 ease-in-out
          
          ${isSidebarOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"}
          
          lg:relative lg:translate-x-0 
          ${isSidebarOpen ? "lg:w-64 lg:pointer-events-auto" : "lg:w-0 lg:pointer-events-none"}
        `}
      >
        <div
          className={`h-full w-64 transition-opacity duration-200 ${
            !isSidebarOpen ? "lg:opacity-0" : "lg:opacity-100"
          }`}
        >
          <AdminSidebar />
        </div>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex flex-col flex-1 min-w-0 h-full relative">
        <AdminHeader
          onSidebarToggle={() => setIsSidebarOpen((p) => !p)}
          admin={{ name: "Hotel Admin" }}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
