import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Loader2, Save, Utensils, ChefHat } from "lucide-react";

import {
  getRosterByDate,
  upsertDailyRoster,
} from "@/api/services/dailyRoster.service";

import { getMenuItems } from "@/api/services/dining.service";

export default function DailyRoster() {
  const queryClient = useQueryClient();

  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedItems, setSelectedItems] = useState([]);
  const [notes, setNotes] = useState("");

  const { data: menuItems = [], isLoading: menuLoading } = useQuery({
    queryKey: ["menuItems"],
    queryFn: getMenuItems,
    staleTime: 1000 * 60 * 5,
  });

  const { isFetching, data: rosterData } = useQuery({
    queryKey: ["roster", selectedDate],
    queryFn: () => getRosterByDate(selectedDate),
    enabled: !!selectedDate,
    onSuccess: (data) => {
      setSelectedItems(data?.items?.map((i) => i._id) || []);
      setNotes(data?.notes || "");
    },
  });

  const saveMutation = useMutation({
    mutationFn: upsertDailyRoster,
    onSuccess: () => {
      queryClient.invalidateQueries(["roster"]);
      alert("Daily roster saved ✅");
    },
  });

  const toggleItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSave = () => {
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const chosen = new Date(selectedDate);
    chosen.setHours(0, 0, 0, 0);

    if (chosen < todayDate) {
      alert("Past dates are not allowed");
      return;
    }

    if (!selectedItems.length) {
      alert("Please select menu items");
      return;
    }

    saveMutation.mutate({
      dates: [selectedDate],
      items: selectedItems,
      notes,
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F8F8] p-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-light text-slate-900">
            Daily <span className="text-[#C5A059] italic">Dining Roster</span>
          </h1>

          <p className="text-sm text-slate-400 mt-2 flex items-center gap-2">
            <ChefHat size={14} />
            Viewing roster for:
            <span className="font-semibold text-[#C5A059]">
              {new Date(selectedDate).toDateString()}
            </span>
          </p>
        </motion.div>

        <div className="bg-white rounded-2xl p-6 shadow mb-8">
          <label className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2 mb-2">
            <Calendar size={14} /> Select Date
          </label>

          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded-lg px-4 py-2"
          />
        </div>

        <div className="bg-white rounded-2xl p-6 shadow">
          <h2 className="flex items-center gap-2 mb-6 font-semibold">
            <Utensils size={18} /> Menu Selection
          </h2>

          {(menuLoading || isFetching) && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[#C5A059]" />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {menuItems.map((item) => {
              const active = selectedItems.includes(item._id);

              return (
                <button
                  key={item._id}
                  onClick={() => toggleItem(item._id)}
                  className={`p-4 rounded-xl border transition-all text-sm font-medium
                    ${
                      active
                        ? "bg-[#C5A059] text-white border-[#C5A059] shadow-md"
                        : "bg-slate-50 hover:border-[#C5A059]"
                    }`}
                >
                  {item.name}
                </button>
              );
            })}
          </div>

          <div className="mt-6">
            <textarea
              placeholder="Chef notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full border rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#C5A059]/30 outline-none"
              rows={3}
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="mt-6 flex items-center gap-2 bg-[#C5A059] text-white px-6 py-3 rounded-xl hover:bg-black transition disabled:opacity-60"
          >
            {saveMutation.isPending ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <>
                <Save size={16} />
                Save Daily Roster
              </>
            )}
          </button>

          {rosterData?.items?.length > 0 && (
            <p className="mt-4 text-xs text-green-600 font-medium">
              Existing roster loaded
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
