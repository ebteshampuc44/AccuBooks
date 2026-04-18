import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithGoogle, 
  logoutUser, 
  onAuthStateChange, 
  uploadProfilePicture,
  auth
} from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Business data for user
const getBusinessData = (user) => ({
  id: user.uid,
  name: user.name,
  email: user.email,
  phone: user.phone || '9876543210',
  photoURL: user.photoURL || '',
  isProfileComplete: true,
  businessName: `${user.name?.split(' ')[0]}'s Business`,
  businessType: 'Wholesale Trading',
  gst: '22AAAAA0000A1Z',
  address: 'Your Business Address',
  totalReceivable: 125000,
  totalPayable: 45000,
  currentBalance: 80000,
  linkedAccounts: 3,
  buyersCount: 12,
  suppliersCount: 8,
  recentTransactions: [
    { id: 1, date: '2024-01-15', type: 'sale', counterparty: 'Rahman Traders', amount: 25000, balanceAfter: 125000 },
    { id: 2, date: '2024-01-14', type: 'purchase', counterparty: 'Karim Enterprise', amount: 15000, balanceAfter: 100000 },
  ],
  ledgerEntries: [
    { id: 1, date: '2024-01-15', type: 'sale', entryType: 'credit', counterparty: 'Rahman Traders', amount: 25000, balanceAfter: 125000 },
    { id: 2, date: '2024-01-14', type: 'purchase', entryType: 'debit', counterparty: 'Karim Enterprise', amount: 15000, balanceAfter: 100000 },
  ],
  createdAt: new Date().toISOString()
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const storedUser = localStorage.getItem('accubooks_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Firebase auth state listener
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const userData = getBusinessData({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          phone: firebaseUser.phoneNumber,
          photoURL: firebaseUser.photoURL
        });
        localStorage.setItem('accubooks_user', JSON.stringify(userData));
        setUser(userData);
      } else {
        // User is signed out
        localStorage.removeItem('accubooks_user');
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Google Login
  const googleLogin = async () => {
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        const userData = getBusinessData(result.user);
        localStorage.setItem('accubooks_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  // Upload Profile Picture
  const updateProfilePicture = async (file) => {
    if (!user || !user.id) {
      return { success: false, error: 'User not found' };
    }
    
    setUploadingPhoto(true);
    try {
      const result = await uploadProfilePicture(user.id, file);
      
      if (result.success) {
        // Update local user state
        const updatedUser = { ...user, photoURL: result.url };
        localStorage.setItem('accubooks_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        return { success: true, url: result.url };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('Upload error:', error);
      return { success: false, error: error.message };
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
      localStorage.removeItem('accubooks_user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Complete Business Profile
  const completeProfile = async (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
      isProfileComplete: true
    };
    localStorage.setItem('accubooks_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true };
  };

  const value = {
    user,
    loading,
    uploadingPhoto,
    googleLogin,
    logout,
    completeProfile,
    updateProfilePicture,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};