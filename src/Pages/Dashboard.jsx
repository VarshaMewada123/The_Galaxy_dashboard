const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Dashboard
        </h1>
        <p className="text-gray-500">
          Welcome back, manage your hotel from here
        </p>
      </div>

      {/* STATS GRID (ready for real data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Total Rooms</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">24</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Active Bookings</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">12</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Today’s Check-ins</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">5</h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <p className="text-sm text-gray-500">Revenue (Today)</p>
          <h3 className="text-2xl font-bold text-gray-800 mt-1">₹18,500</h3>
        </div>
      </div>

      {/* PLACEHOLDER SECTIONS */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Bookings
        </h2>
        <p className="text-sm text-gray-500">
          Booking list will appear here.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;


