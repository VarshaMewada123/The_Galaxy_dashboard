/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Utensils,
  MapPin,
  Star,
  Loader2,
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import axiosClient from "../api/axiosClient";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [areas, setAreas] = useState([]);
  const [mostSelling, setMostSelling] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatCurrency = (num) => {
    if (!num) return "₹0";
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
    return `₹${num}`;
  };

  const loadDashboard = async () => {
    try {
      const [statsRes, dishesRes, areaRes, mostRes] = await Promise.all([
        axiosClient.get("/admin/dashboard/stats"),
        axiosClient.get("/admin/dashboard/top-dishes"),
        axiosClient.get("/admin/dashboard/orders-by-landmark"),
        axiosClient.get("/admin/dashboard/most-selling"),
      ]);

      setStats(statsRes.data.data);
      setTopDishes(dishesRes.data.data);
      setAreas(areaRes.data.data);
      setMostSelling(mostRes.data.data);
    } catch (err) {
      console.error("Dashboard error:", err);
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#FAFAFA] z-50">
        <Loader2 className="h-10 w-10 animate-spin text-[#C5A059]" />
        <p className="mt-4 text-sm font-medium text-gray-500 animate-pulse">
          Loading Galaxy Analytics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] antialiased p-4 md:p-6 lg:p-5">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6 py-0">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Galaxy <span className="text-[#C5A059]">Dashboard</span>
          </h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium mt-1">
            Real-time performance metrics
          </p>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard
            title="Revenue"
            value={formatCurrency(stats?.totalRevenue)}
            icon={<TrendingUp size={20} />}
            color="bg-blue-50 text-blue-600"
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={<ShoppingBag size={20} />}
            color="bg-orange-50 text-orange-600"
            onClick={() => navigate("/admin/orders")}
          />
          <StatCard
            title="Weekly"
            value={stats?.weeklyOrders || 0}
            icon={<Clock size={20} />}
            color="bg-purple-50 text-purple-600"
          />
          <StatCard
            title="Monthly"
            value={stats?.monthlyOrders || 0}
            icon={<CheckCircle size={20} />}
            color="bg-green-50 text-green-600"
          />

          <motion.div
            whileHover={{ y: -5 }}
            className="bg-[#1A1A1A] p-5 rounded-3xl shadow-sm flex flex-col justify-between border border-gray-800 relative overflow-hidden"
          >
            <div className="flex justify-between items-start relative z-10">
              <div className="p-2 bg-[#C5A059]/10 rounded-xl text-[#C5A059]">
                <Star size={20} fill="#C5A059" />
              </div>
              <span className="text-[10px] font-bold text-[#C5A059] uppercase tracking-tighter bg-[#C5A059]/10 px-2 py-0.5 rounded">
                MVP
              </span>
            </div>
            <div className="relative z-10 mt-4">
              <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                Most Selling
              </p>
              <h3 className="text-white text-lg font-bold leading-tight truncate">
                {mostSelling?._id || "N/A"}
              </h3>
              <p className="text-[#C5A059] text-xs font-bold">
                {mostSelling?.totalQty || 0} Sold
              </p>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Section title="Top Dishes" icon={<Utensils size={18} />}>
            <div className="divide-y divide-gray-50">
              {topDishes.slice(0, 6).map((dish, index) => (
                <Row
                  key={index}
                  left={`${index + 1}. ${dish.dish}`}
                  right={`${dish.quantity}`}
                  subRight="orders"
                />
              ))}
            </div>
          </Section>

          <Section title="Orders By Area" icon={<MapPin size={18} />}>
            <div className="divide-y divide-gray-50">
              {areas.slice(0, 6).map((area, index) => (
                <Row
                  key={index}
                  left={area.landmark}
                  right={`${area.orders}`}
                  subRight="orders"
                />
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
  >
    <div className="flex items-center gap-3 font-bold mb-4 text-gray-800">
      <span className="p-2 bg-gray-50 rounded-xl text-[#C5A059]">{icon}</span>
      <span className="tracking-tight">{title}</span>
    </div>
    <div className="space-y-1">{children}</div>
  </motion.div>
);

const Row = ({ left, right, subRight }) => (
  <div className="flex justify-between items-center py-3 group transition-all">
    <span className="text-sm text-gray-600 group-hover:text-black font-medium truncate pr-4 transition-colors">
      {left}
    </span>
    <div className="text-right">
      <span className="font-bold text-sm text-[#1A1A1A] block leading-none">
        {right}
      </span>
      <span className="text-[10px] text-gray-400 uppercase font-semibold">
        {subRight}
      </span>
    </div>
  </div>
);

const StatCard = ({ title, value, icon, color, onClick }) => (
  <motion.div
    whileHover={{ y: onClick ? -5 : 0 }}
    onClick={onClick}
    role={onClick ? "button" : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={(e) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        onClick();
      }
    }}
    className={`bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between h-full transition
      ${onClick ? "cursor-pointer hover:shadow-md" : ""}
    `}
  >
    <div className={`w-fit p-2.5 rounded-2xl ${color}`}>{icon}</div>

    <div className="mt-4">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
        {title}
      </p>
      <h3 className="text-xl md:text-2xl font-black text-[#1A1A1A] tracking-tight truncate">
        {value}
      </h3>
    </div>
  </motion.div>
);

export default Dashboard;
