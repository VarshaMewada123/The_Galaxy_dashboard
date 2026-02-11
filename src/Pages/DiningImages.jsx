import { useState, useEffect } from 'react';
import { Upload, CheckCircle, X, Utensils, Trash2, Image as ImageIcon } from 'lucide-react';

const DiningImages = () => {
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Initial Static Data
  useEffect(() => {
    setCurrentImages([
      { id: 1, url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&fit=crop', name: 'Fine-Dining-Hall.jpg' },
      { id: 2, url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=400&fit=crop', name: 'Terrace-Lounge.jpg' },
      { id: 3, url: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&fit=crop', name: 'Royal-Cuisine.jpg' }
    ]);
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadSuccess(false);
  };

  // ✅ STATIC WORKING UPLOAD SIMULATION
  const handleUpload = () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    
    // Simulate API delay
    setTimeout(() => {
      const newImages = selectedFiles.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file), // Create local preview URL
        name: file.name
      }));

      setCurrentImages(prev => [...prev, ...newImages]);
      setUploading(false);
      setUploadSuccess(true);
      setSelectedFiles([]);
      
      // Auto-hide success message
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const removeImage = (id) => {
    setCurrentImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="space-y-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b border-gray-100 pb-8">
        <div>
          <h1 className="text-3xl font-serif tracking-wide text-gray-900">
            Dining <span className="text-[#C6A45C]">Gallery</span>
          </h1>
          <p className="text-[11px] text-gray-400 uppercase tracking-[2px] mt-1 font-medium">
            Manage Restaurant & Lounge Visuals
          </p>
        </div>
        
        {uploadSuccess && (
          <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-sm border border-green-100 animate-fade-in">
            <CheckCircle size={16} />
            <span className="text-[12px] font-semibold uppercase tracking-wider">Gallery Updated</span>
          </div>
        )}
      </div>

      {/* Current Gallery Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-gray-800 flex items-center gap-2">
            <Utensils size={20} className="text-[#C6A45C]" />
            Active Imagery
          </h2>
          <span className="text-[11px] text-gray-400 font-medium uppercase tracking-widest">
            {currentImages.length} / 10 Slots Used
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {currentImages.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden bg-gray-100 rounded-sm border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <img 
                src={img.url} 
                alt={img.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4">
                <p className="text-white text-[10px] uppercase tracking-wider text-center mb-3 line-clamp-1">{img.name}</p>
                <button 
                  onClick={() => removeImage(img.id)}
                  className="p-2 bg-white/10 hover:bg-red-500 text-white rounded-full transition-colors border border-white/20"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          
          {/* Empty Slots */}
          {[...Array(Math.max(0, 5 - currentImages.length))].map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-gray-100 rounded-sm flex items-center justify-center text-gray-200">
               <ImageIcon size={24} />
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white border border-gray-100 rounded-sm p-8 shadow-sm">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h3 className="font-serif text-lg text-gray-900">Upload New Experience</h3>
            <p className="text-[11px] text-gray-400 uppercase tracking-widest">High resolution JPG or PNG preferred</p>
          </div>

          <div className={`relative border-2 border-dashed transition-all duration-300 group rounded-sm p-12 text-center 
            ${selectedFiles.length > 0 ? 'border-[#C6A45C] bg-[#c6a45c05]' : 'border-gray-100 hover:border-[#C6A45C]'}`}>
            
            <input
              id="diningFileInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label htmlFor="diningFileInput" className="cursor-pointer flex flex-col items-center">
              <div className={`mb-4 p-4 rounded-full transition-colors ${selectedFiles.length > 0 ? 'bg-[#C6A45C] text-white' : 'bg-gray-50 text-gray-400 group-hover:text-[#C6A45C]'}`}>
                <Upload size={32} />
              </div>
              <span className="text-[13px] font-medium uppercase tracking-[2px] text-gray-700">
                {selectedFiles.length === 0 ? 'Select Images to Add' : `${selectedFiles.length} Media Selected`}
              </span>
            </label>

            {selectedFiles.length > 0 && (
              <button 
                onClick={() => setSelectedFiles([])}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Action Button */}
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full h-14 bg-black text-white hover:bg-[#C6A45C] disabled:bg-gray-200 disabled:text-gray-400 transition-all duration-500 font-medium uppercase tracking-[3px] text-[12px] flex items-center justify-center shadow-lg"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              `Establish ${selectedFiles.length || ''} New Assets`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiningImages;