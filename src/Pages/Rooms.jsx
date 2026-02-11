import { useState, useEffect } from 'react';
import { Eye, Edit3, Trash2, BedDouble, Plus } from 'lucide-react';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const staticRooms = [
    { 
      id: 1, 
      name: 'Deluxe Room', 
      price: 5000, 
      status: 'available',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&fit=crop',
      capacity: '2 Adults',
      facilities: ['AC', 'WiFi', 'TV']
    },
    { 
      id: 2, 
      name: 'Premium Suite', 
      price: 8000, 
      status: 'booked',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&fit=crop',
      capacity: '2 Adults + 1 Child',
      facilities: ['WiFi', 'Jacuzzi', 'Breakfast']
    },
    { 
      id: 3, 
      name: 'Family Room', 
      price: 6500, 
      status: 'available',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&fit=crop',
      capacity: '4 Adults',
      facilities: ['AC', 'WiFi', 'TV']
    }
  ];

  useEffect(() => {
    setTimeout(() => {
      setRooms(staticRooms);
      setLoading(false);
    }, 800);
  }, []);

  const filteredRooms = rooms.filter(room => 
    filterStatus === 'all' || room.status === filterStatus
  );

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A45C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-serif tracking-wide text-gray-900">
            Manage <span className="text-[#C6A45C]">Rooms</span>
          </h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-[2px] mt-1 font-medium">
            Luxury Stay Inventory Management
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-sm hover:bg-[#C6A45C] transition-all duration-300 shadow-lg shadow-gray-200 uppercase text-[12px] tracking-widest font-medium">
          <Plus size={18} /> Add New Room
        </button>
      </div>

      {/* Filter Tabs - Clean & Minimal */}
      <div className="flex flex-wrap gap-8 border-b border-gray-50 pb-2">
        {['all', 'available', 'booked', 'maintenance'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`pb-4 text-[12px] uppercase tracking-[2px] font-semibold transition-all relative ${
              filterStatus === status
                ? 'text-[#C6A45C] after:content-[""] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-[#C6A45C]'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            {status} <span className="ml-1 opacity-50 text-[10px]">({status === 'all' ? rooms.length : rooms.filter(r => r.status === status).length})</span>
          </button>
        ))}
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-sm border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Room Info</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Price/Night</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Status</th>
                <th className="px-6 py-4 text-left text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Capacity</th>
                <th className="px-6 py-4 text-right text-[11px] font-bold text-gray-400 uppercase tracking-[2px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center space-x-4">
                      <div className="relative overflow-hidden rounded-sm w-16 h-16 border border-gray-100">
                        <img src={room.image} alt={room.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div>
                        <div className="font-serif text-lg text-gray-900">{room.name}</div>
                        <div className="flex gap-2 mt-1">
                          {room.facilities.map((f, i) => (
                            <span key={i} className="text-[10px] text-[#C6A45C] uppercase tracking-wider">· {f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-lg font-medium text-gray-800">
                      ₹{room.price.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                      room.status === 'available' ? 'text-green-600 bg-green-50' :
                      room.status === 'booked' ? 'text-red-600 bg-red-50' :
                      'text-amber-600 bg-amber-50'
                    }`}>
                      {room.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[12px] text-gray-600 uppercase tracking-wider">{room.capacity}</td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end space-x-3">
                      <button title="View" className="p-2 text-gray-400 hover:text-[#C6A45C] transition-colors">
                        <Eye size={18} />
                      </button>
                      <button title="Edit" className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit3 size={18} />
                      </button>
                      <button title="Delete" className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredRooms.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-sm">
          <BedDouble className="mx-auto text-gray-200 mb-4" size={48} />
          <h3 className="font-serif text-xl text-gray-800">No rooms found</h3>
          <p className="text-gray-400 text-sm mt-2 uppercase tracking-widest">Adjust your selection criteria</p>
        </div>
      )}
    </div>
  );
};

export default Rooms;