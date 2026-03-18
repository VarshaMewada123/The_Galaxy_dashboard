import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  getRidersApi,
  createRiderApi,
  updateRiderApi,
} from "../api/services/rider.api";
import { isValidPhone } from "../utils/validators";

const Riders = () => {
  const [riders, setRiders] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchRiders = useCallback(async () => {
    try {
      const res = await getRidersApi();
      setRiders(res?.data || []);
    } catch (err) {
      toast.error("Failed to fetch riders list");
    }
  }, []);

  useEffect(() => {
    fetchRiders();
  }, [fetchRiders]);

  const resetForm = () => {
    setName("");
    setPhone("");
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!isValidPhone(phone)) {
      toast.error("Phone must be exactly 10 digits");
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading(
      editingId ? "Updating rider..." : "Adding rider...",
    );

    try {
      if (editingId) {
        await updateRiderApi(editingId, {
          name: name.trim(),
          phone,
        });
        toast.success("Rider updated successfully", { id: loadingToast });
      } else {
        await createRiderApi({
          name: name.trim(),
          phone,
        });
        toast.success("Rider added successfully", { id: loadingToast });
      }

      resetForm();
      fetchRiders();
    } catch (err) {
      toast.error("Operation failed. Try again.", { id: loadingToast });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (rider) => {
    setEditingId(rider._id);
    setName(rider.name);
    setPhone(String(rider.phone));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-800 p-4 sm:p-8 lg:p-12">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        <header className="mb-8 lg:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Riders Management
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your fleet and rider assignments.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:p-8 mb-10">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end"
          >
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Rider Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059] outline-none"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700 ml-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPhone(value);
                }}
                maxLength={10}
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-[#C5A059] outline-none"
                required
              />
            </div>

            <button
              disabled={isLoading || !name || !phone}
              className="w-full bg-[#C5A059] hover:bg-[#b08d4a] disabled:opacity-70 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all"
            >
              {editingId ? "Update Rider" : "Add Rider"}
            </button>
          </form>
        </section>

        <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b">
                <th className="p-5">Name</th>
                <th className="p-5">Phone</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {riders.map((rider) => (
                  <motion.tr key={rider._id} layout>
                    <td className="p-5">{rider.name}</td>
                    <td className="p-5">{rider.phone}</td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleEdit(rider)}
                        className="text-[#C5A059] font-semibold"
                      >
                        Edit
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {riders.length === 0 && (
          <div className="text-center py-20">No riders found</div>
        )}
      </div>
    </div>
  );
};

export default Riders;
