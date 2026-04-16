import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'alert-success' : type === 'error' ? 'alert-error' : 'alert-info';

  return (
    <div className="toast toast-top toast-end z-[100]">
      <div className={`alert ${bgColor} shadow-lg`}>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;