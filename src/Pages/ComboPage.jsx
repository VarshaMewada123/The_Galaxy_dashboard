import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Plus,
  Minus,
  Trash2,
  Edit3,
  Package,
  CheckCircle2,
  ShoppingBag,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axiosClient from "../api/axiosClient";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 },
};

const MenuItemCard = React.memo(
  ({ item, isChecked, onSelect, qty, updateQty, disabled }) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        layout={!shouldReduceMotion}
        variants={itemVariants}
        className={`group relative flex flex-col justify-between p-3 md:p-4 rounded-2xl border-2 transition-all duration-300 h-full
        ${
          isChecked
            ? "border-[#C5A059] bg-[#C5A059]/5 shadow-md ring-1 ring-[#C5A059]/10"
            : "border-gray-100 bg-white hover:border-gray-200 hover:shadow-lg"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div
          onClick={() => !disabled && onSelect(item._id)}
          className="flex flex-col gap-2 md:gap-3 cursor-pointer h-full"
        >
          <div className="flex items-start justify-between">
            <div
              className={`p-1.5 md:p-2 rounded-lg transition-colors ${isChecked ? "bg-[#C5A059] text-white" : "bg-gray-100 text-gray-400 group-hover:bg-gray-200"}`}
            >
              <CheckCircle2 size={16} />
            </div>
            {item.price && (
              <span className="text-xs md:text-sm font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md">
                ₹{item.price}
              </span>
            )}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs md:text-sm lg:text-base font-bold text-gray-800 line-clamp-2 leading-tight">
              {item.name}
            </span>
          </div>
        </div>

        <AnimatePresence>
          {isChecked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 pt-3 border-t border-[#C5A059]/20"
            >
              <div className="flex items-center justify-between bg-white rounded-xl p-1 shadow-inner border border-gray-100">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQty(item._id, -1);
                  }}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                >
                  <span className="sr-only">Decrease</span>
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="font-bold text-xs md:text-sm tabular-nums w-6 text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQty(item._id, 1);
                  }}
                  className="w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                >
                  <span className="sr-only">Increase</span>
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  },
);

MenuItemCard.displayName = "MenuItemCard";

export default function ComboPage() {
  const [menuItems, setMenuItems] = useState([]);
  const [combos, setCombos] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [images, setImages] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const isPriceValid = useMemo(() => {
    const p = parseFloat(price);
    return !isNaN(p) && p >= 100;
  }, [price]);

  const isFormValid = useMemo(
    () => name.trim() !== "" && isPriceValid && selectedItems.length > 0,
    [name, isPriceValid, selectedItems],
  );

  const fetchMenu = async () => {
    const res = await axiosClient.get("/admin/dining/menu");
    setMenuItems(res.data?.data || res.data || []);
  };

  const fetchCombos = async () => {
    const res = await axiosClient.get("/admin/dining/combos");
    setCombos(res.data?.data || res.data || []);
  };

  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([fetchMenu(), fetchCombos()]);
      } catch (err) {
        toast.error("Failed to load kitchen data");
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const handleSelect = useCallback((itemId) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.item === itemId);
      if (exists) return prev.filter((i) => i.item !== itemId);
      return [...prev, { item: itemId, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((itemId, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((item) => {
          if (item.item !== itemId) return item;
          const newQty = item.quantity + delta;
          return newQty <= 0 ? null : { ...item, quantity: newQty };
        })
        .filter(Boolean),
    );
  }, []);

  const getQty = (itemId) => {
    const found = selectedItems.find((i) => i.item === itemId);
    return found ? found.quantity : 1;
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImages([]);
    setSelectedItems([]);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) {
      toast.error("Please fill all fields correctly");
      return;
    }
    setIsSubmitting(true);
    const loadingToast = toast.loading(
      editingId ? "Updating combo..." : "Creating combo...",
    );
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("items", JSON.stringify(selectedItems));
      images.forEach((img) => {
        formData.append("images", img);
      });

      if (editingId) {
        await axiosClient.put(`/admin/dining/combos/${editingId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("Combo updated successfully", { id: loadingToast });
      } else {
        await axiosClient.post("/admin/dining/combos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        toast.success("New combo launched!", { id: loadingToast });
      }
      await fetchCombos();
      resetForm();
    } catch (error) {
      toast.error("Process failed", { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (id) => {
    const deleteToast = toast.loading("Deleting combo...");
    try {
      await axiosClient.delete(`/admin/dining/combos/${id}`);
      setCombos((prev) => prev.filter((c) => c._id !== id));
      toast.success("Combo deleted successfully", { id: deleteToast });
    } catch (err) {
      toast.error("Deletion failed. Please try again.", { id: deleteToast });
    }
  };

  const handleDeleteTrigger = (id) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold text-gray-800">
            Are you sure you want to delete this combo?
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                confirmDelete(id);
              }}
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 5000,
        position: "top-center",
        style: {
          padding: "16px",
          borderRadius: "16px",
          border: "1px solid #fee2e2",
        },
      },
    );
  };

  const handleEdit = (combo) => {
    setEditingId(combo._id);
    setName(combo.name);
    setPrice(combo.price.toString());
    const items = combo.items.map((i) => ({
      item: i.item._id || i.item,
      quantity: i.quantity,
    }));
    setSelectedItems(items);

    formRef.current?.scrollIntoView({
      behavior: shouldReduceMotion ? "auto" : "smooth",
      block: "start",
    });
    toast.success("Editing mode active");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#FBFBFA]">
        <Loader2 className="w-10 h-10 text-[#C5A059] animate-spin mb-4" />
        <p className="text-gray-500 font-medium animate-pulse">
          Loading your kitchen...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#FBFBFA] text-gray-900 pb-10 md:pb-20">
      <Toaster position="top-right" reverseOrder={false} />
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-12 max-w-[1600px]"
      >
        <header
          ref={formRef}
          className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 scroll-mt-20"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A059]/10 text-[#C5A059] text-[10px] md:text-xs font-bold uppercase tracking-wider">
              <Package size={14} /> Admin Portal
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-gray-900">
              {editingId ? "Update" : "Create"}{" "}
              <span className="text-[#C5A059]">Combo</span>
            </h1>
            <p className="text-gray-500 text-sm md:text-base lg:text-lg max-w-xl">
              Design attractive bundles and manage your pricing for maximum
              value.
            </p>
          </div>
          {editingId && (
            <button
              onClick={resetForm}
              className="flex items-center self-start md:self-auto gap-2 text-xs md:text-sm font-semibold text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all border border-red-100"
            >
              <X size={16} /> Cancel Editing
            </button>
          )}
        </header>

        <section className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden mb-12 md:mb-20">
          <form onSubmit={handleSubmit} className="p-5 md:p-10 lg:p-14">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  Combo Title
                </label>
                <input
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C5A059] focus:bg-white rounded-2xl p-3 md:p-4 transition-all outline-none text-base md:text-lg font-medium shadow-sm"
                  placeholder="e.g. Weekend Special Feast"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  Combo Price (₹)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    className={`w-full bg-gray-50 border-2 rounded-2xl p-3 md:p-4 transition-all outline-none text-base md:text-lg font-bold pr-12 shadow-sm
                      ${price && !isPriceValid ? "border-red-200 focus:border-red-400" : "border-transparent focus:border-[#C5A059] focus:bg-white"}`}
                    placeholder="0.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  {!isPriceValid && price !== "" && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-red-500">
                      <AlertCircle size={20} />
                    </div>
                  )}
                </div>
                <p
                  className={`text-[10px] md:text-xs font-medium ml-1 transition-colors ${!isPriceValid && price !== "" ? "text-red-500" : "text-gray-400"}`}
                >
                  * Minimum required price is ₹100
                </p>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => setImages(Array.from(e.target.files))}
                  className="w-full bg-gray-50 border-2 border-transparent focus:border-[#C5A059] focus:bg-white rounded-2xl p-3 md:p-4 transition-all outline-none text-base md:text-lg font-medium shadow-sm"
                />
              </div>
            </div>

            <div className="mb-10 md:mb-12">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <ShoppingBag size={20} className="text-[#C5A059]" />
                  Select Menu Items
                  <span className="ml-2 bg-[#C5A059]/10 text-[#C5A059] text-[10px] md:text-xs px-2 py-1 rounded-full font-bold">
                    {selectedItems.length} selected
                  </span>
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 md:gap-4 lg:gap-5">
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item._id}
                    item={item}
                    isChecked={selectedItems.some((s) => s.item === item._id)}
                    qty={getQty(item._id)}
                    updateQty={updateQty}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-gray-100 pt-8 md:pt-10">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full sm:w-auto bg-[#C5A059] disabled:bg-gray-200 disabled:cursor-not-allowed text-white px-8 md:px-12 py-4 md:py-5 rounded-2xl font-bold text-base md:text-lg shadow-xl shadow-[#C5A059]/20 hover:shadow-[#C5A059]/40 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={22} />
                ) : (
                  <Package size={22} />
                )}
                {editingId ? "Update Combo" : "Launch New Combo"}
              </button>
              {editingId && (
                <p className="text-xs font-semibold text-gray-400">
                  Currently modifying: {name}
                </p>
              )}
            </div>
          </form>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-xl md:text-3xl font-black text-gray-900 whitespace-nowrap">
              Existing Combos
            </h2>
            <div className="h-px w-full bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {combos.map((combo) => (
                <motion.div
                  layout={!shouldReduceMotion}
                  key={combo._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-gray-100 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-full"
                >
                  <div>
                    {combo.images && combo.images.length > 0 && (
                      <img
                        src={combo.images[0].url}
                        alt={combo.name}
                        className="w-full h-40 object-cover rounded-xl mb-4"
                      />
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-lg md:text-xl text-gray-800 group-hover:text-[#C5A059] transition-colors truncate">
                          {combo.name}
                        </h3>
                        <p className="text-xl md:text-2xl font-black text-[#C5A059]">
                          ₹{combo.price}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-3 md:p-4 mb-6">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-3 flex items-center gap-2">
                        Included Items ({combo.items.length})
                      </p>
                      <ul className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {combo.items.map((i, idx) => (
                          <li
                            key={idx}
                            className="text-xs md:text-sm text-gray-600 flex justify-between gap-2 border-b border-gray-200/50 pb-1 last:border-0"
                          >
                            <span className="truncate">
                              • {i.item.name || "Unknown Item"}
                            </span>
                            <span className="font-bold text-[#C5A059] whitespace-nowrap">
                              x{i.quantity}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={() => handleEdit(combo)}
                      className="flex items-center justify-center gap-2 px-3 py-3 bg-gray-100 hover:bg-[#C5A059] hover:text-white text-gray-600 rounded-xl font-bold text-xs md:text-sm transition-all"
                    >
                      <Edit3 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTrigger(combo._id)}
                      className="flex items-center justify-center gap-2 px-3 py-3 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl font-bold text-xs md:text-sm transition-all"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {combos.length === 0 && (
            <div className="text-center py-16 md:py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
              <Package className="w-12 h-12 md:w-16 md:h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 text-base md:text-lg font-medium">
                No combos found. Start by creating one above.
              </p>
            </div>
          )}
        </section>
      </motion.div>
    </main>
  );
}
