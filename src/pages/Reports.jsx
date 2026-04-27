// pages/Reports.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const Reports = () => {
  const { user, getTransactionSummary } = useAuth();
  const [period, setPeriod] = useState('month');

  const summary = getTransactionSummary();
  const contacts = user?.contacts || [];
  
  const buyers = contacts.filter(c => c.type === 'buyer');
  const suppliers = contacts.filter(c => c.type === 'supplier');
  
  const totalReceivable = buyers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  const totalPayable = suppliers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  
  const grossProfit = summary.sales - summary.purchases;
  const grossProfitMargin = summary.sales > 0 ? ((grossProfit / summary.sales) * 100).toFixed(1) : 0;

  // Top buyers by sales
  const topBuyers = [...buyers]
    .sort((a, b) => b.totalDue - a.totalDue)
    .slice(0, 3);
    
  // Top suppliers by purchases
  const topSuppliers = [...suppliers]
    .sort((a, b) => b.totalDue - a.totalDue)
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Financial Reports</h1>
        <p className="text-gray-500 mt-1">Summary of your business performance</p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="join">
          <button 
            className={`join-item btn border-gray-200 ${period === 'week' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`} 
            onClick={() => setPeriod('week')}
          >
            Week
          </button>
          <button 
            className={`join-item btn border-gray-200 ${period === 'month' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`} 
            onClick={() => setPeriod('month')}
          >
            Month
          </button>
          <button 
            className={`join-item btn border-gray-200 ${period === 'quarter' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`} 
            onClick={() => setPeriod('quarter')}
          >
            Quarter
          </button>
          <button 
            className={`join-item btn border-gray-200 ${period === 'year' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`} 
            onClick={() => setPeriod('year')}
          >
            Year
          </button>
        </div>
      </div>

      {/* P&L Summary & Receivables/Payables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit & Loss Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Profit & Loss Summary</h2>
            </div>
            <div className="border-t border-gray-200 my-3"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Sales Revenue</span>
                <span className="text-green-600 font-bold text-xl">₹{summary.sales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Cost of Purchases</span>
                <span className="text-red-600 font-bold text-xl">₹{summary.purchases.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Gross Profit</span>
                <span className="text-blue-600 font-bold text-2xl">₹{grossProfit.toLocaleString()}</span>
              </div>
              <div className="text-center mt-3">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  Gross Profit Margin: {grossProfitMargin}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Receivables & Payables */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v4m0-4h4m0 0v4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Receivables & Payables</h2>
            </div>
            <div className="border-t border-gray-200 my-3"></div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Accounts Receivable (Due from Buyers)</span>
                <span className="text-green-600 font-bold text-xl">₹{totalReceivable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Accounts Payable (Due to Suppliers)</span>
                <span className="text-red-600 font-bold text-xl">₹{totalPayable.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">Net Position</span>
                <span className="text-blue-600 font-bold text-2xl">₹{(totalReceivable - totalPayable).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Customers & Suppliers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Buyers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Top Buyers (By Due Amount)</h2>
            </div>
            {topBuyers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Buyer</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-medium">Due Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBuyers.map((buyer) => (
                      <tr key={buyer.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{buyer.name}</td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">₹{buyer.totalDue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No buyers added yet</p>
            )}
          </div>
        </div>

        {/* Top Suppliers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Top Suppliers (By Due Amount)</h2>
            </div>
            {topSuppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 text-gray-600 font-medium">Supplier</th>
                      <th className="text-right py-3 px-4 text-gray-600 font-medium">Due Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topSuppliers.map((supplier) => (
                      <tr key={supplier.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-900">{supplier.name}</td>
                        <td className="py-3 px-4 text-right text-red-600 font-medium">₹{supplier.totalDue.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No suppliers added yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Export Reports */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12m-4 4h8" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Export Reports</h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <button className="btn bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export as PDF
            </button>
            <button className="btn bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export as Excel
            </button>
            <button className="btn bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;