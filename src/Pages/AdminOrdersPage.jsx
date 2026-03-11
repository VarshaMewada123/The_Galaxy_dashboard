import { useEffect, useState, useMemo } from "react";
import axiosClient from "../api/axiosClient";
import { motion } from "framer-motion";
import { Loader2, Package, Phone, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

function groupOrdersByDate(orders) {
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const groups = {
    today: [],
    yesterday: [],
    older: {},
  };

  orders.forEach((order) => {
    const date = new Date(order.createdAt);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) {
      groups.today.push(order);
    } else if (isYesterday) {
      groups.yesterday.push(order);
    } else {
      const key = date.toLocaleDateString();
      if (!groups.older[key]) groups.older[key] = [];
      groups.older[key].push(order);
    }
  });

  return groups;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const THEME_TAN = "#C6A45C";
  const THEME_OFF_WHITE = "#FAF9F6";

  const fetchOrders = async () => {
    try {
      const res = await axiosClient.get("/admin/dining/orders");
      setOrders(res.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const groupedOrders = useMemo(() => {
    return groupOrdersByDate(orders);
  }, [orders]);

  const totalOrders = orders.length;
  const todayCount = groupedOrders.today.length;
  const yesterdayCount = groupedOrders.yesterday.length;

  const updateStatus = async (id, status) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await axiosClient.patch(`/admin/dining/orders/${id}/status`, { status });
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o)),
      );
      toast.success(`Order marked as ${status.replace("_", " ")}`, {
        id: loadingToast,
      });
    } catch (error) {
      toast.error("Status update failed", { id: loadingToast });
    }
  };

  const cancelOrder = async (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-stone-900">
            Cancel this order?
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loadingToast = toast.loading("Cancelling order...");
                try {
                  await axiosClient.patch(`/admin/dining/orders/${id}/cancel`);
                  setOrders((prev) =>
                    prev.map((o) =>
                      o._id === id ? { ...o, status: "cancelled" } : o,
                    ),
                  );
                  toast.success("Order cancelled", { id: loadingToast });
                } catch (error) {
                  toast.error("Cancel failed", { id: loadingToast });
                }
              }}
              className="bg-rose-500 text-white px-3 py-1 rounded text-xs font-bold"
            >
              Yes, Cancel
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-stone-100 text-stone-600 px-3 py-1 rounded text-xs font-bold"
            >
              No
            </button>
          </div>
        </div>
      ),
      { duration: 5000 },
    );
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === "delivered" || s === "confirmed")
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    if (s === "cancelled") return "bg-rose-50 text-rose-700 border-rose-100";
    if (s === "preparing" || s === "out_for_delivery")
      return "bg-[#C6A45C]/10 text-[#C6A45C] border-[#C6A45C]/20";
    return "bg-stone-100 text-stone-600 border-stone-200";
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#FAF9F6]">
        <Loader2 className="w-10 h-10 animate-spin text-[#C6A45C] mb-2" />
        <p className="text-stone-500 font-medium text-sm sm:text-base">
          Loading live orders...
        </p>
      </div>
    );
  }

  const renderOrders = (ordersList) =>
    ordersList.map((order) => (
      <tr
        key={order._id}
        className="hover:bg-[#C6A45C]/5 transition-colors group cursor-default"
      >
        <td className="p-3 sm:p-4 font-mono text-xs font-bold text-[#C6A45C] whitespace-nowrap">
          #{order.orderNumber || "N/A"}
        </td>
        <td className="p-3 sm:p-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-stone-700 font-medium">
            <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">
              {order.user?.phone || order.address?.phone || "Guest"}
            </span>
          </div>
        </td>
        <td className="p-3 sm:p-4 max-w-[180px] sm:max-w-[260px]">
          <div className="text-xs text-stone-600 truncate group-hover:whitespace-normal group-hover:overflow-visible transition-all">
            {order.items
              ?.map((i) => `${i.name || i.nameSnapshot} (x${i.quantity})`)
              .join(", ")}
          </div>
        </td>
        <td className="p-3 sm:p-4 text-center font-bold text-stone-900 font-serif text-sm sm:text-base whitespace-nowrap">
          ₹{(order?.pricing?.total || order?.grandTotal || 0).toLocaleString()}
        </td>
        <td className="p-3 sm:p-4 text-center">
          <span
            className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold border uppercase tracking-tighter ${getStatusColor(order.status || "pending")}`}
          >
            {(order.status || "pending").replace("_", " ")}
          </span>
        </td>
        <td className="p-3 sm:p-4 text-right">
          <div className="flex items-center justify-end gap-2 sm:gap-3 flex-wrap">
            <select
              value={order.status || "pending"}
              onChange={(e) => updateStatus(order._id, e.target.value)}
              className="text-xs border-stone-200 rounded-md focus:ring-[#C6A45C] focus:border-[#C6A45C] bg-white shadow-sm py-1 pl-2 pr-6 cursor-pointer hover:border-[#C6A45C] transition-colors"
            >
              {[
                "pending",
                "confirmed",
                "preparing",
                "out_for_delivery",
                "delivered",
              ].map((opt) => (
                <option key={opt} value={opt}>
                  {opt.replace("_", " ")}
                </option>
              ))}
            </select>
            <button
              onClick={() => cancelOrder(order._id)}
              className="text-stone-300 hover:text-rose-500 transition-colors cursor-pointer p-1"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </td>
      </tr>
    ));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full min-h-screen bg-[#FFFFFF] px-4 sm:px-6 lg:px-8 py-6"
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#FFFFFF",
            color: "#1C1917",
            border: "1px solid #E7E5E4",
            fontSize: "14px",
            fontFamily: "serif",
          },
          success: {
            iconTheme: {
              primary: "#C6A45C",
              secondary: "#FFFFFF",
            },
          },
        }}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center justify-between mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-stone-900">
            Order Management
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm italic">
            Manage and track live dining requests
          </p>
        </div>
        <div className="bg-white px-4 sm:px-5 py-2 rounded-full shadow-sm border border-stone-200 flex items-center gap-3 w-fit">
          <span className="text-xs sm:text-sm font-medium text-stone-400 uppercase tracking-widest">
            Total
          </span>
          <span className="bg-[#C6A45C] text-white text-xs sm:text-sm font-bold px-3 py-1 rounded-full">
            {totalOrders} {totalOrders === 1 ? "Order" : "Orders"}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white/50 border-2 border-dashed border-stone-200 rounded-2xl p-10 sm:p-12 text-center">
          <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 text-sm sm:text-base">
            No active orders found.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {todayCount > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Today ({todayCount})
              </h2>
              <div className="w-full overflow-x-auto bg-white rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Order ID
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Customer
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Items
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                        Total
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {renderOrders(groupedOrders.today)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {yesterdayCount > 0 && (
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Yesterday ({yesterdayCount})
              </h2>
              <div className="w-full overflow-x-auto bg-white rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Order ID
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Customer
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Items
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                        Total
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {renderOrders(groupedOrders.yesterday)}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {Object.entries(groupedOrders.older).map(([date, list]) => (
            <div key={date}>
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                {date} ({list.length})
              </h2>
              <div className="w-full overflow-x-auto bg-white rounded-xl border border-stone-200 shadow-sm">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead className="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Order ID
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Customer
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest">
                        Items
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                        Total
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold text-stone-500 uppercase tracking-widest text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {renderOrders(list)}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
