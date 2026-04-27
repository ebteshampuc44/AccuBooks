// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Contacts from './pages/Contacts';
import AddContact from './pages/AddContact';
import LinkRequest from './pages/LinkRequest';
import Transactions from './pages/Transactions';
import CreateTransaction from './pages/CreateTransaction';
import Ledger from './pages/Ledger';
import Reports from './pages/Reports';
import BusinessProfile from './pages/BusinessProfile';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#333',
                borderRadius: '12px',
                padding: '12px 16px',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<PrivateRoute />}>
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/add-contact" element={<AddContact />} />
                <Route path="/link-request" element={<LinkRequest />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/create-transaction" element={<CreateTransaction />} />
                <Route path="/ledger" element={<Ledger />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<BusinessProfile />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;