/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axiosClient";
import { useRef } from "react";
import {
  Loader2,
  Plus,
  UtensilsCrossed,
  IndianRupee,
  Trash2,
  RotateCcw,
  Power,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";

export default function DiningImages() {
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();
  const scrollRef = useRef(null);
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        axiosClient.get("/admin/dining/menu"),
        axiosClient.get("/admin/dining/categories"),
      ]);
      setMenuItems(menuRes.data.data || []);
      setCategories(catRes.data.data || []);
    } catch (error) {
      toast.error("Failed to sync menu data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const executeDelete = async (id, name) => {
    toast.dismiss();
    try {
      await axiosClient.delete(`/admin/dining/menu/${id}`);
      toast.success(`${name} moved to trash`);
      setMenuItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, isDeleted: true } : i)),
      );
    } catch {
      toast.error(`Could not delete ${name}`);
    }
  };

  const deleteItem = (id, name) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 p-1">
          <p className="text-sm font-semibold text-slate-800">
            Delete <span className="text-red-500">{name}</span>?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                executeDelete(id, name);
                toast.dismiss(t.id);
              }}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 4000,
        position: "top-center",
        style: { border: "1px solid #fee2e2", padding: "12px" },
      },
    );
  };

  const restoreItem = async (id, name) => {
    try {
      await axiosClient.patch(`/admin/dining/menu/${id}/restore`);
      toast.success(`${name} restored successfully`);
      setMenuItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, isDeleted: false } : i)),
      );
    } catch {
      toast.error(`Failed to restore ${name}`);
    }
  };

  const toggleAvailability = async (item) => {
    const newStatus = !item.isAvailable;
    try {
      await axiosClient.patch(`/admin/dining/menu/${item._id}/availability`, {
        isAvailable: newStatus,
      });

      if (newStatus) {
        toast.success(`${item.name} is now Available`);
      } else {
        toast.error(`${item.name} marked as Not Available`);
      }

      setMenuItems((prev) =>
        prev.map((i) =>
          i._id === item._id ? { ...i, isAvailable: newStatus } : i,
        ),
      );
    } catch {
      toast.error("Update failed");
    }
  };

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return menuItems;
    return menuItems.filter((item) => item.category?.name === activeCategory);
  }, [menuItems, activeCategory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: shouldReduceMotion ? 0 : 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 15 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-slate-900">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: {
            borderRadius: "12px",
            background: "#fff",
            color: "#333",
            fontWeight: "500",
            boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
          },
        }}
      />

      <main className="max-w-[1600px] mx-auto px-4 sm:px-10 py-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4">
            <div className="bg-[#C5A059] p-3 rounded-2xl text-white shadow-lg shadow-[#C5A059]/20">
              <UtensilsCrossed size={24} />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-800">
                Menu Control
              </h1>
              <p className="text-sm text-slate-500 font-medium">
                Manage your culinary offerings
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/add-item")}
            className="cursor-pointer flex items-center justify-center gap-2 bg-[#C5A059] hover:bg-[#b38f4d] text-white px-6 py-3 rounded-xl font-bold transition-all active:scale-95"
          >
            <Plus size={20} />
            <span>Add Item</span>
          </button>
        </header>

        <nav className="mb-12">
          <div className="flex items-center gap-6 sm:gap-10 overflow-x-auto py-6 px-2 scrollbar-hide">
            <CategoryCircle
              name="All"
              isActive={activeCategory === "All"}
              onClick={() => setActiveCategory("All")}
            />
            {categories.map((cat) => (
              <CategoryCircle
                key={cat._id}
                name={cat.name}
                image={cat.image?.url}
                isActive={activeCategory === cat.name}
                onClick={() => setActiveCategory(cat.name)}
              />
            ))}
          </div>
        </nav>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="animate-spin text-[#C5A059]" size={40} />
            <p className="text-[#C5A059] font-medium">Loading menu...</p>
          </div>
        ) : (
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 sm:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <motion.div
                  layout
                  key={item._id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={
                        item.images?.[0]?.url ||
                        "https://placehold.co/600x450?text=No+Image"
                      }
                      alt={item.name}
                      className={`w-full h-full object-cover transition-opacity ${!item.isAvailable ? "grayscale opacity-50" : ""}`}
                    />
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-[#C5A059] font-bold flex items-center gap-1 text-sm border border-slate-100">
                      <IndianRupee size={14} />
                      {item.basePrice}
                    </div>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg shadow-lg">
                          Not Available
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex flex-col flex-grow gap-4">
                    <div className="flex-grow">
                      <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1">
                        {item.name}
                      </h3>
                      <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
                        {item.category?.name || "Uncategorized"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <button
                        onClick={() => toggleAvailability(item)}
                        className={`cursor-pointer p-2 rounded-lg transition-all active:scale-90
                        ${
                          item.isAvailable
                            ? "bg-green-50 text-green-600 hover:bg-green-100"
                            : "bg-red-50 text-red-600 hover:bg-red-100"
                        }`}
                        title={
                          item.isAvailable
                            ? "Mark Unavailable"
                            : "Mark Available"
                        }
                      >
                        <Power size={18} strokeWidth={2.5} />
                      </button>

                      <div className="flex items-center gap-2">
                        {item.isDeleted ? (
                          <button
                            onClick={() => restoreItem(item._id, item.name)}
                            className="cursor-pointer p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                          >
                            <RotateCcw size={18} strokeWidth={2.5} />
                          </button>
                        ) : (
                          <button
                            onClick={() => deleteItem(item._id, item.name)}
                            className="cursor-pointer p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </div>
  );
}

function CategoryCircle({ name, image, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group cursor-pointer flex flex-col items-center gap-3 shrink-0 focus:outline-none"
    >
      <div className="relative overflow-visible">
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full transition-all duration-300 p-1 border-2
          ${
            isActive
              ? "border-[#C5A059] shadow-xl shadow-[#C5A059]/30 scale-110 z-10"
              : "border-transparent opacity-60 hover:opacity-100 group-hover:scale-105"
          }`}
        >
          <div className="w-full h-full rounded-full overflow-hidden shadow-inner">
            {image ? (
              <img
                src={image}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#EFEAE1] flex items-center justify-center text-[#C5A059] text-xl font-bold">
                {name[0]}
              </div>
            )}
          </div>
        </div>
      </div>
      <span
        className={`text-[10px] sm:text-xs tracking-widest uppercase font-bold transition-colors
      ${isActive ? "text-[#C5A059]" : "text-slate-400 group-hover:text-slate-600"}`}
      >
        {name}
      </span>
    </button>
  );
}
