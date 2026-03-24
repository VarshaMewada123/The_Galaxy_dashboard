import React, { useEffect, useState } from "react";
import { ArrowLeft, Save, Clock, Power, AlertCircle, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import axiosClient from "../api/axiosClient";

export default function Availability() {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [data, setData] = useState({
    isOrderingEnabled: true,
    kitchenStartTime: "09:00",
    kitchenEndTime: "23:00",
    isTemporarilyClosed: false,
    reason: "",
  });

  const fetchData = async () => {
    try {
      const res = await axiosClient.get("/admin/availability");
      setData(res.data.data);
    } catch (error) {
      toast.error("Failed to load settings");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      await axiosClient.put("admin/availability", data);
      toast.success("Settings updated successfully", {
        style: { border: '1px solid #C6A45C', padding: '16px', color: '#1a1a1a' },
        iconTheme: { primary: '#C6A45C', secondary: '#FFFAEE' },
      });
    } catch (error) {
      toast.error("Update failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({ name, checked, onChange }) => (
    <button
      type="button"
      onClick={() => onChange({ target: { name, type: "checkbox", checked: !checked } })}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#C6A45C] focus:ring-offset-2 cursor-pointer ${
        checked ? "bg-[#C6A45C]" : "bg-gray-300"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F7] p-4 md:p-8 font-sans text-[#1a1a1a] relative">
      <Toaster position="top-right" />
      
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setShowConfirm(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-amber-50 rounded-full text-[#C6A45C]">
                <AlertCircle size={24} />
              </div>
              <button onClick={() => setShowConfirm(false)} className="text-gray-400 hover:text-black cursor-pointer">
                <X size={20} />
              </button>
            </div>
            <h3 className="text-lg font-bold mb-2">Confirm Changes?</h3>
            <p className="text-gray-500 text-sm mb-6">
              Are you sure you want to update the kitchen availability? This will reflect on the live app immediately.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                onClick={handleSave}
                className="flex-1 py-3 bg-[#C6A45C] text-white rounded-xl font-semibold hover:bg-[#b08e4b] shadow-lg shadow-[#C6A45C]/20 transition-all cursor-pointer"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-[#C6A45C] transition-colors mb-6 cursor-pointer group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Dashboard</span>
        </button>

        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Kitchen Control Panel</h1>
          <p className="text-gray-500 text-sm md:text-base">Manage store visibility and hours.</p>
        </header>

        <div className="space-y-6">
          {/* Availability Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg text-green-600">
                  <Power size={20} />
                </div>
                <div>
                  <p className="font-semibold">Online Ordering</p>
                  <p className="text-xs text-gray-400">Enable/Disable customer orders</p>
                </div>
              </div>
              <Toggle name="isOrderingEnabled" checked={data.isOrderingEnabled} onChange={handleChange} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg text-red-600">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <p className="font-semibold">Temporary Closure</p>
                  <p className="text-xs text-gray-400">Manual store shutdown</p>
                </div>
              </div>
              <Toggle name="isTemporarilyClosed" checked={data.isTemporarilyClosed} onChange={handleChange} />
            </div>

            {data.isTemporarilyClosed && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Reason for closing</label>
                <textarea
                  name="reason"
                  value={data.reason}
                  onChange={handleChange}
                  placeholder="e.g., Heavy rain, Maintenance..."
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C6A45C] focus:border-transparent outline-none transition-all resize-none h-24"
                />
              </div>
            )}
          </section>

          {/* Timing Card */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-amber-50 rounded-lg text-[#C6A45C]">
                <Clock size={20} />
              </div>
              <p className="font-semibold">Kitchen Operating Hours</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">Start Time</label>
                <input
                  type="time"
                  name="kitchenStartTime"
                  value={data.kitchenStartTime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C6A45C] outline-none cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase text-gray-400">End Time</label>
                <input
                  type="time"
                  name="kitchenEndTime"
                  value={data.kitchenEndTime}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-[#C6A45C] outline-none cursor-pointer"
                />
              </div>
            </div>
          </section>

          {/* Save Button */}
          <button
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="w-full bg-[#C6A45C] hover:bg-[#b08e4b] active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#C6A45C]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}