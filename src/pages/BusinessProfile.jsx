// pages/BusinessProfile.jsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BusinessProfile = () => {
  const { user, completeProfile, updateProfilePicture, uploadingPhoto } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(user?.photoURL || '');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    businessName: user?.businessName || '',
    businessType: user?.businessType || '',
    gst: user?.gst || '',
    address: user?.address || '',
    email: user?.email || '',
    website: user?.website || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('File selected:', file.name, file.type, file.size);
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file (JPEG, PNG, GIF)');
      setUploadSuccess('');
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be less than 5MB');
      setUploadSuccess('');
      return;
    }
    
    setUploadError('');
    setUploadSuccess('');
    
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      console.log('Preview created');
    };
    reader.readAsDataURL(file);
    
    // Upload to Firebase Storage
    console.log('Starting upload...');
    const result = await updateProfilePicture(file);
    console.log('Upload result:', result);
    
    if (result.success) {
      setUploadSuccess('Profile picture updated successfully!');
      setPreviewUrl(result.url);
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setUploadError(`Upload failed: ${result.error}`);
      setPreviewUrl(user?.photoURL || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.businessName) {
      alert('Please enter your business name');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await completeProfile(formData);
      if (result.success) {
        alert('Profile completed successfully!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'Failed to save profile');
      }
    } catch (error) {
      alert('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Business Profile</h1>
        <p className="text-gray-500 mt-1">Manage your business information and profile picture</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-200">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-white shadow-lg">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.log('Image load error');
                      e.target.src = '';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </div>
              
              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 disabled:opacity-50"
                title="Upload profile picture"
              >
                {uploadingPhoto ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            
            <h3 className="mt-3 text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            
            {uploadError && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{uploadError}</p>
              </div>
            )}
            
            {uploadSuccess && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{uploadSuccess}</p>
              </div>
            )}
            
            <p className="mt-2 text-xs text-gray-400">
              Click the camera icon to change profile picture (JPEG, PNG, max 5MB)
            </p>
          </div>

          {/* Business Information Form */}
          <div className="flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Business Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Business Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Rahman Traders"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Business Type</label>
                <select
                  name="businessType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors"
                  value={formData.businessType}
                  onChange={handleChange}
                >
                  <option value="">Select business type</option>
                  <option value="Wholesale Trading">Wholesale Trading</option>
                  <option value="Retail">Retail</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Service">Service Sector</option>
                  <option value="Distribution">Distribution Business</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">GST / BIN Number</label>
                <input
                  type="text"
                  name="gst"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.gst}
                  onChange={handleChange}
                  placeholder="GST or BIN number"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Address</label>
                <textarea
                  name="address"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Your complete business address"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-md'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900">Profile Information</h3>
            <p className="text-sm text-gray-700 mt-1">
              Complete your business profile to get started. You can add contacts and create transactions after saving your business information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;