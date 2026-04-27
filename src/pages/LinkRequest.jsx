// pages/LinkRequest.jsx
import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import toast from 'react-hot-toast';

const LinkRequest = () => {
  const { user, getUserQRData, sendLinkRequest, acceptLinkRequest, declineLinkRequest } = useAuth();
  const { addNotification } = useNotification();
  const [showQR, setShowQR] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualUserId, setManualUserId] = useState('');
  const [loading, setLoading] = useState(false);

  const qrData = getUserQRData();
  const pendingRequests = user?.pendingLinkRequests || [];
  const sentRequests = user?.sentLinkRequests || [];
  const linkedContacts = user?.linkedContacts || [];

  const handleSendManualRequest = async () => {
    if (!manualUserId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }
    
    setLoading(true);
    
    // Try to find user in localStorage
    const targetUserData = localStorage.getItem(`accubooks_user_${manualUserId}`);
    if (!targetUserData) {
      toast.error('User not found. Please check the User ID.');
      setLoading(false);
      return;
    }
    
    const targetUser = JSON.parse(targetUserData);
    
    const result = await sendLinkRequest(manualUserId, {
      name: targetUser.name,
      businessName: targetUser.businessName,
      email: targetUser.email,
      phone: targetUser.phone
    }, { addNotification });
    
    if (result.success) {
      toast.success(`Link request sent to ${targetUser.businessName || targetUser.name}!`);
      setManualUserId('');
      setShowManualInput(false);
    } else {
      toast.error(result.error || 'Failed to send link request');
    }
    
    setLoading(false);
  };

  const handleAcceptRequest = async (request) => {
    setLoading(true);
    const result = await acceptLinkRequest(
      request.id, 
      request.userId, 
      {
        name: request.userName,
        businessName: request.userBusiness,
        email: request.userEmail,
        phone: request.userPhone
      },
      { addNotification }
    );
    
    if (result.success) {
      toast.success(`Connected with ${request.userBusiness || request.userName}!`);
    } else {
      toast.error(result.error || 'Failed to accept request');
    }
    
    setLoading(false);
  };

  const handleDeclineRequest = async (requestId, requesterId) => {
    const result = await declineLinkRequest(requestId, requesterId, { addNotification });
    if (result.success) {
      toast.success('Request declined');
    } else {
      toast.error(result.error || 'Failed to decline request');
    }
  };

  const copyUserId = () => {
    if (qrData) {
      navigator.clipboard.writeText(qrData.userId);
      toast.success('User ID copied to clipboard!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Link Accounts</h1>
        <p className="text-gray-500 mt-2">
          Connect with other AccuBooks users for automatic transaction syncing
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-gray-600">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </div>
        </div>
      )}

      {/* Two Options */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Share QR Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Share Your QR Code</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Share this QR code with other AccuBooks users to connect
            </p>

            <div className="my-4 p-4 bg-gray-50 rounded-xl inline-block border border-gray-200">
              {qrData && (
                <QRCodeSVG 
                  value={JSON.stringify(qrData)} 
                  size={200}
                  bgColor="#ffffff"
                  fgColor="#1e3a8a"
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={copyUserId}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 inline-flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copy User ID
              </button>
              
              <button
                className="ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setShowQR(!showQR)}
              >
                {showQR ? 'Hide Details' : 'Show Details'}
              </button>
            </div>

            {showQR && qrData && (
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-left w-full border border-gray-200">
                <p className="text-xs font-mono break-all text-gray-600">
                  <strong>Your User ID:</strong> {qrData.userId}<br />
                  <strong>Name:</strong> {qrData.name}<br />
                  <strong>Business:</strong> {qrData.businessName}<br />
                  <strong>Email:</strong> {qrData.email}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Manual Connect */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Connect via User ID</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Enter another user's ID to send a link request
            </p>

            {!showManualInput ? (
              <button
                onClick={() => setShowManualInput(true)}
                className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Enter User ID Manually
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  placeholder="Paste User ID here..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSendManualRequest}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    Send Request
                  </button>
                  <button
                    onClick={() => {
                      setShowManualInput(false);
                      setManualUserId('');
                    }}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pending Link Requests */}
      {(pendingRequests.length > 0 || sentRequests.filter(r => r.status === 'pending').length > 0 || linkedContacts.length > 0) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-xl font-bold text-gray-900">Link Requests & Connections</h2>
            </div>

            {/* Incoming Requests */}
            {pendingRequests.length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  Incoming Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <p className="font-medium text-gray-900">{request.userBusiness || request.userName}</p>
                        <p className="text-xs text-gray-500">{request.userEmail}</p>
                        <p className="text-xs text-gray-400 mt-1">Received {new Date(request.receivedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptRequest(request)}
                          className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleDeclineRequest(request.id, request.userId)}
                          className="px-3 py-1.5 text-xs font-medium bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sent Requests */}
            {sentRequests.filter(r => r.status === 'pending').length > 0 && (
              <div className="mb-6">
                <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  Sent Requests
                </h3>
                <div className="space-y-2">
                  {sentRequests.filter(r => r.status === 'pending').map((request) => (
                    <div key={request.id} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="font-medium text-gray-900">{request.userBusiness || request.userName}</p>
                      <p className="text-xs text-gray-500">{request.userEmail}</p>
                      <p className="text-xs text-gray-400 mt-1">Sent {new Date(request.sentAt).toLocaleDateString()} - Waiting for response...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Linked Contacts */}
            {linkedContacts.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Connected Accounts ({linkedContacts.length})
                </h3>
                <div className="space-y-2">
                  {linkedContacts.map((contact) => (
                    <div key={contact.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div>
                        <p className="font-medium text-gray-900">{contact.businessName || contact.name}</p>
                        <p className="text-xs text-gray-500">{contact.email}</p>
                        <p className="text-xs text-gray-400 mt-1">Connected on {new Date(contact.linkedAt).toLocaleDateString()}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round"strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102m3.172-3.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.102" />
                        </svg>
                        Connected
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">How Linking Works</h3>
            <div className="text-sm text-gray-700 mt-2 space-y-1">
              <p>1️⃣ <strong>Share your QR code</strong> or <strong>User ID</strong> with another AccuBooks user</p>
              <p>2️⃣ They send you a link request (you'll get <strong>email + in-app notification</strong>)</p>
              <p>3️⃣ <strong>Accept the request</strong> to connect</p>
              <p>4️⃣ Now transactions will <strong>automatically sync</strong> between both accounts!</p>
            </div>
            <div className="mt-3 p-2 bg-blue-100 rounded-lg">
              <p className="text-xs text-blue-800">
                💡 <strong>Pro Tip:</strong> When you create a transaction with a linked contact, 
                it will automatically appear in their ledger and update their balance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkRequest;