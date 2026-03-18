/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "@/api/axiosClient";
import toast from "react-hot-toast";
import { Edit2, Trash2, X, Calendar } from "lucide-react";

export default function OfferManagement() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    discountValue: "",
    discountType: "PERCENTAGE",
  });

  const [isEditing, setIsEditing] = useState(false);

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/admin/dining/offers");
      setOffers(res.data.data || []);
    } catch {
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
    } catch {
      toast.error("Error fetching offer");
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
      toast.success("Offer updated");
      setIsEditing(false);
      navigate("/admin/dining/offers");
      fetchOffers();
    } catch {
      toast.error("Update failed");
    }
  };

  const deleteOffer = async (offerId) => {
    try {
      await axiosClient.delete(`/admin/dining/offers/${offerId}`);
      toast.success("Offer deleted");
      fetchOffers();
    } catch {
      toast.error("Delete failed");
    }
  };

  const closeEditor = () => {
    setIsEditing(false);
    setFormData({
      name: "",
      discountValue: "",
      discountType: "PERCENTAGE",
    });
    navigate("/admin/dining/offers");
  };

  return (
    <div className="min-h-screen bg-[#F9F9F7] p-6 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">
            Promotions <span className="text-[#C5A059]">&</span> Offers
          </h1>
          <p className="text-gray-500 mt-1">Manage your store discounts</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className={`${isEditing ? "lg:col-span-7" : "lg:col-span-12"}`}>
            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-[#C5A059] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                No offers created yet
              </div>
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                <AnimatePresence>
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
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="lg:col-span-5"
              >
                <div className="bg-white rounded-2xl shadow-xl border">
                  <div className="bg-[#C5A059] p-4 flex justify-between text-white">
                    <h2 className="font-semibold">Edit Offer</h2>
                    <button onClick={closeEditor}>
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={updateOffer} className="p-6 space-y-4">
                    <input
                      name="name"
                      value={formData.name || ""}
                      onChange={handleChange}
                      placeholder="Offer Name"
                      className="w-full border p-3 rounded-lg"
                      required
                    />

                    <input
                      name="discountValue"
                      type="number"
                      value={formData.discountValue || ""}
                      onChange={handleChange}
                      placeholder="Discount"
                      className="w-full border p-3 rounded-lg"
                      required
                    />

                    <button className="w-full bg-[#C5A059] text-white p-3 rounded-lg hover:bg-[#b08d4b]">
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
  const items = offer.items || [];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden"
    >
      <div className="relative h-40 overflow-hidden">
        <img
          src={offer.image?.url}
          alt={offer.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-2 left-3 text-white font-bold text-lg bg-black/50 px-2 py-1 rounded">
          {offer.name}
        </div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {items.map((item) => (
            <div
              key={item._id}
              className="border rounded-lg overflow-hidden bg-gray-50 relative"
            >
              {item.discountLabel && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  {item.discountLabel}
                </div>
              )}

              <div className="h-24 overflow-hidden">
                <img
                  src={item.images?.[0]?.url}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2">
                <div className="text-sm font-semibold">{item.name}</div>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-gray-400 line-through text-xs">
                    ₹{item.originalPrice}
                  </span>

                  <span className="font-bold text-sm">₹{item.finalPrice}</span>
                </div>

                {item.savings > 0 && (
                  <div className="text-green-600 text-xs">
                    Save ₹{item.savings}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Calendar size={12} />
            {offer.startDate?.slice(0, 10)}
          </span>

          <span>{offer.endDate?.slice(0, 10)}</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(offer._id)}
            className="flex-1 text-blue-600 border rounded-lg py-2 flex justify-center hover:bg-blue-50"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={() => onDelete(offer._id)}
            className="flex-1 text-red-600 border rounded-lg py-2 flex justify-center hover:bg-red-50"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
