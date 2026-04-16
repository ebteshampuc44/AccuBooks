import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="navbar bg-white shadow-md border-b border-gray-200 sticky top-0 z-50 min-h-0 h-16">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52 border border-gray-200">
            <li><Link to="/dashboard" className="text-gray-700">Dashboard</Link></li>
            <li><Link to="/contacts" className="text-gray-700">Contacts</Link></li>
            <li><Link to="/transactions" className="text-gray-700">Transactions</Link></li>
            <li><Link to="/ledger" className="text-gray-700">Ledger</Link></li>
            <li><Link to="/reports" className="text-gray-700">Reports</Link></li>
          </ul>
        </div>
        <Link to="/dashboard" className="flex items-center -my-3">
          <img 
            src="https://i.ibb.co.com/dvcXzdJ/Gemini-Generated-Image-rf1iz4rf1iz4rf1i-removebg-preview.png" 
            alt="AccuBooks Logo" 
            className="h-20 w-auto"
          />
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link to="/dashboard" className="text-gray-700">Dashboard</Link></li>
          <li><Link to="/contacts" className="text-gray-700">Contacts</Link></li>
          <li><Link to="/transactions" className="text-gray-700">Transactions</Link></li>
          <li><Link to="/ledger" className="text-gray-700">Ledger</Link></li>
          <li><Link to="/reports" className="text-gray-700">Reports</Link></li>
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {/* Notification */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle text-gray-600">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="badge badge-xs badge-primary indicator-item">3</span>
            </div>
          </div>
          <div tabIndex={0} className="mt-3 z-[1] card card-compact dropdown-content w-80 bg-white shadow-xl border border-gray-200">
            <div className="card-body">
              <h3 className="card-title text-gray-900">Notifications</h3>
              <div className="divider my-1"></div>
              <div className="text-sm text-gray-700">New link request from Raj Traders</div>
              <div className="text-sm text-gray-500">Payment received of ₹10,000</div>
              <div className="text-sm text-gray-700">Transaction synced with Sharma Enterprises</div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
            <div className="w-10 rounded-full ring ring-blue-500 ring-offset-2">
              <img
                alt="Profile"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-white rounded-box w-52 border border-gray-200">
            <li><Link to="/profile" className="text-gray-700">Profile</Link></li>
            <li><Link to="/settings" className="text-gray-700">Settings</Link></li>
            <li><Link to="/link-request" className="text-gray-700">Link Account</Link></li>
            <div className="divider my-0"></div>
            <li><button onClick={handleLogout} className="text-gray-700">Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;