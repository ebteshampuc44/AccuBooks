import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { verifyOTPAndLogin, sendLoginOTP } = useAuth();
  const phone = sessionStorage.getItem('loginPhone');

  useEffect(() => {
    if (!phone) {
      navigate('/login');
    }
  }, [phone, navigate]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('৬ ডিজিটের OTP সম্পূর্ণ দিন');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      const result = await verifyOTPAndLogin(otpValue);
      if (result.success) {
        sessionStorage.removeItem('loginPhone');
        if (!result.isProfileComplete) {
          navigate('/profile');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(result.error || 'OTP সঠিক নয়। আবার চেষ্টা করুন।');
      }
    } catch (err) {
      setError('ভেরিফিকেশন ব্যর্থ হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimer(60);
    setError('');
    try {
      const result = await sendLoginOTP(phone);
      if (!result.success) {
        alert(result.error || 'OTP পুনরায় পাঠানো যায়নি');
      }
    } catch (err) {
      alert('OTP পুনরায় পাঠানো যায়নি');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-gray-50 to-teal-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">OTP ভেরিফিকেশন</h2>
          <p className="text-gray-500 mt-2">
            <strong className="text-gray-900">+880 {phone}</strong> নম্বরে ৬ ডিজিটের কোড পাঠানো হয়েছে
          </p>
        </div>

        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                autoFocus={index === 0}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className={`w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                ভেরিফাই করা হচ্ছে...
              </span>
            ) : (
              'ভেরিফাই করুন'
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          {timer > 0 ? (
            <p className="text-sm text-gray-500">
              পুনরায় কোড পাঠাতে <span className="font-bold text-blue-600">{timer}</span> সেকেন্ড অপেক্ষা করুন
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              পুনরায় OTP পাঠান
            </button>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-xs text-gray-400">
            <p>কোড না পেলে নেটওয়ার্ক কানেকশন চেক করুন</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;