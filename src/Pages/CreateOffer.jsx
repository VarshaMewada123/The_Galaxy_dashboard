import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import axiosClient from "@/api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import {
  Loader2,
  Tag,
  Calendar,
  Package,
  Layers,
  CheckCircle2,
  ImageIcon,
  X,
  UploadCloud,
  ChevronRight
} from "lucide-react";

export default function CreateOffer() {
  const [items, setItems] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const today = new Date().toISOString().split("T")[0];

  const [formData, setFormData] = useState({
    name: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    items: [],
    combos: [],
    startDate: today,
    endDate: today,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const [itemRes, comboRes] = await Promise.all([
          axiosClient.get("/admin/dining/menu"),
          axiosClient.get("/admin/dining/combos"),
        ]);
     const menuData = itemRes?.data?.data?.data;
        const comboData = comboRes?.data?.data;
       setItems(Array.isArray(menuData) ? menuData : []);
        setCombos(Array.isArray(comboData) ? comboData : []);
      } catch (error) {
        toast.error("Data synchronization failed");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "discountValue") {
      const val = parseFloat(value);
      if (formData.discountType === "PERCENTAGE") {
        if (val < 0 || val > 100) return;
      } else {
        if (val < 0) return;
      }
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "startDate" && newData.endDate < value) {
        newData.endDate = value;
      }
      return newData;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      toast.success("Image attached");
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const toggleSelection = (id, field) => {
    setFormData((prev) => {
      const list = prev[field];
      const isSelected = list.includes(id);
      const updated = isSelected ? list.filter((i) => i !== id) : [...list, id];
      return { ...prev, [field]: updated };
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Offer headline is required");
      return false;
    }
    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      toast.error("Enter a valid discount value");
      return false;
    }
    if (formData.discountType === "PERCENTAGE" && val > 100) {
      toast.error("Percentage cannot exceed 100%");
      return false;
    }
    if (formData.items.length === 0 && formData.combos.length === 0) {
      toast.error("Select at least one item or combo");
      return false;
    }
    if (!formData.startDate || !formData.endDate) {
      toast.error("Campaign duration is required");
      return false;
    }
    if (formData.endDate < formData.startDate) {
      toast.error("End date cannot be before start date");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (Array.isArray(formData[key])) {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });

      if (image) data.append("image", image);

      await axiosClient.post("/admin/dining/offers", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Offer published successfully");
      setFormData({
        name: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        items: [],
        combos: [],
        startDate: today,
        endDate: today,
      });
      removeImage();
    } catch (error) {
      toast.error(error.response?.data?.message || "Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = useMemo(() => {
    const val = parseFloat(formData.discountValue);
    const common = formData.name && val > 0 && (formData.items.length > 0 || formData.combos.length > 0);
    if (formData.discountType === "PERCENTAGE") {
      return common && val <= 100;
    }
    return common;
  }, [formData]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#C5A059]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 selection:bg-[#C5A059]/20">
      <Toaster position="top-right" />

      <main className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12">
        <header className="mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-800">
                New <span className="text-[#C5A059]">Promotion</span>
              </h1>
              <p className="text-slate-500 mt-2 font-medium">Design premium offers for your menu.</p>
            </div>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

          <div className="lg:col-span-7 space-y-6 lg:space-y-8">
            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-[#C5A059]/10 rounded-lg text-[#C5A059]">
                  <Tag size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Campaign Details</h2>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">Offer Headline</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-[#C5A059]/20 focus:bg-white p-4 rounded-2xl transition-all outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-[#C5A059]/10 placeholder:text-slate-300 font-medium"
                    placeholder="e.g., Weekend Royal Feast"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">Reward Type</label>
                    <div className="relative">
                      <select
                        name="discountType"
                        value={formData.discountType}
                        onChange={(e) => {
                          handleChange(e);
                          setFormData(p => ({ ...p, discountValue: "" }));
                        }}
                        className="w-full bg-slate-50 border-2 border-transparent focus:border-[#C5A059]/20 focus:bg-white p-4 rounded-2xl transition-all outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-[#C5A059]/10 appearance-none font-semibold text-slate-700"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FLAT">Flat Amount (₹)</option>
                      </select>
                      <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase mb-2 ml-1">
                      {formData.discountType === "PERCENTAGE" ? "Discount Percentage (1-100)" : "Discount Amount (₹)"}
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      required
                      min="1"
                      max={formData.discountType === "PERCENTAGE" ? "100" : ""}
                      value={formData.discountValue}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-2 border-transparent focus:border-[#C5A059]/20 focus:bg-white p-4 rounded-2xl transition-all outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-[#C5A059]/10 font-bold text-[#C5A059]"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-8 text-[#C5A059]">
                <div className="p-2 bg-[#C5A059]/10 rounded-lg">
                  <Calendar size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Duration</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <input type="date" name="startDate" min={today} value={formData.startDate} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-[#C5A059]/10 font-medium text-slate-600" />
                </div>
                <div>
                  <input type="date" name="endDate" min={formData.startDate || today} value={formData.endDate} onChange={handleChange} className="w-full bg-slate-50 border-2 border-transparent p-4 rounded-2xl outline-none ring-1 ring-slate-200 focus:ring-4 focus:ring-[#C5A059]/10 font-medium text-slate-600" />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-50 hover:border-[#C5A059]/30 transition-all group">
                  <UploadCloud className="w-10 h-10 text-slate-300 group-hover:text-[#C5A059] transition-colors mb-2" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              ) : (
                <div className="relative rounded-2xl overflow-hidden aspect-video max-h-60 group">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={removeImage} className="absolute top-2 right-2 bg-white p-2 rounded-full text-red-500">
                    <X size={18} />
                  </button>
                </div>
              )}
            </section>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <SelectionCard title="Menu Selection" icon={<Package size={20} />} count={formData.items.length} items={items} selectedIds={formData.items} onToggle={(id) => toggleSelection(id, "items")} />
            <SelectionCard title="Curated Combos" icon={<Layers size={20} />} count={formData.combos.length} items={combos} selectedIds={formData.combos} onToggle={(id) => toggleSelection(id, "combos")} />

            <motion.button type="submit" disabled={loading || !isFormValid} className="w-full py-5 rounded-2xl font-bold shadow-xl shadow-[#C5A059]/20 flex items-center justify-center gap-3 disabled:bg-slate-200 bg-[#C5A059] text-white">
              {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={22} />}
              <span>{loading ? "Publishing..." : "Launch Campaign"}</span>
            </motion.button>
          </div>
        </form>
      </main>
    </div>
  );
}

function SelectionCard({ title, icon, count, items, selectedIds, onToggle }) {
  const list = Array.isArray(items) ? items : [];

  return (
    <section className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden max-h-[420px]">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-[#C5A059]">
          <div className="p-2 bg-[#C5A059]/10 rounded-lg">{icon}</div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">{title}</h2>
        </div>
        <div className="bg-slate-100 text-[10px] font-black px-2 py-1 rounded-md text-slate-500">{count}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {list.length === 0 ? (
          <div className="text-center py-10 text-slate-300 text-xs font-medium">No items found</div>
        ) : (
          list.map((item) => {
            const isSelected = selectedIds.includes(item._id);
            return (
              <motion.div
                key={item._id}
                onClick={() => onToggle(item._id)}
                className={`group flex items-center justify-between p-4 rounded-xl border cursor-pointer ${
                  isSelected ? "border-[#C5A059]/40 bg-[#C5A059]/10" : "border-slate-100"
                }`}
              >
                <span className={`text-sm font-bold ${isSelected ? "text-[#C5A059]" : "text-slate-600"}`}>
                  {item.name}
                </span>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? "bg-[#C5A059] border-[#C5A059]" : "border-slate-200"}`}>
                  {isSelected && <CheckCircle2 size={14} className="text-white" />}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}