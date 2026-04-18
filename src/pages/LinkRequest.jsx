import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';

const LinkRequest = () => {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+880'); // বাংলাদেশের জন্য +880

  const handleSendRequest = (e) => {
    e.preventDefault();
    
    // ফোন নম্বর ভ্যালিডেশন
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
      setMessage('Please enter a valid 10 or 11 digit Bangladesh phone number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    
    setIsLoading(true);
    
    setTimeout(() => {
      const fullNumber = `${countryCode}${cleanPhone}`;
      setMessage(`Link request sent to ${fullNumber}! They will be able to sync transactions with you.`);
      setPhone('');
      setIsLoading(false);
      
      // 3 সেকেন্ড পর মেসেজ ক্লিয়ার করুন
      setTimeout(() => setMessage(''), 3000);
    }, 1000);
  };

  const generateQRData = () => {
    const userData = {
      userId: user?.id || 'demo_user_001',
      name: user?.name || 'John Doe',
      business: user?.businessName || 'ACME Industries',
      phone: user?.phone || '01712345678',
      email: user?.email || 'user@example.com',
      timestamp: Date.now(),
    };
    return JSON.stringify(userData);
  };

  // বাংলাদেশি অপারেটর চেক করার ফাংশন
  const getOperatorInfo = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    if (cleanNumber.startsWith('17')) return { name: 'Grameenphone', color: 'text-red-600' };
    if (cleanNumber.startsWith('18')) return { name: 'Robi', color: 'text-purple-600' };
    if (cleanNumber.startsWith('19')) return { name: 'Banglalink', color: 'text-blue-600' };
    if (cleanNumber.startsWith('14')) return { name: 'Teletalk', color: 'text-green-600' };
    if (cleanNumber.startsWith('15')) return { name: 'Airtel', color: 'text-orange-600' };
    if (cleanNumber.startsWith('16')) return { name: 'Robi', color: 'text-purple-600' };
    return null;
  };

  const operator = getOperatorInfo(phone);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Link Accounts</h1>
        <p className="text-gray-500 mt-2">
          Connect with other AccuBooks users for automatic transaction syncing
        </p>
        <p className="text-xs text-green-600 mt-1">✓ Bangladesh mobile numbers supported</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Request Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Send Link Request</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter the Bangladesh mobile number of the user you want to connect with
            </p>

            <form onSubmit={handleSendRequest}>
              <div>
                <label className="block text-gray-700 font-medium mb-2">Mobile Number</label>
                <div className="flex gap-2">
                  {/* Country Code Select */}
                  <div className="relative w-28">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white appearance-none"
                    >
                      <option value="+880">🇧🇩 +880 (BD)</option>
                      <option value="+91">🇮🇳 +91 (India)</option>
                      <option value="+1">🇺🇸 +1 (USA)</option>
                      <option value="+44">🇬🇧 +44 (UK)</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  
                  {/* Phone Input */}
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      placeholder="1712345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                      value={phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                        setPhone(value);
                      }}
                      required
                    />
                  </div>
                </div>
                
                {/* Operator Info */}
                {operator && phone.length >= 3 && (
                  <p className={`text-xs mt-1 ${operator.color}`}>
                    {operator.name} operator detected
                  </p>
                )}
                
                <p className="text-xs text-gray-400 mt-2">
                  Example: 1712345678 (Grameenphone), 1812345678 (Robi), 1912345678 (Banglalink)
                </p>
              </div>

              <button
                type="submit"
                className={`w-full mt-6 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Link Request
                  </>
                )}
              </button>
            </form>

            {message && (
              <div className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                message.includes('valid') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 flex-shrink-0 ${
                  message.includes('valid') ? 'text-red-600' : 'text-green-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className={`text-sm ${
                  message.includes('valid') ? 'text-red-800' : 'text-green-800'
                }`}>{message}</span>
              </div>
            )}
          </div>
        </div>

        {/* QR Code Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Share QR Code</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Let others scan this QR code to send you a link request
            </p>

            <div className="my-4 p-4 bg-gray-50 rounded-xl inline-block border border-gray-200">
              <QRCodeSVG value={generateQRData()} size={200} />
            </div>

            <button
              className="mt-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              onClick={() => setShowQR(!showQR)}
            >
              {showQR ? 'Hide Details' : 'Show Details'}
            </button>

            {showQR && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left w-full border border-gray-200">
                <p className="text-xs font-mono break-all text-gray-600">{generateQRData()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-xl font-bold text-gray-900">Pending Link Requests</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">From</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Phone</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-medium text-sm">Status</th>
                  <th className="text-center py-3 px-4 text-gray-600 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">Raj Traders</td>
                  <td className="py-3 px-4 text-gray-600">+880 1712345678</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors duration-150">
                        Accept
                      </button>
                      <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150">
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">Sharma Enterprises</td>
                  <td className="py-3 px-4 text-gray-600">+880 1812345678</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors duration-150">
                        Accept
                      </button>
                      <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150">
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">Banglalink Business</td>
                  <td className="py-3 px-4 text-gray-600">+880 1912345678</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Pending
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex gap-2 justify-center">
                      <button className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition-colors duration-150">
                        Accept
                      </button>
                      <button className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors duration-150">
                        Decline
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Bangladesh Info Box */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Bangladesh Mobile Networks</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Supported operators: <strong>Grameenphone (017)</strong>, <strong>Robi (018, 016)</strong>, 
                  <strong> Banglalink (019)</strong>, <strong>Teletalk (014)</strong>, <strong>Airtel (015)</strong>
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Enter 10 or 11 digit mobile number without country code. The system will automatically detect your operator.
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">How linking works</h3>
                <p className="text-sm text-gray-700 mt-1">
                  Once connected, any transaction you create with a linked contact will automatically appear in their ledger.
                  This ensures double-entry accounting is maintained across both accounts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkRequest;