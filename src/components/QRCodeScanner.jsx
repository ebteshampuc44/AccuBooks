// components/QRCodeScanner.jsx
import React, { useState, useRef, useEffect } from 'react';

const QRCodeScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      setError('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const captureQR = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/png');
    
    // Simulate QR code reading (in production, use a proper QR library)
    // For demo, we'll prompt user to enter the code manually
    const code = prompt('Scan QR code or enter user ID manually:');
    if (code) {
      try {
        // Try to parse as JSON
        const userData = JSON.parse(code);
        onScan(userData);
        stopCamera();
      } catch {
        // If not JSON, treat as user ID and fetch from localStorage
        const storedUser = localStorage.getItem(`accubooks_user_${code}`);
        if (storedUser) {
          const user = JSON.parse(storedUser);
          onScan({
            userId: user.id,
            name: user.name,
            businessName: user.businessName,
            email: user.email,
            phone: user.phone
          });
          stopCamera();
        } else {
          setError('Invalid QR code or user not found');
        }
      }
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setScanning(false);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full overflow-hidden shadow-xl">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Scan QR Code</h3>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
            <video 
              ref={videoRef} 
              className="w-full h-full object-cover"
              playsInline
              autoPlay
            />
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none m-4"></div>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-white rounded-lg opacity-50"></div>
            </div>
          </div>
          
          <p className="text-center text-sm text-gray-500 mt-3">
            Position QR code within the frame
          </p>
          
          <button
            onClick={captureQR}
            className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
          >
            Capture QR Code
          </button>
          
          {error && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;