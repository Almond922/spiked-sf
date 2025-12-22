import React, { useEffect, useState } from 'react';

// Define the types for the component props
interface SuccessNotificationProps {
  message: string;
  duration?: number; // Optional duration in milliseconds (default is 5000)
  onClose: () => void; // Function to call when the notification is closed
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({ 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  // Auto-dismiss logic
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, duration);

    // Cleanup the timer
    return () => clearTimeout(timer);
  }, [duration, onClose, isVisible]);

  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  // Inline styles are used for simplicity here, but should ideally be moved to a CSS file or CSS-in-JS solution
  const notificationStyle: React.CSSProperties = {
    position: 'fixed',
    top: '20px', 
    right: '20px', 
    backgroundColor: '#1E4620', // Dark Green
    color: 'white',
    padding: '15px 20px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 1000, 
    display: 'flex',
    alignItems: 'center',
    maxWidth: '350px',
    transition: 'opacity 0.3s ease-in-out',
    opacity: isVisible ? 1 : 0,
  };

  const closeButtonStyle: React.CSSProperties = {
    marginLeft: '15px',
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '18px',
    cursor: 'pointer',
    fontWeight: 'bold',
    lineHeight: 1, // Fixes vertical alignment of the 'x'
  };

  return (
    <div style={notificationStyle} role="alert">
      <span>{message}</span>
      <button style={closeButtonStyle} onClick={handleClose} aria-label="Close notification">
        &times;
      </button>
    </div>
  );
};

export default SuccessNotification;