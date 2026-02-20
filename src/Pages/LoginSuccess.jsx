import { useState } from "react";
import {
  Clock,
  CheckCircle,
  ChefHat,
  Truck,
  UtensilsCrossed,
} from "lucide-react";

const STATIC_ORDERS = [
  {
    id: "#ORD-101",
    table: "Table 3",
    items: ["Paneer Butter Masala", "Butter Naan"],
    status: "Preparing",
    time: "5 min ago",
  },
  {
    id: "#ORD-102",
    table: "Table 7",
    items: ["Veg Biryani"],
    status: "Ready",
    time: "2 min ago",
  },
  {
    id: "#ORD-103",
    table: "Online",
    items: ["Pizza", "Cold Coffee"],
    status: "Delivered",
    time: "15 min ago",
  },
];

const statusColor = {
  Preparing: "bg-yellow-100 text-yellow-700",
  Ready: "bg-blue-100 text-blue-700",
  Delivered: "bg-green-100 text-green-700",
};

export default function LiveOrders() {
  const [orders] = useState(STATIC_ORDERS);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <UtensilsCrossed /> Live Orders
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-2xl shadow-sm p-5 border"
          >
            <div className="flex justify-between mb-3">
              <h2 className="font-semibold">{order.id}</h2>

              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[order.status]}`}
              >
                {order.status}
              </span>
            </div>

            <p className="text-sm text-gray-500 mb-2">{order.table}</p>

            <ul className="text-sm mb-4 space-y-1">
              {order.items.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>

            <div className="flex items-center text-xs text-gray-400 gap-2">
              <Clock size={14} />
              {order.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
