import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "@/api/axiosClient";
import toast from "react-hot-toast";
import { Edit2, Trash2, X, Tag, Calendar, Percent } from "lucide-react";

export default function OfferManagement() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: "", discountValue: "", discountType: "PERCENTAGE" });
  const [isEditing, setIsEditing] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/admin/dining/offers");
      setOffers(res.data.data);
    } catch (error) {
      toast.error("Failed to load offers");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSingleOffer = useCallback(async (offerId) => {
    try {
      const res = await axiosClient.get(`/admin/dining/offers/${offerId}`);
      setFormData(res.data.data);
      setIsEditing(true);
    } catch (error) {
      toast.error("Error fetching offer details");
    }
  }, []);

  useEffect(() => {
    fetchOffers();
    if (id) fetchSingleOffer(id);
  }, [id, fetchOffers, fetchSingleOffer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateOffer = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.put(`/admin/dining/offers/${id}`, formData);
      toast.success("Offer Updated Successfully");
      setIsEditing(false);
      navigate("/offers");
      fetchOffers();
    } catch (error) {
      toast.error("Update failed");
    }
  };

  const deleteOffer = async (offerId) => {
    try {
      await axiosClient.delete(`/admin/dining/offers/${offerId}`);
      toast.success("Offer Deleted");
      fetchOffers();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
              Promotions <span className="text-[#C5A059]">&</span> Offers
            </h1>
            <p className="text-gray-500 mt-1">Manage your store discounts and seasonal campaigns.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className={`${isEditing ? "lg:col-span-7" : "lg:col-span-12"} transition-all duration-500`}>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {offers.map((offer) => (
                    <OfferCard 
                      key={offer._id} 
                      offer={offer} 
                      onEdit={(id) => navigate(`/admin/dining/offers/${id}`)} 
                      onDelete={deleteOffer} 
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </main>

          <AnimatePresence>
            {isEditing && (
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-5"
              >
                <div className="sticky top-8 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                  <div className="bg-[#C5A059] p-4 flex justify-between items-center text-white">
                    <h2 className="font-semibold text-lg">Edit Offer Details</h2>
                    <button onClick={() => { setIsEditing(false); navigate("/offers"); }} className="hover:rotate-90 transition-transform">
                      <X size={20} />
                    </button>
                  </div>
                  <form onSubmit={updateOffer} className="p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Offer Name</label>
                      <input
                        name="name"
                        value={formData.name || ""}
                        onChange={handleChange}
                        className="w-full bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#C5A059] rounded-lg p-3 transition-all outline-none"
                        placeholder="e.g. Summer Sale"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Discount Value</label>
                      <div className="relative">
                        <input
                          name="discountValue"
                          type="number"
                          value={formData.discountValue || ""}
                          onChange={handleChange}
                          className="w-full bg-gray-50 border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-[#C5A059] rounded-lg p-3 pl-10 transition-all outline-none"
                          required
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                          {formData.discountType === "PERCENTAGE" ? <Percent size={16} /> : <span className="text-sm font-bold">₹</span>}
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-[#C5A059] hover:bg-[#b08d4b] text-white font-bold py-4 rounded-lg shadow-lg shadow-tan/20 transition-all active:scale-[0.98]">
                      Save Changes
                    </button>
                  </form>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function OfferCard({ offer, onEdit, onDelete }) {
  const isDiscounted = offer.finalPrice < offer.basePrice;
  const discountPercentage = isDiscounted 
    ? Math.round(((offer.basePrice - offer.finalPrice) / offer.basePrice) * 100) 
    : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="group bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
    >
      {isDiscounted && (
        <div className="absolute top-0 left-0 bg-red-500 text-white text-[10px] font-black px-3 py-1 rounded-br-lg z-10 uppercase tracking-widest">
          {discountPercentage}% Off
        </div>
      )}

      <div className="aspect-square w-full mb-4 overflow-hidden rounded-xl bg-gray-50">
        <img 
          src={offer.image || "https://via.placeholder.com/300"} 
          alt={offer.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 line-clamp-1">{offer.name}</h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(offer._id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <Edit2 size={16} />
            </button>
            <button onClick={() => onDelete(offer._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isDiscounted ? (
            <>
              <span className="text-xl font-black text-gray-900">₹{offer.finalPrice}</span>
              <span className="text-sm text-gray-400 line-through">₹{offer.basePrice}</span>
            </>
          ) : (
            <span className="text-xl font-black text-gray-900">₹{offer.basePrice}</span>
          )}
        </div>

        <div className="pt-3 border-t border-gray-50 flex items-center justify-between text-[11px] font-medium text-gray-400 uppercase tracking-tighter">
          <div className="flex items-center gap-1">
            <Calendar size={12} className="text-[#C5A059]" />
            <span>{offer.startDate?.slice(0, 10) || "N/A"}</span>
          </div>
          <span>to</span>
          <div className="flex items-center gap-1">
            <span>{offer.endDate?.slice(0, 10) || "N/A"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}