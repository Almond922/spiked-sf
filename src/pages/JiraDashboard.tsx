import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle, RefreshCw, XCircle, Calendar, User, Filter, X, Grid3x3, List } from 'lucide-react';
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
  
  // Filter states
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) {
      setError(`OAuth failed: ${oauthError}`);
      setLoading(false);
      return;
    }
    checkConnection();
  }, []);

  useEffect(() => {
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

  const getUniqueAssignees = (): string[] => {
    const assignees = new Set<string>();
    Object.values(tasksByProject).forEach((projectData: any) => {
      projectData.tasks.forEach((task: any) => {
        if (task.assignee) assignees.add(task.assignee);
      });
    });
    return Array.from(assignees).sort();
  };

  const getUniqueStatuses = (): string[] => {
    const statuses = new Set<string>();
    Object.values(tasksByProject).forEach((projectData: any) => {
      projectData.tasks.forEach((task: any) => {
        if (task.status) statuses.add(task.status);
      });
    });
    return Array.from(statuses).sort();
  };

  const getFilteredTasksByProject = () => {
    if (selectedAssignees.length === 0 && selectedStatuses.length === 0) {
      return tasksByProject;
    }

    const filtered: any = {};
    Object.entries(tasksByProject).forEach(([projectKey, projectData]: [string, any]) => {
      const filteredTasks = projectData.tasks.filter((task: any) => {
        const assigneeMatch = selectedAssignees.length === 0 || selectedAssignees.includes(task.assignee);
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(task.status);
        return assigneeMatch && statusMatch;
      });

      if (filteredTasks.length > 0) {
        filtered[projectKey] = {
          ...projectData,
          tasks: filteredTasks
        };
      }
    });

    return filtered;
  };

  const toggleAssigneeFilter = (assignee: string) => {
    setSelectedAssignees(prev =>
      prev.includes(assignee) ? prev.filter(a => a !== assignee) : [...prev, assignee]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearFilters = () => {
    setSelectedAssignees([]);
    setSelectedStatuses([]);
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAssigneeColor = (name: string): string => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 
      'bg-pink-500', 'bg-orange-500', 'bg-indigo-500',
      'bg-teal-500', 'bg-cyan-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const isOverdue = (dueDate: string | null): boolean => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const formatDueDate = (dueDate: string | null): string => {
    if (!dueDate) return 'No due date';
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays}d`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusStyle = (status: string): string => {
    const upper = status.toUpperCase();
    if (upper.includes('DONE') || upper.includes('CLOSED')) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    }
    if (upper.includes('PROGRESS')) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    if (upper.includes('REVIEW')) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
    if (upper.includes('TODO') || upper.includes('TO DO')) {
      return 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300';
    }
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  };

  const filteredTasksByProject = getFilteredTasksByProject();
  const activeFilterCount = selectedAssignees.length + selectedStatuses.length;

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
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'} pb-8`}>
      {/* Top Bar */}
      <div className={`sticky top-0 z-10 ${isDarkMode ? 'bg-slate-900/95' : 'bg-white/95'} backdrop-blur-sm border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Jira Tasks
              </h1>
              <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {Object.values(filteredTasksByProject).reduce((acc: number, p: any) => acc + p.tasks.length, 0)} tasks
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className={`flex rounded-lg p-1 ${isDarkMode ? 'bg-slate-800' : 'bg-gray-100'}`}>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-blue-500 text-white'
                      : isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 relative transition-colors ${
                  isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              
              <button
                onClick={fetchTasks}
                disabled={loading}
                className={`p-2 rounded-lg transition-colors ${
                  isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                } disabled:opacity-50`}
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              
              {selectedTaskIds.length > 0 && (
                <button
                  onClick={handleTrackSelected}
                  disabled={syncing}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 font-medium"
                >
                  {syncing ? 'Saving...' : `Track ${selectedTaskIds.length}`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 mt-6">
        {/* Filter Panel */}
        {showFilters && (
          <div className={`mb-6 p-5 rounded-xl border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Filter Tasks
              </h3>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-500 hover:text-blue-600 flex items-center space-x-1 font-medium"
                >
                  <X className="w-4 h-4" />
                  <span>Clear all</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Assignee Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Assignee
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {getUniqueAssignees().map(assignee => (
                    <label
                      key={assignee}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAssignees.includes(assignee)}
                        onChange={() => toggleAssigneeFilter(assignee)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <div className={`w-7 h-7 rounded-full ${getAssigneeColor(assignee)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                          {getInitials(assignee)}
                        </div>
                        <span className={`text-sm ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {assignee}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {getUniqueStatuses().map(status => (
                    <label
                      key={status}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStatuses.includes(status)}
                        onChange={() => toggleStatusFilter(status)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(status)}`}>
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-red-500 text-sm">{error}</p>
          </div>
        )}

        {/* Tasks */}
        {Object.keys(filteredTasksByProject).length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {activeFilterCount > 0 ? 'No tasks match the selected filters' : 'No tasks found'}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {activeFilterCount > 0 ? 'Try adjusting your filters' : 'Create tasks in Jira and refresh'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredTasksByProject).map(([projectKey, projectData]: [string, any]) => (
              <div key={projectKey}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {projectData.project_name}
                  </h2>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {projectData.tasks.length} {projectData.tasks.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {projectData.tasks.map((task: any) => (
                    <div
                      key={task.task_key}
                      onClick={() => toggleTaskSelection(task.task_key)}
                      className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedTaskIds.includes(task.task_key)
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                          : isDarkMode
                          ? 'border-slate-700/50 hover:border-slate-600 hover:shadow-lg bg-slate-800'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                      }`}
                    >
                      {/* Selection Indicator */}
                      {selectedTaskIds.includes(task.task_key) && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-6 h-6 text-blue-500 drop-shadow-lg" />
                        </div>
                      )}

                      {/* Task Key & Status */}
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-xs font-mono font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded">
                          {task.task_key}
                        </span>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusStyle(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      
                      {/* Task Title */}
                      <h3 className={`font-semibold mb-2 line-clamp-2 pr-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {task.title}
                      </h3>
                      
                      {/* Task Description */}
                      {task.description && (
                        <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {task.description}
                        </p>
                      )}

                      {/* Task Metadata */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                        {/* Assignee */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full ${getAssigneeColor(task.assignee)} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                            {getInitials(task.assignee)}
                          </div>
                          <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {task.assignee.split(' ')[0]}
                          </span>
                        </div>

                        {/* Due Date */}
                        <div className="flex items-center space-x-1.5">
                          <Calendar className={`w-4 h-4 ${isOverdue(task.due_date) ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className={`text-xs font-medium ${
                            isOverdue(task.due_date) 
                              ? 'text-red-500' 
                              : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {formatDueDate(task.due_date)}
                          </span>
                        </div>
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