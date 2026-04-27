// pages/Contacts.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Contacts = () => {
  const { user, getContactsByType } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const contacts = user?.contacts || [];
  
  const filteredContacts = contacts.filter(contact => {
    const matchesTab = activeTab === 'all' || contact.type === activeTab;
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          contact.phone.includes(searchTerm);
    return matchesTab && matchesSearch;
  });

  const buyers = contacts.filter(c => c.type === 'buyer');
  const suppliers = contacts.filter(c => c.type === 'supplier');
  
  const totalReceivable = buyers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  const totalPayable = suppliers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your buyers and suppliers</p>
        </div>
        <Link 
          to="/add-contact" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Contact
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Receivable</p>
              <p className="text-2xl font-bold text-green-600">₹{totalReceivable.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Payable</p>
              <p className="text-2xl font-bold text-red-600">₹{totalPayable.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v4m0-4h4m0 0v4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {/* Filters */}
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'all' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('all')}
              >
                All Contacts ({contacts.length})
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'buyer' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('buyer')}
              >
                Buyers ({buyers.length})
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === 'supplier' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('supplier')}
              >
                Suppliers ({suppliers.length})
              </button>
            </div>
            
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search by name or phone..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          {filteredContacts.length > 0 ? (
            <div className="overflow-x-auto mt-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Name</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Phone</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Type</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">GST</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium text-sm">Balance</th>
                    <th className="text-center py-3 px-4 text-gray-600 font-medium text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-3 px-4 font-medium text-gray-900 text-sm">{contact.name}</td>
                      <td className="py-3 px-4 text-gray-600 text-sm">{contact.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          contact.type === 'buyer' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {contact.type === 'buyer' ? 'Buyer' : 'Supplier'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs font-mono">{contact.gst || '-'}</td>
                      <td className={`py-3 px-4 text-right font-bold text-sm ${
                        contact.totalDue > 0 ? 'text-red-600' : contact.totalDue < 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {contact.totalDue > 0 ? `₹${contact.totalDue.toLocaleString()}` : 
                         contact.totalDue < 0 ? `₹${Math.abs(contact.totalDue).toLocaleString()}` : '₹0'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex gap-2 justify-center">
                          <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150">
                            Ledger
                          </button>
                          {!contact.linked && (
                            <button className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-150">
                              Link
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <p className="text-gray-500">No contacts found</p>
              <Link to="/add-contact" className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium">
                Add your first contact
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Info Tip */}
      {contacts.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-semibold text-gray-900">Getting Started</h3>
              <p className="text-sm text-gray-700 mt-1">
                Start by adding your buyers and suppliers. Click the "Add Contact" button to get started.
                Once added, you can create transactions and track your ledger automatically.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;