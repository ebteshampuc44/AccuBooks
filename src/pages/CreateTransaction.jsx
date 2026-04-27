// pages/CreateTransaction.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const { user, addTransaction } = useAuth();
  const [formData, setFormData] = useState({
    type: 'sale',
    counterpartyId: '',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Get all contacts
  const allContacts = user?.contacts || [];
  
  // Filter contacts based on transaction type
  const getFilteredContacts = () => {
    if (formData.type === 'sale') {
      return allContacts.filter(c => c.type === 'buyer');
    } else if (formData.type === 'purchase') {
      return allContacts.filter(c => c.type === 'supplier');
    } else if (formData.type === 'payment') {
      return allContacts.filter(c => c.type === 'buyer' || c.type === 'supplier');
    }
    return [];
  };

  const filteredContacts = getFilteredContacts();
  const selectedContact = allContacts.find(c => c.id === parseInt(formData.counterpartyId));

  // Check if selected contact is linked
  const isLinked = selectedContact?.linked === true;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.counterpartyId) {
      setError('Please select a contact');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (!formData.reference) {
      setError('Please enter a reference/invoice number');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const result = await addTransaction(formData);
      if (result.success) {
        const syncMessage = isLinked ? '\n\n✓ Transaction synced automatically with linked account!' : '';
        alert(`Transaction created successfully!${syncMessage}\n\nLedger entries created: Credit & Debit`);
        navigate('/transactions');
      } else {
        setError(result.error || 'Failed to create transaction');
      }
    } catch (error) {
      console.error('Transaction error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get transaction preview data
  const getPreviewData = () => {
    if (!selectedContact || !formData.amount) return null;
    
    const amount = parseFloat(formData.amount) || 0;
    const currentDue = selectedContact.totalDue || 0;
    let newDue = currentDue;
    let yourAccountChange = 0;
    let contactAccountChange = 0;
    
    if (formData.type === 'sale') {
      newDue = currentDue + amount;
      yourAccountChange = amount;
      contactAccountChange = -amount;
    } else if (formData.type === 'purchase') {
      newDue = currentDue + amount;
      yourAccountChange = -amount;
      contactAccountChange = amount;
    } else if (formData.type === 'payment') {
      newDue = Math.max(0, currentDue - amount);
      yourAccountChange = -amount;
      contactAccountChange = amount;
    }
    
    return {
      amount,
      currentDue,
      newDue,
      yourAccountChange,
      contactAccountChange,
      isLinked: selectedContact.linked
    };
  };

  const preview = getPreviewData();

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Header */}
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Create Transaction</h1>
            <p className="text-gray-500 mt-1">
              Every transaction will create two ledger entries (Credit & Debit) automatically
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Transaction Type */}
            <div>
              <label className="block text-gray-700 font-medium mb-3">Transaction Type</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'sale', label: 'Sale', sub: 'To Buyer', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
                  { id: 'purchase', label: 'Purchase', sub: 'From Supplier', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' },
                  { id: 'payment', label: 'Payment', sub: 'Cash/Bank', icon: 'M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z' }
                ].map((type) => (
                  <label key={type.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type.id}
                      className="hidden peer"
                      checked={formData.type === type.id}
                      onChange={handleChange}
                    />
                    <div className={`
                      p-3 text-center rounded-lg border-2 transition-all cursor-pointer
                      ${formData.type === type.id 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 mx-auto mb-1 ${formData.type === type.id ? 'text-blue-600' : 'text-gray-400'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={type.icon} />
                      </svg>
                      <p className={`font-medium capitalize ${formData.type === type.id ? 'text-gray-900' : 'text-gray-600'}`}>
                        {type.label}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{type.sub}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Counterparty Select */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {formData.type === 'sale' ? 'Buyer (Customer)' : 
                 formData.type === 'purchase' ? 'Supplier (Vendor)' : 
                 'Select Party'}
              </label>
              <select
                name="counterpartyId"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                value={formData.counterpartyId}
                onChange={handleChange}
                required
              >
                <option value="">Select {formData.type === 'sale' ? 'buyer' : formData.type === 'purchase' ? 'supplier' : 'party'}...</option>
                {filteredContacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name} {contact.linked ? '🔗 (Linked - Auto Sync)' : ` | Due: ₹${(contact.totalDue || 0).toLocaleString()}`}
                  </option>
                ))}
              </select>
              
              {filteredContacts.length === 0 && (
                <p className="text-sm text-amber-600 mt-2">
                  No {formData.type === 'sale' ? 'buyers' : formData.type === 'purchase' ? 'suppliers' : 'contacts'} found. 
                  <Link to="/add-contact" className="text-blue-600 ml-1 hover:underline">Add a contact first</Link>
                </p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
                <input
                  type="number"
                  name="amount"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-lg"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Reference & Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Reference / Invoice No.</label>
                <input
                  type="text"
                  name="reference"
                  placeholder="INV-001 / PO-123"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.reference}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Transaction Date</label>
                <input
                  type="date"
                  name="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Description (Optional)</label>
              <textarea
                name="description"
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                placeholder="Additional notes about this transaction..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Double Entry Preview */}
            {preview && (
              <div className={`rounded-lg p-4 border-2 transition-all duration-300 ${
                preview.isLinked 
                  ? 'bg-green-50 border-green-300 shadow-md' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex gap-3">
                  {preview.isLinked ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold ${preview.isLinked ? 'text-green-800' : 'text-gray-900'}`}>
                      {preview.isLinked ? '🔗 Linked Account - Auto Sync Enabled' : 'Double-Entry Preview'}
                    </h3>
                    
                    <div className="text-sm mt-2 space-y-1">
                      {formData.type === 'sale' && (
                        <>
                          <p>• <span className="font-medium">Your Account:</span> <span className="text-green-600">Credit (+₹{preview.amount.toLocaleString()})</span></p>
                          <p>• <span className="font-medium">{selectedContact?.name}:</span> <span className="text-red-600">Debit (-₹{preview.amount.toLocaleString()})</span></p>
                        </>
                      )}
                      {formData.type === 'purchase' && (
                        <>
                          <p>• <span className="font-medium">Your Account:</span> <span className="text-red-600">Debit (-₹{preview.amount.toLocaleString()})</span></p>
                          <p>• <span className="font-medium">{selectedContact?.name}:</span> <span className="text-green-600">Credit (+₹{preview.amount.toLocaleString()})</span></p>
                        </>
                      )}
                      {formData.type === 'payment' && (
                        <>
                          <p>• <span className="font-medium">Your Account:</span> <span className="text-red-600">Debit (-₹{preview.amount.toLocaleString()})</span></p>
                          <p>• <span className="font-medium">{selectedContact?.name}:</span> <span className="text-green-600">Credit (+₹{preview.amount.toLocaleString()})</span></p>
                        </>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-gray-200 text-xs">
                      <p className="text-gray-600">
                        Current Due: <span className="font-semibold">₹{preview.currentDue.toLocaleString()}</span>
                        {' → '}
                        New Due: <span className="font-semibold">₹{preview.newDue.toLocaleString()}</span>
                      </p>
                      {preview.isLinked && (
                        <p className="text-green-600 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102" />
                          </svg>
                          This transaction will automatically sync to {selectedContact?.name}'s ledger
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Linked Account Info Box */}
            {selectedContact?.linked && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">Linked Account:</span> {selectedContact.name} is connected with you. 
                    Transactions will be automatically synced to their ledger.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button 
                type="button" 
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium"
                onClick={() => navigate('/transactions')}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 ${
                  isSubmitting || filteredContacts.length === 0 ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isSubmitting || filteredContacts.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Transaction
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Info Card - Double Entry Explanation */}
      <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
        <div className="flex items-start gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h3 className="font-semibold text-gray-900">Double-Entry Accounting System</h3>
            <p className="text-sm text-gray-600 mt-1">
              Every transaction creates two entries - one Credit and one Debit. 
              {selectedContact?.linked && (
                <span className="text-green-600 block mt-1">
                  ✓ Since {selectedContact.name} is linked, their ledger will update automatically in real-time.
                </span>
              )}
              {!selectedContact?.linked && selectedContact && (
                <span className="text-amber-600 block mt-1">
                  ⚠️ This contact is not linked. To enable auto-sync, send them a link request from the Link Request page.
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTransaction;