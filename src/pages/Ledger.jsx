// pages/Ledger.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Ledger = () => {
  const { user, getTotalCredits, getTotalDebits } = useAuth();
  const [filter, setFilter] = useState('all');

  const ledgerEntries = user?.ledgerEntries || [];
  const totalCredits = getTotalCredits();
  const totalDebits = getTotalDebits();
  const currentBalance = (user?.currentBalance || 0);

  const filteredEntries = ledgerEntries.filter(entry => {
    if (filter !== 'all' && entry.entryType !== filter) return false;
    return true;
  });

  // Sort by date (newest first)
  const sortedEntries = [...filteredEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">General Ledger</h1>
        <p className="text-gray-500 mt-1">Complete transaction history with running balance</p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl text-white">
        <div className="p-6">
          <div className="text-center">
            <p className="text-sm opacity-80">Current Balance</p>
            <p className="text-4xl font-bold">₹{currentBalance.toLocaleString()}</p>
            <div className="flex justify-center gap-4 mt-4">
              <div>
                <p className="text-xs opacity-80">Total Credits</p>
                <p className="text-lg font-bold">₹{totalCredits.toLocaleString()}</p>
              </div>
              <div className="w-px bg-white/30"></div>
              <div>
                <p className="text-xs opacity-80">Total Debits</p>
                <p className="text-lg font-bold">₹{totalDebits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="tabs tabs-boxed bg-gray-100 w-fit">
            <button
              className={`tab ${filter === 'all' ? 'tab-active bg-white text-gray-900' : 'text-gray-600'}`}
              onClick={() => setFilter('all')}
            >
              All Entries
            </button>
            <button
              className={`tab ${filter === 'credit' ? 'tab-active bg-white text-gray-900' : 'text-gray-600'}`}
              onClick={() => setFilter('credit')}
            >
              Credits (+)
            </button>
            <button
              className={`tab ${filter === 'debit' ? 'tab-active bg-white text-gray-900' : 'text-gray-600'}`}
              onClick={() => setFilter('debit')}
            >
              Debits (-)
            </button>
          </div>

          {sortedEntries.length > 0 ? (
            <div className="overflow-x-auto mt-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Description</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Reference</th>
                    <th className="text-left py-3 px-4 text-gray-600 font-medium">Counterparty</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Debit (-)</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Credit (+)</th>
                    <th className="text-right py-3 px-4 text-gray-600 font-medium">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedEntries.map((entry, idx) => (
                    <tr key={entry.id} className={`border-b border-gray-100 ${idx === sortedEntries.length - 1 ? 'bg-blue-50 font-bold' : 'hover:bg-gray-50'}`}>
                      <td className="py-3 px-4 text-gray-600">{entry.date}</td>
                      <td className="py-3 px-4 text-gray-900">
                        {entry.type === 'sale' ? 'Sale Invoice' : entry.type === 'purchase' ? 'Purchase Order' : 'Payment'}
                        {entry.description && <span className="text-gray-400 text-xs block">{entry.description}</span>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.entryType === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {entry.entryType === 'credit' ? 'Credit' : 'Debit'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500 font-mono text-sm">{entry.reference || '-'}</td>
                      <td className="py-3 px-4 text-gray-700">{entry.counterparty}</td>
                      <td className="py-3 px-4 text-right font-mono text-red-600">
                        {entry.entryType === 'debit' ? `₹${entry.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-green-600">
                        {entry.entryType === 'credit' ? `₹${entry.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        ₹{entry.balanceAfter.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No ledger entries yet</p>
              <Link to="/create-transaction" className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
                Create your first transaction →
              </Link>
            </div>
          )}

          {sortedEntries.length > 0 && (
            <div className="alert bg-green-50 border border-green-200 mt-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-bold text-gray-900">Double-Entry Verified</h3>
                <p className="text-sm text-gray-700">
                  Total Credits (₹{totalCredits.toLocaleString()}) - Total Debits (₹{totalDebits.toLocaleString()}) = Current Balance (₹{currentBalance.toLocaleString()})
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Ledger;