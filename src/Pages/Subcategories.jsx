import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  ArrowLeft,
  Loader2,
  ChefHat,
  LayoutGrid,
  ChevronRight,
  Layers,
} from "lucide-react";
import {
  getCategories,
  getSubCategories,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
} from "@/api/services/dining.service";

export default function SubCategories() {
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const { data: subcategories = [], isLoading } = useQuery({
    queryKey: ["subcategories"],
    queryFn: getSubCategories,
  });

  const resetForm = useCallback(() => {
    setName("");
    setCategory("");
    setEditing(null);
  }, []);

  const createMutation = useMutation({
    mutationFn: createSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["subcategories"]);
      toast.success("Sub-category added");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateSubCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["subcategories"]);
      toast.success("Changes saved");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSubCategory,
    onMutate: () => toast.loading("Removing...", { id: "del-sub" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["subcategories"]);
      toast.success("Sub-category removed", { id: "del-sub" });
    },
    onError: () => toast.error("Error deleting", { id: "del-sub" }),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Enter a name");
    if (!category) return toast.error("Select a parent category");

    const payload = { name, category, isActive: true, sortOrder: 0 };

    if (editing) {
      updateMutation.mutate({ id: editing, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = useMemo(() => ({
    initial: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95 },
  }), [shouldReduceMotion]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5A059] opacity-20" />
          <ChefHat className="absolute w-6 h-6 text-[#C5A059]" />
        </div>
        <p className="mt-4 text-[#C5A059] font-medium tracking-[0.3em] uppercase text-[10px]">
          Loading Menu
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D2D2D] selection:bg-[#C5A059]/20 pb-20 overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          className: "text-sm font-sans font-medium rounded-2xl shadow-2xl border border-slate-100",
          duration: 4000,
          style: { background: "#FFF", color: "#2D2D2D", padding: "16px 24px" },
        }}
      />

      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-12">
        <nav className="mb-8 lg:mb-12">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-3 text-slate-400 hover:text-[#C5A059] transition-all"
          >
            <div className="p-2 rounded-full bg-slate-100 group-hover:bg-[#C5A059]/10 transition-colors">
              <ArrowLeft size={18} />
            </div>
          </button>
        </nav>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-[2px] w-8 bg-[#C5A059]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
                Menu Structure
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-slate-900">
              Sub{" "}
              <span className="text-[#C5A059] font-serif italic">Categories</span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm md:min-w-[200px]">
            <div className="p-2.5 bg-[#C5A059]/10 rounded-xl">
              <LayoutGrid size={22} className="text-[#C5A059]" />
            </div>
            <div>
              <span className="block text-slate-400 text-[9px] font-bold tracking-widest uppercase mb-0.5">
                Total Sub-Items
              </span>
              <span className="text-slate-900 font-bold text-2xl tabular-nums leading-none">
                {subcategories.length}
              </span>
            </div>
          </div>
        </header>

        <section className="max-w-4xl mx-auto mb-16 lg:mb-24">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex flex-col lg:flex-row gap-2">
              <div className="flex-1 flex items-center px-6 py-4 bg-slate-50 rounded-[1.5rem] focus-within:ring-2 ring-[#C5A059]/20 focus-within:bg-white transition-all">
                <UtensilsCrossed className="text-[#C5A059]/40 w-5 h-5 mr-4" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sub-category Name"
                  className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300"
                />
              </div>

              <div className="flex-1 flex items-center px-6 py-4 bg-slate-50 rounded-[1.5rem] focus-within:ring-2 ring-[#C5A059]/20 focus-within:bg-white transition-all">
                <Layers className="text-[#C5A059]/40 w-5 h-5 mr-4" />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-transparent outline-none text-slate-700 font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select Parent Category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isMutating}
                className="whitespace-nowrap flex items-center justify-center gap-3 px-8 h-[60px] lg:h-auto rounded-[1.5rem] bg-[#C5A059] text-white hover:bg-[#B38F4D] transition-all duration-300 shadow-lg disabled:opacity-50 active:scale-95 outline-none"
              >
                {isMutating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <span className="text-xs font-bold tracking-widest uppercase">
                      {editing ? "Save" : "Create"}
                    </span>
                    {editing ? <ChevronRight size={16} /> : <Plus size={16} />}
                  </>
                )}
              </button>
            </div>
            {editing && (
              <div className="px-6 py-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:underline"
                >
                  Cancel Edit
                </button>
              </div>
            )}
          </form>
        </section>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {subcategories.map((sub) => (
              <motion.div
                key={sub._id}
                layout={!shouldReduceMotion}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="group flex flex-col bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
              >
                <div className="p-8 flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-[#C5A059]/10 text-[#C5A059] text-[9px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                      {sub.category?.name || "Uncategorized"}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-medium text-slate-800 mb-8 line-clamp-2 min-h-[3.5rem]">
                    {sub.name}
                  </h3>

                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(sub._id);
                        setName(sub.name);
                        setCategory(sub.category?._id || "");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-500 hover:bg-[#C5A059] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${sub.name}"?`)) {
                          deleteMutation.mutate(sub._id);
                        }
                      }}
                      className="p-3.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {subcategories.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ChefHat className="text-slate-200 w-10 h-10" />
            </div>
            <h3 className="text-xl font-medium text-slate-400 mb-2">No Sub-categories</h3>
            <p className="text-slate-300 text-sm max-w-xs mx-auto font-sans">
              Add your first sub-category using the form above.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}