import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Puzzle, Loader } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const Integrations = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { session } = useAuth();
  const [connectingJira, setConnectingJira] = useState(false);
  const [connectingHubSpot, setConnectingHubSpot] = useState(false);

  const handleJiraConnect = async () => {
    try {
      setConnectingJira(true);
      const response = await fetch(`${BASE_URL}/integrations/jira/auth/initiate`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate Jira OAuth');
      }

      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Error connecting to Jira:', error);
      alert('Failed to connect to Jira. Please try again.');
      setConnectingJira(false);
    }
  };

  const handleHubSpotConnect = async () => {
    try {
      setConnectingHubSpot(true);
      const response = await fetch(`${BASE_URL}/integrations/hubspot/auth/initiate`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate HubSpot OAuth');
      }

      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Error connecting to HubSpot:', error);
      alert('Failed to connect to HubSpot. Please try again.');
      setConnectingHubSpot(false);
    }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className={`text-3xl font-bold mb-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Integrations
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Jira Card */}
          <div
            className={`p-6 rounded-xl border-2 transition-all ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <img
                src="https://cdn.worldvectorlogo.com/logos/jira-1.svg"
                alt="Jira"
                className="w-12 h-12"
              />
              <Puzzle className="w-6 h-6 text-blue-500" />
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Jira
            </h3>
            
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your Jira tasks during meetings and sync updates automatically.
            </p>
            
            <button
              onClick={handleJiraConnect}
              disabled={connectingJira}
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {connectingJira ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>
          </div>

          {/* HubSpot Card */}
          <div
            className={`p-6 rounded-xl border-2 transition-all ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <img
                src="https://cdn.worldvectorlogo.com/logos/hubspot.svg"
                alt="HubSpot"
                className="w-12 h-12"
              />
              <Puzzle className="w-6 h-6 text-orange-500" />
            </div>
            
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              HubSpot
            </h3>
            
            <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track deals during sales meetings with MEDPIC analysis and sync insights automatically.
            </p>
            
            <button
              onClick={handleHubSpotConnect}
              disabled={connectingHubSpot}
              className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {connectingHubSpot ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <span>Connect</span>
              )}
            </button>
          </div>
          
          {/* Coming Soon Cards */}
          <div className={`p-6 rounded-xl border-2 opacity-50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">📋</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-500 text-white">Coming Soon</span>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Asana
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Sync your Asana tasks and projects.
            </p>
          </div>
          
          <div className={`p-6 rounded-xl border-2 opacity-50 ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">📊</span>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-500 text-white">Coming Soon</span>
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Linear
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Connect your Linear issues and cycles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Integrations;