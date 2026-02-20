import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  X,
  Loader2,
  Sparkles,
  ChefHat,
  LayoutGrid,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/services/dining.service";

export default function Categories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
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
      setName("");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      setEditing(null);
      setName("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => queryClient.invalidateQueries(["categories"]),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    editing
      ? updateMutation.mutate({ id: editing, payload: { name } })
      : createMutation.mutate({ name });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-[#FDFDFD]">
        <div className="relative mb-4">
          <Loader2 className="w-10 h-10 animate-spin text-[#C5A059]" />
          <ChefHat className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 text-[#C5A059]" />
        </div>
        <p className="text-[#C5A059] font-medium tracking-[0.2em] uppercase text-[10px] animate-pulse">
          Setting the Table
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F8F8] text-[#2D2D2D] selection:bg-[#C5A059]/20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 lg:py-12">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="h-[2px] w-6 bg-[#C5A059]" />
              <span className="text-[9px] uppercase tracking-[0.4em] font-black text-[#C5A059]">
                Cuisine Architecture
              </span>
            </div>
            <h1 className="text-4xl font-light tracking-tight text-slate-900">
              Menu{" "}
              <span className="font-serif italic text-[#C5A059] font-medium">
                Categories
              </span>
            </h1>
          </motion.div>

          <div className="inline-flex items-center bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
            <LayoutGrid size={14} className="text-[#C5A059] mr-2" />
            <p className="text-slate-500 text-[10px] font-bold tracking-widest uppercase">
              Live Sections:{" "}
              <span className="text-slate-900 ml-1">{categories.length}</span>
            </p>
          </div>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)] border border-slate-200">
              <div className="relative flex-1 flex items-center pl-4">
                <UtensilsCrossed className="text-slate-300 w-4 h-4 mr-3" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter category name..."
                  className="w-full bg-transparent py-3 outline-none text-slate-700 font-medium text-sm placeholder:text-slate-300"
                />
              </div>

              <div className="flex gap-1">
                {editing && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(null);
                      setName("");
                    }}
                    className="px-3 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
                <button
                  type="submit"
                  disabled={
                    createMutation.isPending || updateMutation.isPending
                  }
                  className="whitespace-nowrap flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#C5A059] text-white hover:bg-[#2D2D2D] transition-all duration-300 shadow-md disabled:opacity-50 active:scale-95"
                >
                  {createMutation.isPending || updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span className="text-[11px] font-bold tracking-widest uppercase">
                        {editing ? "Save Changes" : "Add Category"}
                      </span>
                      {!editing && <Plus size={14} />}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {categories.map((cat, index) => (
              <motion.div
                key={cat._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group bg-white border border-slate-200/60 rounded-2xl p-5 hover:border-[#C5A059]/40 hover:shadow-xl hover:shadow-[#C5A059]/5 transition-all duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full bg-[#C5A059] transition-all duration-300" />

                <div className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-[#C5A059] transition-colors duration-300">
                      <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] font-black text-slate-200 group-hover:text-[#C5A059]/30 tracking-tighter">
                      #{String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-800 mb-6 line-clamp-1 group-hover:translate-x-1 transition-transform">
                    {cat.name}
                  </h3>

                  <div className="flex items-center gap-2 mt-auto pt-4 border-t border-slate-50">
                    <button
                      onClick={() => {
                        setEditing(cat._id);
                        setName(cat.name);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-slate-50 text-slate-500 hover:bg-[#C5A059] hover:text-white rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Delete this category?"))
                          deleteMutation.mutate(cat._id);
                      }}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        {categories.length === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-200 rounded-[2rem] bg-white/50"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4 border border-slate-100">
              <ChefHat size={28} className="text-slate-200" />
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">
              No Categories Found
            </h3>
            <p className="text-slate-300 text-xs mt-1">
              Ready to create your first culinary masterpiece?
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
