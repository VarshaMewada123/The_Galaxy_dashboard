import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast, Toaster } from "react-hot-toast";
import { ArrowLeft, Upload, Trash2, Edit3, X, AlertTriangle } from "lucide-react";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
} from "@/api/room";

const BASE_URL = "http://localhost:5000";

// --- Custom Delete Confirmation Modal ---
const DeleteModal = ({ isOpen, onClose, onConfirm, roomName }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-[#C6A45C]/20">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4 mx-auto">
          <AlertTriangle className="text-red-600" size={24} />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-800 mb-2 curs">Delete Room?</h3>
        <p className="text-slate-500 text-center mb-6">
          Are you sure you want to delete <span className="font-semibold text-slate-700">"{roomName}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default function AdminRooms() {
  const queryClient = useQueryClient();

  // State
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
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState({ show: false, id: null, name: "" });

  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      queryClient.invalidateQueries(["rooms"]);
      toast.success("Room created successfully");
      resetForm();
    },
    onError: () => toast.error("Failed to create room"),
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
      setDeleteModal({ show: false, id: null, name: "" });
    },
    onError: () => toast.error("Delete failed"),
  });

  // Helper: Prevent Negative Typing
  const handleNumericInput = (e, field) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !value.includes('-'))) {
      setForm({ ...form, [field]: value });
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreview(previewUrls);
  };

  const resetForm = () => {
    setForm({
      name: "", price: "", size: "", roomType: "Suite",
      maxGuests: "", bedType: "King", description: "", amenities: "",
    });
    setFiles([]);
    setPreview([]);
    setEditId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) return toast.error("Room name is required");
    if (!form.price || Number(form.price) <= 0) return toast.error("Please enter a valid price greater than 0");
    if (!form.maxGuests || Number(form.maxGuests) <= 0) return toast.error("Max guests must be at least 1");
    if (!editId && files.length === 0) return toast.error("Please upload at least one image");

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
    
    // Smooth scroll to top when edit is clicked
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const inputStyle = "w-full border border-[#C6A45C]/30 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C6A45C] bg-white transition-all duration-200 text-slate-700";
  const labelStyle = "text-sm font-semibold text-[#C6A45C] mb-1 block uppercase tracking-wider";

  return (
    <div className="min-h-screen bg-[#F9F8F6] pb-20">
      <Toaster position="top-right" />
      
      <DeleteModal 
        isOpen={deleteModal.show}
        roomName={deleteModal.name}
        onClose={() => setDeleteModal({ show: false, id: null, name: "" })}
        onConfirm={() => deleteMutation.mutate(deleteModal.id)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.history.back()}
              className="p-2 hover:bg-[#C6A45C]/10 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="text-[#C6A45C]" size={24} />
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#C6A45C] tracking-tight">
              {editId ? "Edit Room" : "Add New Room"}
            </h1>
          </div>
        </div>

        <section className="bg-white rounded-2xl shadow-sm border border-[#C6A45C]/10 p-6 mb-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className={labelStyle}>Room Name *</label>
                <input
                  placeholder="e.g. Presidential Suite"
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
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => handleNumericInput(e, 'price')}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Room Size (sq ft)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 450"
                  value={form.size}
                  onChange={(e) => handleNumericInput(e, 'size')}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Room Type</label>
                <select
                  value={form.roomType}
                  onChange={(e) => setForm({ ...form, roomType: e.target.value })}
                  className={`${inputStyle} cursor-pointer`}
                >
                  <option>Suite</option>
                  <option>Deluxe</option>
                  <option>Standard</option>
                </select>
              </div>

              <div>
                <label className={labelStyle}>Max Guests *</label>
                <input
                  type="number"
                  min="1"
                  value={form.maxGuests}
                  onChange={(e) => handleNumericInput(e, 'maxGuests')}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className={labelStyle}>Bed Type</label>
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

              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelStyle}>Amenities (Comma separated)</label>
                <input
                  placeholder="WiFi, Mini Bar, Sea View..."
                  value={form.amenities}
                  onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelStyle}>Description</label>
                <textarea
                  rows="3"
                  placeholder="Describe the room details..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className={labelStyle}>Room Images</label>
                <div className="relative border-2 border-dashed border-[#C6A45C]/30 rounded-xl p-8 text-center hover:bg-[#F9F8F6] transition-colors cursor-pointer group">
                  <input 
                    type="file" 
                    multiple 
                    onChange={handleFileChange} 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="mx-auto text-[#C6A45C] mb-2 group-hover:scale-110 transition-transform" size={32} />
                  <p className="text-slate-500">Click to upload or drag and drop images</p>
                </div>

                {preview.length > 0 && (
                  <div className="flex gap-4 mt-6 flex-wrap">
                    {preview.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img} className="w-24 h-24 object-cover rounded-lg border border-[#C6A45C]/20 shadow-sm" />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <button type="button" onClick={() => setPreview(preview.filter((_, idx) => idx !== i))} className="text-white bg-red-500 rounded-full p-1"><X size={14}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                type="submit" 
                disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-[#C6A45C] text-white py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-[#b39352] transform active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-[#C6A45C]/20 disabled:opacity-50"
              >
                {createMutation.isPending || updateMutation.isPending ? "Processing..." : (editId ? "Update Room Details" : "Create New Room")}
              </button>
              {editId && (
                <button 
                  type="button"
                  onClick={resetForm}
                  className="px-8 py-4 border border-[#C6A45C] text-[#C6A45C] rounded-xl font-bold hover:bg-[#C6A45C]/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <h2 className="text-xl font-bold text-[#C6A45C] mb-6 uppercase tracking-widest">Existing Rooms</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            <p className="text-[#C6A45C]">Loading rooms...</p>
          ) : rooms.map((room) => (
            <div key={room._id} className="bg-white rounded-2xl overflow-hidden border border-[#C6A45C]/10 shadow-sm hover:shadow-md transition-shadow group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={room.images?.length > 0 ? `${BASE_URL}${room.images}` : "/no-image.png"}
                  alt={room.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[#C6A45C] font-bold text-sm">
                  {room.roomType}
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-bold text-lg text-slate-800 truncate">{room.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-[#C6A45C] font-bold text-xl">₹{room.price}</span>
                  <span className="text-slate-400 text-xs uppercase tracking-tighter">/ night</span>
                </div>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#F9F8F6] text-[#C6A45C] py-2.5 rounded-lg border border-[#C6A45C]/20 hover:bg-[#C6A45C] hover:text-white transition-all cursor-pointer"
                  >
                    <Edit3 size={16} /> <span className="text-sm font-semibold">Edit</span>
                  </button>

                  <button
                    onClick={() => setDeleteModal({ show: true, id: room._id, name: room.name })}
                    className="px-3 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
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