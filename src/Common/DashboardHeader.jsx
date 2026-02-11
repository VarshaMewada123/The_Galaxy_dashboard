import { Menu, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const AdminHeader = ({ onSidebarToggle, admin = {} }) => {
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case "/admin":
      case "/admin/dashboard":
        return "Dashboard Overview";
      case "/admin/rooms":
        return "Rooms Management";
      case "/admin/bookings":
        return "Guest Bookings";
      case "/admin/dining":
        return "Dining & Menu";
      case "/admin/gallery":
        return "Media Gallery";
      case "/admin/home":
        return "Home Content";
      case "/admin/about":
        return "About Content";
      case "/admin/settings":
        return "System Settings";
      default:
        return "Admin Panel";
    }
  };

  const unreadCount = admin?.notificationsCount || 0;

  return (
    <header className="flex items-center justify-between h-20 bg-white px-8 border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-6">
        <button
          onClick={onSidebarToggle}
          className="p-2 rounded-sm hover:bg-gray-50 text-gray-800 hover:text-[#C6A45C] transition-all duration-300"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>

        <div className="flex flex-col">
          <h1 className="text-xl font-serif text-black tracking-wide">
            {getPageTitle()}
          </h1>
          <div className="h-0.5 w-8 bg-[#C6A45C] mt-1"></div> {/* Royal accent line */}
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-5">
        {/* Notifications */}
        <Link
          to="/admin/notifications"
          className={`relative p-2.5 rounded-full transition-all duration-300 ${
            location.pathname === "/admin/notifications"
              ? "bg-[#C6A45C] text-white shadow-md shadow-[#c6a45c44]"
              : "text-gray-500 hover:bg-gray-50 hover:text-[#C6A45C]"
          }`}
        >
          <Bell className="w-5 h-5" />

          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-4 w-4 bg-black text-[#C6A45C] text-[10px] rounded-full flex items-center justify-center font-bold border border-white">
              {unreadCount}
            </span>
          )}
        </Link>

        {/* Vertical Divider */}
        <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

        {/* Profile Section */}
        <Link
          to="/admin/profile"
          className="flex items-center gap-3 group transition-all duration-300"
        >
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-black uppercase tracking-wider group-hover:text-[#C6A45C] transition-colors">
              {admin.name || "Hotel Admin"}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-[2px] font-medium">
              Administrator
            </p>
          </div>

          <div className="w-10 h-10 rounded-full p-[2px] border-2 border-[#C6A45C] group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              {admin.avatar ? (
                <img
                  src={admin.avatar}
                  alt="Admin"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = `https://ui-avatars.com/api/?name=${
                      admin.name || "Admin"
                    }&background=C6A45C&color=fff&bold=true`;
                  }}
                />
              ) : (
                <User className="w-5 h-5 text-[#C6A45C]" />
              )}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;

