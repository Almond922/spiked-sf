// src/ProtectedRoute.tsx
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

// A set of on-brand loading messages for SpikedAI
const loadingMessages = [
  "Sharpening AI Insights...",
  "Analyzing Meeting Transcripts...",
  "Extracting Key Insights...",
  "Calibrating Neural Networks...",
  "Preparing Your Dashboard...",
  "Unlocking Conversational Intelligence...",
];

const ProtectedRoute: React.FC = () => {
  const { session, loading } = useAuth();
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * loadingMessages.length);
    setLoadingMessage(loadingMessages[randomIndex]);
  }, []); 

  if (loading) {
    return (
      <>
        {/* You can move this CSS to your main stylesheet if you prefer */}
        <style>{`
          .spinner {
            width: 56px;
            height: 56px;
            border-radius: 50%;
            border: 8px solid #e0e0e0; /* Light grey */
            border-top: 8px solid #FE243D; /* SpikedAI Theme Color */
            animation: spin 1s linear infinite;
            margin-bottom: 24px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fdfdfd',
          color: '#2d3748',
          fontFamily: 'Arial, sans-serif'
        }}>
          <div className="spinner"></div>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>{loadingMessage}</p>
        </div>
      </>
    );
  }

  const isPasswordRecovery = window.location.hash.includes('type=recovery');

  if (session && !isPasswordRecovery) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default ProtectedRoute;