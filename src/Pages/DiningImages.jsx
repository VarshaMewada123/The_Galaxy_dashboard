import React, { useState, useEffect, useMemo, useCallback } from "react";
import axiosClient from "@/api/axiosClient";
import { Loader2, ChevronLeft, LayoutGrid } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";

export default function DiningImages() {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSubCategory, setActiveSubCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  // ✅ Safe ID extractor
  const getId = (field) => {
    if (!field) return null;
    return typeof field === "object" ? field?._id : field;
  };

  // ✅ Ultra-safe image handler (array + object support)
  const getImageUrl = (item) => {
    if (Array.isArray(item?.images)) return item.images[0]?.url;
    if (typeof item?.images === "object") return item.images?.url;
    return null;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [menuRes, catRes, subRes] = await Promise.all([
        axiosClient.get("/admin/dining/menu"),
        axiosClient.get("/admin/dining/categories"),
        axiosClient.get("/admin/dining/subcategories"),
      ]);

      setMenuItems(
        Array.isArray(menuRes?.data?.data?.data)
          ? menuRes.data.data.data
          : []
      );

      setCategories(
        Array.isArray(catRes?.data?.data) ? catRes.data.data : []
      );

      setSubcategories(
        Array.isArray(subRes?.data?.data) ? subRes.data.data : []
      );

    } catch (err) {
      toast.error("Failed to sync dining data");
      setMenuItems([]);
      setCategories([]);
      setSubcategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ✅ Filter subcategories
  const filteredSubCategories = useMemo(() => {
    if (!Array.isArray(subcategories)) return [];
    if (activeCategory === "All") return subcategories;

    return subcategories.filter(
      (sub) => getId(sub.category) === activeCategory
    );
  }, [subcategories, activeCategory]);

  // ✅ Filter menu items
  const filteredItems = useMemo(() => {
    if (!Array.isArray(menuItems)) return [];

    let items = menuItems;

    if (activeCategory !== "All") {
      items = items.filter(
        (item) => getId(item?.subCategory?.category) === activeCategory
      );
    }

    if (activeSubCategory !== "All") {
      items = items.filter(
        (item) => getId(item?.subCategory) === activeSubCategory
      );
    }

    return items;
  }, [menuItems, activeCategory, activeSubCategory]);

  // ✅ Button component
  const FilterButton = ({ active, onClick, children }) => (
    <button
      onClick={onClick}
      className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap border cursor-pointer ${
        active
          ? "bg-[#C6A45C] border-[#C6A45C] text-white shadow-md transform scale-105"
          : "bg-white border-gray-200 text-gray-600 hover:border-[#C6A45C] hover:text-[#C6A45C]"
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="min-h-screen bg-[#FDFCF9] text-gray-900 font-sans selection:bg-[#C6A45C]/20">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
            border: "1px solid #C6A45C",
          },
        }}
      />

      {/* HEADER */}
      <header className="top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 sm:h-20 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-1.5 text-gray-600 hover:text-[#C6A45C]"
          >
            <ChevronLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm font-medium uppercase tracking-wider">
              Back
            </span>
          </button>

          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[#C6A45C]" />
            <h1 className="text-base sm:text-lg font-bold uppercase">
              Dining Gallery
            </h1>
          </div>

          <div className="w-16 hidden sm:block" />
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {/* FILTERS */}
        <section className="space-y-6 mb-10">
          <div className="flex flex-col gap-4">
            {/* Categories */}
          <div className="flex gap-2 overflow-x-auto py-3 px-1 -mx-1 no-scrollbar">
              <FilterButton
                active={activeCategory === "All"}
                onClick={() => {
                  setActiveCategory("All");
                  setActiveSubCategory("All");
                }}
              >
                All
              </FilterButton>

              {categories.map((cat) => (
                <FilterButton
                  key={cat._id}
                  active={activeCategory === cat._id}
                  onClick={() => {
                    setActiveCategory(cat._id);
                    setActiveSubCategory("All");
                  }}
                >
                  {cat.name}
                </FilterButton>
              ))}
            </div>

            {/* Subcategories */}
            <div className="flex gap-2 overflow-x-auto py-3 px-1 -mx-1 no-scrollbar border-t pt-4">
              <FilterButton
                active={activeSubCategory === "All"}
                onClick={() => setActiveSubCategory("All")}
              >
                All Sub-Types
              </FilterButton>

              {filteredSubCategories.map((sub) => (
                <FilterButton
                  key={sub._id}
                  active={activeSubCategory === sub._id}
                  onClick={() => setActiveSubCategory(sub._id)}
                >
                  {sub.name}
                </FilterButton>
              ))}
            </div>
          </div>
        </section>

        {/* LOADING */}
        {loading ? (
          <div className="flex flex-col items-center py-32 gap-4">
            <Loader2 className="animate-spin text-[#C6A45C]" size={40} />
            <p className="text-gray-400 text-sm">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <LayoutGrid className="text-gray-300 mx-auto mb-3" size={32} />
                <h3 className="text-gray-500">No menu items found</h3>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="group bg-white rounded-2xl overflow-hidden border shadow-sm hover:shadow-xl transition"
                >
                  <div className="relative aspect-[4/3] bg-gray-100">
                    {/* ✅ FIXED IMAGE */}
                    <img
                      src={
                        getImageUrl(item) ||
                        "https://placehold.co/600x400?text=No+Image"
                      }
                      alt={item?.name || "Dining Item"}
                      className="w-full h-full object-cover group-hover:scale-110 transition"
                      loading="lazy"
                    />

                    <div className="absolute top-3 right-3">
                      <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-[#C6A45C]">
                        {item?.subCategory?.name || "Dining"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-bold">{item?.name}</h3>

                    <div className="mt-3 flex justify-between">
                      <span className="text-xs text-gray-400">
                        Base Price
                      </span>
                      <span className="font-bold">
                        ₹{item?.basePrice?.toLocaleString("en-IN") || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* SCROLLBAR HIDE */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}