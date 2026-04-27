// contexts/AuthContext.jsx

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

// Empty business data for new users - NO PRELOADED DEMO DATA
const getEmptyBusinessData = (user) => ({
  id: user.uid,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  photoURL: user.photoURL || '',
  isProfileComplete: false, // Profile not complete, needs business info
  businessName: '',
  businessType: '',
  gst: '',
  address: '',
  website: '',
  totalReceivable: 0,
  totalPayable: 0,
  currentBalance: 0,
  linkedAccounts: 0,
  buyersCount: 0,
  suppliersCount: 0,
  recentTransactions: [],
  ledgerEntries: [],
  contacts: [],
  createdAt: new Date().toISOString()
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    // Firebase auth state listener
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user data exists in localStorage for this specific user
        const storedUser = localStorage.getItem(`accubooks_user_${firebaseUser.uid}`);
        
        if (storedUser) {
          // Existing user - load their data
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          // New user - create empty data structure
          const emptyUserData = getEmptyBusinessData({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            phone: firebaseUser.phoneNumber,
            photoURL: firebaseUser.photoURL
          });
          localStorage.setItem(`accubooks_user_${firebaseUser.uid}`, JSON.stringify(emptyUserData));
          setUser(emptyUserData);
        }
      } else {
        // User is signed out
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
        const firebaseUser = result.user;
        const storedUser = localStorage.getItem(`accubooks_user_${firebaseUser.uid}`);
        
        if (storedUser) {
          // Existing user
          setUser(JSON.parse(storedUser));
          return { success: true, isNewUser: false };
        } else {
          // New user - empty data
          const emptyUserData = getEmptyBusinessData(firebaseUser);
          localStorage.setItem(`accubooks_user_${firebaseUser.uid}`, JSON.stringify(emptyUserData));
          setUser(emptyUserData);
          return { success: true, isNewUser: true };
        }
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
        localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
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

  // Complete Business Profile - User fills their business info
  const completeProfile = async (profileData) => {
    const updatedUser = {
      ...user,
      ...profileData,
      isProfileComplete: true
    };
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true };
  };

  // Add a new contact
  const addContact = async (contactData) => {
    const newContact = {
      id: Date.now(),
      name: contactData.name,
      phone: contactData.phone,
      type: contactData.type,
      gst: contactData.gst || '',
      address: contactData.address || '',
      openingBalance: parseFloat(contactData.openingBalance) || 0,
      totalDue: parseFloat(contactData.openingBalance) || 0,
      linked: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedContacts = [...(user.contacts || []), newContact];
    let updatedUser = { ...user, contacts: updatedContacts };
    
    // Update counts and totals based on contact type
    if (contactData.type === 'buyer') {
      updatedUser.buyersCount = (user.buyersCount || 0) + 1;
      updatedUser.totalReceivable = (user.totalReceivable || 0) + (parseFloat(contactData.openingBalance) || 0);
    } else if (contactData.type === 'supplier') {
      updatedUser.suppliersCount = (user.suppliersCount || 0) + 1;
      updatedUser.totalPayable = (user.totalPayable || 0) + (parseFloat(contactData.openingBalance) || 0);
    }
    
    // Update current balance
    updatedUser.currentBalance = (updatedUser.totalReceivable || 0) - (updatedUser.totalPayable || 0);
    
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true, contact: newContact };
  };

  // Add a new transaction
  const addTransaction = async (transactionData) => {
    const { type, counterpartyId, amount, reference, date, description } = transactionData;
    
    // Find the counterparty contact
    const contact = user.contacts?.find(c => c.id === parseInt(counterpartyId));
    
    if (!contact) {
      return { success: false, error: 'Contact not found' };
    }
    
    const transactionAmount = parseFloat(amount);
    const newTransaction = {
      id: Date.now(),
      date,
      type,
      amount: transactionAmount,
      counterparty: contact.name,
      counterpartyId: contact.id,
      reference,
      description: description || '',
      status: 'completed',
      synced: contact.linked || false,
      createdAt: new Date().toISOString()
    };
    
    // Create ledger entry based on transaction type
    let ledgerEntry = null;
    let updatedTotalReceivable = user.totalReceivable || 0;
    let updatedTotalPayable = user.totalPayable || 0;
    let updatedContactDue = contact.totalDue || 0;
    let newBalance = user.currentBalance || 0;
    
    if (type === 'sale') {
      // Sale: Your account gets Credit (+), Buyer owes you
      newBalance = (user.currentBalance || 0) + transactionAmount;
      ledgerEntry = {
        id: Date.now() + 1,
        date,
        type: 'sale',
        entryType: 'credit',
        counterparty: contact.name,
        counterpartyId: contact.id,
        amount: transactionAmount,
        reference: reference,
        description: description || '',
        balanceAfter: newBalance
      };
      updatedTotalReceivable += transactionAmount;
      updatedContactDue += transactionAmount;
      
    } else if (type === 'purchase') {
      // Purchase: Your account gets Debit (-), You owe supplier
      newBalance = (user.currentBalance || 0) - transactionAmount;
      ledgerEntry = {
        id: Date.now() + 1,
        date,
        type: 'purchase',
        entryType: 'debit',
        counterparty: contact.name,
        counterpartyId: contact.id,
        amount: transactionAmount,
        reference: reference,
        description: description || '',
        balanceAfter: newBalance
      };
      updatedTotalPayable += transactionAmount;
      updatedContactDue += transactionAmount;
      
    } else if (type === 'payment') {
      // Payment: Settlement of dues
      const isPaymentToSupplier = contact.type === 'supplier';
      newBalance = (user.currentBalance || 0) - transactionAmount;
      ledgerEntry = {
        id: Date.now() + 1,
        date,
        type: 'payment',
        entryType: 'debit',
        counterparty: contact.name,
        counterpartyId: contact.id,
        amount: transactionAmount,
        reference: reference,
        description: description || '',
        balanceAfter: newBalance
      };
      
      if (isPaymentToSupplier) {
        updatedTotalPayable -= transactionAmount;
        updatedContactDue -= transactionAmount;
      } else {
        updatedTotalReceivable -= transactionAmount;
        updatedContactDue -= transactionAmount;
      }
    }
    
    // Update contact's due amount
    const updatedContacts = user.contacts.map(c => {
      if (c.id === contact.id) {
        return { ...c, totalDue: Math.max(0, updatedContactDue) };
      }
      return c;
    });
    
    // Update user data
    const updatedUser = {
      ...user,
      contacts: updatedContacts,
      recentTransactions: [newTransaction, ...(user.recentTransactions || [])].slice(0, 50),
      ledgerEntries: [...(user.ledgerEntries || []), ledgerEntry],
      totalReceivable: Math.max(0, updatedTotalReceivable),
      totalPayable: Math.max(0, updatedTotalPayable),
      currentBalance: newBalance
    };
    
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true, transaction: newTransaction, ledgerEntry };
  };

  // Get contacts by type
  const getContactsByType = (type) => {
    if (!user?.contacts) return [];
    if (type === 'all') return user.contacts;
    return user.contacts.filter(c => c.type === type);
  };

  // Get a single contact by ID
  const getContactById = (id) => {
    if (!user?.contacts) return null;
    return user.contacts.find(c => c.id === parseInt(id));
  };

  // Get transaction summary
  const getTransactionSummary = () => {
    const transactions = user?.recentTransactions || [];
    const sales = transactions.filter(t => t.type === 'sale').reduce((sum, t) => sum + t.amount, 0);
    const purchases = transactions.filter(t => t.type === 'purchase').reduce((sum, t) => sum + t.amount, 0);
    const paymentsReceived = transactions.filter(t => t.type === 'payment' && 
      user?.contacts?.find(c => c.id === t.counterpartyId)?.type === 'buyer')
      .reduce((sum, t) => sum + t.amount, 0);
    const paymentsMade = transactions.filter(t => t.type === 'payment' && 
      user?.contacts?.find(c => c.id === t.counterpartyId)?.type === 'supplier')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { sales, purchases, paymentsReceived, paymentsMade };
  };

  // Get total credits (money received/earned)
  const getTotalCredits = () => {
    const ledgerEntries = user?.ledgerEntries || [];
    return ledgerEntries.filter(e => e.entryType === 'credit').reduce((sum, e) => sum + e.amount, 0);
  };

  // Get total debits (money spent/paid)
  const getTotalDebits = () => {
    const ledgerEntries = user?.ledgerEntries || [];
    return ledgerEntries.filter(e => e.entryType === 'debit').reduce((sum, e) => sum + e.amount, 0);
  };

  // Delete a transaction (optional - for future use)
  const deleteTransaction = async (transactionId) => {
    const transactionToDelete = user.recentTransactions?.find(t => t.id === transactionId);
    if (!transactionToDelete) {
      return { success: false, error: 'Transaction not found' };
    }
    
    // Remove from recentTransactions
    const updatedTransactions = user.recentTransactions.filter(t => t.id !== transactionId);
    
    // Remove from ledgerEntries
    const updatedLedger = user.ledgerEntries.filter(e => e.id !== transactionId + 1 && e.id !== transactionId);
    
    // Recalculate balances (simplified - in production you'd need full recalculation)
    const updatedUser = {
      ...user,
      recentTransactions: updatedTransactions,
      ledgerEntries: updatedLedger
    };
    
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    return { success: true };
  };

  // Logout
  const logout = async () => {
    try {
      await logoutUser();
      // Don't clear localStorage - keep user data for next login
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    loading,
    uploadingPhoto,
    googleLogin,
    logout,
    completeProfile,
    updateProfilePicture,
    addContact,
    addTransaction,
    deleteTransaction,
    getContactsByType,
    getContactById,
    getTransactionSummary,
    getTotalCredits,
    getTotalDebits,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};