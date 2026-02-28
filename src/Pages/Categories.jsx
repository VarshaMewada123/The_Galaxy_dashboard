import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, UtensilsCrossed, X, Loader2, ChefHat, LayoutGrid, Image as ImageIcon } from "lucide-react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/api/services/dining.service";

export default function Categories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => { 
      queryClient.invalidateQueries(["categories"]); 
      resetForm(); 
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Something went wrong");
    }
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => { 
      queryClient.invalidateQueries(["categories"]); 
      resetForm(); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries(["categories"]),
  });

  const resetForm = () => {
    setName("");
    setImage(null);
    setPreview(null);
    setEditing(null);
    // Cleanup blob URL memory
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // IMPORTANT: Use FormData for file uploads
    const formData = new FormData();
    formData.append("name", name);
    formData.append("isActive", "true"); // Default value to prevent undefined
    formData.append("sortOrder", "0");   // Default value
    
    if (image) {
      formData.append("image", image); // Field name must match upload.single("image")
    }

    if (editing) {
      updateMutation.mutate({ id: editing, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#FDFDFD]">
        <div className="relative mb-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#C5A059]" />
          <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A059]" />
        </div>
        <p className="text-[#C5A059] font-medium tracking-[0.2em] uppercase text-[10px] animate-pulse">Setting the Table</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#2D2D2D] selection:bg-[#C5A059]/20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-[2px] w-6 bg-[#C5A059]" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-[#C5A059]">Cuisine Architecture</span>
            </div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900">Menu <span className="font-serif italic text-[#C5A059] font-medium">Categories</span></h1>
          </motion.div>
          <div className="inline-flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <LayoutGrid size={14} className="text-[#C5A059] mr-2" />
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">Live Sections: <span className="text-slate-900 ml-1">{categories.length}</span></p>
          </div>
        </header>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1 flex items-center pl-4 bg-slate-50 rounded-xl border border-slate-100">
                <UtensilsCrossed className="text-slate-300 w-4 h-4 mr-3" />
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter category name..." className="w-full bg-transparent py-3 outline-none text-slate-700 font-medium text-sm placeholder:text-slate-300" />
              </div>
              <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl hover:border-[#C5A059] transition-colors group">
                <ImageIcon size={16} className="text-slate-400 group-hover:text-[#C5A059]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            </div>
            {preview && (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border-2 border-[#C5A059]/20">
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => { setImage(null); setPreview(null); }} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"><X size={14} /></button>
              </div>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-50 pt-2">
              {editing && <button type="button" onClick={resetForm} className="px-4 py-2 text-slate-400 hover:text-red-500 text-[11px] font-bold uppercase tracking-widest transition-colors">Cancel</button>}
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="whitespace-nowrap flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#C5A059] text-white hover:bg-[#2D2D2D] transition-all duration-300 shadow-md disabled:opacity-50 active:scale-95">
                {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span className="text-[11px] font-bold tracking-widest uppercase">{editing ? "Update Category" : "Add Category"}</span>{!editing && <Plus size={14} />}</>}
              </button>
            </div>
          </form>
        </motion.div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {categories.map((cat, index) => (
              <motion.div key={cat._id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="group bg-white border border-slate-200/60 rounded-2xl overflow-hidden hover:border-[#C5A059]/40 hover:shadow-xl transition-all duration-300 relative">
                <div className="relative h-40 w-full overflow-hidden bg-slate-100">
                  {cat.image?.url ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" /> : <div className="w-full h-full flex items-center justify-center"><ChefHat className="w-10 h-10 text-slate-200" /></div>}
                  <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/20 backdrop-blur-md px-2 py-1 rounded-md"><span className="text-[9px] font-black text-white tracking-tighter">#{String(index + 1).padStart(2, "0")}</span></div>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-800 mb-6 line-clamp-1 group-hover:translate-x-1 transition-transform">{cat.name}</h3>
                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                    <button onClick={() => { setEditing(cat._id); setName(cat.name); setPreview(cat.image?.url); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-500 hover:bg-[#C5A059] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"><Pencil size={12} /> Edit</button>
                    <button onClick={() => { if (confirm("Delete?")) deleteMutation.mutate(cat._id); }} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}