const orders = [
  { id: "#1023", table: "T5", items: 3, status: "Preparing" },
  { id: "#1024", table: "T2", items: 1, status: "New" },
];

export default function LiveOrders() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Live Orders</h1>

      <div className="grid md:grid-cols-3 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-5 rounded shadow">
            <h2 className="font-semibold">{order.id}</h2>
            <p>Table: {order.table}</p>
            <p>Items: {order.items}</p>

            <span className="text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              {order.status}
            </span>

            <div className="mt-4 flex gap-2">
              <button className="bg-green-500 text-white px-3 py-1 rounded">
                Accept
              </button>
              <button className="bg-blue-500 text-white px-3 py-1 rounded">
                Ready
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
