// contexts/NotificationContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import emailjs from '@emailjs/browser';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

// ⭐⭐⭐ এখানে আপনার EmailJS কী গুলো বসান ⭐⭐⭐
const EMAILJS_CONFIG = {
  PUBLIC_KEY: 'YOUR_EMAILJS_PUBLIC_KEY',    // আপনার Public Key দিন
  SERVICE_ID: 'YOUR_SERVICE_ID',             // আপনার Service ID দিন
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID'            // আপনার Template ID দিন
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // EmailJS initialize করুন
    if (EMAILJS_CONFIG.PUBLIC_KEY && EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_EMAILJS_PUBLIC_KEY') {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      console.log('EmailJS initialized successfully');
    } else {
      console.warn('EmailJS not configured. Email notifications will be disabled.');
    }
    
    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem('accubooks_notifications');
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications);
        setNotifications(parsed);
        setUnreadCount(parsed.filter(n => !n.read).length);
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }
  }, []);

  const saveNotifications = (updatedNotifications) => {
    localStorage.setItem('accubooks_notifications', JSON.stringify(updatedNotifications));
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.read).length);
  };

  const sendEmailNotification = async (toEmail, userName, requesterName, requesterBusiness) => {
    // EmailJS কনফিগার না থাকলে skip করুন
    if (!EMAILJS_CONFIG.PUBLIC_KEY || EMAILJS_CONFIG.PUBLIC_KEY === 'YOUR_EMAILJS_PUBLIC_KEY') {
      console.log('EmailJS not configured. Skipping email notification.');
      return false;
    }
    
    try {
      const templateParams = {
        to_email: toEmail,
        user_name: userName,
        requester_name: requesterName,
        requester_business: requesterBusiness,
        link_url: `${window.location.origin}/link-request`,
        current_year: new Date().getFullYear()
      };
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );
      
      console.log('Email sent successfully:', response);
      return true;
    } catch (error) {
      console.error('Email send failed:', error);
      return false;
    }
  };

  const addNotification = async (type, title, message, actionData = null, userEmail = null, userName = null) => {
    const newNotification = {
      id: Date.now(),
      type,
      title,
      message,
      actionData,
      read: false,
      createdAt: new Date().toISOString()
    };
    
    const updatedNotifications = [newNotification, ...notifications];
    saveNotifications(updatedNotifications);
    
    // Show toast notification
    if (type === 'link_request') {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-slide-in' : 'hidden'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">{title}</p>
                <p className="mt-1 text-sm text-gray-500">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-200">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                window.location.href = '/link-request';
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 hover:bg-gray-50"
            >
              View
            </button>
          </div>
        </div>
      ), { duration: 10000 });
    } else if (type === 'request_accepted') {
      toast.success(message, { duration: 4000 });
    } else {
      toast(message, { duration: 3000 });
    }
    
    // Send email for link requests
    if (userEmail && userName && type === 'link_request') {
      const emailSent = await sendEmailNotification(
        userEmail, 
        userName, 
        actionData?.requesterName, 
        actionData?.requesterBusiness
      );
      
      if (emailSent) {
        toast.success(`📧 Email notification sent to ${userName}`, { duration: 3000 });
      }
    }
    
    return newNotification;
  };

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updatedNotifications);
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    saveNotifications(updatedNotifications);
  };

  const removeNotification = (notificationId) => {
    const updatedNotifications = notifications.filter(n => n.id !== notificationId);
    saveNotifications(updatedNotifications);
  };

  const clearAllNotifications = () => {
    saveNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAllNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};