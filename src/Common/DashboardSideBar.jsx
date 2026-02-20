import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  BedDouble,
  Utensils,
  Tag,
  Settings,
  LogOut,
  ChevronDown,
  Image,
  List,
  PlusCircle,
  Layers,
  Clock,
  ShoppingCart,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import axiosClient from "../api/axiosClient";

export default function Sidebar() {
  const location = useLocation();

  const isDiningPath = location.pathname.includes("/admin/dining");
  const [openDining, setOpenDining] = useState(isDiningPath);

  useEffect(() => {
    if (isDiningPath) setOpenDining(true);
  }, [location.pathname, isDiningPath]);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Rooms", path: "/admin/rooms", icon: <BedDouble size={20} /> },
    { name: "Offers", path: "/admin/offers", icon: <Tag size={20} /> },
  ];

  const diningSubMenu = [
    {
      name: "Categories",
      path: "/admin/categories",
      icon: <Layers size={18} />,
    },
    {
      name: "Menu List",
      path: "/admin/dining-images",
      icon: <List size={18} />,
    },
    {
      name: "Add Item",
      path: "/admin/add-item",
      icon: <PlusCircle size={18} />,
    },
    {
      name: "Live Orders",
      path: "/admin/live-orders",
      icon: <ShoppingCart size={18} />,
    },

    {
      name: "Kitchen Staff",
      path: "/admin/kitchen-staff",
      icon: <Users size={18} />,
    },
    {
      name: "Inventory/Stock",
      path: "/admin/Stock",
      icon: <Clock size={18} />,
    },
    {
      name: "Daily Roster",
      path: "/admin/daily-roster",
      icon: <Clock size={18} />,
    },
  ];

  const handleLogout = async () => {
    await axiosClient.post("/admin/logout").then(() => {
      window.location.href = "http://localhost:3000/admin";
    });
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col">
      <div className="p-6 border-b border-gray-50">
        <Link to="/" className="text-2xl font-serif tracking-wide">
          <span className="text-black">The</span>
          <span className="text-[#C6A45C]">Galaxy</span>
        </Link>
        <p className="text-[10px] text-gray-400 uppercase tracking-[3px] mt-1 font-medium">
          Admin Panel
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-sm text-sm font-medium transition ${
                isActive
                  ? "bg-[#C6A45C] text-white"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#C6A45C]"
              }`}
            >
              {item.icon}
              <span className="uppercase text-[12px]">{item.name}</span>
            </Link>
          );
        })}

        <div>
          <button
            onClick={() => setOpenDining(!openDining)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-sm transition ${
              isDiningPath
                ? "bg-gray-50 text-[#C6A45C]"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-4">
              <Utensils
                size={20}
                className={isDiningPath ? "text-[#C6A45C]" : "text-gray-400"}
              />
              <span className="uppercase text-[12px] font-medium">Dining</span>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform duration-300 ${openDining ? "rotate-180" : ""}`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${openDining ? "max-h-96 mt-2" : "max-h-0"}`}
          >
            <div className="ml-9 border-l-2 border-gray-50 space-y-1">
              {diningSubMenu.map((sub) => {
                const isActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.name}
                    to={sub.path}
                    className={`flex items-center gap-3 px-4 py-2 text-[13px] transition ${
                      isActive
                        ? "text-[#C6A45C] font-semibold"
                        : "text-gray-500 hover:text-[#C6A45C]"
                    }`}
                  >
                    {sub.icon}
                    <span>{sub.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <Link
          to="/admin/settings"
          className={`flex items-center gap-4 px-4 py-3 rounded-sm text-sm font-medium transition ${
            location.pathname === "/admin/settings"
              ? "bg-[#C6A45C] text-white"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Settings size={20} />
          <span className="uppercase text-[12px]">Settings</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 text-gray-500 hover:text-red-600 transition uppercase text-[12px] font-medium"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
