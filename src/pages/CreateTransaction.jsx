import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateTransaction = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    type: 'sale',
    counterpartyId: '',
    amount: '',
    reference: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contacts = [
    { id: 1, name: 'Raj Traders', type: 'buyer', linked: true },
    { id: 2, name: 'Sharma Enterprises', type: 'buyer', linked: false },
    { id: 3, name: 'Gupta Store', type: 'buyer', linked: true },
    { id: 4, name: 'Singh Suppliers', type: 'supplier', linked: true },
    { id: 5, name: 'Verma & Sons', type: 'supplier', linked: false },
  ];

  const filteredContacts = contacts.filter(c => 
    formData.type === 'sale' ? c.type === 'buyer' : 
    formData.type === 'purchase' ? c.type === 'supplier' : 
    true
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      alert('Transaction created successfully!\n\nLedger entries created: Credit & Debit');
      navigate('/transactions');
      setIsSubmitting(false);
    }, 1500);
  };

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
                {['sale', 'purchase', 'payment'].map((type) => (
                  <label key={type} className="cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      className="hidden peer"
                      checked={formData.type === type}
                      onChange={handleChange}
                    />
                    <div className={`
                      p-3 text-center rounded-lg border-2 transition-all cursor-pointer
                      ${formData.type === type 
                        ? 'border-blue-500 bg-blue-50 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                      }
                    `}>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className={`h-6 w-6 mx-auto mb-1 ${formData.type === type ? 'text-blue-600' : 'text-gray-400'}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth="2" 
                          d={type === 'sale' 
                            ? 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
                            : type === 'purchase' 
                            ? 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z' 
                            : 'M17 9V7a5 5 0 00-10 0v2M5 9h14l1 12H4L5 9z'
                          } 
                        />
                      </svg>
                      <p className={`font-medium capitalize ${formData.type === type ? 'text-gray-900' : 'text-gray-600'}`}>
                        {type}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {type === 'sale' ? 'To Buyer' : type === 'purchase' ? 'From Supplier' : 'Cash/Bank'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Counterparty Select */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                {formData.type === 'sale' ? 'Buyer' : formData.type === 'purchase' ? 'Supplier' : 'Party'}
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
                    {contact.name} {contact.linked ? '✓ (Linked)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  name="amount"
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

            {/* Double Entry Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Double-Entry Preview</h3>
                  <div className="text-sm text-gray-700 mt-2 space-y-1">
                    {formData.type === 'sale' && (
                      <>
                        <p>• Your Account: <span className="text-green-600 font-medium">Credit (+₹{parseInt(formData.amount) || 0})</span></p>
                        <p>• Buyer Account: <span className="text-red-600 font-medium">Debit (-₹{parseInt(formData.amount) || 0})</span></p>
                        <p className="text-xs text-gray-500 mt-1">The buyer's ledger will be updated automatically if linked.</p>
                      </>
                    )}
                    {formData.type === 'purchase' && (
                      <>
                        <p>• Your Account: <span className="text-red-600 font-medium">Debit (-₹{parseInt(formData.amount) || 0})</span></p>
                        <p>• Supplier Account: <span className="text-green-600 font-medium">Credit (+₹{parseInt(formData.amount) || 0})</span></p>
                        <p className="text-xs text-gray-500 mt-1">The supplier's ledger will be updated automatically if linked.</p>
                      </>
                    )}
                    {formData.type === 'payment' && (
                      <>
                        <p>• Your Account: <span className="text-red-600 font-medium">Debit (-₹{parseInt(formData.amount) || 0})</span></p>
                        <p>• Party Account: <span className="text-green-600 font-medium">Credit (+₹{parseInt(formData.amount) || 0})</span></p>
                        <p className="text-xs text-gray-500 mt-1">The party's ledger will be updated automatically if linked.</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
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
    </div>
  );
};

export default CreateTransaction;