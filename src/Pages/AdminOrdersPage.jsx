import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, Phone, XCircle, Truck, Package, MapPin, 
  Calendar, CheckCircle2, Clock, AlertCircle, ChevronRight 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getRidersApi } from "../api/services/rider.api";
import OrderTrackingModal from "../components/OrderTrackingModal";

function groupOrdersByDate(orders) {
  const today = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  
  const groups = { today: [], yesterday: [], older: {} };

  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const dateStr = date.toDateString();
    
    if (dateStr === today) {
      groups.today.push(order);
    } else if (dateStr === yesterdayStr) {
      groups.yesterday.push(order);
    } else {
      const key = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      if (!groups.older[key]) groups.older[key] = [];
      groups.older[key].push(order);
    }
  });
  return groups;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const [ordersRes, ridersRes] = await Promise.all([
          axiosClient.get("/admin/dining/orders"),
          getRidersApi(),
        ]);
        setOrders(ordersRes.data.data || []);
        setRiders(ridersRes.data || []);
      } catch (err) {
        toast.error("Failed to synchronize live data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const groupedOrders = useMemo(() => groupOrdersByDate(orders), [orders]);

  const stats = useMemo(() => ({
    total: orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    pending: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length
  }), [orders]);

  const updateStatus = async (id, status) => {
    const t = toast.loading("Updating status...");
    try {
      await axiosClient.patch(`/admin/dining/orders/${id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
      toast.success(`Order is now ${status.replace("_", " ")}`, { id: t });
    } catch {
      toast.error("Update failed", { id: t });
    }
  };

  const assignRider = async (orderId, riderId) => {
    if (!riderId) return;
    const t = toast.loading("Assigning delivery partner...");
    try {
      await axiosClient.patch(`/admin/dining/orders/${orderId}/assign-rider`, { riderId });
      const rider = riders.find((r) => r._id === riderId);
      setOrders((prev) => prev.map((o) => o._id === orderId ? { ...o, rider, status: "out_for_delivery" } : o));
      toast.success(`Assigned to ${rider.name}`, { id: t });
    } catch {
      toast.error("Rider assignment failed", { id: t });
    }
  };

  const confirmCancelOrder = (id) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-serif font-medium text-stone-900">
          Are you sure you want to cancel this order?
        </p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const loadingToast = toast.loading("Cancelling order...");
              try {
                await axiosClient.patch(`/admin/dining/orders/${id}/cancel`);
                setOrders((prev) => prev.map((o) => o._id === id ? { ...o, status: "cancelled" } : o));
                toast.success("Order cancelled", { id: loadingToast });
              } catch {
                toast.error("Could not cancel", { id: loadingToast });
              }
            }}
            className="bg-rose-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-transform active:scale-95"
          >
            Confirm
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Dismiss
          </button>
        </div>
      </div>
    ), { duration: 5000, icon: <AlertCircle className="text-rose-500" /> });
  };

  const getStatusStyle = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered") return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-100";
    if (["preparing", "ready", "out_for_delivery"].includes(s)) return "bg-[#C5A059]/10 text-[#C5A059] border-[#C5A059]/20";
    return "bg-stone-100 text-stone-600 border-stone-200";
  };

  const OrderRow = ({ order }) => (
    <motion.tr 
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target.closest("button") || e.target.closest("select")) return;
        typeof order?.address?.lat === "number" ? setSelectedOrder(order) : toast.error("Location missing");
      }}
      className="hidden lg:table-row group border-b border-stone-100 hover:bg-[#C5A059]/5 transition-colors cursor-pointer"
    >
      <td className="p-4 font-mono text-xs font-bold text-[#C5A059]">#{order.orderNumber}</td>
      <td className="p-4 text-sm text-stone-700 font-medium">
        <Phone size={12} className="inline mr-1 opacity-40"/> {order.user?.phone || "N/A"}
      </td>
      <td className="p-4 text-xs text-stone-500 max-w-[200px] truncate">
        {order.items?.map(i => `${i.name || i.nameSnapshot} (x${i.quantity})`).join(", ")}
      </td>
      <td className="p-4">
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-tighter ${getStatusStyle(order.status)}`}>
          {order.status?.replace("_", " ")}
        </span>
      </td>
      <td className="p-4 text-center">
        <MapPin size={16} className={typeof order?.address?.lat === "number" ? "text-emerald-500 mx-auto" : "text-stone-200 mx-auto"} />
      </td>
      <td className="p-4">
        {order.rider ? (
          <div className="flex items-center gap-2 text-emerald-600 text-[11px] font-bold"><Truck size={14} /> {order.rider.name}</div>
        ) : (
          <select 
            onChange={(e) => assignRider(order._id, e.target.value)} 
            className="text-[11px] border-stone-200 rounded-lg bg-stone-50 py-1 px-2 focus:ring-2 focus:ring-[#C5A059] outline-none transition-shadow"
          >
            <option value="">Assign Rider</option>
            {riders.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        )}
      </td>
      <td className="p-4">
        <div className="flex items-center gap-2 justify-end">
          <select 
            value={order.status} 
            onChange={(e) => updateStatus(order._id, e.target.value)} 
            className="text-[11px] font-bold border-stone-200 rounded-lg py-1 px-2 shadow-sm focus:ring-2 focus:ring-[#C5A059] outline-none transition-shadow"
          >
            {["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
          </select>
          <button 
            onClick={() => confirmCancelOrder(order._id)} 
            className="text-stone-300 hover:text-rose-500 transition-colors p-1"
            aria-label="Cancel Order"
          >
            <XCircle size={18} />
          </button>
        </div>
      </td>
    </motion.tr>
  );

  const OrderCard = ({ order }) => (
    <motion.div 
      layout
      className="lg:hidden bg-white rounded-2xl border border-stone-200 p-4 mb-4 shadow-sm"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className="font-mono text-xs font-bold text-[#C5A059]">#{order.orderNumber}</span>
          <div className="text-sm font-bold text-stone-800 flex items-center mt-1">
            <Phone size={12} className="mr-1 opacity-40"/> {order.user?.phone || "N/A"}
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getStatusStyle(order.status)}`}>
          {order.status?.replace("_", " ")}
        </span>
      </div>
      
      <p className="text-xs text-stone-500 mb-4 line-clamp-2">
        {order.items?.map(i => `${i.name || i.nameSnapshot} (x${i.quantity})`).join(", ")}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-stone-50 p-2 rounded-xl">
          <p className="text-[9px] font-bold text-stone-400 uppercase mb-1">Logistics</p>
          {order.rider ? (
            <div className="flex items-center gap-1.5 text-emerald-600 text-[11px] font-bold truncate"><Truck size={12} /> {order.rider.name}</div>
          ) : (
            <select 
              onChange={(e) => assignRider(order._id, e.target.value)} 
              className="w-full text-[10px] bg-transparent outline-none font-bold text-[#C5A059]"
            >
              <option value="">Rider</option>
              {riders.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
            </select>
          )}
        </div>
        <button 
          onClick={() => setSelectedOrder(order)}
          className="bg-stone-50 p-2 rounded-xl flex items-center justify-between group"
        >
          <div>
            <p className="text-[9px] font-bold text-stone-400 uppercase">Location</p>
            <p className="text-[11px] font-bold text-stone-700">Track Map</p>
          </div>
          <ChevronRight size={14} className="text-stone-300 group-hover:text-[#C5A059]" />
        </button>
      </div>

      <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
        <select 
          value={order.status} 
          onChange={(e) => updateStatus(order._id, e.target.value)} 
          className="flex-1 text-[11px] font-bold border-stone-200 rounded-lg py-2 px-3 bg-stone-50 outline-none"
        >
          {["pending", "confirmed", "preparing", "ready", "out_for_delivery", "delivered"].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>
        <button 
          onClick={() => confirmCancelOrder(order._id)}
          className="p-2 text-rose-500 bg-rose-50 rounded-lg active:bg-rose-100 transition-colors"
        >
          <XCircle size={20} />
        </button>
      </div>
    </motion.div>
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#FAF9F6]">
      <Loader2 className="w-10 h-10 animate-spin text-[#C5A059] mb-4" />
      <p className="text-stone-500 font-medium animate-pulse font-serif italic">Syncing Kitchen Dashboard...</p>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen bg-[#FAF9F6] p-4 sm:p-6 lg:p-10"
    >
      <Toaster 
        position="top-right"
        toastOptions={{ 
          style: { borderRadius: '16px', border: '1px solid #E7E5E4', fontFamily: 'serif', padding: '16px', background: '#FFFFFF' } 
        }} 
      />

      <header className="max-w-[1600px] mx-auto mb-10 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-stone-900 tracking-tight">Kitchen Orders</h1>
          <p className="text-stone-500 text-sm sm:text-base mt-2 italic flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Culinary Logistics Pipeline
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full xl:w-auto">
          {[
            { label: 'Total', value: stats.total, icon: <Package size={18}/>, color: 'text-stone-400', bg: 'bg-stone-50' },
            { label: 'Delivered', value: stats.delivered, icon: <CheckCircle2 size={18}/>, color: 'text-emerald-500', bg: 'bg-emerald-50' },
            { label: 'Active', value: stats.pending, icon: <Clock size={18}/>, color: 'text-[#C5A059]', bg: 'bg-[#C5A059]/10' }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:-translate-y-1">
              <div className={`p-2.5 ${stat.bg} rounded-xl ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{stat.label}</p>
                <p className={`text-xl font-bold leading-none mt-1 ${idx === 0 ? 'text-stone-800' : stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto space-y-12">
        {Object.entries({
          "Today": groupedOrders.today,
          "Yesterday": groupedOrders.yesterday,
          ...groupedOrders.older
        }).map(([label, list]) => {
          if (!list || (Array.isArray(list) && list.length === 0)) return null;
          return (
            <section key={label} className="relative">
              <div className="flex items-center gap-4 mb-8 sticky top-0 bg-[#FAF9F6]/80 backdrop-blur-md py-2 z-10">
                <h2 className="text-xs sm:text-sm font-black text-stone-800 uppercase tracking-[0.25em] flex items-center gap-3">
                  {label === "Today" && <span className="w-2.5 h-2.5 rounded-full bg-[#C5A059] animate-ping shrink-0" />}
                  {label}
                </h2>
                <div className="h-px flex-1 bg-stone-200" />
                <span className="text-[10px] font-black bg-white border border-stone-200 px-3 py-1.5 rounded-full text-stone-500 shadow-sm">
                  {list.length} ORDERS
                </span>
              </div>

              <div className="lg:bg-white lg:rounded-[2rem] lg:border lg:border-stone-200 lg:shadow-xl lg:overflow-hidden">
                <table className="hidden lg:table w-full text-left">
                  <thead className="bg-stone-50/50 border-b border-stone-100">
                    <tr>
                      {["Order", "Customer", "Items", "Status", "Map", "Rider", "Actions"].map((h) => (
                        <th key={h} className="px-6 py-4 text-[10px] font-bold text-stone-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    <AnimatePresence mode="popLayout">
                      {list.map((order) => <OrderRow key={order._id} order={order} />)}
                    </AnimatePresence>
                  </tbody>
                </table>

                <div className="lg:hidden">
                  <AnimatePresence mode="popLayout">
                    {list.map((order) => <OrderCard key={order._id} order={order} />)}
                  </AnimatePresence>
                </div>
              </div>
            </section>
          );
        })}

        {orders.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-stone-200"
          >
            <div className="bg-stone-50 p-8 rounded-full mb-6">
              <Package size={48} className="text-stone-200" />
            </div>
            <h3 className="text-2xl font-serif text-stone-800 mb-2">Kitchen is Quiet</h3>
            <p className="text-stone-400 italic">Awaiting new incoming orders...</p>
          </motion.div>
        )}
      </main>

      {selectedOrder && (
        <OrderTrackingModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)} 
        />
      )}
    </motion.div>
  );
}