import { ChefHat, CheckCircle, XCircle } from "lucide-react";

const STAFF = [
  { name: "Ramesh", role: "Head Chef", status: "Active" },
  { name: "Amit", role: "Assistant Chef", status: "Active" },
  { name: "Suresh", role: "Helper", status: "Offline" },
];

export default function KitchenStaff() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6 flex gap-2 items-center">
        <ChefHat /> Kitchen Staff
      </h1>

      <div className="bg-white rounded-2xl shadow-sm border">
        {STAFF.map((staff, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-5 border-b last:border-0"
          >
            <div>
              <h3 className="font-medium">{staff.name}</h3>
              <p className="text-sm text-gray-500">{staff.role}</p>
            </div>

            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                staff.status === "Active" ? "text-green-600" : "text-red-500"
              }`}
            >
              {staff.status === "Active" ? (
                <CheckCircle size={18} />
              ) : (
                <XCircle size={18} />
              )}
              {staff.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
