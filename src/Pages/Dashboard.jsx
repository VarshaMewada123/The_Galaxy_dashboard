import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  ChevronRight,
  Utensils,
} from "lucide-react";
import axiosClient from "../api/axiosClient";

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [summaryRes, topRes] = await Promise.all([
        axiosClient.get("/admin/dining/analytics/summary"),
        axiosClient.get("/admin/dining/analytics/top-items"),
      ]);

      setSummary(summaryRes.data.data);
      setTopItems(topRes.data.data);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A45C]"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#FAFAFA] min-h-screen"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-black tracking-tight">
            Dining <span className="text-[#C6A45C]">Analytics</span>
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Welcome back, Admin. Here's what's happening today.
          </p>
        </div>
        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2 w-fit">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Live System
          </span>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Revenue Today"
            value={`₹${summary.totalRevenueToday}`}
            icon={<TrendingUp className="text-[#C6A45C]" size={24} />}
            trend="+12.5%"
          />
          <StatCard
            title="Total Orders"
            value={summary.totalOrdersToday}
            icon={<ShoppingBag className="text-[#C6A45C]" size={24} />}
            trend="New"
          />
          <StatCard
            title="Pending"
            value={summary.pendingOrders}
            icon={<Clock className="text-orange-400" size={24} />}
            subtext="Needs attention"
          />
          <StatCard
            title="Completed"
            value={summary.completedOrders}
            icon={<CheckCircle className="text-green-500" size={24} />}
            subtext="Success rate: 98%"
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div
          variants={itemVariants}
          className="lg:col-span-3 bg-white rounded-3xl shadow-xl shadow-gray-100/50 border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-black flex items-center gap-2">
              <Utensils size={20} className="text-[#C6A45C]" />
              Popular Delicacies
            </h2>
            <button className="text-sm font-semibold text-[#C6A45C] hover:underline">
              View All
            </button>
          </div>

          <div className="p-6">
            {topItems.length === 0 ? (
              <div className="py-10 text-center text-gray-400 italic">
                No data available for today yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {topItems.map((item, index) => (
                  <motion.div
                    whileHover={{ x: 10 }}
                    key={item._id}
                    className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#C6A45C] text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">
                          Top Rated
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-black">
                        {item.totalQuantity}
                      </p>
                      <p className="text-[10px] font-bold text-[#C6A45C] uppercase">
                        Orders
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ title, value, icon, trend, subtext }) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-gray-50 rounded-2xl">{icon}</div>
      {trend && (
        <span className="text-[10px] font-bold bg-[#C6A45C]/10 text-[#C6A45C] px-2 py-1 rounded-lg uppercase tracking-wider">
          {trend}
        </span>
      )}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <h3 className="text-3xl font-black text-black mt-1">{value}</h3>
      {subtext && (
        <p className="text-[11px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">
          {subtext}
        </p>
      )}
    </div>
  </motion.div>
);

export default Dashboard;
