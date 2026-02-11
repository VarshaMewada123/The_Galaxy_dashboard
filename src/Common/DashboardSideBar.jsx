import { Link, useLocation,useNavigate  } from "react-router-dom";
import { 
  LayoutDashboard, 
  BedDouble, 
  Utensils, 
  Tag, 
  Info, 
  LogOut,
  Settings
} from "lucide-react"; // Icons ke liye lucide-react ka use kiya hai

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
    { name: "Rooms", path: "/rooms", icon: <BedDouble size={20} /> },
    { name: "Dining", path: "/dining-images", icon: <Utensils size={20} /> },
    { name: "Offers", path: "/offers", icon: <Tag size={20} /> },
    { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
  ];

  const handleLogout = () => {
    console.log("heloo varsha")
    

    // simple navigate
     window.location.href = "https://the-galaxy-chi.vercel.app/"
  };


  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 shadow-sm flex flex-col">
      {/* Logo Section - Same as Navbar */}
      <div className="p-6 border-b border-gray-50">
        <Link to="/" className="text-2xl font-serif tracking-wide">
          <span className="text-black">The</span>
          <span className="text-[#C6A45C]">Galaxy</span>
        </Link>
        <p className="text-[10px] text-gray-400 uppercase tracking-[3px] mt-1 font-medium">
          Admin Panel
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-sm text-sm font-medium transition-all duration-300 group ${
                isActive
                  ? "bg-[#C6A45C] text-white shadow-lg shadow-[#c6a45c44]"
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#C6A45C]"
              }`}
            >
              <span className={`${isActive ? "text-white" : "text-[#C6A45C] group-hover:scale-110 transition-transform"}`}>
                {item.icon}
              </span>
              <span className="tracking-wide uppercase text-[12px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout / Bottom Section */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors uppercase tracking-wider text-[12px]"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}


