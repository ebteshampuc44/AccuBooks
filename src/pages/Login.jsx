// src/pages/Login.jsx - শুধু ডেমো লগইন
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [phone, setPhone] = useState('9876543210');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { demoLogin } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('880')) cleanPhone = cleanPhone.slice(3);
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.slice(1);
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await demoLogin(cleanPhone);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('লগইন ব্যর্থ হয়েছে');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-full bg-blue-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">AccuBooks</h2>
          <p className="text-gray-500 mt-2">ডেমো ভার্সন</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">মোবাইল নম্বর</label>
            <div className="flex gap-2">
              <div className="w-20">
                <input type="text" value="+880" disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="9876543210"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">শুধুমাত্র <strong>9876543210</strong> নাম্বার কাজ করবে</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
          >
            {isLoading ? 'লগইন হচ্ছে...' : 'লগইন করুন'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-center">
            <p className="text-sm font-medium text-green-800">✅ ডেমো অ্যাকাউন্ট</p>
            <p className="text-xs text-green-600 mt-1">
              নাম্বার: <strong>9876543210</strong>
            </p>
            <p className="text-xs text-green-600">
              OTP প্রয়োজন নেই - সরাসরি লগইন হবে
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;