const staff = [
  { name: "Chef Aman", role: "Head Chef", shift: "10AM - 6PM", active: true },
  { name: "Ravi", role: "Helper", shift: "2PM - 10PM", active: false },
];

export default function KitchenStaff() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Kitchen Staff</h1>

      {staff.map((s, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded shadow mb-3 flex justify-between"
        >
          <div>
            <h3 className="font-medium">{s.name}</h3>
            <p className="text-sm text-gray-500">{s.role}</p>
          </div>

          <div>
            <p>{s.shift}</p>
            <span
              className={`text-xs ${
                s.active ? "text-green-600" : "text-red-600"
              }`}
            >
              {s.active ? "On Duty" : "Off Duty"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
