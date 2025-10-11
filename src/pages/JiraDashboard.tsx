import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle, RefreshCw, XCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const JiraDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tasksByProject, setTasksByProject] = useState<any>({});
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check for OAuth errors in URL
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(`OAuth failed: ${oauthError}`);
      setLoading(false);
      return;
    }

    checkConnection();
  }, []);

  useEffect(() => {
    const checkConnection = async () => {
      const response = await fetch('/integrations/jira/connection', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      setConnected(data.connected);
      if (data.connected) {
        fetchTasks();
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    // Auto-fetch tasks if coming back from successful OAuth
    if (searchParams.get('connected') === 'true' && connected) {
      fetchTasks();
    }
  }, [searchParams, connected]);

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/integrations/jira/connection`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to check connection status');
      }

      const data = await response.json();
      setConnected(data.connected);
      
      if (data.connected) {
        fetchTasks();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setError('Failed to check Jira connection. Please refresh the page.');
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/integrations/jira/tasks`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Jira tasks');
      }

      const data = await response.json();
      setTasksByProject(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to fetch tasks from Jira. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const response = await fetch(`${BASE_URL}/integrations/jira/auth/initiate`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      setError('Failed to connect to Jira. Please try again.');
    }
  };

  const toggleTaskSelection = (taskKey: string) => {
    setSelectedTaskIds(prev =>
      prev.includes(taskKey) ? prev.filter(key => key !== taskKey) : [...prev, taskKey]
    );
  };

  const handleTrackSelected = async () => {
    try {
      setSyncing(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/integrations/jira/tasks/select`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({ task_keys: selectedTaskIds })
      });

      if (!response.ok) {
        throw new Error('Failed to select tasks');
      }
      
      alert(`✓ ${selectedTaskIds.length} tasks selected for tracking`);
      navigate('/');
    } catch (error) {
      console.error('Error selecting tasks:', error);
      setError('Failed to save task selection. Please try again.');
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
            Loading Jira connection...
          </p>
        </div>
      </div>
    );
  }

  if (error && !connected) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} p-8`}>
        <div className="max-w-2xl mx-auto text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Connection Error
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          <button
            onClick={() => navigate('/integrations')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Back to Integrations
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} p-8`}>
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Connect Your Jira Account
          </h2>
          <p className={`mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Connect Jira to track your tasks during meetings
          </p>
          <button
            onClick={handleConnect}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect with Jira
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} p-8`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Jira Tasks
          </h1>
          <div className="flex space-x-4">
            <button
              onClick={fetchTasks}
              disabled={loading}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-gray-900'
              } disabled:opacity-50`}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {selectedTaskIds.length > 0 && (
              <button
                onClick={handleTrackSelected}
                disabled={syncing}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {syncing ? 'Saving...' : `Track ${selectedTaskIds.length} Tasks`}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {Object.keys(tasksByProject).length === 0 ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
              No tasks found. Create tasks in Jira and refresh.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(tasksByProject).map(([projectKey, projectData]: [string, any]) => (
              <div
                key={projectKey}
                className={`p-6 rounded-xl ${
                  isDarkMode ? 'bg-slate-800' : 'bg-white'
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {projectData.project_name}
                </h3>
                
                <div className="space-y-3">
                  {projectData.tasks.map((task: any) => (
                    <div
                      key={task.task_key}
                      onClick={() => toggleTaskSelection(task.task_key)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTaskIds.includes(task.task_key)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : isDarkMode
                          ? 'border-slate-700 hover:border-slate-600'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-mono text-blue-500">
                              {task.task_key}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode ? 'bg-slate-700' : 'bg-gray-200'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                          
                          <h4 className={`font-medium mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                            {task.title}
                          </h4>
                          
                          {task.description && (
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {task.description.substring(0, 100)}...
                            </p>
                          )}
                        </div>
                        
                        {selectedTaskIds.includes(task.task_key) && (
                          <CheckCircle className="w-6 h-6 text-blue-500 flex-shrink-0 ml-4" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JiraDashboard;