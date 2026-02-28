import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import axiosClient from "@/api/axiosClient";
import { Loader2, Upload, ChevronLeft, ImagePlus, X, Utensils, IndianRupee, Clock } from "lucide-react";

export default function AddMenuItem() {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    basePrice: "",
    isVeg: true,
    preparationTime: 15,
    spiceLevel: "MEDIUM",
    description: "",
  });

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await axiosClient.get("/admin/dining/categories");
        const data = res.data.data || [];
        setCategories(data);
        if (data.length > 0) setFormData(p => ({ ...p, category: data[0]._id }));
      } catch (err) { console.error(err); }
      finally { setLoadingCats(false); }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const urls = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach(url => URL.revokeObjectURL(url));
  }, [selectedFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => fd.append(key, formData[key]));
      selectedFiles.forEach(file => fd.append("images", file));

      await axiosClient.post("/admin/dining/menu", fd);
      navigate("/admin/dining/images"); 
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create");
    } finally { setUploading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-6 lg:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <header className="flex items-center gap-4 mb-10">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border rounded-2xl hover:border-[#C5A059] transition-all"><ChevronLeft size={20}/></button>
          <div>
            <h1 className="text-3xl font-black text-gray-900">New <span className="italic font-serif text-[#C5A059]">Creation</span></h1>
            <p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Menu Registry</p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Utensils className="absolute left-4 top-4 text-gray-300" size={18} />
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Dish Name" className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none focus:ring-2 focus:ring-[#C5A059]" required />
                </div>
                
                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Describe the taste and ingredients..." className="w-full bg-gray-50 p-4 rounded-2xl h-32 outline-none focus:ring-2 focus:ring-[#C5A059] resize-none" />

                <div className="grid grid-cols-2 gap-4">
                  <select name="category" value={formData.category} onChange={handleChange} className="bg-gray-50 p-4 rounded-2xl outline-none font-bold">
                    {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-4 text-gray-300" size={18} />
                    <input type="number" name="basePrice" value={formData.basePrice} onChange={handleChange} placeholder="Price" className="w-full bg-gray-50 p-4 pl-12 rounded-2xl outline-none font-bold text-[#C4A15A]" required />
                  </div>
                </div>
              </div>
            </div>

            {/* Veg & Spice Selection */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 grid grid-cols-2 gap-8">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Dietary Preference</p>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="isVeg" checked={formData.isVeg} onChange={handleChange} className="sr-only" />
                    <div className={`w-12 h-6 rounded-full transition-all relative ${formData.isVeg ? 'bg-green-500' : 'bg-gray-200'}`}>
                       <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isVeg ? 'translate-x-6' : ''}`} />
                    </div>
                    <span className="font-bold text-sm uppercase">{formData.isVeg ? 'Veg' : 'Non-Veg'}</span>
                  </label>
               </div>
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Spice Level</p>
                  <div className="flex gap-2">
                    {["MILD", "MEDIUM", "SPICY"].map(lvl => (
                      <button key={lvl} type="button" onClick={() => setFormData(p => ({...p, spiceLevel: lvl}))} className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${formData.spiceLevel === lvl ? 'bg-[#C4A15A] text-white shadow-lg' : 'bg-gray-100 text-gray-400'}`}>{lvl}</button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          {/* Sidebar: Images & Prep Time */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
               <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Visuals</p>
               <div className="aspect-square relative border-2 border-dashed border-gray-100 rounded-3xl flex flex-col items-center justify-center bg-gray-50 hover:bg-yellow-50 cursor-pointer transition-all">
                  <ImagePlus className="text-gray-300 mb-2" size={32} />
                  <span className="text-[9px] font-black text-gray-400 uppercase">Drop photos here</span>
                  <input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)])} />
               </div>
               <div className="grid grid-cols-3 gap-2 mt-4">
                  {previews.map((url, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group">
                      <img src={url} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setSelectedFiles(selectedFiles.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-all"><X size={10}/></button>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
               <div className="flex items-center gap-2 mb-4"><Clock size={16} className="text-[#C4A15A]" /><span className="text-[10px] font-black uppercase tracking-widest">Prep Time</span></div>
               <input type="range" name="preparationTime" min="5" max="60" step="5" value={formData.preparationTime} onChange={handleChange} className="w-full accent-[#C4A15A]" />
               <div className="text-2xl font-black mt-2">{formData.preparationTime} <span className="text-xs text-gray-400">MINS</span></div>
            </div>

            <button type="submit" disabled={uploading} className="w-full bg-black text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-[#C4A15A] transition-all active:scale-95 disabled:bg-gray-300">
               {uploading ? <Loader2 className="animate-spin mx-auto" /> : "Publish Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}