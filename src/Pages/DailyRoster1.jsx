
import { useState, useEffect, useMemo } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from "@tanstack/react-query";

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
  Info,
  CheckCircle2,
} from "lucide-react";

import { getRosterByDate, upsertDailyRoster } from "@/api/services/dailyRoster.service";
import { getMenuItems } from "@/api/services/dining.service";

/* ================= CATEGORY MAP ================= */
const CATEGORY_MAP = {
  Starters: "698ecb03929a7b5884e69f7b",
  Burgers: "6992f9a23fb7d03ea072b5bd",
  "Main Course": "69930a803ddb72820b1a1f86",
  Desserts: "69930ac73ddb72820b1a1f88",
  Beverages: "69930adc3ddb72820b1a1f8a",
  Salads: "69930af33ddb72820b1a1f8c",
};

const getNextDays = (count = 7) => {
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
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCategory, setSelectedCategory] = useState("Starters");
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState("");

  /* ================= QUERIES ================= */
  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: getMenuItems,
  });

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

  const filteredItems = useMemo(() => {
    const categoryId = CATEGORY_MAP[selectedCategory];
    return menuItems.filter((item) => (item.category?._id || item.category) === categoryId);
  }, [menuItems, selectedCategory]);

  useEffect(() => {
    if (!rosterData) {
      setSelectedItems([]);
      setNotes("");
    } else {
      setSelectedItems(rosterData.items?.map((i) => i._id) || []);
      setNotes(rosterData.notes || "");
    }
  }, [rosterData]);

  const saveMutation = useMutation({
    mutationFn: upsertDailyRoster,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roster"] });
      alert("Roster Updated Successfully! 🍽️");
    },
  });

  const toggleAvailability = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    saveMutation.mutate({ dates: [selectedDate], items: selectedItems, notes });
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-slate-900 pb-32">
      {/* PREMIUM HEADER */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50 px-4 py-4 md:px-10">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#C5A059] p-2.5 rounded-2xl shadow-lg shadow-[#C5A059]/30">
              <ChefHat className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-800">
                Kitchen <span className="text-[#C5A059] font-light italic">Orchestrator</span>
              </h1>
              <p className="hidden md:block text-[10px] text-slate-400 uppercase tracking-widest font-bold">Roster Management System</p>
            </div>
          </div>
          
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="group relative overflow-hidden bg-[#C5A059] hover:bg-slate-900 text-white px-8 py-3 rounded-2xl flex items-center gap-3 transition-all duration-300 shadow-xl active:scale-95 disabled:opacity-50"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span className="font-bold text-sm tracking-wide">Sync Changes</span>
          </button>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4 md:p-10 space-y-10">
        
        {/* SECTION 1 (NOW TOP): MAIN EDITOR */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4">
            
            {/* LEFT BAR: CONTROLS */}
            <div className="p-8 lg:p-10 bg-slate-50/80 border-r border-slate-100 space-y-10">
              <section>
                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 block mb-4">
                  Select Target Date
                </label>
                <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C5A059]" size={18} />
                    <input
                      type="date"
                      value={selectedDate}
                      min={today}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-white border-2 border-slate-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-[#C5A059] transition-all font-bold text-slate-700 shadow-sm"
                    />
                </div>
              </section>

              <section>
                <label className="text-[11px] uppercase tracking-[0.2em] font-black text-slate-400 block mb-4">
                  Menu Categories
                </label>
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  {Object.keys(CATEGORY_MAP).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`group flex items-center justify-between px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                        selectedCategory === cat
                          ? "bg-[#C5A059] text-white shadow-xl scale-[1.02]"
                          : "bg-white text-slate-500 hover:bg-slate-900 hover:text-white"
                      }`}
                    >
                      {cat}
                      <ChevronRight size={16} className={selectedCategory === cat ? "text-white" : "opacity-0 group-hover:opacity-100"} />
                    </button>
                  ))}
                </div>
              </section>
            </div>

            {/* ITEM GRID */}
            <div className="lg:col-span-3 p-8 lg:p-12">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-gradient-to-br from-[#C5A059] to-[#b38f4d] text-white rounded-[1.5rem] shadow-xl shadow-[#C5A059]/30">
                    <LayoutGrid size={28} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-slate-800">{selectedCategory}</h3>
                    <p className="text-sm text-slate-400 font-medium">Select items to include in the roster</p>
                  </div>
                </div>
                <div className="bg-slate-100 px-6 py-2 rounded-full flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#C5A059] rounded-full" />
                    <span className="text-xs font-black text-slate-600 uppercase">{filteredItems.length} Total Items</span>
                </div>
              </div>

              {(menuLoading || isRosterFetching) ? (
                <div className="flex flex-col items-center justify-center h-80 space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-[#C5A059]/20 border-t-[#C5A059] rounded-full animate-spin" />
                  </div>
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Syncing inventory...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {filteredItems.map((item) => {
                    const isChecked = selectedItems.includes(item._id);
                    return (
                      <label
                        key={item._id}
                        className={`group relative flex items-center justify-between p-6 rounded-[2rem] cursor-pointer transition-all duration-300 border-2 ${
                          isChecked
                            ? "border-[#C5A059] bg-[#C5A059]/5 shadow-lg shadow-[#C5A059]/5"
                            : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-md"
                        }`}
                      >
                        <div className="flex flex-col gap-1 pr-4">
                          <span className={`font-black text-sm leading-tight transition-colors ${isChecked ? "text-[#C5A059]" : "text-slate-700"}`}>
                            {item.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">ID: {item._id.slice(-6)}</span>
                        </div>
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isChecked ? "bg-[#C5A059] border-[#C5A059]" : "border-slate-200"
                        }`}>
                            {isChecked && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={() => toggleAvailability(item._id)}
                        />
                      </label>
                    );
                  })}
                </div>
              )}

              {/* NOTES SECTION */}
              <div className="mt-12 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                   <ClipboardList size={22} className="text-[#C5A059]" />
                   <h4 className="text-lg font-black text-slate-800">Chef's Daily Bulletin</h4>
                </div>
                <textarea
                  placeholder="Mention daily specials, 86'd items, or kitchen notices here..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white border-2 border-slate-200 rounded-[1.5rem] p-6 text-sm font-medium focus:outline-none focus:border-[#C5A059] transition-all min-h-[150px] shadow-sm"
                />
                <div className="mt-4 flex items-center gap-3 text-slate-400">
                  <Info size={16} />
                  <p className="text-[11px] font-bold uppercase tracking-tight">System will broadcast these notes to all terminals.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2 (NOW BOTTOM): LIVE STATUS & UPCOMING */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LIVE TODAY PANEL */}
          <div className="xl:col-span-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Utensils size={120} />
            </div>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Active Menu Today</h2>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {!todayRoster?.items?.length ? (
                <div className="flex flex-col items-center justify-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                   <p className="text-slate-400 font-medium">No active menu for today</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {todayRoster.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                        <CheckCircle2 size={14} className="text-emerald-500" />
                        <span className="text-sm font-bold text-emerald-900">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* UPCOMING QUEUE */}
          <div className="xl:col-span-8 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                    <Clock size={24} />
                  </div>
                  <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Upcoming Schedules</h2>
                </div>
            </div>

            <div className="flex gap-6 overflow-x-auto pb-6 snap-x no-scrollbar">
              {upcomingRosters.length === 0 && (
                <div className="w-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed">
                    <p className="text-slate-400 italic">No future rosters planned.</p>
                </div>
              )}
              {upcomingRosters.map((r) => (
                <div key={r.date} className="min-w-[300px] md:min-w-[350px] snap-start bg-slate-50 rounded-[2rem] p-6 border border-slate-200/60 hover:border-[#C5A059]/40 transition-colors shadow-sm">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                    <p className="text-sm font-black text-[#C5A059] uppercase tracking-tighter">
                      {new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })}
                    </p>
                    <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold shadow-sm">{r.roster.items.length} Items</span>
                  </div>
                  
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                    {r.roster.items.map((item) => (
                      <div key={item._id} className="group flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:shadow-md transition-all">
                        <span className="text-xs font-bold text-slate-600 truncate mr-2">{item.name}</span>
                        <ChevronRight size={12} className="text-slate-300 group-hover:text-[#C5A059]" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* MOBILE FLOATING ACTION */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-[60]">
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="w-full bg-[#C5A059] hover:bg-slate-900 text-white py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-4 active:scale-95 transition-all"
          >
            {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <Save size={20} />}
            Save Roster
          </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}