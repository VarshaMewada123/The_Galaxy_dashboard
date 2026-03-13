import { useEffect, useState, useMemo } from "react";
import axiosClient from "@/api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, Tag, Calendar, Package, Layers, CheckCircle2 } from "lucide-react";

export default function CreateOffer() {
  const [items, setItems] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    items: [],
    combos: [],
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const [itemRes, comboRes] = await Promise.all([
          axiosClient.get("/admin/dining/menu"),
          axiosClient.get("/admin/dining/combos"),
        ]);
        setItems(itemRes.data.data || []);
        setCombos(comboRes.data.data || []);
      } catch (error) {
        toast.error("Failed to synchronize menu data");
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (id, field) => {
    setFormData((prev) => {
      const currentList = prev[field];
      const newList = currentList.includes(id)
        ? currentList.filter((i) => i !== id)
        : [...currentList, id];
      return { ...prev, [field]: newList };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.discountValue || (!formData.items.length && !formData.combos.length)) {
      toast.error("Please provide a name, value, and at least one selection");
      return;
    }

    try {
      setLoading(true);
      await axiosClient.post("/admin/dining/offers", formData);
      toast.success("Offer published successfully");
      setFormData({
        name: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        items: [],
        combos: [],
        startDate: "",
        endDate: "",
      });
    } catch (error) {
      toast.error("Server error: Could not save offer");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = formData.name && formData.discountValue;

  return (
    <div className="min-h-screen bg-[#F9F8F6] text-slate-900 selection:bg-[#C5A059]/30 p-4 sm:p-6 lg:p-10">
      <Toaster position="top-right" />
      
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-800">
            Create <span className="text-[#C5A059]">Offer</span>
          </h1>
          <p className="text-slate-500 mt-2 text-sm sm:text-base">Configure discounts for specific menu items or curated combos.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[#C5A059]">
                <Tag size={20} />
                <h2 className="font-bold uppercase tracking-wider text-xs">General Information</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Offer Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#C5A059] p-3.5 rounded-xl transition-all outline-none placeholder:text-slate-400"
                    placeholder="e.g. Summer Brunch Special"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Type</label>
                    <select
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#C5A059] p-3.5 rounded-xl transition-all outline-none appearance-none"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FLAT">Flat Amount</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2 ml-1">Value</label>
                    <input
                      type="number"
                      name="discountValue"
                      required
                      value={formData.discountValue}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#C5A059] p-3.5 rounded-xl transition-all outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 text-[#C5A059]">
                <Calendar size={20} />
                <h2 className="font-bold uppercase tracking-wider text-xs">Validity Period</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#C5A059] p-3.5 rounded-xl transition-all outline-none"
                />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border-0 ring-1 ring-slate-200 focus:ring-2 focus:ring-[#C5A059] p-3.5 rounded-xl transition-all outline-none"
                />
              </div>
            </section>

            <div className="hidden lg:block">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-[#C5A059] hover:bg-[#b38f4d] disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold shadow-lg shadow-[#C5A059]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {loading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={20} />}
                {loading ? "Processing..." : "Publish Offer"}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-h-[400px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#C5A059]">
                  <Package size={20} />
                  <h2 className="font-bold uppercase tracking-wider text-xs">Select Items</h2>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                  {formData.items.length} Selected
                </span>
              </div>
              <div className="overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {items.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => toggleSelection(item._id, "items")}
                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      formData.items.includes(item._id)
                        ? "border-[#C5A059] bg-[#C5A059]/5"
                        : "border-slate-100 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-700">{item.name}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.items.includes(item._id) 
                        ? "bg-[#C5A059] border-[#C5A059]" 
                        : "border-slate-300"
                    }`}>
                      {formData.items.includes(item._id) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-h-[400px] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#C5A059]">
                  <Layers size={20} />
                  <h2 className="font-bold uppercase tracking-wider text-xs">Select Combos</h2>
                </div>
                <span className="text-[10px] font-bold bg-slate-100 px-2 py-1 rounded text-slate-500">
                  {formData.combos.length} Selected
                </span>
              </div>
              <div className="overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
                {combos.map((combo) => (
                  <div
                    key={combo._id}
                    onClick={() => toggleSelection(combo._id, "combos")}
                    className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      formData.combos.includes(combo._id)
                        ? "border-[#C5A059] bg-[#C5A059]/5"
                        : "border-slate-100 hover:border-slate-300 bg-slate-50/50"
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-700">{combo.name}</span>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      formData.combos.includes(combo._id) 
                        ? "bg-[#C5A059] border-[#C5A059]" 
                        : "border-slate-300"
                    }`}>
                      {formData.combos.includes(combo._id) && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="lg:hidden pb-10">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="w-full bg-[#C5A059] text-white py-4 rounded-2xl font-bold shadow-lg active:scale-[0.98] transition-all"
              >
                {loading ? "Processing..." : "Publish Offer"}
              </button>
            </div>
          </div>
        </form>
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        @media (prefers-reduced-motion: reduce) {
          * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>
    </div>
  );
}