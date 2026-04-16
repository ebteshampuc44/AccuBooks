// src/contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, setupRecaptcha, sendOTP, logoutUser } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmationResult, setConfirmationResult] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('accubooks_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // ডেমো লগইন (সবচেয়ে সহজ, কোন OTP লাগবে না)
  const demoLogin = async (phone) => {
    // শুধুমাত্র এই নাম্বারটা কাজ করবে
    if (phone !== '9876543210') {
      return { success: false, error: 'শুধুমাত্র 9876543210 নাম্বার ব্যবহার করুন' };
    }
    
    const demoUser = {
      id: 'demo_user_001',
      phone: '9876543210',
      isProfileComplete: true,
      name: 'ডেমো ব্যবসায়ী',
      businessName: 'ডেমো ট্রেডার্স',
      businessType: 'Wholesale Trading',
      gst: '22AAAAA0000A1Z',
      address: 'ঢাকা, বাংলাদেশ',
      email: 'demo@accubooks.com',
      website: 'https://accubooks.com',
      totalReceivable: 125000,
      totalPayable: 45000,
      currentBalance: 80000,
      linkedAccounts: 3,
      buyersCount: 12,
      suppliersCount: 8,
      recentTransactions: [
        { id: 1, date: '2024-01-15', type: 'sale', counterparty: 'রহমান ট্রেডার্স', amount: 25000, balanceAfter: 125000 },
        { id: 2, date: '2024-01-14', type: 'purchase', counterparty: 'করিম এন্টারপ্রাইজ', amount: 15000, balanceAfter: 100000 },
      ],
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem('accubooks_user', JSON.stringify(demoUser));
    setUser(demoUser);
    return { success: true };
  };

  // Real OTP send (বিলিং প্রয়োজন)
  const sendLoginOTP = async (phoneNumber) => {
    try {
      // reCAPTCHA সেটআপ - নিশ্চিত করুন div টি আছে
      const recaptchaContainer = document.getElementById('recaptcha-container');
      if (!recaptchaContainer) {
        return { success: false, error: 'reCAPTCHA container not found' };
      }
      
      const recaptcha = setupRecaptcha('recaptcha-container');
      if (!recaptcha) {
        return { success: false, error: 'Failed to setup reCAPTCHA' };
      }
      
      const result = await sendOTP(phoneNumber, recaptcha);
      if (result.success) {
        setConfirmationResult(result.confirmationResult);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await logoutUser();
    localStorage.removeItem('accubooks_user');
    setUser(null);
    setConfirmationResult(null);
  };

  const value = {
    user,
    loading,
    demoLogin,      // ডেমো লগইন (OTP ছাড়া)
    sendLoginOTP,   // রিয়েল OTP (বিলিং প্রয়োজন)
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {/* reCAPTCHA container - সব সময় থাকবে */}
      <div id="recaptcha-container" style={{ position: 'fixed', bottom: 0, right: 0, zIndex: 9999 }}></div>
    </AuthContext.Provider>
  );
};