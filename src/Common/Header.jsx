import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Info,
  LogIn,
  UserPlus,
  Menu,
  X,
  ShieldCheck,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

const cn = (...inputs) => twMerge(clsx(inputs));

const navigations = [
  { title: "Home", path: "/", icon: Home },
  { title: "About Us", path: "/about-us", icon: Info },
  { title: "Login", path: "/login", icon: LogIn },
  { title: "Register", path: "/register", icon: UserPlus },
];

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        isScrolled
          ? "bg-white/90 backdrop-blur-md shadow-md py-2 border-gray-200"
          : "bg-white/50 backdrop-blur-sm py-4 border-transparent",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg group-hover:shadow-blue-500/30 transition">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
              MedVault.ai
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-sm">
            {navigations.map(({ title, path, icon: Icon }) => {
              const active = isActive(path);

              return (
                <Link
                  key={path}
                  to={path}
                  className={cn(
                    "relative px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition",
                    active
                      ? "text-white"
                      : "text-slate-600 hover:text-blue-600",
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full -z-10 shadow-md"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    />
                  )}

                  <Icon className="w-4 h-4" />
                  {title}
                </Link>
              );
            })}
          </nav>

          <button
            onClick={() => setIsMobileMenuOpen((p) => !p)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navigations.map(({ title, path, icon: Icon }) => {
                const active = isActive(path);

                return (
                  <Link
                    key={path}
                    to={path}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl transition",
                      active
                        ? "bg-blue-50 text-blue-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4",
                        active ? "text-blue-600" : "text-slate-400",
                      )}
                    />
                    {title}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
