/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import axiosClient from "@/api/axiosClient";
import { Trash2, Edit3, UserPlus, Phone, Briefcase, X } from "lucide-react";

const API = "/admin/staff";

export default function KitchenStaff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    role: "",
  });

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get(API);
      setStaff(res?.data?.data || []);
    } catch (err) {
      toast.error("Failed to load staff members");
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const validateForm = () => {
    if (form.phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    if (!form.name.trim() || !form.role) {
      toast.error("Please fill in all required fields");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (editId) {
        await axiosClient.put(`${API}/${editId}`, form);
        toast.success("Staff profile updated successfully");
      } else {
        await axiosClient.post(API, form);
        toast.success("New staff member added");
      }
      resetForm();
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this staff member?"))
      return;
    try {
      await axiosClient.delete(`${API}/${id}`);
      toast.success("Staff member removed");
      fetchStaff();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const handleEdit = (s) => {
    setForm({
      name: s.name || "",
      phone: s.phone || "",
      role: s.role || "",
    });
    setEditId(s._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setForm({ name: "", phone: "", role: "" });
    setEditId(null);
  };

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-slate-900 p-4 sm:p-6 lg:p-8">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Kitchen Staff
            </h1>
            <p className="text-slate-500 mt-1">
              Manage your professional culinary team
            </p>
          </div>
          <div className="h-1 w-20 bg-[#C5A059] rounded-full" />
        </header>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <section className="lg:col-span-1 sticky top-8">
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5"
            >
              <h2 className="text-lg font-semibold flex items-center gap-2 mb-2">
                {editId ? (
                  <Edit3 className="w-5 h-5 text-[#C5A059]" />
                ) : (
                  <UserPlus className="w-5 h-5 text-[#C5A059]" />
                )}
                {editId ? "Update Profile" : "Register Staff"}
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Full Name
                </label>
                <input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-[#C5A059] focus:border-transparent transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    className="w-full bg-slate-50 border border-slate-200 p-3.5 pl-12 rounded-xl focus:ring-2 focus:ring-[#C5A059] transition-all outline-none"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Designation
                </label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-[#C5A059] transition-all outline-none cursor-pointer"
                  required
                >
                  <option value="">Select Role</option>
                  <option>Head Chef</option>
                  <option>Assistant Chef</option>
                  <option>Helper</option>
                  <option>Cleaner</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-[#C5A059] hover:bg-[#b08e4d] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#C5A059]/20 transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Processing..."
                    : editId
                      ? "Save Changes"
                      : "Confirm Staff"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="p-4 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors group"
                    title="Cancel Edit"
                  >
                    <X className="w-5 h-5 text-slate-500 group-hover:text-slate-700" />
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="lg:col-span-2">
            {loading ? (
              <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-10 h-10 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
                <p className="text-slate-400 font-medium">Updating roster...</p>
              </div>
            ) : (
              <div className="grid gap-4">
                <AnimatePresence mode="popLayout">
                  {staff.length > 0 ? (
                    staff.map((s) => (
                      <motion.div
                        key={s._id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-md transition-shadow group"
                      >
                        <div className="flex gap-5 items-center">
                          <div className="w-14 h-14 bg-gradient-to-br from-[#C5A059]/20 to-[#C5A059]/5 rounded-2xl flex items-center justify-center text-[#C5A059] font-black text-xl border border-[#C5A059]/10">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg text-slate-800 leading-tight">
                              {s.name}
                            </h3>
                            <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm font-medium text-slate-500">
                              <span className="flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-[#C5A059]" />
                                {s.role}
                              </span>
                              <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#C5A059]" />
                                {s.phone}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-slate-50">
                          <span
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] ${
                              s.status === "Active"
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                : "bg-slate-50 text-slate-400 border border-slate-100"
                            }`}
                          >
                            {s.status || "Inactive"}
                          </span>
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleEdit(s)}
                              className="p-2.5 text-slate-400 hover:text-[#C5A059] hover:bg-[#C5A059]/10 rounded-xl transition-all"
                              aria-label="Edit"
                            >
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(s._id)}
                              className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200"
                    >
                      <UserPlus className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-slate-400 font-medium">
                        No staff members currently on the roster.
                      </p>
                      <p className="text-slate-300 text-sm">
                        Add your first team member using the form.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
