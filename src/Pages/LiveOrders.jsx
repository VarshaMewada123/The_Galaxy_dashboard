import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
export default function LiveOrders() {
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 5000,
  });

  const update = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => qc.invalidateQueries(["orders"]),
  });

  return (
    <div className="p-6 grid md:grid-cols-3 gap-4">
      {data.map((order) => (
        <div key={order._id} className="bg-white p-4 shadow rounded">
          <h3>Order #{order.orderNumber}</h3>
          <p>Status: {order.status}</p>

          <button
            onClick={() => update.mutate({ id: order._id, status: "READY" })}
            className="bg-blue-500 text-white px-3 py-1 mt-3 rounded"
          >
            Mark Ready
          </button>
        </div>
      ))}
    </div>
  );
}
