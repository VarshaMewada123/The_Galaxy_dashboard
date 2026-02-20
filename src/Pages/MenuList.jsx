import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenuItems,
  toggleAvailability,
  deleteMenuItem,
} from "@/api/services/dining.service";

export default function MenuList() {
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery({
    queryKey: ["menu"],
    queryFn: getMenuItems,
  });

  const toggle = useMutation({
    mutationFn: toggleAvailability,
    onSuccess: () => qc.invalidateQueries(["menu"]),
  });

  const remove = useMutation({
    mutationFn: deleteMenuItem,
    onSuccess: () => qc.invalidateQueries(["menu"]),
  });

  if (isLoading) return <p>Loading menu...</p>;

  return (
    <div className="p-6 grid gap-4">
      {data.map((item) => (
        <div
          key={item._id}
          className="bg-white p-4 rounded shadow flex justify-between"
        >
          <div>
            <h3>{item.name}</h3>
            <p>₹{item.price}</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => toggle.mutate(item._id)}
              className="bg-green-500 text-white px-3 py-1 rounded"
            >
              Toggle
            </button>

            <button
              onClick={() => remove.mutate(item._id)}
              className="bg-red-500 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
