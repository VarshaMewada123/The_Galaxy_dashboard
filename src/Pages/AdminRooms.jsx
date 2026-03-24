import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { ArrowLeft, Upload, Trash2, Edit3, X, Image as ImageIcon } from "lucide-react";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "@/api/room";

const BASE_URL = "http://localhost:5000";

export default function AdminRooms() {
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    price: "",
    size: "",
    roomType: "Suite",
    maxGuests: "",
    bedType: "King",
    description: "",
    amenities: "",
  });

  const [files, setFiles] = useState([]);
  const [preview, setPreview] = useState([]);
  const [editId, setEditId] = useState(null);

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      toast.success("Room created successfully");
      resetForm();
    },
    onError: () => toast.error("Error creating room"),
  });

  const updateMutation = useMutation({
    mutationFn: updateRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      toast.success("Room updated successfully");
      resetForm();
    },
    onError: () => toast.error("Update failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      toast.success("Room deleted");
    },
    onError: () => toast.error("Delete failed"),
  });

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreview(previewUrls);
  };

  const resetForm = () => {
    setForm({
      name: "",
      price: "",
      size: "",
      roomType: "Suite",
      maxGuests: "",
      bedType: "King",
      description: "",
      amenities: "",
    });
    setFiles([]);
    setPreview([]);
    setEditId(null);
  };

  const preventInvalidNumber = (e) => {
    if (["e", "E", "-", "+", "."].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleNumberInput = (key, value, isInteger = false) => {
    let cleanValue = value.replace(/[^0-9.]/g, "");
    if (isInteger) cleanValue = value.replace(/[^0-9]/g, "");
    
    if (parseFloat(cleanValue) < 0) cleanValue = "0";
    setForm({ ...form, [key]: cleanValue });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name || !form.price || !form.maxGuests) {
      toast.error("Please fill all required fields");
      return;
    }

    const formData = new FormData();
    Object.keys(form).forEach((key) => formData.append(key, form[key]));
    files.forEach((file) => formData.append("images", file));

    if (editId) {
      updateMutation.mutate({ id: editId, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (room) => {
    setForm({
      name: room.name,
      price: room.price,
      size: room.size,
      roomType: room.roomType,
      maxGuests: room.maxGuests,
      bedType: room.bedType,
      description: room.description,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(",") : room.amenities,
    });
    setEditId(room._id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const inputStyle = "w-full border border-[#C6A45C]/40 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A45C] bg-white transition-all text-slate-700 placeholder:text-slate-300";
  const labelStyle = "text-xs font-bold text-[#C6A45C] mb-1.5 block uppercase tracking-widest";

  return (
    <div className="min-h-screen bg-[#F9F8F6] pb-24 text-slate-800">
      <Toaster position="bottom-center" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex items-center gap-4 mb-10">
          <button 
            onClick={() => window.history.back()}
            className="p-2.5 hover:bg-[#C6A45C]/10 rounded-full transition-colors cursor-pointer border border-transparent hover:border-[#C6A45C]/20"
          >
            <ArrowLeft className="text-[#C6A45C]" size={22} />
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#C6A45C] tracking-tight">
            {editId ? "Update Room" : "Room Management"}
          </h1>
        </div>

        <section className="bg-white rounded-3xl shadow-xl shadow-[#C6A45C]/5 border border-[#C6A45C]/10 p-6 sm:p-10 mb-16">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              
              <div className="lg:col-span-2">
                <label className={labelStyle}>Room Title *</label>
                <input
                  placeholder="e.g. Royal Emperor Suite"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Price per Night (₹) *</label>
                <input
                  type="number"
                  min="0"
                  onKeyDown={preventInvalidNumber}
                  placeholder="0"
                  value={form.price}
                  onChange={(e) => handleNumberInput("price", e.target.value, true)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Total Guests *</label>
                <input
                  type="number"
                  min="1"
                  onKeyDown={preventInvalidNumber}
                  placeholder="Max occupancy"
                  value={form.maxGuests}
                  onChange={(e) => handleNumberInput("maxGuests", e.target.value, true)}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Room Category</label>
                <select
                  value={form.roomType}
                  onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                  className={`${inputStyle} cursor-pointer appearance-none bg-no-repeat bg-right pr-10`}
                >
                  <option>Suite</option>
                  <option>Deluxe</option>
                  <option>Standard</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Bedding Arrangement</label>
                <select
                  value={form.bedType}
                  onChange={(e) => setForm({ ...form, bedType: e.target.value })}
                  className={`${inputStyle} cursor-pointer`}
                >
                  <option>King</option>
                  <option>Queen</option>
                  <option>Double</option>
                </select>
              </div>

              <div className="lg:col-span-3">
                <label className={labelStyle}>Room Amenities</label>
                <input
                  placeholder="High-speed WiFi, Mini Bar, Ocean View, Bath Tub"
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div className="lg:col-span-3">
                <label className={labelStyle}>Detailed Description</label>
                <textarea
                  rows="4"
                  placeholder="Describe the luxury features and unique selling points..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={`${inputStyle} resize-none`}
                />
              </div>

              <div className="lg:col-span-3">
                <label className={labelStyle}>Gallery Upload</label>
                <div className="relative group border-2 border-dashed border-[#C6A45C]/30 rounded-2xl p-10 text-center hover:bg-[#F9F8F6] transition-all cursor-pointer">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center">
                    <div className="p-4 bg-[#C6A45C]/10 rounded-full mb-4 group-hover:bg-[#C6A45C] group-hover:text-white transition-all">
                      <Upload size={28} />
                    </div>
                    <p className="font-semibold text-[#C6A45C]">Drop images here or click to browse</p>
                    <p className="text-slate-400 text-sm mt-1">High resolution PNG or JPG preferred</p>
                  </div>
                </div>

                {preview.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 gap-4 mt-8">
                    {preview.map((img, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-[#C6A45C]/20 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => setPreview(preview.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 p-1 rounded-full shadow-md cursor-pointer hover:bg-red-500 hover:text-white transition-all"
                        >
                          <X size={14}/>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button className="flex-1 bg-[#C6A45C] text-white py-4 rounded-xl font-bold uppercase tracking-[0.2em] hover:bg-[#b39352] transform active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-[#C6A45C]/30">
                {editId ? "Update Property" : "Save New Room"}
              </button>
              {editId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-10 py-4 border-2 border-[#C6A45C] text-[#C6A45C] rounded-xl font-bold hover:bg-[#C6A45C]/5 transition-colors cursor-pointer uppercase tracking-widest"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <div className="flex items-center justify-between mb-8 border-b border-[#C6A45C]/20 pb-4">
          <h2 className="text-xl font-bold text-[#C6A45C] uppercase tracking-[0.15em]">Live Inventory</h2>
          <span className="bg-[#C6A45C]/10 text-[#C6A45C] px-4 py-1 rounded-full text-xs font-bold uppercase">{rooms.length} Rooms</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-3xl overflow-hidden border border-[#C6A45C]/10 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="relative h-56 overflow-hidden">
                <img
                  src={room.images?.length > 0 ? `${BASE_URL}${room.images}` : "/no-image.png"}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-[#C6A45C] font-bold text-[10px] uppercase tracking-wider shadow-sm">
                    {room.roomType}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-lg text-slate-800 truncate mb-1">{room.name}</h3>
                <div className="flex items-center justify-between">
                   <p className="text-[#C6A45C] font-black text-xl">₹{room.price}</p>
                   <div className="flex items-center gap-1 text-slate-400 text-[10px] font-bold uppercase">
                     <span>{room.maxGuests} Guests</span>
                   </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F9F8F6] text-[#C6A45C] py-3 rounded-xl border border-[#C6A45C]/20 hover:bg-[#C6A45C] hover:text-white transition-all cursor-pointer font-bold text-sm"
                  >
                    <Edit3 size={16} /> Edit
                  </button>

                  <button
                    onClick={() => {
                      if(window.confirm("Delete this room permanently?")) deleteMutation.mutate(room._id);
                    }}
                    className="w-12 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}