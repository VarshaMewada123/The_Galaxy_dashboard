import { useState, useEffect } from 'react';
import { Eye, Edit3, Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // ✅ STATIC DATA - No Backend Required
  const staticBookings = [
    { 
      id: 1,
      room: 'Deluxe Room',
      guest: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@email.com',
      checkin: '2026-02-12',
      checkout: '2026-02-15',
      amount: 15000,
      status: 'confirmed',
      days: 3
    },
    { 
      id: 2,
      room: 'Premium Suite',
      guest: 'Priya Patel',
      phone: '+91 98765 43211',
      email: 'priya@email.com',
      checkin: '2026-02-11',
      checkout: '2026-02-13',
      amount: 16000,
      status: 'checked-in',
      days: 2
    },
    { 
      id: 3,
      room: 'Family Room',
      guest: 'Amit Kumar',
      phone: '+91 98765 43212',
      email: 'amit@email.com',
      checkin: '2026-02-14',
      checkout: '2026-02-18',
      amount: 19500,
      status: 'pending',
      days: 4
    },
    { 
      id: 4,
      room: 'Executive Suite',
      guest: 'Neha Singh',
      phone: '+91 98765 43213',
      email: 'neha@email.com',
      checkin: '2026-02-10',
      checkout: '2026-02-12',
      amount: 24000,
      status: 'cancelled',
      days: 2
    }
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setBookings(staticBookings);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = bookings.filter(booking => 
    filterStatus === 'all' || booking.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'checked-in': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Guest Bookings
          </h1>
          <p className="text-gray-500 mt-1">Total: {bookings.length} bookings | Revenue: ₹{bookings.reduce((sum, b) => sum + b.amount, 0).toLocaleString()}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-wrap gap-3">
          {['all', 'confirmed', 'checked-in', 'pending', 'cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                filterStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${bookings.filter(b => b.status === status).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Room</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stay</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-all group">
                  <td className="px-6 py-6">
                    <div className="font-bold text-lg text-gray-900">{booking.guest}</div>
                    <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                      <div className="flex items-center"><Phone className="w-4 h-4 mr-1" />{booking.phone}</div>
                      <div className="flex items-center"><Mail className="w-4 h-4 mr-1" />{booking.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-6 font-semibold text-gray-900">{booking.room}</td>
                  <td className="px-6 py-6">
                    <div className="text-sm text-gray-900 mb-1">{booking.checkin} → {booking.checkout}</div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {booking.days} nights
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="text-2xl font-bold text-green-600">₹{booking.amount.toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-6">
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
                      {booking.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl hover:scale-105 transition-all shadow-sm">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-xl hover:scale-105 transition-all shadow-sm">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredBookings.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h3>
          <p className="text-gray-500 mb-6">Try adjusting your filters</p>
          <button 
            onClick={() => setFilterStatus('all')}
            className="bg-blue-600 text-white px-8 py-3 rounded-2xl hover:shadow-xl transition-all font-medium"
          >
            Show All Bookings
          </button>
        </div>
      )}
    </div>
  );
};

export default Bookings;
