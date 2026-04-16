import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BusinessProfile = () => {
  const { user, completeProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.businessName) {
      alert('দয়া করে ব্যবসার নাম দিন');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await completeProfile(formData);
      if (result.success) {
        alert('প্রোফাইল সফলভাবে সম্পূর্ণ হয়েছে!');
        navigate('/dashboard');
      } else {
        alert(result.error || 'প্রোফাইল সেভ করতে ব্যর্থ হয়েছে');
      }
    } catch (error) {
      alert('কিছু একটা সমস্যা হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">আপনার ব্যবসার প্রোফাইল সম্পূর্ণ করুন</h1>
        <p className="text-gray-500 mt-1">শুরু করতে আপনার ব্যবসার তথ্য দিন</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">ব্যবসার তথ্য</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  ব্যবসার নাম <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="businessName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.businessName}
                  onChange={handleChange}
                  required
                  placeholder="যেমন: রহমান ট্রেডার্স"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">ব্যবসার ধরন</label>
                <select
                  name="businessType"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  value={formData.businessType}
                  onChange={handleChange}
                >
                  <option value="">ব্যবসার ধরন নির্বাচন করুন</option>
                  <option value="Wholesale Trading">পাইকারি ব্যবসা</option>
                  <option value="Retail">খুচরা ব্যবসা</option>
                  <option value="Manufacturing">উৎপাদন কারখানা</option>
                  <option value="Service">সেবা খাত</option>
                  <option value="Distribution">বিতরণ ব্যবসা</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">বিন কর নম্বর (BIN)</label>
                <input
                  type="text"
                  name="gst"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.gst}
                  onChange={handleChange}
                  placeholder="বাংলাদেশের BIN নম্বর"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">ইমেইল ঠিকানা</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="contact@yourbusiness.com"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">ঠিকানা</label>
                <textarea
                  name="address"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="আপনার ব্যবসার সম্পূর্ণ ঠিকানা"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">ওয়েবসাইট</label>
                <input
                  type="url"
                  name="website"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://yourbusiness.com"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isLoading ? 'সেভ করা হচ্ছে...' : 'প্রোফাইল সম্পূর্ণ করুন'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Phone Info */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-sm text-blue-800">
              আপনার অ্যাকাউন্ট এই নম্বরে তৈরি হয়েছে: <strong>+880 {user?.phone}</strong>
            </p>
            <p className="text-xs text-blue-600 mt-1">সব ফিচার ব্যবহার করতে প্রোফাইল সম্পূর্ণ করুন</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessProfile;