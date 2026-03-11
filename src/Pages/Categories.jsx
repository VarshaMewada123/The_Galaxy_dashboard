import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Pencil,
  Trash2,
  UtensilsCrossed,
  X,
  Loader2,
  ChefHat,
  LayoutGrid,
  Image as ImageIcon,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/api/services/dining.service";

export default function Categories() {
  const queryClient = useQueryClient();
  const shouldReduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [editing, setEditing] = useState(null);
  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetForm = useCallback(() => {
    setName("");
    setImage(null);
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setEditing(null);
  }, [preview]);
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category added to menu");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateCategory,
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Changes saved successfully");
      resetForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onMutate: () =>
      toast.loading("Removing category...", { id: "delete-toast" }),
    onSuccess: () => {
      queryClient.invalidateQueries(["categories"]);
      toast.success("Category removed", { id: "delete-toast" });
    },
    onError: () => {
      toast.error("Could not delete category", { id: "delete-toast" });
    },
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Please enter a category name");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("isActive", "true");
    formData.append("sortOrder", "0");
    if (image) formData.append("image", image);

    if (editing) {
      updateMutation.mutate({ id: editing, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const itemVariants = useMemo(
    () => ({
      initial: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, scale: 0.95 },
    }),
    [shouldReduceMotion],
  );

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
        <div className="relative flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#C5A059] opacity-20" />
          <ChefHat className="absolute w-6 h-6 text-[#C5A059]" />
        </div>
        <p className="mt-4 text-[#C5A059] font-medium tracking-[0.3em] uppercase text-[10px]">
          Loading Kitchen
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#2D2D2D] selection:bg-[#C5A059]/20 pb-20 overflow-x-hidden">
      <Toaster
        position="top-right"
        toastOptions={{
          className:
            "text-sm font-sans font-medium rounded-2xl shadow-2xl border border-slate-100",
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
            <span className="text-[10px] uppercase tracking-widest font-bold"></span>
          </button>
        </nav>
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 lg:mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-[2px] w-8 bg-[#C5A059]" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#C5A059] font-bold">
                Culinary Collection
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-slate-900">
              Menu{" "}
              <span className="text-[#C5A059] font-serif italic">
                Categories
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm md:min-w-[200px]">
            <div className="p-2.5 bg-[#C5A059]/10 rounded-xl">
              <LayoutGrid size={22} className="text-[#C5A059]" />
            </div>
            <div>
              <span className="block text-slate-400 text-[9px] font-bold tracking-widest uppercase mb-0.5">
                Total Sections
              </span>
              <span className="text-slate-900 font-bold text-2xl tabular-nums leading-none">
                {categories.length}
              </span>
            </div>
          </div>
        </header>
        <section className="max-w-4xl mx-auto mb-16 lg:mb-24">
          <form
            onSubmit={handleSubmit}
            className="bg-white p-2 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100"
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col lg:flex-row gap-2">
                <div className="flex-1 flex items-center px-6 py-4 bg-slate-50 rounded-[1.5rem] focus-within:ring-2 ring-[#C5A059]/20 focus-within:bg-white transition-all">
                  <UtensilsCrossed className="text-[#C5A059]/40 w-5 h-5 mr-4" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Signature Mains"
                    className="w-full bg-transparent outline-none text-slate-700 font-medium placeholder:text-slate-300"
                  />
                </div>
                <div className="flex flex-row gap-2 h-[60px] lg:h-auto">
                  <label className="flex-1 lg:flex-none cursor-pointer flex items-center justify-center gap-3 px-6 bg-white border border-slate-100 rounded-[1.5rem] hover:border-[#C5A059] hover:bg-[#C5A059]/5 transition-all group active:scale-95">
                    <ImageIcon
                      size={20}
                      className="text-slate-400 group-hover:text-[#C5A059]"
                    />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isMutating}
                    className="flex-[2] lg:flex-none whitespace-nowrap flex items-center justify-center gap-3 px-8 rounded-[1.5rem] bg-[#C5A059] text-white hover:bg-[#C5A059] transition-all duration-300 shadow-lg disabled:opacity-50 active:scale-95 outline-none"
                  >
                    {isMutating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <span className="text-xs font-bold tracking-widest uppercase">
                          {editing ? "Save Changes" : "Create Category"}
                        </span>
                        {editing ? (
                          <ChevronRight size={16} />
                        ) : (
                          <Plus size={16} />
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="relative aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-100 group">
                        <img
                          src={preview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

                        <div className="absolute top-4 right-4 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setImage(null);
                              setPreview(null);
                            }}
                            className="p-3 bg-white/90 backdrop-blur text-red-500 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-lg active:scale-90"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {editing && (
                          <div className="absolute bottom-4 left-4">
                            <button
                              type="button"
                              onClick={resetForm}
                              className="px-6 py-2 bg-white rounded-full text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-all shadow-md"
                            >
                              Cancel Edit
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </form>
        </section>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {categories.map((cat, index) => (
              <motion.div
                key={cat._id}
                layout={!shouldReduceMotion}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="group flex flex-col bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500"
              >
                <div className="relative aspect-[5/4] w-full overflow-hidden bg-slate-50">
                  {cat.image?.url ? (
                    <img
                      src={cat.image.url}
                      alt={cat.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ChefHat className="w-12 h-12 text-slate-200" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-[#C5A059] border border-white/50 shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-8 flex flex-col flex-1">
                  <h3 className="text-xl font-medium text-slate-800 mb-6 line-clamp-1">
                    {cat.name}
                  </h3>

                  <div className="mt-auto flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditing(cat._id);
                        setName(cat.name);
                        setPreview(cat.image?.url);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-50 text-slate-500 hover:bg-[#C5A059] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
                    >
                      <Pencil size={14} /> Edit
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete "${cat.name}" category?`)) {
                          deleteMutation.mutate(cat._id);
                        }
                      }}
                      className="p-3.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
                      aria-label="Delete category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {categories.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <ChefHat className="text-slate-200 w-10 h-10" />
            </div>
            <h3 className="text-xl font-medium text-slate-400 mb-2">
              The Menu is Empty
            </h3>
            <p className="text-slate-300 text-sm max-w-xs mx-auto font-sans">
              Click the button above to add your first category.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
