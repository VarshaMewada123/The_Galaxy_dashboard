import { useState } from "react";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Lock,
  Globe,
  Save,
  Camera,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1500);
  };

  const tabs = [
    { id: "general", name: "General Info", icon: <User size={18} /> },
    { id: "security", name: "Security", icon: <Lock size={18} /> },
    { id: "notifications", name: "Notifications", icon: <Bell size={18} /> },
    { id: "website", name: "Website Settings", icon: <Globe size={18} /> },
  ];

  return (
    <div className="space-y-8 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-serif tracking-wide text-gray-900">
            Admin <span className="text-[#C6A45C]">Settings</span>
          </h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-[2px] mt-1 font-medium">
            Configure your hotel preferences and profile
          </p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center justify-center gap-2 bg-black text-white px-8 py-3 rounded-sm hover:bg-[#C6A45C] transition-all duration-300 shadow-lg uppercase text-[12px] tracking-widest font-medium"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-sm transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-[#C6A45C] text-white shadow-md shadow-[#c6a45c44]"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              }`}
            >
              <span
                className={
                  activeTab === tab.id ? "text-white" : "text-[#C6A45C]"
                }
              >
                {tab.icon}
              </span>
              <span className="text-[11px] uppercase tracking-widest font-bold">
                {tab.name}
              </span>
            </button>
          ))}
        </aside>

        <div className="flex-1 bg-white border border-gray-100 rounded-sm shadow-sm overflow-hidden">
          <div className="p-8">
            {activeTab === "general" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-gray-50">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-[#C6A45C] overflow-hidden">
                      <img
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&fit=crop"
                        alt="Admin"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full hover:bg-[#C6A45C] transition-colors shadow-lg">
                      <Camera size={14} />
                    </button>
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="font-serif text-lg text-gray-900">
                      Administrator Profile
                    </h3>
                    <p className="text-[11px] text-gray-400 uppercase tracking-widest">
                      Update your personal and hotel brand identity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Hotel Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="The Galaxy International"
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Admin Email
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        defaultValue="admin@The Galaxy.com"
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Contact Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="+91 98765 43210"
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        defaultValue="Bhopal, Madhya Pradesh"
                        className="w-full pl-4 pr-4 py-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                    Hotel Description (About)
                  </label>
                  <textarea
                    rows="4"
                    className="w-full p-4 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                    defaultValue="Welcome to The Galaxy, where luxury meets heritage. Experience world-class hospitality in the heart of the city."
                  ></textarea>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-500 max-w-md">
                <h3 className="font-serif text-lg text-gray-900 mb-6">
                  Change Password
                </h3>
                <div className="space-y-4">
                  <input
                    type="password"
                    placeholder="Current Password"
                    className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full p-3 bg-gray-50 border-none focus:ring-1 focus:ring-[#C6A45C] text-sm rounded-sm"
                  />
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h3 className="font-serif text-lg text-gray-900">
                  Email Notifications
                </h3>
                <div className="space-y-4">
                  {[
                    "New Booking Alerts",
                    "Guest Review Notifications",
                    "Monthly Revenue Reports",
                    "Room Maintenance Reminders",
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-sm"
                    >
                      <span className="text-[12px] uppercase tracking-wider text-gray-700 font-medium">
                        {item}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          defaultChecked={i < 2}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#C6A45C]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "website" && (
              <div className="text-center py-20 border border-dashed border-gray-100 rounded-sm">
                <Globe
                  className="mx-auto text-[#C6A45C] mb-4 opacity-20"
                  size={48}
                />
                <h3 className="font-serif text-xl text-gray-800 uppercase tracking-widest">
                  CMS Integration
                </h3>
                <p className="text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">
                  Live website synchronization is active
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
