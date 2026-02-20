import { useState, useEffect } from "react";
import {
  Percent,
  Tag,
  Calendar,
  Users,
  Award,
  Edit3,
  Trash2,
  Eye,
  Plus,
  Search,
} from "lucide-react";

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const staticOffers = [
    {
      id: 1,
      title: "Royal Summer Staycation",
      discount: 25,
      originalPrice: 8000,
      type: "room",
      status: "active",
      validFrom: "Mar 01",
      validTo: "May 31",
      description:
        "Experience luxury with 25% OFF on all room bookings for 2+ nights including breakfast.",
      bookings: 124,
      revenue: 245000,
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&fit=crop",
    },
    {
      id: 2,
      title: "Honeymoon Special Suite",
      discount: 35,
      originalPrice: 12000,
      type: "suite",
      status: "active",
      validFrom: "Feb 01",
      validTo: "Apr 30",
      description:
        "Celebrate love with 35% OFF on Premium Suites and a complimentary candle-lit dinner.",
      bookings: 89,
      revenue: 356000,
      image:
        "https://images.unsplash.com/photo-1578683015141-39940e9653ec?w=400&fit=crop",
    },
    {
      id: 3,
      title: "Imperial Breakfast Combo",
      discount: 15,
      originalPrice: 3500,
      type: "dining",
      status: "active",
      validFrom: "Feb 11",
      validTo: "Dec 31",
      description:
        "Relish our grand buffet with a 15% discount for our in-house premium guests.",
      bookings: 342,
      revenue: 178000,
      image:
        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&fit=crop",
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setOffers(staticOffers);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterStatus === "all" ||
      offer.status === filterStatus ||
      offer.type === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C6A45C]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-serif tracking-wide text-gray-900">
            Special <span className="text-[#C6A45C]">Promotions</span>
          </h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-[2px] mt-1 font-medium">
            Manage Exclusive Deals & Seasonal Offers
          </p>
        </div>
        <button className="flex items-center justify-center gap-2 bg-black text-white px-6 py-3 rounded-sm hover:bg-[#C6A45C] transition-all duration-300 shadow-lg uppercase text-[12px] tracking-widest font-medium">
          <Plus size={18} /> Create New Offer
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 rounded-sm border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search offers..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] rounded-sm transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {["all", "active", "room", "dining"].map((f) => (
            <button
              key={f}
              onClick={() => setFilterStatus(f)}
              className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold rounded-sm border transition-all ${
                filterStatus === f
                  ? "bg-[#C6A45C] border-[#C6A45C] text-white"
                  : "border-gray-100 text-gray-400 hover:border-[#C6A45C] hover:text-[#C6A45C]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className="group bg-white border border-gray-100 rounded-sm overflow-hidden hover:shadow-xl transition-all duration-500"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={offer.image}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                alt={offer.title}
              />
              <div className="absolute top-0 left-0 w-full h-full bg-black/20 group-hover:bg-black/40 transition-all" />

              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-[2px] text-gray-900 border-l-2 border-[#C6A45C]">
                {offer.type}
              </div>

              <div className="absolute bottom-4 right-4 bg-[#C6A45C] text-white w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white/20">
                <span className="text-xs font-bold leading-none">
                  {offer.discount}%
                </span>
                <span className="text-[8px] uppercase font-black">OFF</span>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="font-serif text-xl text-gray-900 leading-tight group-hover:text-[#C6A45C] transition-colors">
                  {offer.title}
                </h3>
                <span
                  className={`text-[9px] uppercase font-bold tracking-tighter px-2 py-1 rounded-sm ${
                    offer.status === "active"
                      ? "bg-green-50 text-green-600"
                      : "bg-gray-50 text-gray-400"
                  }`}
                >
                  {offer.status}
                </span>
              </div>

              <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 italic">
                "{offer.description}"
              </p>

              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} className="text-[#C6A45C]" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {offer.validFrom} - {offer.validTo}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Users size={14} className="text-[#C6A45C]" />
                  <span className="text-[10px] uppercase tracking-wider font-semibold">
                    {offer.bookings} Booked
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest line-through">
                    ₹{offer.originalPrice}
                  </p>
                  <p className="text-2xl font-serif text-gray-900">
                    ₹
                    {(
                      offer.originalPrice *
                      (1 - offer.discount / 100)
                    ).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2.5 text-gray-400 hover:text-[#C6A45C] hover:bg-gray-50 transition-all rounded-sm">
                    <Edit3 size={18} />
                  </button>
                  <button className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-gray-50 transition-all rounded-sm">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOffers.length === 0 && (
        <div className="text-center py-24 border border-dashed border-gray-100 rounded-sm">
          <Tag className="mx-auto text-gray-100 mb-4" size={64} />
          <h3 className="font-serif text-2xl text-gray-800 uppercase tracking-widest">
            No Offers Available
          </h3>
          <p className="text-gray-400 text-sm mt-2 font-medium tracking-widest">
            PERHAPS IT'S TIME TO CREATE A NEW CAMPAIGN
          </p>
        </div>
      )}
    </div>
  );
};

export default Offers;
