import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "@/api/axiosClient";
import toast, { Toaster } from "react-hot-toast";
import { Loader2, X, ArrowLeft, Upload, IndianRupee, Clock, ChevronDown } from "lucide-react";

export default function AddMenuItem() {
  const navigate = useNavigate();

  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loadingSub, setLoadingSub] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subCategory: "",
    basePrice: "",
    isVeg: true,
    isJain: false,
    preparationTime: 15,
    spiceLevel: "MEDIUM",
    description: "",
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosClient.get("/admin/dining/categories");
        setCategories(res?.data?.data ?? []);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    if (!formData.category) {
      setSubCategories([]);
      setFormData((p) => ({ ...p, subCategory: "" }));
      return;
    }

    const fetchSub = async () => {
      try {
        setLoadingSub(true);
        const res = await axiosClient.get(
          `/admin/dining/subcategories?category=${formData.category}`
        );
        setSubCategories(res?.data?.data ?? []);
      } catch {
        toast.error("Failed to load subcategories");
      } finally {
        setLoadingSub(false);
      }
    };
    fetchSub();
  }, [formData.category]);

  useEffect(() => {
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
      if (name === "isVeg" && !checked) updated.isJain = false;
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + selectedFiles.length > 5) {
      return toast.error("Max 5 images allowed");
    }
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subCategory) return toast.error("Select SubCategory");
    if (!formData.name.trim()) return toast.error("Enter name");

    const price = Number(formData.basePrice);
    if (!price || price < 50) return toast.error("Minimum price ₹50");

    setUploading(true);
    const loadingToast = toast.loading("Creating menu item...");

    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      selectedFiles.forEach((file) => fd.append("images", file));

      await axiosClient.post("/admin/dining/menu", fd);
      toast.success("Item added successfully!", { id: loadingToast });
      navigate("/admin/dining-images");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed", { id: loadingToast });
    } finally {
      setUploading(false);
    }
  };

  const inputStyle = "w-full bg-white border border-stone-200 p-3 rounded-lg focus:ring-2 focus:ring-[#C6A45C] focus:border-transparent outline-none transition-all placeholder:text-stone-400 text-stone-800";
  const labelStyle = "block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5 ml-1";

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 font-sans antialiased pb-12">
      <Toaster position="top-center" />

      {/* HEADER */}
      <header className="top-0 z-30 bg-[#FDFBF7]/80 backdrop-blur-md border-b border-stone-100 px-4 py-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-stone-600 hover:text-[#C6A45C] transition-colors cursor-pointer"
          >
            <div className="p-2 rounded-full group-hover:bg-[#C6A45C]/10 transition-colors">
              <ArrowLeft size={20} />
            </div>
            <span className="font-medium hidden sm:inline">Back</span>
          </button>
          <h1 className="text-xl font-semibold text-stone-800">New Menu Item</h1>
          <div className="w-10 md:w-24"></div> 
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:px-8">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: INFO FORM */}
          <div className="lg:col-span-7 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <div className="space-y-5">
                <div>
                  <label className={labelStyle}>Item Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Truffle Mushroom Risotto"
                    className={inputStyle}
                  />
                </div>

                <div>
                  <label className={labelStyle}>Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the flavors and ingredients..."
                    className={`${inputStyle} resize-none`}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <label className={labelStyle}>Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`${inputStyle} appearance-none cursor-pointer`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 bottom-3.5 text-stone-400 pointer-events-none" size={18} />
                  </div>

                  <div className="relative">
                    <label className={labelStyle}>Sub Category</label>
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                      disabled={!formData.category || loadingSub}
                      className={`${inputStyle} appearance-none cursor-pointer disabled:bg-stone-50 disabled:text-stone-400`}
                    >
                      <option value="">{loadingSub ? "Loading..." : "Select SubCategory"}</option>
                      {subCategories.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 bottom-3.5 text-stone-400 pointer-events-none" size={18} />
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelStyle}>Base Price</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3.5 text-stone-400" size={16} />
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      className={`${inputStyle} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Prep Time (Mins)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3.5 text-stone-400" size={16} />
                    <input
                      type="number"
                      name="preparationTime"
                      value={formData.preparationTime}
                      onChange={handleChange}
                      className={`${inputStyle} pl-9`}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Spice Level</label>
                  <select
                    name="spiceLevel"
                    value={formData.spiceLevel}
                    onChange={handleChange}
                    className={`${inputStyle} cursor-pointer`}
                  >
                    <option value="MILD">MILD</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="SPICY">SPICY</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-8 mt-8 pt-6 border-t border-stone-50">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="isVeg"
                      checked={formData.isVeg}
                      onChange={handleChange}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-stone-200 checked:bg-[#C6A45C] checked:border-[#C6A45C] transition-all"
                    />
                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">Vegetarian</span>
                </label>

                <label className={`flex items-center gap-3 cursor-pointer group transition-opacity ${!formData.isVeg ? "opacity-40 cursor-not-allowed" : "opacity-100"}`}>
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      name="isJain"
                      disabled={!formData.isVeg}
                      checked={formData.isJain}
                      onChange={handleChange}
                      className="peer h-6 w-6 cursor-pointer appearance-none rounded-md border-2 border-stone-200 checked:bg-[#C6A45C] checked:border-[#C6A45C] transition-all"
                    />
                    <div className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-stone-700 group-hover:text-stone-900 transition-colors">Jain Friendly</span>
                </label>
              </div>
            </section>
          </div>

          {/* RIGHT: IMAGE UPLOAD & SUBMIT */}
          <div className="lg:col-span-5 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <label className={labelStyle}>Gallery (Max 5)</label>
              
              <div className="mt-2 group relative border-2 border-dashed border-stone-200 hover:border-[#C6A45C] rounded-2xl p-8 transition-colors text-center cursor-pointer">
                <input 
                  type="file" 
                  multiple 
                  onChange={handleFileChange} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-stone-50 group-hover:bg-[#C6A45C]/10 rounded-full transition-colors">
                    <Upload className="text-stone-400 group-hover:text-[#C6A45C]" size={24} />
                  </div>
                  <p className="mt-3 text-sm font-medium text-stone-600">Click or drag images to upload</p>
                  <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {previews.map((url, i) => (
                    <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-stone-100 shadow-sm animate-in fade-in zoom-in duration-300">
                      <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="Preview" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1.5 right-1.5 bg-white/90 backdrop-blur-sm p-1.5 rounded-lg text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50 cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-[#C6A45C] hover:bg-[#b39352] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#C6A45C]/20 hover:shadow-[#C6A45C]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Processing...</span>
                </>
              ) : (
                "Create Menu Item"
              )}
            </button>
            
            <p className="text-center text-xs text-stone-400 px-4">
              Review all details carefully. Once created, items will appear instantly on the customer-facing menu.
            </p>
          </div>

        </form>
      </main>
    </div>
  );
}