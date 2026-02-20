import { useState, useEffect, useMemo } from "react";
import axiosClient from "@/api/axiosClient";
import {
  Loader2,
  Plus,
  Trash2,
  UtensilsCrossed,
  CheckSquare,
  X,
  ChevronRight,
  Zap,
  Edit3,
  Flame,
  Clock,
  ChevronLeft,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_MAP = {
  Starters: "698ecb03929a7b5884e69f7b",
  Burgers: "6992f9a23fb7d03ea072b5bd",
  "Main Course": "69930a803ddb72820b1a1f86",
  Desserts: "69930ac73ddb72820b1a1f88",
  Beverages: "69930adc3ddb72820b1a1f8a",
  Salads: "69930af33ddb72820b1a1f8c",
};

const CATEGORY_ORDER = [
  "Starters",
  "Burgers",
  "Main Course",
  "Salads",
  "Desserts",
  "Beverages",
];

export default function DiningImages() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bulkMode, setBulkMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    categoryName: "Burgers",
    category: CATEGORY_MAP["Burgers"],
    basePrice: "",
    isVeg: true,
    preparationTime: 15,
    spiceLevel: "MEDIUM",
    description: "",
  });

  const fetchMenu = async () => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/admin/dining/menu");
      setMenuItems(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const groupedMenu = useMemo(() => {
    const grouped = {};
    CATEGORY_ORDER.forEach((c) => (grouped[c] = []));
    menuItems.forEach((item) => {
      const catName = item.category?.name;
      if (catName && grouped[catName]) {
        grouped[catName].push(item);
      }
    });
    return grouped;
  }, [menuItems]);

  const handleCategoryChange = (e) => {
    const name = e.target.value;
    setFormData((p) => ({
      ...p,
      categoryName: name,
      category: CATEGORY_MAP[name],
    }));
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => fd.append(key, formData[key]));
      selectedFiles.forEach((file) => fd.append("images", file));

      if (isEditing && selectedItem) {
        await axiosClient.patch(`/admin/dining/menu/${selectedItem._id}`, fd);
      } else {
        await axiosClient.post("/admin/dining/menu", fd);
      }

      setUploading(false);
      setIsModalOpen(false);
      setIsDetailOpen(false);
      setIsEditing(false);
      setSelectedItem(null);
      setSelectedFiles([]);
      fetchMenu();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
      setUploading(false);
    }
  };

  const openItemDetails = (item) => {
    if (bulkMode) return;
    setSelectedItem(item);
    setIsDetailOpen(true);

    setFormData({
      name: item.name,
      categoryName: item.category?.name || "Burgers",
      category: item.category?._id || CATEGORY_MAP["Burgers"],
      basePrice: item.basePrice,
      isVeg: item.isVeg,
      preparationTime: item.preparationTime || 15,
      spiceLevel: item.spiceLevel || "MEDIUM",
      description: item.description || "",
    });
  };

  const runBulkAction = async (action) => {
    if (!selectedIds.length) return alert("Select items first");

    let payload = { ids: selectedIds, action };

    if (action.includes("Price")) {
      const isDecrease = action === "decreasePrice";
      const value = prompt(
        `Enter percentage to ${isDecrease ? "DECREASE" : "INCREASE"} (e.g. 10)`,
      );

      if (!value || isNaN(value)) return;

      payload.value = isDecrease
        ? -Math.abs(Number(value))
        : Math.abs(Number(value));

      payload.action = "updatePricePercentage";
    }

    try {
      await axiosClient.patch("/admin/dining/menu/bulk", payload);
      setBulkMode(false);
      setSelectedIds([]);
      fetchMenu();
    } catch (error) {
      alert("Bulk update failed.");
    }
  };

  const toggleAvailability = async (item) => {
    await axiosClient.patch(`/admin/dining/menu/${item._id}/availability`, {
      isAvailable: !item.isAvailable,
      reason: "MANUAL",
    });
    if (selectedItem)
      setSelectedItem({
        ...selectedItem,
        isAvailable: !selectedItem.isAvailable,
      });
    fetchMenu();
  };

  const archiveItem = async (id) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    await axiosClient.delete(`/admin/dining/menu/${id}`);
    setIsDetailOpen(false);
    fetchMenu();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-black p-2 rounded-lg text-white">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Menu Control
              </h1>
              <p className="text-gray-500 text-sm">Organize and manage items</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setBulkMode(!bulkMode);
                setSelectedIds([]);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${
                bulkMode
                  ? "bg-black text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
            >
              <CheckSquare size={18} />
              <span className="hidden sm:inline">Bulk Actions</span>
            </button>

            <button
              onClick={() => {
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-[#C4A15A] hover:bg-[#b89245] text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-yellow-900/10 active:scale-95 transition"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>
        </div>

        <AnimatePresence>
          {bulkMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <div className="mt-4 p-4 bg-white border rounded-2xl flex flex-wrap gap-3 items-center shadow-sm">
                <span className="text-sm font-bold text-gray-400 uppercase mr-2">
                  {selectedIds.length} Selected
                </span>

                <button
                  onClick={() => runBulkAction("increasePrice")}
                  className="flex items-center gap-1 bg-green-50 text-green-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-100 transition-colors"
                >
                  <TrendingUp size={16} /> Price %
                </button>

                <button
                  onClick={() => runBulkAction("decreasePrice")}
                  className="flex items-center gap-1 bg-orange-50 text-orange-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-100 transition-colors"
                >
                  <TrendingDown size={16} /> Price %
                </button>

                <button
                  onClick={() => runBulkAction("toggleAvailability")}
                  className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-colors"
                >
                  Toggle Status
                </button>

                <button
                  onClick={() => setSelectedIds([])}
                  className="text-gray-400 text-sm font-bold ml-auto px-4 hover:text-gray-600"
                >
                  Clear Selection
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#C4A15A] mb-4" size={40} />
            <p className="text-gray-400 font-medium tracking-wide">
              Fetching Culinary Delights...
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORY_ORDER.map((category) => {
              const items = groupedMenu[category];
              if (!items || items.length === 0) return null;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1 bg-[#C4A15A] rounded-full" />
                    <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter">
                      {category}
                    </h2>
                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                      {items.length}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((item) => (
                      <motion.div
                        key={item._id}
                        layoutId={item._id}
                        onClick={() => openItemDetails(item)}
                        className={`group bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all cursor-pointer relative ${!item.isAvailable ? "grayscale-[0.5] opacity-80" : ""}`}
                      >
                        <div className="relative aspect-square overflow-hidden">
                          {bulkMode && (
                            <div
                              className="absolute top-4 left-4 z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(item._id)}
                                onChange={() => {
                                  setSelectedIds((prev) =>
                                    prev.includes(item._id)
                                      ? prev.filter((i) => i !== item._id)
                                      : [...prev, item._id],
                                  );
                                }}
                                className="w-6 h-6 rounded-lg accent-black cursor-pointer"
                              />
                            </div>
                          )}
                          <img
                            src={
                              item.images?.[0] ||
                              "https://placehold.co/400x400?text=No+Image"
                            }
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            alt={item.name}
                          />
                          {!item.isAvailable && (
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-white text-black px-4 py-1 rounded-full font-black text-xs uppercase tracking-widest">
                                Sold Out
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900 text-lg leading-tight line-clamp-1">
                              {item.name}
                            </h3>
                            <div
                              className={`shrink-0 w-4 h-4 rounded-sm border ${item.isVeg ? "border-green-600" : "border-red-600"} flex items-center justify-center p-[2px]`}
                            >
                              <div
                                className={`w-full h-full rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`}
                              />
                            </div>
                          </div>
                          <p className="text-[#C4A15A] font-black text-xl">
                            ₹{item.basePrice}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isDetailOpen && selectedItem && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              layoutId={selectedItem._id}
              className="relative bg-white w-full max-w-4xl h-[90vh] md:h-auto rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto bg-gray-100 relative">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="absolute top-4 left-4 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-md p-2 rounded-full text-white md:hidden"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
                  {selectedItem.images?.length > 0 ? (
                    selectedItem.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        className="w-full h-full object-cover shrink-0 snap-center"
                        alt=""
                      />
                    ))
                  ) : (
                    <img
                      src="https://placehold.co/600x600?text=No+Image"
                      className="w-full h-full object-cover shrink-0"
                      alt=""
                    />
                  )}
                </div>
                {selectedItem.images?.length > 1 && (
                  <div className="absolute bottom-4 right-4 bg-black/50 px-3 py-1 rounded-full text-[10px] text-white font-bold">
                    Scroll for more →
                  </div>
                )}
              </div>

              <div className="flex-1 p-6 md:p-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#C4A15A] mb-1 block">
                      {selectedItem.category?.name}
                    </span>
                    <h2 className="text-3xl font-black text-gray-900 leading-none">
                      {selectedItem.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="hidden md:block p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <Flame size={14} /> {selectedItem.spiceLevel || "MEDIUM"}
                  </div>
                  <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl text-xs font-bold">
                    <Clock size={14} /> {selectedItem.preparationTime || 15}{" "}
                    MINS
                  </div>
                  <div
                    className={`w-5 h-5 rounded-sm border ${selectedItem.isVeg ? "border-green-600" : "border-red-600"} flex items-center justify-center p-[2px]`}
                  >
                    <div
                      className={`w-full h-full rounded-full ${selectedItem.isVeg ? "bg-green-600" : "bg-red-600"}`}
                    />
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                  {selectedItem.description ||
                    "No description provided for this item. Perfectly crafted for a premium dining experience."}
                </p>

                <div className="mt-auto pt-6 border-t">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-gray-400 font-bold uppercase text-xs">
                      Base Price
                    </span>
                    <span className="text-3xl font-black text-gray-900">
                      ₹{selectedItem.basePrice}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => toggleAvailability(selectedItem)}
                      className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${selectedItem.isAvailable ? "border-green-100 bg-green-50 text-green-700" : "border-red-100 bg-red-50 text-red-700"}`}
                    >
                      <Zap
                        size={20}
                        className={
                          selectedItem.isAvailable ? "fill-green-700" : ""
                        }
                      />
                      <span className="text-[10px] font-bold mt-1 uppercase">
                        {selectedItem.isAvailable ? "Online" : "Offline"}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsModalOpen(true);
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-gray-100 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      <Edit3 size={20} />
                      <span className="text-[10px] font-bold mt-1 uppercase">
                        Edit
                      </span>
                    </button>
                    <button
                      onClick={() => archiveItem(selectedItem._id)}
                      className="flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-red-50 bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={20} />
                      <span className="text-[10px] font-bold mt-1 uppercase">
                        Delete
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <h2 className="text-xl font-black text-gray-800">
                  {isEditing ? "Update Item" : "Create New Item"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                onSubmit={handleCreateOrUpdate}
                className="p-6 space-y-4 max-h-[75vh] overflow-y-auto no-scrollbar"
              >
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                    Item Title
                  </label>
                  <input
                    name="name"
                    placeholder="Name of dish..."
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none focus:ring-2 focus:ring-[#C4A15A] font-bold"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                      Category
                    </label>
                    <select
                      value={formData.categoryName}
                      onChange={handleCategoryChange}
                      className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none appearance-none font-bold"
                    >
                      {Object.keys(CATEGORY_MAP).map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      name="basePrice"
                      value={formData.basePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, basePrice: e.target.value })
                      }
                      className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none font-bold text-[#C4A15A]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                      Dietary
                    </label>
                    <select
                      value={formData.isVeg}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isVeg: e.target.value === "true",
                        })
                      }
                      className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none font-bold"
                    >
                      <option value="true">VEG</option>
                      <option value="false">NON-VEG</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                      Spice Level
                    </label>
                    <select
                      value={formData.spiceLevel}
                      onChange={(e) =>
                        setFormData({ ...formData, spiceLevel: e.target.value })
                      }
                      className="w-full bg-gray-50 border-0 p-4 rounded-2xl outline-none font-bold"
                    >
                      <option value="MILD">MILD</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HOT">HOT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">
                    Product Images
                  </label>
                  <div className="relative border-2 border-dashed border-gray-200 rounded-3xl p-6 text-center hover:bg-yellow-50/50 cursor-pointer transition-colors">
                    <Plus className="mx-auto text-gray-400 mb-1" size={24} />
                    <span className="text-xs font-bold text-[#C4A15A]">
                      Upload New Photos
                    </span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setSelectedFiles(Array.from(e.target.files))
                      }
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-black text-white py-5 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 disabled:bg-gray-300 transition-all shadow-xl shadow-black/10"
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <ChevronRight size={18} />{" "}
                      {isEditing ? "Update Product" : "Confirm & Create"}
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
