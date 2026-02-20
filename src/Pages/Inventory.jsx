import { Package } from "lucide-react";

const INVENTORY = [
  { item: "Rice", quantity: "25 Kg", status: "In Stock" },
  { item: "Paneer", quantity: "5 Kg", status: "Low Stock" },
  { item: "Tomato", quantity: "12 Kg", status: "In Stock" },
];

const badge = {
  "In Stock": "bg-green-100 text-green-700",
  "Low Stock": "bg-yellow-100 text-yellow-700",
};

export default function Inventory() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <Package /> Inventory
      </h1>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-gray-600">
            <tr>
              <th className="p-4 text-left">Item</th>
              <th className="p-4 text-left">Quantity</th>
              <th className="p-4 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {INVENTORY.map((item, i) => (
              <tr key={i} className="border-t">
                <td className="p-4">{item.item}</td>
                <td className="p-4">{item.quantity}</td>
                <td className="p-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${badge[item.status]}`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
