import { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, CheckCircle, X } from 'lucide-react';

const HotelImages = () => {
  const [currentImages, setCurrentImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  useEffect(() => {
    // Demo images
    setCurrentImages([
      { id: 1, url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&fit=crop', name: 'hotel-main-1.jpg' },
      { id: 2, url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&fit=crop', name: 'hotel-lobby.jpg' },
      { id: 3, url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&fit=crop', name: 'hotel-exterior.jpg' }
    ]);
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setUploadSuccess(false);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('hotelImages', file);
    });

    try {
      const res = await fetch('/api/admin/upload-hotel-images', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      
      if (result.success) {
        setUploadSuccess(true);
        setSelectedFiles([]);
        document.getElementById('hotelFileInput').value = '';
        setTimeout(() => setUploadSuccess(false), 3000);
      }
    } catch (error) {
      alert('Upload failed! Backend chal raha hai?');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hotel Page Images</h1>
          <p className="text-gray-500">Update images for hotel landing page (Max 5 images)</p>
        </div>
        {uploadSuccess && (
          <div className="bg-green-100 border border-green-200 text-green-800 px-6 py-3 rounded-xl flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Images uploaded successfully!
          </div>
        )}
      </div>

      {/* Current Images */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <ImageIcon className="w-6 h-6 mr-2 text-blue-600" />
          Current Images ({currentImages.length}/10)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {currentImages.map((img) => (
            <div key={img.id} className="group relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-all">
              <img 
                src={img.url} 
                alt="Hotel" 
                className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300" 
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <span className="text-white font-medium text-sm px-3 py-1 bg-black bg-opacity-50 rounded-full">
                  {img.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100/50 p-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Upload New Images</h2>
        <div className="space-y-4 max-w-2xl">
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
            <input
              id="hotelFileInput"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label htmlFor="hotelFileInput" className="cursor-pointer flex flex-col items-center">
              <Upload className="w-12 h-12 text-gray-400 group-hover:text-blue-500 mb-4 transition-colors" />
              <p className="text-lg font-semibold text-gray-700 group-hover:text-blue-600">
                {selectedFiles.length === 0 ? 'Click to select images' : `${selectedFiles.length} files selected`}
              </p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG (Max 5MB each)</p>
            </label>
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="font-medium text-gray-800 mb-2">Selected files:</p>
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="bg-gray-100 px-3 py-1 rounded-lg text-sm flex items-center">
                    {file.name}
                    <button 
                      onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-8 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
          >
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Uploading...
              </>
            ) : (
              `Upload ${selectedFiles.length || 0} Image${selectedFiles.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default HotelImages;
