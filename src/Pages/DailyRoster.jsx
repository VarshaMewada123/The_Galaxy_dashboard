import { useState, useEffect, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Loader2,
  Save,
  ChefHat,
  Plus,
  Minus,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

import {
  getRosterByDate,
  upsertDailyRoster,
} from "@/api/services/dailyRoster.service";
import axiosClient from "@/api/axiosClient";

const todayStr = new Date().toISOString().split("T");

const getNextDays = (count = 5) => {
  const arr = [];
  for (let i = 1; i <= count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    arr.push(d.toISOString().split("T"));
  }
  return arr;
};

export default function DailyRoster() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // Helper to check if date is past
  const isPastDate = (date) => date < todayStr;

  useEffect(() => {
    const fetch = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          axiosClient.get("/admin/dining/menu"),
          axiosClient.get("/admin/dining/categories"),
        ]);
        const menu = menuRes?.data?.data?.data || [];
        const cats = catRes?.data?.data || [];
        setMenuItems(menu);
        setCategories(cats);
        setSelectedItems(menu.map((i) => ({ id: i._id, quantity: 10 })));
      } catch {
        toast.error("Failed to load menu data");
      } finally {
        setMenuLoading(false);
      }
    };
    fetch();
  }, []);

  const { data: todayRoster } = useQuery({
    queryKey: ["roster", todayStr],
    queryFn: () => getRosterByDate(todayStr),
  });

  const { data: rosterData } = useQuery({
    queryKey: ["roster", selectedDate],
    queryFn: () => getRosterByDate(selectedDate),
  });

  const nextDates = useMemo(() => getNextDays(5), []);
  const upcomingQueries = useQueries({
    queries: nextDates.map((d) => ({
      queryKey: ["roster", d],
      queryFn: () => getRosterByDate(d),
    })),
  });

  const upcoming = useMemo(() => {
    return upcomingQueries
      .map((q, i) => ({
        date: nextDates[i],
        data: q.data,
      }))
      .filter((r) => r.data?.items?.length);
  }, [upcomingQueries, nextDates]);

  useEffect(() => {
    if (!menuItems.length) return;
    const map = new Map();
    rosterData?.items?.forEach((i) => {
      map.set(i.id?._id, i.quantity);
    });
    setSelectedItems(
      menuItems.map((m) => ({
        id: m._id,
        quantity: map.get(m._id) || 10,
      }))
    );
  }, [rosterData, menuItems]);

  const toggleItem = (id) => {
    if (isPastDate(selectedDate)) return toast.error("Cannot edit past rosters");
    
    setSelectedItems((prev) => {
      const exist = prev.find((i) => i.id === id);
      if (exist) {
        toast.info("Item removed");
        return prev.filter((i) => i.id !== id);
      } else {
        toast.success("Item added");
        return [...prev, { id, quantity: 10 }];
      }
    });
  };

  const updateQty = (id, delta) => {
    if (isPastDate(selectedDate)) return;
    setSelectedItems((prev) =>
      prev.map((i) =>
        i.id === id
          ? { ...i, quantity: Math.max(1, i.quantity + delta) }
          : i
      )
    );
  };

  const isChecked = (id) => selectedItems.some((i) => i.id === id);
  const getQty = (id) => selectedItems.find((i) => i.id === id)?.quantity || 10;

  const saveMutation = useMutation({
    mutationFn: upsertDailyRoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
      toast.success("Roster updated successfully");
    },
    onError: () => {
      toast.error("Failed to save roster");
    }
  });

  return (
    <div className="min-h-screen bg-[#FCFAf7] text-slate-800 font-sans selection:bg-[#C6A45C]/30 pb-10">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#FCFAf7]/80 backdrop-blur-md border-b border-[#C6A45C]/10 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2 text-slate-900">
              <ChefHat className="text-[#C6A45C]" /> 
              <span>Daily Roster</span>
            </h1>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              saveMutation.mutate({
                dates: [selectedDate],
                items: selectedItems,
              })
            }
            disabled={saveMutation.isPending || isPastDate(selectedDate)}
            className="bg-[#C6A45C] hover:bg-[#b39352] text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-[#C6A45C]/20 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{isPastDate(selectedDate) ? "Locked" : "Save Roster"}</span>
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        
        {/* Date Selector */}
        <section className="bg-white p-4 rounded-2xl border border-[#C6A45C]/10 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-[200px]">
            <Calendar className="text-[#C6A45C]" size={20} />
            <input
              type="date"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none focus:ring-0 font-medium text-slate-700 cursor-pointer w-full"
            />
          </div>
          {isPastDate(selectedDate) && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg text-sm font-medium">
              <AlertCircle size={16} /> Viewing Past Date (Read Only)
            </div>
          )}
          <button 
            onClick={() => setSelectedDate(todayStr)}
            className="text-sm font-semibold text-[#C6A45C] hover:bg-[#C6A45C]/5 px-4 py-2 rounded-lg transition-colors ml-auto"
          >
            Go to Today
          </button>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-5 rounded-2xl border border-[#C6A45C]/10 shadow-sm"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#C6A45C] rounded-full" />
                Today's Live Menu
              </h2>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {todayRoster?.items?.length > 0 ? (
                  todayRoster.items.map((i) => (
                    <div key={i._id} className="flex justify-between items-center p-3 bg-[#FCFAf7] rounded-xl border border-[#C6A45C]/5">
                      <span className="text-sm font-medium text-slate-700 truncate mr-2">{i.id?.name}</span>
                      <span className="text-xs font-bold bg-[#C6A45C]/10 text-[#C6A45C] px-2 py-1 rounded-md">x{i.quantity}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic text-center py-4">Nothing scheduled for today</p>
                )}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white p-5 rounded-2xl border border-[#C6A45C]/10 shadow-sm"
            >
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#C6A45C] rounded-full" />
                Upcoming
              </h2>
              <div className="space-y-4">
                {upcoming.map((r) => (
                  <div key={r.date} className="group border-l-2 border-[#C6A45C]/20 pl-4 py-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">{r.date}</p>
                    <div className="flex flex-wrap gap-2">
                      {r.data.items.slice(0, 3).map((i) => (
                        <span key={i._id} className="text-[11px] bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                          {i.id?.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Select Items</h2>
              <p className="text-sm text-slate-500 font-medium">{menuItems.length} Available</p>
            </div>

            {menuLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="animate-spin text-[#C6A45C]" size={40} />
                <p className="text-slate-500 font-medium">Loading Menu...</p>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                <AnimatePresence>
                  {menuItems.map((item, index) => {
                    const active = isChecked(item._id);
                    return (
                      <motion.div
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        key={item._id}
                        className={`group p-4 rounded-2xl border transition-all duration-300 ${
                          active 
                            ? "bg-white border-[#C6A45C] shadow-md ring-1 ring-[#C6A45C]/10" 
                            : "bg-white border-slate-100 hover:border-[#C6A45C]/30 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="min-w-0">
                            <h3 className="font-bold text-slate-800 truncate leading-tight mb-1">{item.name}</h3>
                            <p className="text-[#C6A45C] font-bold text-sm">₹{item.basePrice}</p>
                          </div>
                          <button
                            onClick={() => toggleItem(item._id)}
                            className={`p-2 rounded-lg transition-colors cursor-pointer ${
                              active 
                                ? "bg-[#C6A45C] text-white" 
                                : "bg-slate-50 text-slate-400 hover:bg-[#C6A45C]/10 hover:text-[#C6A45C]"
                            }`}
                          >
                            {active ? <Minus size={18} /> : <Plus size={18} />}
                          </button>
                        </div>

                        {active && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 pt-4 border-t border-slate-50 overflow-hidden"
                          >
                            <div className="flex items-center justify-between bg-[#FCFAf7] rounded-xl p-2 border border-[#C6A45C]/10">
                              <button 
                                onClick={() => updateQty(item._id, -1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-[#C6A45C]"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-slate-700">
                                {getQty(item._id)}
                              </span>
                              <button 
                                onClick={() => updateQty(item._id, 1)}
                                className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-slate-600 hover:text-[#C6A45C]"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2 font-bold uppercase">Daily Qty</p>
                          </motion.div>
                        )}
                        
                        {!active && (
                          <div className="mt-4 flex items-center gap-2 opacity-30">
                            <div className="w-full h-px bg-slate-200" />
                            <span className="text-[10px] font-bold whitespace-nowrap">Inactive</span>
                            <div className="w-full h-px bg-slate-200" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}