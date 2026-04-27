// pages/AddContact.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AddContact = () => {
  const navigate = useNavigate();
  const { user, addContact } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    type: 'buyer',
    gst: '',
    address: '',
    openingBalance: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [existingUser, setExistingUser] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const checkExistingUser = async () => {
    if (!formData.phone || formData.phone.length < 10) return;
    
    setCheckingUser(true);
    // Check if phone already exists in user's contacts
    const existingContact = user?.contacts?.find(c => c.phone === formData.phone);
    if (existingContact) {
      setExistingUser(existingContact);
    } else {
      // Simulate API call to check if phone is registered on AccuBooks
      setTimeout(() => {
        if (formData.phone === '9876543210' || formData.phone === '9876543211') {
          setExistingUser({
            id: formData.phone === '9876543210' ? 999 : 888,
            name: formData.phone === '9876543210' ? 'Raj Malhotra' : 'Priya Sharma',
            phone: formData.phone,
            businessName: formData.phone === '9876543210' ? 'Raj Traders' : 'Sharma Enterprises',
          });
        } else {
          setExistingUser(null);
        }
        setCheckingUser(false);
      }, 1000);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await addContact(formData);
      if (result.success) {
        alert(`Contact "${formData.name}" added successfully!${existingUser ? ' Would you like to link accounts?' : ''}`);
        navigate('/contacts');
      } else {
        alert('Failed to add contact. Please try again.');
      }
    } catch (error) {
      alert('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendLinkRequest = () => {
    alert(`Link request sent to ${existingUser?.name}!`);
    navigate('/contacts');
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Add New Contact</h1>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Contact Name */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">Contact Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter business or person name"
                  className="input input-bordered w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Phone Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">Phone Number *</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">+880</span>
                    <input
                      type="tel"
                      name="phone"
                      placeholder="1712345678"
                      className="input input-bordered w-full pl-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={checkExistingUser}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                    onClick={checkExistingUser}
                    disabled={checkingUser}
                  >
                    {checkingUser ? <span className="loading loading-spinner loading-sm"></span> : 'Check'}
                  </button>
                </div>
              </div>

              {/* Contact Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">Contact Type</span>
                </label>
                <select
                  name="type"
                  className="select select-bordered w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                  value={formData.type}
                  onChange={handleChange}
                >
                  <option value="buyer">Buyer (Customer)</option>
                  <option value="supplier">Supplier (Vendor)</option>
                </select>
              </div>

              {/* GST Number */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">GST Number (Optional)</span>
                </label>
                <input
                  type="text"
                  name="gst"
                  placeholder="27AAAAA1234A1Z"
                  className="input input-bordered w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                  value={formData.gst}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">Address</span>
                </label>
                <textarea
                  name="address"
                  className="textarea textarea-bordered w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900 placeholder-gray-400"
                  rows="2"
                  placeholder="Full address..."
                  value={formData.address}
                  onChange={handleChange}
                ></textarea>
              </div>

              {/* Opening Balance */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-gray-700 font-medium">Opening Balance</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                  <input
                    type="number"
                    name="openingBalance"
                    className="input input-bordered w-full pl-8 border-gray-300 focus:border-blue-500 focus:ring-blue-500 bg-white text-gray-900"
                    value={formData.openingBalance}
                    onChange={handleChange}
                  />
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Positive = They owe you | Negative = You owe them
                  </span>
                </label>
              </div>
            </div>

            {/* Existing User Alert */}
            {existingUser && (
              <div className="alert bg-blue-50 border border-blue-200 shadow-sm">
                <div className="flex gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="font-bold text-gray-900">User Already Exists!</h3>
                    <div className="text-sm text-gray-700">
                      {existingUser.name} ({existingUser.businessName}) is already registered on AccuBooks.
                      <br />
                      Would you like to link your accounts for auto-sync?
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-sm bg-blue-600 hover:bg-blue-700 text-white border-none" onClick={sendLinkRequest}>
                    Send Link Request
                  </button>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button 
                type="button" 
                className="btn btn-ghost text-gray-600 hover:bg-gray-100" 
                onClick={() => navigate('/contacts')}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn bg-blue-600 hover:bg-blue-700 text-white border-none"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Card - Pro Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl mt-6">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <h3 className="font-bold text-gray-900">Pro Tip</h3>
              <p className="text-sm text-gray-700">
                Opening balance will affect your receivable/payable totals. Positive amount means the contact owes you money.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddContact;