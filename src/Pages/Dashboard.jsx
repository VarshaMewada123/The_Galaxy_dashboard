import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle,
  Utensils,
  MapPin,
  Star,
  Loader2
} from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import axiosClient from "../api/axiosClient";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [topDishes, setTopDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [areas, setAreas] = useState([]);
  const [mostSelling, setMostSelling] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsRes, dishesRes, categoryRes, areaRes, mostRes] = await Promise.all([
        axiosClient.get("/admin/dashboard/stats"),
        axiosClient.get("/admin/dashboard/top-dishes"),
        axiosClient.get("/admin/dashboard/category-sales"),
        axiosClient.get("/admin/dashboard/orders-by-landmark"),
        axiosClient.get("/admin/dashboard/most-selling")
      ]);

      setStats(statsRes.data.data);
      setTopDishes(dishesRes.data.data);
      setCategories(categoryRes.data.data);
      setAreas(areaRes.data.data);
      setMostSelling(mostRes.data.data);
      toast.success("Analytics updated");
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
        <p className="mt-4 text-sm font-medium text-gray-500">Loading Galaxy Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A] antialiased selection:bg-[#C5A059]/30">
      <Toaster position="top-right" />
      
      <main className="max-w-[1440px] mx-auto p-4 md:p-8 lg:p-10 space-y-8">
        
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Galaxy <span className="text-[#C5A059]">Dashboard</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">Real-time hotel performance overview</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full w-fit">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-green-700 font-bold text-xs uppercase tracking-wider">System Live</span>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard title="Total Revenue" value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`} icon={<TrendingUp />} color="bg-blue-50 text-blue-600" />
          <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={<ShoppingBag />} color="bg-orange-50 text-orange-600" />
          <StatCard title="Weekly Orders" value={stats?.weeklyOrders || 0} icon={<Clock />} color="bg-purple-50 text-purple-600" />
          <StatCard title="Monthly Orders" value={stats?.monthlyOrders || 0} icon={<CheckCircle />} color="bg-green-50 text-green-600" />
        </section>

        <div className="grid grid-cols-12 gap-6">
          
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Section title="Top Selling Dishes" icon={<Utensils className="text-[#C5A059]" />}>
                {topDishes.map((dish, index) => (
                  <Row key={index} left={`${index + 1}. ${dish.dish}`} right={`${dish.quantity} orders`} />
                ))}
              </Section>

              <Section title="Category Wise Sales" icon={<TrendingUp className="text-[#C5A059]" />}>
                {categories.map((cat, index) => (
                  <Row key={index} left={cat.category} right={`₹${cat.totalSales?.toLocaleString()}`} />
                ))}
              </Section>
            </div>

            <Section title="Orders By Area" icon={<MapPin className="text-[#C5A059]" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                {areas.map((area, index) => (
                  <Row key={index} left={area.landmark} right={`${area.orders} orders`} />
                ))}
              </div>
            </Section>
          </div>

          <aside className="col-span-12 lg:col-span-4 space-y-6">
            <AnimatePresence>
              {mostSelling && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-[#1A1A1A] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 text-[#C5A059] font-bold mb-6 italic tracking-widest uppercase text-xs">
                      <Star size={16} fill="#C5A059" />
                      MVP of the Month
                    </div>
                    <h2 className="text-3xl font-bold mb-2">{mostSelling._id}</h2>
                    <p className="text-gray-400 text-lg">{mostSelling.totalQty} Units Sold</p>
                    <button 
                      onClick={() => toast("Promotion applied to " + mostSelling._id)}
                      className="mt-8 w-full py-3 bg-[#C5A059] hover:bg-[#b08e4d] transition-colors rounded-xl font-bold text-sm"
                    >
                      View Insights
                    </button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10">
                    <Utensils size={150} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4 text-[#1A1A1A]">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => toast.success("Report Generated")} className="p-3 bg-gray-50 rounded-2xl text-xs font-semibold hover:bg-gray-100 transition-colors">Download PDF</button>
                <button onClick={() => loadDashboard()} className="p-3 bg-gray-50 rounded-2xl text-xs font-semibold hover:bg-gray-100 transition-colors">Refresh Data</button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

const Section = ({ title, icon, children }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow h-full"
  >
    <div className="flex items-center gap-3 font-bold mb-6 text-lg">
      <span className="p-2 bg-gray-50 rounded-lg">{icon}</span>
      {title}
    </div>
    <div className="space-y-4">{children}</div>
  </motion.div>
);

const Row = ({ left, right }) => (
  <div className="flex justify-between items-center group py-1 border-b border-transparent hover:border-gray-50 transition-colors">
    <span className="text-gray-600 group-hover:text-[#1A1A1A] transition-colors truncate pr-4">{left}</span>
    <span className="font-bold whitespace-nowrap text-[#C5A059]">{right}</span>
  </div>
);

const StatCard = ({ title, value, icon, color }) => (
  <motion.div
    whileHover={{ y: -5 }}
    transition={{ type: "spring", stiffness: 300 }}
    className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-start justify-between min-h-[160px]"
  >
    <div className={`p-3 rounded-2xl ${color} mb-4`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl md:text-3xl font-black mt-1 text-[#1A1A1A] tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

export default Dashboard;