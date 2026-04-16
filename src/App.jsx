import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import VerifyOTP from './pages/VerifyOTP';
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
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          {/* Private Routes (requires authentication) */}
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
      </AuthProvider>
    </Router>
  );
}

export default App;