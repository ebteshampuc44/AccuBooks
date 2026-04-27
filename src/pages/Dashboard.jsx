// pages/Dashboard.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();

  // Calculate real data from user's contacts and transactions
  const contacts = user?.contacts || [];
  const buyers = contacts.filter(c => c.type === 'buyer');
  const suppliers = contacts.filter(c => c.type === 'supplier');
  
  // Calculate total receivable from buyers who owe money
  const totalReceivable = buyers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  
  // Calculate total payable to suppliers
  const totalPayable = suppliers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  
  // Current balance = Receivable - Payable
  const currentBalance = totalReceivable - totalPayable;

  const stats = [
    { 
      title: 'Total Receivable', 
      value: `₹${totalReceivable.toLocaleString()}`, 
      color: 'from-emerald-500 to-green-600', 
      bgLight: 'bg-emerald-50', 
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
      title: 'Total Payable', 
      value: `₹${totalPayable.toLocaleString()}`, 
      color: 'from-rose-500 to-red-600', 
      bgLight: 'bg-rose-50', 
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
      title: 'Current Balance', 
      value: `₹${currentBalance.toLocaleString()}`, 
      color: 'from-blue-500 to-indigo-600', 
      bgLight: 'bg-blue-50', 
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' 
    },
    { 
      title: 'Linked Accounts', 
      value: user?.linkedContacts?.length || 0, 
      color: 'from-purple-500 to-violet-600', 
      bgLight: 'bg-purple-50', 
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102' 
    },
    { 
      title: 'Buyers', 
      value: buyers.length, 
      color: 'from-teal-500 to-cyan-600', 
      bgLight: 'bg-teal-50', 
      icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' 
    },
    { 
      title: 'Suppliers', 
      value: suppliers.length, 
      color: 'from-orange-500 to-amber-600', 
      bgLight: 'bg-orange-50', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
  ];

  const quickActions = [
    { title: 'New Transaction', path: '/create-transaction', gradient: 'from-blue-500 to-blue-600', icon: 'M12 4v16m8-8H4' },
    { title: 'Add Contact', path: '/add-contact', gradient: 'from-teal-500 to-teal-600', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { title: 'Link Account', path: '/link-request', gradient: 'from-purple-500 to-purple-600', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102' },
    { title: 'View Ledger', path: '/ledger', gradient: 'from-gray-600 to-gray-700', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  ];

  const recentTransactions = user?.recentTransactions || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full filter blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full filter blur-3xl -ml-24 -mb-24"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                Welcome back, {user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-blue-100 text-lg mb-3">
                {user?.businessName || 'Set up your business profile'} • {user?.businessType || 'Complete profile'}
              </p>
              {user?.gst && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-medium">GST: {user.gst}</span>
                </div>
              )}
              {!user?.businessName && (
                <Link to="/profile" className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Complete Profile
                </Link>
              )}
            </div>
            
            <div className="mt-4 md:mt-0">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
                <p className="text-sm text-blue-100">Today's Date</p>
                <p className="text-xl font-semibold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="group relative bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full transform translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-500`}></div>
            <div className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg flex items-center justify-center`}>
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.icon} />
                  </svg>
                </div>
                <div className={`px-2 py-1 rounded-full ${stat.bgLight} text-xs font-semibold`}>
                  Current
                </div>
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">{stat.title}</p>
              <p className="text-3xl font-bold text-gray-900 tracking-tight">{stat.value}</p>
              <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full w-3/4 bg-gradient-to-r ${stat.color} rounded-full`}></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, idx) => (
              <Link
                key={idx}
                to={action.path}
                className={`group relative overflow-hidden bg-gradient-to-r ${action.gradient} rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative px-4 py-3 flex items-center justify-center gap-2 text-white font-semibold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={action.icon} />
                  </svg>
                  {action.title}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
            </div>
            <Link to="/transactions" className="group inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
        
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Date</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Type</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Counterparty</th>
                  <th className="text-left py-4 px-6 text-gray-600 font-semibold text-sm">Reference</th>
                  <th className="text-right py-4 px-6 text-gray-600 font-semibold text-sm">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.slice(0, 5).map((tx) => (
                  <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                    <td className="py-3 px-6 text-gray-600 text-sm">{tx.date}</td>
                    <td className="py-3 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tx.type === 'sale' ? 'bg-emerald-100 text-emerald-700' : 
                        tx.type === 'purchase' ? 'bg-rose-100 text-rose-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          tx.type === 'sale' ? 'bg-emerald-500' : 
                          tx.type === 'purchase' ? 'bg-rose-500' : 
                          'bg-blue-500'
                        }`}></span>
                        {tx.type === 'sale' ? 'Sale' : tx.type === 'purchase' ? 'Purchase' : 'Payment'}
                      </span>
                    </td>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                          {tx.counterparty?.charAt(0) || '?'}
                        </div>
                        <span className="text-gray-800 font-medium text-sm">{tx.counterparty}</span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-gray-500 text-sm font-mono">{tx.reference}</td>
                    <td className={`py-3 px-6 text-right font-bold text-sm ${
                      tx.type === 'sale' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'sale' ? '+' : '-'} ₹{tx.amount.toLocaleString()}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500">No transactions yet</p>
            <Link to="/create-transaction" className="inline-block mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium">
              Create your first transaction →
            </Link>
          </div>
        )}
      </div>

      {/* Getting Started Guide for New Users */}
      {contacts.length === 0 && recentTransactions.length === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 text-lg">Welcome to AccuBooks! 🎉</h3>
              <p className="text-gray-600 mt-1">Your account is ready. Here's how to get started:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Complete your business profile</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Add your buyers and suppliers</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Create your first transaction</span>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link to="/profile" className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Complete Profile →
                </Link>
                <Link to="/add-contact" className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                  Add Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data Persistence Info */}
      <div className="text-center text-xs text-gray-400">
        <p>✅ Your data is automatically saved. You can log out and log back in anytime.</p>
      </div>
    </div>
  );
};

export default Dashboard;