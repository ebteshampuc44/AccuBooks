// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { 
  signInWithGoogle, 
  logoutUser, 
  onAuthStateChange, 
  uploadProfilePicture
} from '../firebase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Empty business data for new users - সবকিছু জিরো থেকে শুরু
const getEmptyBusinessData = (user) => ({
  id: user.uid,
  name: user.name,
  email: user.email,
  phone: user.phone || '',
  photoURL: user.photoURL || '',
  isProfileComplete: false,
  businessName: '',
  businessType: '',
  gst: '',
  address: '',
  website: '',
  totalReceivable: 0,
  totalPayable: 0,
  currentBalance: 0,
  linkedAccounts: 0,
  linkedContacts: [],
  pendingLinkRequests: [],
  sentLinkRequests: [],
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

  // Auth state listener - Firebase authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // Check if user data exists in localStorage for this specific user
        const storedUser = localStorage.getItem(`accubooks_user_${firebaseUser.uid}`);
        
        if (storedUser) {
          // Existing user - load their data from localStorage
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } else {
          // New user - create empty data structure (সবকিছু জিরো)
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
        // User is signed out - শুধু state ক্লিয়ার করুন, localStorage ডিলিট করবেন না
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

  // Get user data for QR code
  const getUserQRData = () => {
    if (!user) return null;
    return {
      userId: user.id,
      name: user.name,
      businessName: user.businessName || user.name,
      email: user.email,
      phone: user.phone,
      timestamp: Date.now()
    };
  };

  // Send link request to another user
  const sendLinkRequest = async (targetUserId, targetUserData, notificationContext) => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    // Check if already linked
    if (user.linkedContacts?.some(c => c.userId === targetUserId)) {
      return { success: false, error: 'Already linked with this user' };
    }
    
    // Check if request already sent
    if (user.sentLinkRequests?.some(req => req.userId === targetUserId && req.status === 'pending')) {
      return { success: false, error: 'Link request already sent' };
    }
    
    const newRequest = {
      id: Date.now(),
      userId: targetUserId,
      userName: targetUserData.name,
      userBusiness: targetUserData.businessName,
      userEmail: targetUserData.email,
      userPhone: targetUserData.phone,
      status: 'pending',
      sentAt: new Date().toISOString()
    };
    
    // Update current user's sent requests
    const updatedUser = {
      ...user,
      sentLinkRequests: [...(user.sentLinkRequests || []), newRequest]
    };
    
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Add to target user's pending requests
    const targetUserData_stored = localStorage.getItem(`accubooks_user_${targetUserId}`);
    if (targetUserData_stored) {
      const targetUser = JSON.parse(targetUserData_stored);
      const incomingRequest = {
        id: Date.now(),
        requestId: newRequest.id,
        userId: user.id,
        userName: user.name,
        userBusiness: user.businessName || user.name,
        userEmail: user.email,
        userPhone: user.phone,
        status: 'pending',
        receivedAt: new Date().toISOString()
      };
      const updatedTarget = {
        ...targetUser,
        pendingLinkRequests: [...(targetUser.pendingLinkRequests || []), incomingRequest]
      };
      localStorage.setItem(`accubooks_user_${targetUserId}`, JSON.stringify(updatedTarget));
      
      // Send notification to target user (email + in-app)
      if (notificationContext) {
        await notificationContext.addNotification(
          'link_request',
          'New Link Request',
          `${user.businessName || user.name} wants to connect with you`,
          {
            requesterId: user.id,
            requesterName: user.name,
            requesterBusiness: user.businessName || user.name,
            requestId: incomingRequest.id
          },
          targetUser.email,
          targetUser.name
        );
      }
    }
    
    return { success: true, request: newRequest };
  };

  // Accept link request
  const acceptLinkRequest = async (requestId, requesterId, requesterData, notificationContext) => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    const request = (user.pendingLinkRequests || []).find(req => req.id === requestId);
    if (!request) return { success: false, error: 'Request not found' };
    
    // Remove from pending requests
    const updatedPending = (user.pendingLinkRequests || []).filter(req => req.id !== requestId);
    
    // Add to linked contacts
    const newLinkedContact = {
      id: Date.now(),
      userId: requesterId,
      name: requesterData.name || request.userName,
      businessName: requesterData.businessName || request.userBusiness,
      email: requesterData.email || request.userEmail,
      phone: requesterData.phone || request.userPhone,
      linkedAt: new Date().toISOString(),
      type: 'both'
    };
    
    const updatedLinkedContacts = [...(user.linkedContacts || []), newLinkedContact];
    
    // Also add as regular contact for transactions
    const newContact = {
      id: Date.now(),
      name: requesterData.businessName || request.userBusiness || requesterData.name || request.userName,
      phone: requesterData.phone || request.userPhone || '',
      type: 'both',
      gst: '',
      address: '',
      openingBalance: 0,
      totalDue: 0,
      linked: true,
      linkedUserId: requesterId,
      linkedUserEmail: requesterData.email || request.userEmail,
      createdAt: new Date().toISOString()
    };
    
    const updatedContacts = [...(user.contacts || []), newContact];
    
    const updatedUser = {
      ...user,
      pendingLinkRequests: updatedPending,
      linkedContacts: updatedLinkedContacts,
      contacts: updatedContacts,
      linkedAccounts: (user.linkedAccounts || 0) + 1
    };
    
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Update the requester's side
    const requesterData_stored = localStorage.getItem(`accubooks_user_${requesterId}`);
    if (requesterData_stored) {
      const requester = JSON.parse(requesterData_stored);
      
      const requesterNewContact = {
        id: Date.now(),
        name: user.businessName || user.name,
        phone: user.phone || '',
        type: 'both',
        gst: '',
        address: '',
        openingBalance: 0,
        totalDue: 0,
        linked: true,
        linkedUserId: user.id,
        linkedUserEmail: user.email,
        createdAt: new Date().toISOString()
      };
      
      const updatedRequesterSent = (requester.sentLinkRequests || []).map(req => 
        req.userId === user.id ? { ...req, status: 'accepted', acceptedAt: new Date().toISOString() } : req
      );
      
      const updatedRequester = {
        ...requester,
        sentLinkRequests: updatedRequesterSent,
        linkedContacts: [...(requester.linkedContacts || []), {
          id: Date.now(),
          userId: user.id,
          name: user.name,
          businessName: user.businessName || user.name,
          email: user.email,
          phone: user.phone,
          linkedAt: new Date().toISOString(),
          type: 'both'
        }],
        contacts: [...(requester.contacts || []), requesterNewContact],
        linkedAccounts: (requester.linkedAccounts || 0) + 1
      };
      
      localStorage.setItem(`accubooks_user_${requesterId}`, JSON.stringify(updatedRequester));
      
      // Send notification to requester
      if (notificationContext) {
        await notificationContext.addNotification(
          'request_accepted',
          'Link Request Accepted',
          `${user.businessName || user.name} accepted your connection request. You can now transact with them.`,
          null,
          requester.email,
          requester.name
        );
      }
    }
    
    return { success: true };
  };

  // Decline link request
  const declineLinkRequest = async (requestId, requesterId, notificationContext) => {
    if (!user) return { success: false, error: 'Not logged in' };
    
    const updatedPending = (user.pendingLinkRequests || []).filter(req => req.id !== requestId);
    
    const updatedUser = {
      ...user,
      pendingLinkRequests: updatedPending
    };
    
    localStorage.setItem(`accubooks_user_${user.id}`, JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    // Update requester's side
    const requesterData_stored = localStorage.getItem(`accubooks_user_${requesterId}`);
    if (requesterData_stored) {
      const requester = JSON.parse(requesterData_stored);
      const updatedRequesterSent = (requester.sentLinkRequests || []).map(req => 
        req.userId === user.id ? { ...req, status: 'declined', declinedAt: new Date().toISOString() } : req
      );
      const updatedRequester = {
        ...requester,
        sentLinkRequests: updatedRequesterSent
      };
      localStorage.setItem(`accubooks_user_${requesterId}`, JSON.stringify(updatedRequester));
    }
    
    return { success: true };
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

  // Complete Business Profile
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

  // Add a new contact (local contact, not linked user)
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
      linkedUserId: null,
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

  // Add transaction with linked user sync
  const addTransaction = async (transactionData) => {
    const { type, counterpartyId, amount, reference, date, description } = transactionData;
    
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
      linkedUserId: contact.linkedUserId || null,
      createdAt: new Date().toISOString()
    };
    
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
      
      // If linked, sync to other user's ledger
      if (contact.linked && contact.linkedUserId) {
        syncTransactionToLinkedUser(contact.linkedUserId, {
          type: 'purchase', // For the other user, sale becomes purchase
          amount: transactionAmount,
          counterparty: user.businessName || user.name,
          counterpartyId: user.id,
          reference: reference,
          date: date,
          description: description
        });
      }
      
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
      
      if (contact.linked && contact.linkedUserId) {
        syncTransactionToLinkedUser(contact.linkedUserId, {
          type: 'sale',
          amount: transactionAmount,
          counterparty: user.businessName || user.name,
          counterpartyId: user.id,
          reference: reference,
          date: date,
          description: description
        });
      }
      
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
      
      if (contact.linked && contact.linkedUserId) {
        syncTransactionToLinkedUser(contact.linkedUserId, {
          type: 'payment',
          amount: transactionAmount,
          counterparty: user.businessName || user.name,
          counterpartyId: user.id,
          reference: reference,
          date: date,
          description: description
        });
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

  // Sync transaction to linked user
  const syncTransactionToLinkedUser = (targetUserId, transactionData) => {
    const targetUserData = localStorage.getItem(`accubooks_user_${targetUserId}`);
    if (targetUserData) {
      const targetUser = JSON.parse(targetUserData);
      
      // Find the contact that matches current user
      const targetContact = targetUser.contacts?.find(c => c.linkedUserId === user.id);
      
      if (targetContact) {
        const syncedTransaction = {
          id: Date.now(),
          date: transactionData.date,
          type: transactionData.type,
          amount: transactionData.amount,
          counterparty: transactionData.counterparty,
          counterpartyId: targetContact.id,
          reference: transactionData.reference,
          description: transactionData.description,
          status: 'completed',
          synced: true,
          syncedFrom: user.id,
          createdAt: new Date().toISOString()
        };
        
        let updatedTargetReceivable = targetUser.totalReceivable || 0;
        let updatedTargetPayable = targetUser.totalPayable || 0;
        let updatedTargetContactDue = targetContact.totalDue || 0;
        let newTargetBalance = targetUser.currentBalance || 0;
        
        if (transactionData.type === 'sale') {
          newTargetBalance = (targetUser.currentBalance || 0) + transactionData.amount;
          updatedTargetReceivable += transactionData.amount;
          updatedTargetContactDue += transactionData.amount;
        } else if (transactionData.type === 'purchase') {
          newTargetBalance = (targetUser.currentBalance || 0) - transactionData.amount;
          updatedTargetPayable += transactionData.amount;
          updatedTargetContactDue += transactionData.amount;
        } else if (transactionData.type === 'payment') {
          newTargetBalance = (targetUser.currentBalance || 0) - transactionData.amount;
          if (targetContact.type === 'supplier') {
            updatedTargetPayable -= transactionData.amount;
            updatedTargetContactDue -= transactionData.amount;
          } else {
            updatedTargetReceivable -= transactionData.amount;
            updatedTargetContactDue -= transactionData.amount;
          }
        }
        
        const updatedTargetContacts = targetUser.contacts.map(c => {
          if (c.id === targetContact.id) {
            return { ...c, totalDue: Math.max(0, updatedTargetContactDue) };
          }
          return c;
        });
        
        const updatedTarget = {
          ...targetUser,
          contacts: updatedTargetContacts,
          recentTransactions: [syncedTransaction, ...(targetUser.recentTransactions || [])].slice(0, 50),
          totalReceivable: Math.max(0, updatedTargetReceivable),
          totalPayable: Math.max(0, updatedTargetPayable),
          currentBalance: newTargetBalance
        };
        
        localStorage.setItem(`accubooks_user_${targetUserId}`, JSON.stringify(updatedTarget));
      }
    }
  };

  // Get contacts by type
  const getContactsByType = (type) => {
    if (!user?.contacts) return [];
    if (type === 'all') return user.contacts;
    return user.contacts.filter(c => c.type === type);
  };

  // Get linked contacts
  const getLinkedContacts = () => {
    if (!user?.contacts) return [];
    return user.contacts.filter(c => c.linked === true);
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

  // Logout - শুধু state ক্লিয়ার করুন, localStorage ডিলিট করবেন না (ডাটা থাকবে)
  const logout = async () => {
    try {
      await logoutUser();
      // শুধু React state ক্লিয়ার করুন
      setUser(null);
      // localStorage.removeItem করা যাবে না - তাহলে ডাটা ডিলিট হয়ে যাবে
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
    sendLinkRequest,
    acceptLinkRequest,
    declineLinkRequest,
    getUserQRData,
    getContactsByType,
    getLinkedContacts,
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