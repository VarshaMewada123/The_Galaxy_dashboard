import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import axiosClient from "@/api/axiosClient";
import {
  Loader2,
  Upload,
  ChevronLeft,
  ImagePlus,
  X,
  Utensils,
  Clock,
  IndianRupee,
  Leaf,
  ChefHat,
} from "lucide-react";

const CATEGORY_MAP = {
  Starters: "698ecb03929a7b5884e69f7b",
  Burgers: "6992f9a23fb7d03ea072b5bd",
  "Main Course": "69930a803ddb72820b1a1f86",
  Desserts: "69930ac73ddb72820b1a1f88",
  Beverages: "69930adc3ddb72820b1a1f8a",
  Salads: "69930af33ddb72820b1a1f8c",
};

export default function AddMenuItem() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    categoryName: "Burgers",
    category: CATEGORY_MAP["Burgers"],
    basePrice: "",
    isVeg: true,
    preparationTime: 15,
    spiceLevel: "MEDIUM",
  });

  useEffect(() => {
    if (selectedFiles.length === 0) {
      setPreviews([]);
      return;
    }
    const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCategoryChange = (e) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      categoryName: name,
      category: CATEGORY_MAP[name],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      selectedFiles.forEach((file) => fd.append("images", file));

      await axiosClient.post("/admin/dining/menu", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/admin/dining/images");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create item");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-full bg-[#F8F8F8] text-[#2D2D2D] selection:bg-[#C5A059]/20 font-sans pb-20">
      <div className="mx-auto px-4 sm:px-6 pt-6 lg:pt-12">
        <header className="flex items-center justify-between mb-8 lg:mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 sm:gap-4"
          >
            <button
              onClick={() => navigate(-1)}
              className="group p-2.5 sm:p-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl hover:border-[#C5A059] transition-all duration-300 shadow-sm"
            >
              <ChevronLeft
                size={18}
                className="group-hover:text-[#C5A059] transition-colors"
              />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="h-[1px] w-4 sm:w-6 bg-[#C5A059]" />
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] sm:tracking-[0.4em] font-black text-[#C5A059]">
                  Culinary Registry
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-light tracking-tight text-slate-900 leading-tight">
                Create{" "}
                <span className="font-serif italic text-[#C5A059] font-medium">
                  New Masterpiece
                </span>
              </h1>
            </div>
          </motion.div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Main Info Card */}
              <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200/60 p-5 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)]">
                <div className="space-y-5">
                  <div className="relative group">
                    <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                      Dish Name
                    </label>
                    <div className="relative">
                      <Utensils className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#C5A059] transition-colors w-4 h-4" />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 sm:p-4 pl-11 sm:pl-12 rounded-xl sm:rounded-2xl outline-none focus:ring-2 focus:ring-[#C5A059]/20 focus:border-[#C5A059] transition-all text-sm font-medium"
                        placeholder="e.g. Truffle Mushroom Risotto"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        Collection
                      </label>
                      <select
                        value={formData.categoryName}
                        onChange={handleCategoryChange}
                        className="w-full bg-slate-50 border border-slate-100 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl outline-none focus:border-[#C5A059] transition-all text-sm font-medium appearance-none cursor-pointer"
                      >
                        {Object.keys(CATEGORY_MAP).map((cat) => (
                          <option key={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative group">
                      <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
                        Price (INR)
                      </label>
                      <div className="relative">
                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
                        <input
                          type="number"
                          name="basePrice"
                          value={formData.basePrice}
                          onChange={handleChange}
                          required
                          className="w-full bg-slate-50 border border-slate-100 p-3.5 sm:p-4 pl-11 sm:pl-12 rounded-xl sm:rounded-2xl outline-none focus:border-[#C5A059] transition-all text-sm font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200/60 p-5 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.03)] grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                    Dietary Note
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="relative">
                      <input
                        type="checkbox"
                        name="isVeg"
                        checked={formData.isVeg}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 sm:w-12 h-5 sm:h-6 rounded-full transition-colors duration-300 ${formData.isVeg ? "bg-green-500" : "bg-slate-200"}`}
                      />
                      <div
                        className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${formData.isVeg ? "translate-x-5 sm:translate-x-6" : ""}`}
                      />
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-bold transition-colors ${formData.isVeg ? "text-green-600" : "text-slate-400"}`}
                    >
                      {formData.isVeg ? "VEGETARIAN" : "NON-VEG"}
                    </span>
                    <Leaf
                      size={14}
                      className={
                        formData.isVeg ? "text-green-500" : "text-slate-300"
                      }
                    />
                  </label>
                </div>

                <div>
                  <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block">
                    Spice Intensity
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["LOW", "MEDIUM", "HIGH"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() =>
                          setFormData((p) => ({ ...p, spiceLevel: level }))
                        }
                        className={`flex-1 min-w-[60px] px-2 py-2 rounded-lg text-[9px] sm:text-[10px] font-black tracking-tighter transition-all ${
                          formData.spiceLevel === level
                            ? "bg-[#C5A059] text-white shadow-lg shadow-[#C5A059]/20"
                            : "bg-slate-50 text-slate-400 hover:bg-slate-100"
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6"
            >
              <div className="border h-[240px] border-red-600 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] border border-slate-200/60 p-5 sm:p-6 shadow-sm flex flex-col item-center justify-center">
                <label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 block text-center">
                  Gallery
                </label>
                <div className="h-[10em] relative aspect-video sm:aspect-square rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-100 hover:border-[#C5A059]/40 hover:bg-[#C5A059]/5 transition-all group flex flex-col items-center justify-center text-center p-4 cursor-pointer">
                  <ImagePlus
                    size={28}
                    className="text-slate-200 group-hover:text-[#C5A059] transition-colors mb-2"
                  />
                  <p className="text-[9px] font-bold text-slate-400 group-hover:text-slate-600 uppercase tracking-tight leading-tight">
                    Drop images or <br className="hidden sm:block" /> click to
                    browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-3 gap-2 mt-4">
                  <AnimatePresence>
                    {previews.map((url, i) => (
                      <motion.div
                        key={url}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="relative aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-slate-100"
                      >
                        <img
                          src={url}
                          className="w-full h-full object-cover"
                          alt="preview"
                        />
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="absolute top-0.5 right-0.5 bg-white/90 p-1 rounded-full text-red-500 shadow-sm"
                        >
                          <X size={8} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="h-[8rem] bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-6 text-black shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="text-[#C5A059]" size={18} />
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">
                    Prep Timeline
                  </span>
                </div>
                <input
                  type="range"
                  name="preparationTime"
                  min="5"
                  max="60"
                  step="5"
                  value={formData.preparationTime}
                  onChange={handleChange}
                  className="w-full accent-[#C5A059] mb-3"
                />
                <div className="flex justify-between items-center">
                  <span className="text-xl sm:text-2xl font-light">
                    {formData.preparationTime}{" "}
                    <span className="text-[10px] uppercase text-slate-400">
                      min
                    </span>
                  </span>
                  <ChefHat size={18} className="text-slate-600" />
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center pt-4 sm:pt-2"
          >
            <button
              type="submit"
              disabled={uploading}
              className="group relative overflow-hidden w-full max-w-md bg-[#C5A059] text-white py-4 sm:py-5 rounded-full font-bold tracking-[0.2em] sm:tracking-[0.3em] uppercase text-[10px] sm:text-xs flex justify-center items-center gap-3 hover:bg-[#000] transition-all duration-500 shadow-xl disabled:opacity-50"
            >
              <div className="absolute inset-0 w-1/4 h-full bg-white/5 skew-x-[45deg] -translate-x-full group-hover:translate-x-[400%] transition-transform duration-1000" />
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  <span>Encrypting Recipe...</span>
                </>
              ) : (
                <>
                  <Upload size={14} />
                  <span>Publish to Menu</span>
                </>
              )}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
