import { useState, useEffect, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Toaster, toast } from "sonner";
import {
  Calendar,
  Loader2,
  Save,
  Utensils,
  ChevronRight,
  ClipboardList,
  Clock,
  LayoutGrid,
  ChefHat,
  CheckCircle2,
  Plus,
  Minus,
  Search,
  Filter,
} from "lucide-react";

import {
  getRosterByDate,
  upsertDailyRoster,
} from "@/api/services/dailyRoster.service";
import axiosClient from "../api/axiosClient";

const today = new Date().toISOString().split("T")[0];

const getNextDays = (count = 5) => {
  const dates = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
};

export default function DailyRoster() {
  const queryClient = useQueryClient();

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);

  const fetchData = async () => {
    try {
      setMenuLoading(true);
      const [menuRes, catRes] = await Promise.all([
        axiosClient.get("/admin/dining/menu"),
        axiosClient.get("/admin/dining/categories"),
      ]);

      const catData = catRes.data.data || [];
      const menuData = menuRes.data.data || [];

      setCategories(catData);
      setMenuItems(menuData);
      if (catData.length) setSelectedCategory(catData[0]._id);

      const allEnabled = menuData.map((item) => ({
        id: item._id,
        quantity: 10,
      }));
      setSelectedItems(allEnabled);
    } catch (error) {
      toast.error("Failed to fetch menu data");
    } finally {
      setMenuLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { data: rosterData, isFetching: isRosterFetching } = useQuery({
    queryKey: ["roster", selectedDate],
    queryFn: () => getRosterByDate(selectedDate),
    enabled: !!selectedDate,
  });

  const { data: todayRoster } = useQuery({
    queryKey: ["roster", today],
    queryFn: () => getRosterByDate(today),
  });

  const upcomingDates = useMemo(() => getNextDays(5), []);
  const upcomingQueries = useQueries({
    queries: upcomingDates.map((date) => ({
      queryKey: ["roster", date],
      queryFn: () => getRosterByDate(date),
      staleTime: 1000 * 60 * 5,
    })),
  });

  const upcomingRosters = useMemo(() => {
    return upcomingQueries
      .map((query, index) => ({
        date: upcomingDates[index],
        roster: query.data,
      }))
      .filter((r) => r.roster && r.roster.items?.length > 0);
  }, [upcomingQueries, upcomingDates]);

  useEffect(() => {
    if (!menuItems.length) return;

    if (!rosterData) {
      const defaults = menuItems.map((item) => ({
        id: item._id,
        quantity: 10,
      }));
      setSelectedItems(defaults);
      setNotes("");
    } else {
      const map = new Map();
      rosterData.items?.forEach((i) => {
        map.set(i.id?._id || i._id, i.quantity || 10);
      });

      const items = menuItems
        .filter((m) => map.has(m._id))
        .map((m) => ({
          id: m._id,
          quantity: map.get(m._id),
        }));

      setSelectedItems(items);
      setNotes(rosterData.notes || "");
    }
  }, [rosterData, menuItems]);

  const filteredItems = useMemo(() => {
    let filtered = menuItems;
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => (item.category?._id || item.category) === selectedCategory,
      );
    }
    if (searchTerm) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    return filtered;
  }, [menuItems, selectedCategory, searchTerm]);

  const toggleItem = (id, name) => {
    const exists = selectedItems.find((p) => p.id === id);

    setSelectedItems((prev) => {
      if (exists) {
        return prev.filter((p) => p.id !== id);
      }
      return [...prev, { id, quantity: 10 }];
    });

    if (exists) {
      toast.info(`Removed ${name} from roster`);
    } else {
      toast.success(`Added ${name} to roster`);
    }
  };

  const updateQty = (id, delta) => {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }),
    );
  };

  const getQty = (id) => selectedItems.find((i) => i.id === id)?.quantity || 10;
  const isChecked = (id) => selectedItems.some((i) => i.id === id);

  const saveMutation = useMutation({
    mutationFn: upsertDailyRoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
      toast.success("Roster Synced Successfully!", {
        description: `Menu updated for ${selectedDate}`,
        icon: "🍽️",
      });
    },
    onError: () => {
      toast.error("Sync failed. Please check connection.");
    },
  });

  const handleSave = () => {
    if (selectedItems.length === 0) {
      toast.warning("Roster is empty. At least one item is required.");
      return;
    }
    saveMutation.mutate({
      dates: [selectedDate],
      items: selectedItems,
      notes,
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-[#C5A059]/30">
      <Toaster position="top-right" richColors closeButton />

      <header className="bg-white/90 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-[100] px-4 py-4 sm:px-6 lg:px-10">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="bg-[#C5A059] p-2.5 sm:p-3 rounded-2xl shadow-xl shadow-[#C5A059]/20 transform transition-transform hover:rotate-12">
              <ChefHat className="text-white" size={24} />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-black tracking-tight text-slate-800">
                Kitchen{" "}
                <span className="text-[#C5A059] font-serif italic">
                  Orchestrator
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 border border-slate-200">
              <Search size={16} className="text-slate-400 mr-2" />
              <input
                type="text"
                placeholder="Search menu..."
                className="bg-transparent border-none outline-none text-sm w-32 focus:w-48 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-[#C5A059] hover:bg-slate-900 text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-2xl flex items-center gap-3 transition-all duration-500 shadow-lg shadow-[#C5A059]/20 active:scale-95 disabled:opacity-50 group"
            >
              {saveMutation.isPending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save
                  size={20}
                  className="group-hover:translate-y-[-2px] transition-transform"
                />
              )}
              <span className="font-bold text-xs sm:text-sm tracking-wider uppercase">
                Sync Roster
              </span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-10 space-y-8 sm:space-y-12">
        <div className="bg-white rounded-[2rem] sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <aside className="w-full lg:w-[320px] p-6 sm:p-10 bg-[#FAF9F6] border-r border-slate-100 space-y-8">
              <section>
                <label className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400 block mb-5">
                  Target Period
                </label>
                <div className="relative group">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059] group-focus-within:scale-110 transition-transform"
                    size={18}
                  />
                  <input
                    type="date"
                    value={selectedDate}
                    min={today}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      toast(`Switching to ${e.target.value}`);
                    }}
                    className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#C5A059] transition-all font-bold text-slate-700 shadow-sm cursor-pointer"
                  />
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between mb-5">
                  <label className="text-[10px] uppercase tracking-[0.25em] font-black text-slate-400">
                    Categories
                  </label>
                  <Filter size={14} className="text-slate-300" />
                </div>
                <div className="flex lg:flex-col gap-2 overflow-x-auto pb-4 lg:pb-0 no-scrollbar">
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => setSelectedCategory(cat._id)}
                      className={`flex-shrink-0 flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                        selectedCategory === cat._id
                          ? "bg-[#C5A059] text-white shadow-xl shadow-[#C5A059]/30 translate-x-1"
                          : "bg-white text-slate-500 hover:bg-slate-900 hover:text-white border border-slate-100"
                      }`}
                    >
                      <span className="whitespace-nowrap">{cat.name}</span>
                      <ChevronRight
                        size={16}
                        className={`hidden lg:block transition-transform ${selectedCategory === cat._id ? "rotate-0" : "-rotate-90 opacity-0 group-hover:opacity-100"}`}
                      />
                    </button>
                  ))}
                </div>
              </section>
            </aside>

            <div className="flex-1 p-6 sm:p-10 lg:p-14">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-8 border-b border-slate-100">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#C5A059]/10 rounded-full">
                    <span className="w-1.5 h-1.5 bg-[#C5A059] rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-[#C5A059] uppercase tracking-widest">
                      Live Inventory
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-slate-800">
                    {categories.find((c) => c._id === selectedCategory)?.name ||
                      "Kitchen Items"}
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] font-black text-slate-300 uppercase">
                      Active Selection
                    </p>
                    <p className="text-lg font-black text-slate-700">
                      {selectedItems.length} / {menuItems.length}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 text-[#C5A059]">
                    <LayoutGrid size={24} />
                  </div>
                </div>
              </div>

              {menuLoading || isRosterFetching ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-[#C5A059]/10 rounded-full" />
                    <div className="absolute inset-0 border-4 border-t-[#C5A059] rounded-full animate-spin" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                    Synchronizing Matrix...
                  </p>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredItems.map((item) => {
                      const active = isChecked(item._id);
                      return (
                        <motion.div
                          layout
                          key={item._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`group relative p-5 rounded-[2.5rem] transition-all duration-500 border-2 ${
                            active
                              ? "border-[#C5A059] bg-[#C5A059]/5 shadow-xl shadow-[#C5A059]/5"
                              : "border-slate-100 bg-white grayscale opacity-60"
                          }`}
                        >
                          <div className="flex items-start gap-4 mb-5">
                            <div
                              className="relative cursor-pointer"
                              onClick={() => toggleItem(item._id, item.name)}
                            >
                              <input
                                type="checkbox"
                                readOnly
                                checked={active}
                                className="hidden"
                              />
                              <div
                                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${active ? "bg-[#C5A059] border-[#C5A059]" : "border-slate-200"}`}
                              >
                                {active && (
                                  <CheckCircle2
                                    size={14}
                                    className="text-white"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`font-black text-sm truncate transition-colors ${active ? "text-slate-800" : "text-slate-400"}`}
                              >
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-[#C5A059] font-black uppercase tracking-tight">
                                INR {item.price}
                              </p>
                            </div>
                            <img
                              src={
                                item.images?.[0]?.url ||
                                "https://placehold.co/100x100?text=Food"
                              }
                              className={`w-12 h-12 rounded-2xl object-cover shadow-lg transition-transform duration-500 group-hover:scale-110 ${!active && "sepia"}`}
                              alt={item.name}
                            />
                          </div>

                          {active && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="flex items-center justify-between bg-white px-2 py-1.5 rounded-2xl border border-[#C5A059]/20 shadow-inner"
                            >
                              <button
                                onClick={() => updateQty(item._id, -5)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-slate-400"
                              >
                                <Minus size={16} />
                              </button>
                              <div className="text-center">
                                <span className="block text-[8px] font-black text-slate-300 uppercase leading-none mb-1">
                                  Stock Units
                                </span>
                                <span className="font-black text-lg text-slate-800 tabular-nums">
                                  {getQty(item._id)}
                                </span>
                              </div>
                              <button
                                onClick={() => updateQty(item._id, 5)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-500 rounded-xl transition-colors text-slate-400"
                              >
                                <Plus size={16} />
                              </button>
                            </motion.div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}

              <section className="mt-16 bg-[#FAF9F6] rounded-[2.5rem] p-8 sm:p-10 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
                    <ClipboardList size={20} className="text-[#C5A059]" />
                  </div>
                  <h4 className="text-xl font-black text-slate-800 tracking-tight">
                    Chef's Bulletin
                  </h4>
                </div>
                <textarea
                  placeholder="Notes for kitchen staff, 86'd items, or daily modifications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-[2rem] p-6 sm:p-8 text-sm font-medium focus:outline-none focus:border-[#C5A059] transition-all min-h-[150px] shadow-sm placeholder:text-slate-300"
                />
              </section>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10">
          <div className="xl:col-span-4 bg-white rounded-[3rem] p-8 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100 flex flex-col relative overflow-hidden group">
            <Utensils
              size={180}
              className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-700"
            />
            <div className="flex items-center gap-4 mb-10">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
                Active Menu: Today
              </h2>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar relative z-10">
              {!todayRoster?.items?.length ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                    System Standby
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5">
                  {todayRoster.items.map((item) => (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      key={item._id}
                      className="flex items-center gap-4 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                      </div>
                      <span className="text-sm font-black text-emerald-900 flex-1 truncate">
                        {item.id?.name}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 bg-white px-3 py-1 rounded-full shadow-sm">
                        QTY: {item.quantity}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="xl:col-span-8 bg-white rounded-[3rem] p-8 sm:p-10 shadow-xl shadow-slate-200/40 border border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shadow-inner">
                  <Clock size={24} />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-[0.2em]">
                  Deployment Pipeline
                </h2>
              </div>
              <div className="px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase">
                  5-Day Forecast
                </span>
              </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
              {upcomingRosters.length === 0 ? (
                <div className="w-full py-20 text-center bg-[#FAF9F6] rounded-[2.5rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-300 font-bold uppercase tracking-widest text-xs">
                    No Future Deployments Found
                  </p>
                </div>
              ) : (
                upcomingRosters.map((r) => (
                  <motion.div
                    whileHover={{ y: -5 }}
                    key={r.date}
                    className="min-w-[320px] bg-white rounded-[2.5rem] p-7 border border-slate-200/60 shadow-lg shadow-slate-200/20 snap-center"
                  >
                    <div className="flex justify-between items-center mb-6 pb-5 border-b border-slate-100">
                      <div>
                        <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">
                          {new Date(r.date).getFullYear()}
                        </p>
                        <p className="text-lg font-black text-[#C5A059] uppercase tracking-tighter">
                          {new Date(r.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] font-black text-slate-400">
                          MANIFEST
                        </span>
                        <span className="text-sm font-black text-slate-800">
                          {r.roster.items.length} Items
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {r.roster.items.map((item) => (
                        <div
                          key={item._id}
                          className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-xl border border-slate-100 group transition-colors hover:bg-white"
                        >
                          <span className="text-xs font-bold text-slate-600 truncate mr-4">
                            {item.id?.name}
                          </span>
                          <span className="text-[10px] font-black text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-100">
                            {item.quantity}u
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-[1600px] mx-auto px-10 py-12 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 text-slate-400">
        <p className="text-[10px] font-black uppercase tracking-widest">
          © 2026 Hotel The Galaxy • Digital Infrastructure
        </p>
        <div className="flex gap-8">
          <span className="text-[10px] font-black uppercase cursor-pointer hover:text-[#C5A059] transition-colors">
            Documentation
          </span>
          <span className="text-[10px] font-black uppercase cursor-pointer hover:text-[#C5A059] transition-colors">
            Security
          </span>
          <span className="text-[10px] font-black uppercase cursor-pointer hover:text-[#C5A059] transition-colors">
            Support
          </span>
        </div>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 20px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        ::-webkit-calendar-picker-indicator {
          filter: invert(0.6) sepia(1) saturate(5) hue-rotate(10deg);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
