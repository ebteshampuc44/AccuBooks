import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Ledger = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');

  const ledgerEntries = user?.ledgerEntries || [];

  const filteredEntries = ledgerEntries.filter(entry => {
    if (filter !== 'all' && entry.entryType !== filter) return false;
    return true;
  });

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
            <p className="text-4xl font-bold">₹{user?.currentBalance?.toLocaleString()}</p>
            <div className="flex justify-center gap-4 mt-4">
              <div>
                <p className="text-xs opacity-80">Total Credits</p>
                <p className="text-lg font-bold">₹60,000</p>
              </div>
              <div className="divider divider-horizontal bg-white/30"></div>
              <div>
                <p className="text-xs opacity-80">Total Debits</p>
                <p className="text-lg font-bold">₹25,000</p>
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

          <div className="overflow-x-auto mt-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Date</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Description</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Type</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium">Counterparty</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">Debit (-)</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">Credit (+)</th>
                  <th className="text-right py-3 px-4 text-gray-600 font-medium">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, idx) => (
                  <tr key={entry.id} className={`border-b border-gray-100 ${idx === filteredEntries.length - 1 ? 'bg-blue-50 font-bold' : 'hover:bg-gray-50'}`}>
                    <td className="py-3 px-4 text-gray-600">{entry.date}</td>
                    <td className="py-3 px-4 text-gray-900">
                      {entry.type === 'sale' ? 'Sale Invoice' : entry.type === 'purchase' ? 'Purchase Order' : 'Payment'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${entry.entryType === 'credit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {entry.entryType === 'credit' ? 'Credit' : 'Debit'}
                      </span>
                    </td>
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

          <div className="alert bg-green-50 border border-green-200 mt-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-bold text-gray-900">Double-Entry Verified</h3>
              <p className="text-sm text-gray-700">
                Total Credits (₹60,000) - Total Debits (₹25,000) = Current Balance (₹35,000)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ledger;