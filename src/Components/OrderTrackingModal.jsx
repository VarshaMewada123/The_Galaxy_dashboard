import { useEffect, useState, useMemo } from "react";
import { socket } from "../socket/socket";
import LiveTrackingMap from "./LiveTrackingMap";
import { motion, AnimatePresence } from "framer-motion";

// ✅ validate function
const isValidCoord = (loc) => {
  return (
    loc &&
    typeof loc.lat === "number" &&
    typeof loc.lng === "number" &&
    !isNaN(loc.lat) &&
    !isNaN(loc.lng)
  );
};

export default function OrderTrackingModal({ order, onClose }) {
  const [riderTarget, setRiderTarget] = useState(null);

  // 🔥 FIXED: use correct field + fallback + number conversion
  const customer = useMemo(() => {
    const lat = Number(order?.address?.lat);
    const lng = Number(order?.address?.lng);

    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }

    return null;
  }, [order]);

  // ✅ SOCKET LISTENER
  useEffect(() => {
    if (!order?._id) return;

    socket.emit("join_order_room", order._id);

    const handleLocationUpdate = (data) => {
      const lat = Number(data?.lat);
      const lng = Number(data?.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        setRiderTarget({ lat, lng });
      }
    };

    socket.on("location_update", handleLocationUpdate);

    return () => {
      socket.off("location_update", handleLocationUpdate);
    };
  }, [order?._id]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white w-full max-w-4xl rounded-2xl p-6 shadow-xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
        >
          {/* HEADER */}
          <div className="flex justify-between mb-4">
            <h2 className="font-bold text-lg">Live Order Tracking</h2>
            <button onClick={onClose}>✖</button>
          </div>

          {/* INFO */}
          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
            <div className="bg-stone-50 p-3 rounded-xl">
              <p><b>Customer:</b> {order.user?.name || "N/A"}</p>
              <p><b>Phone:</b> {order.user?.phone}</p>
              <p className="text-xs text-gray-500 mt-1">
                {order.address?.street}
              </p>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl">
              <p><b>Rider:</b> {order.rider?.name || "Not Assigned"}</p>
              <p><b>Phone:</b> {order.rider?.phone || "N/A"}</p>
            </div>
          </div>

          {/* 🔥 DEBUG (optional remove later) */}
          {/* <pre>{JSON.stringify(order.address, null, 2)}</pre> */}

          {/* ✅ MAP */}
          {isValidCoord(customer) ? (
            <LiveTrackingMap
              riderTarget={riderTarget}
              customer={customer}
            />
          ) : (
            <div className="text-center text-red-500 font-semibold py-10">
              Invalid customer location ❌
              <p className="text-xs text-gray-400 mt-2">
                (Old order or missing lat/lng)
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}