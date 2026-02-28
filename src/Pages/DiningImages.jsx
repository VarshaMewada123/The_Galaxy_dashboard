import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom"; // Redirect ke liye
import axiosClient from "@/api/axiosClient";
import {
  Loader2, Plus, UtensilsCrossed, 
  ChevronRight, IndianRupee
} from "lucide-react";
import { motion } from "framer-motion";

export default function DiningImages() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [menuRes, catRes] = await Promise.all([
        axiosClient.get("/admin/dining/menu"),
        axiosClient.get("/admin/dining/categories")
      ]);
      setCategories(catRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
    } catch (err) {
      console.error("Data Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredItems = useMemo(() => {
    if (activeCategory === "All") return menuItems;
    return menuItems.filter(item => item.category?.name === activeCategory);
  }, [menuItems, activeCategory]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-black p-2 rounded-lg text-white"><UtensilsCrossed size={20} /></div>
          <h1 className="text-2xl font-black">Menu Control</h1>
        </div>
        {/* Redirect to Add Page */}
        <button 
          onClick={() => navigate("/admin/dining/add-item")} 
          className="bg-[#C4A15A] text-white px-6 py-2.5 rounded-2xl font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} /> Add Item
        </button>
      </div>

      {/* CIRCULAR CATEGORY NAV */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex items-center gap-8 overflow-x-auto pb-4 no-scrollbar">
          <CategoryCircle 
            name="All" 
            isActive={activeCategory === "All"} 
            onClick={() => setActiveCategory("All")} 
          />
          {categories.map((cat) => (
            <CategoryCircle 
              key={cat._id}
              name={cat.name}
              image={cat.image?.url}
              isActive={activeCategory === cat.name}
              onClick={() => setActiveCategory(cat.name)}
            />
          ))}
        </div>
      </div>

      {/* ITEMS GRID */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#C4A15A]" size={40} /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <motion.div 
                layout
                key={item._id} 
                className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all"
              >
                <div className="aspect-square overflow-hidden relative">
                  <img src={item.images?.[0]?.url || "https://placehold.co/400"} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full font-black text-sm text-[#C4A15A]">
                    ₹{item.basePrice}
                  </div>
                </div>
                <div className="p-6">
                  <p className="font-bold text-gray-800 truncate">{item.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{item.category?.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable Circle Component
function CategoryCircle({ name, image, isActive, onClick }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer min-w-[80px]">
      <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all ${isActive ? "border-[#C4A15A] scale-110 shadow-lg" : "border-transparent opacity-60"}`}>
        {image ? (
          <img src={image} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 uppercase font-black text-xs">{name[0]}</div>
        )}
      </div>
      <span className={`text-[10px] font-black uppercase tracking-tighter ${isActive ? "text-black" : "text-gray-400"}`}>{name}</span>
    </div>
  );
}