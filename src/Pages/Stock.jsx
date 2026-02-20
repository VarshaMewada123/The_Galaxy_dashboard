import { Boxes, Plus, Minus } from "lucide-react";
import { useState } from "react";

const INITIAL_STOCK = [
  { name: "Cooking Oil", qty: 10 },
  { name: "Cheese", qty: 6 },
  { name: "Flour", qty: 20 },
];

export default function Stock() {
  const [stock, setStock] = useState(INITIAL_STOCK);

  const updateQty = (index, change) => {
    const updated = [...stock];
    updated[index].qty += change;
    if (updated[index].qty < 0) updated[index].qty = 0;
    setStock(updated);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 flex gap-2 items-center">
        <Boxes /> Stock Management
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stock.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-sm border p-5"
          >
            <h3 className="font-medium mb-4">{item.name}</h3>

            <div className="flex items-center justify-between">
              <button
                onClick={() => updateQty(index, -1)}
                className="p-2 bg-red-50 rounded-lg hover:bg-red-100"
              >
                <Minus size={18} />
              </button>

              <span className="text-lg font-semibold">{item.qty}</span>

              <button
                onClick={() => updateQty(index, 1)}
                className="p-2 bg-green-50 rounded-lg hover:bg-green-100"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
