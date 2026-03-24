import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, Loader2, CheckCircle2, ArrowLeft, Trash2, Edit3, PackagePlus, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axiosClient from "../api/axiosClient";

// Memoized Card for Performance
const MenuItemCard = React.memo(({ item, isChecked, onSelect, qty, updateQty }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-3 md:p-4 rounded-xl border transition-all duration-300 cursor-pointer flex flex-col justify-between h-full ${
        isChecked ? "border-[#C6A45C] bg-[#C6A45C]/5 shadow-sm" : "border-gray-200 bg-white hover:border-[#C6A45C]/50"
      }`}
      onClick={() => !isChecked && onSelect(item._id)}
    >
      <div>
        <div className="flex justify-between items-start mb-2">
          <div className={`p-1 rounded-full ${isChecked ? "bg-[#C6A45C] text-white" : "bg-gray-100 text-gray-300"}`}>
            <CheckCircle2 size={14} />
          </div>
          <span className="font-bold text-gray-700 text-xs md:text-sm">₹{item.price}</span>
        </div>
        <p className="font-medium text-xs md:text-sm text-gray-800 leading-tight line-clamp-2">{item.name}</p>
      </div>

      {isChecked && (
        <div className="flex items-center justify-between mt-3 bg-white rounded-lg border border-[#C6A45C]/20 p-1 shadow-inner" onClick={(e) => e.stopPropagation()}>
          <button 
            type="button"
            onClick={() => updateQty(item._id, -1)}
            className="p-1 hover:bg-gray-100 rounded text-[#C6A45C]"
          >
            <Minus size={12} />
          </button>
          <span className="font-bold text-xs px-1 text-gray-700">{qty}</span>
          <button 
            type="button"
            onClick={() => updateQty(item._id, 1)}
            className="p-1 hover:bg-gray-100 rounded text-[#C6A45C]"
          >
            <Plus size={12} />
          </button>
        </div>
      )}
      
      {isChecked && (
        <button 
          onClick={(e) => { e.stopPropagation(); onSelect(item._id); }}
          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
        >
          <X size={10} />
        </button>
      )}
    </motion.div>
  );
});

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

  const normalize = (res) => {
    if (Array.isArray(res.data?.data)) return res.data.data;
    if (Array.isArray(res.data?.data?.data)) return res.data.data.data;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  const fetchData = async () => {
    try {
      const [m, c] = await Promise.all([
        axiosClient.get("/admin/dining/menu"),
        axiosClient.get("/admin/dining/combos"),
      ]);
      setMenuItems(normalize(m));
      setCombos(normalize(c));
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelect = useCallback((id) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.item === id);
      return exists ? prev.filter((i) => i.item !== id) : [...prev, { item: id, quantity: 1 }];
    });
  }, []);

  const updateQty = useCallback((id, delta) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.item === id ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i))
          .filter((i) => i.quantity > 0)
    );
  }, []);

  const getQty = (id) => selectedItems.find((i) => i.item === id)?.quantity || 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedItems.length === 0) return toast.error("Select at least one item");

    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("price", price);
      fd.append("items", JSON.stringify(selectedItems));
      images.forEach((img) => fd.append("images", img));

      if (editingId) {
        await axiosClient.put(`/admin/dining/combos/${editingId}`, fd);
        toast.success("Combo updated");
      } else {
        await axiosClient.post("/admin/dining/combos", fd);
        toast.success("Combo created");
      }

      fetchData();
      resetForm();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImages([]);
    setSelectedItems([]);
    setEditingId(null);
  };

  const handleEdit = (c) => {
    const safeItems = (c.items || [])
      .filter((i) => i?.item)
      .map((i) => ({
        item: typeof i.item === "object" ? i.item._id : i.item,
        quantity: i.quantity || 1,
      }));

    setEditingId(c._id);
    setName(c.name);
    setPrice(c.price.toString());
    setSelectedItems(safeItems);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this combo?")) return;
    try {
      await axiosClient.delete(`/admin/dining/combos/${id}`);
      setCombos((prev) => prev.filter((c) => c._id !== id));
      toast.success("Combo removed");
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-[#F9F9F9] p-4 text-center">
        <Loader2 className="animate-spin text-[#C6A45C] mb-4" size={40} />
        <p className="text-gray-500 font-medium tracking-wide">Fetching your delicious combinations...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F9F9F9] p-4 md:p-6 lg:p-10 text-gray-800">
      <Toaster position="top-center" />
      
      <div className="max-w-7xl mx-auto">
        {/* Navigation */}
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#C6A45C] transition-colors mb-6 group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to Dashboard</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form Section */}
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className="lg:col-span-5 bg-white p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 lg:sticky lg:top-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <PackagePlus className="text-[#C6A45C]" />
              <h2 className="text-xl md:text-2xl font-bold">{editingId ? "Edit Combo" : "New Combo"}</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Combo Name</label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Special"
                  value={name}
                  required
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-[#C6A45C]/20 focus:border-[#C6A45C] outline-none transition-all bg-gray-50 text-sm"
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  value={price}
                  required
                  className="w-full border-gray-200 border p-3 rounded-xl focus:ring-2 focus:ring-[#C6A45C]/20 focus:border-[#C6A45C] outline-none transition-all bg-gray-50 text-sm"
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 block">Images</label>
                <input
                  type="file"
                  multiple
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#C6A45C]/10 file:text-[#C6A45C] hover:file:bg-[#C6A45C]/20 cursor-pointer"
                  onChange={(e) => setImages([...e.target.files])}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3 block">
                  Select Items ({selectedItems.length})
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[250px] overflow-y-auto pr-2 overflow-x-hidden">
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
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#C6A45C] hover:bg-[#b39352] text-white font-bold py-4 rounded-xl shadow-lg shadow-[#C6A45C]/20 transition-all active:scale-[0.98] flex justify-center items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : editingId ? "Save Changes" : "Publish Combo"}
              </button>
              
              {editingId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="w-full text-gray-400 text-xs hover:text-red-500 transition-colors py-1"
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </form>

          {/* List Section */}
          <div className="lg:col-span-7">
            <h3 className="text-lg md:text-xl font-bold mb-6 flex items-center gap-2">
              Current Combos <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{combos.length}</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {combos.map((c) => (
                  <motion.div
                    key={c._id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-base md:text-lg text-gray-800 leading-tight">{c.name}</h4>
                        <span className="text-[#C6A45C] font-black text-base whitespace-nowrap">₹{c.price}</span>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {c.items?.map((i, idx) => (
                          <span key={idx} className="text-[10px] px-2 py-1 bg-gray-50 rounded-md text-gray-500 border border-gray-100">
                            <span className="font-bold text-[#C6A45C]">{i.quantity}x</span> {i.item?.name || "Item"}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => handleEdit(c)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-[#C6A45C]/10 hover:text-[#C6A45C] transition-all font-semibold text-xs"
                      >
                        <Edit3 size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c._id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all font-semibold text-xs"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {combos.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-400 font-medium">No combos found. Start by creating one!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}