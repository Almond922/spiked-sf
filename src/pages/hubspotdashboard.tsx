import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader, AlertCircle, RefreshCw, XCircle, Calendar, DollarSign, Filter, X, Grid3x3, List, TrendingUp, Clock, User, ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../ThemeContext';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const HubSpotDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const { isDarkMode } = useTheme();
  
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealsByPipeline, setDealsByPipeline] = useState<any>({});
  const [selectedDealIds, setSelectedDealIds] = useState<string[]>([]);
  const [syncing, setSyncing] = useState(false);
  
  // Filter states
  const [selectedStages, setSelectedStages] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
  const [dealTasks, setDealTasks] = useState<Record<string, HubSpotTask[]>>({});
  const [loadingTasks, setLoadingTasks] = useState<Record<string, boolean>>({});
  const [selectedTaskMap, setSelectedTaskMap] = useState<Record<string, HubSpotTask>>({}); 
  const [taskFilters, setTaskFilters] = useState({
    priority: 'all',
    assignee: '', // This will now store the Name, not the ID
    dueDate: ''
  });

  interface HubSpotTask {
    task_id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string | null;
    assignee_id: string | null;
    assignee_name: string | null; // Added field for Name
    deal_id: string;
  }

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
      fetchDeals();
    }
  }, [searchParams, connected]);

  const fetchTasksForDeal = async (dealId: string) => {
    if (dealTasks[dealId]) {
      setExpandedDealId(expandedDealId === dealId ? null : dealId);
      return;
    }

    setLoadingTasks(prev => ({ ...prev, [dealId]: true }));
    setExpandedDealId(dealId);

    try {
      const response = await fetch(`${BASE_URL}/integrations/hubspot/deals/${dealId}/tasks`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });
      const data = await response.json();
      setDealTasks(prev => ({ ...prev, [dealId]: data.tasks || [] }));
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoadingTasks(prev => ({ ...prev, [dealId]: false }));
    }
  };

  const toggleTaskSelection = (task: HubSpotTask) => {
    setSelectedTaskMap(prev => {
      const newMap = { ...prev };
      if (newMap[task.task_id]) {
        delete newMap[task.task_id];
      } else {
        newMap[task.task_id] = task;
      }
      return newMap;
    });
  };

  const getFilteredTasks = (tasks: HubSpotTask[]) => {
    return tasks.filter(task => {
      const matchPriority = taskFilters.priority === 'all' || (task.priority || 'LOW').toUpperCase() === taskFilters.priority;
      
      // Filter by Name now, not ID
      const matchAssignee = !taskFilters.assignee || (task.assignee_name === taskFilters.assignee);
      
      let matchDate = true;
      if (taskFilters.dueDate && task.due_date) {
        const filterDate = new Date(taskFilters.dueDate).getTime();
        const taskDate = new Date(task.due_date).getTime();
        matchDate = taskDate <= filterDate; 
      }

      return matchPriority && matchAssignee && matchDate;
    });
  };

  // Helper to get unique assignee names for the current list of tasks
  const getUniqueAssignees = (tasks: HubSpotTask[]) => {
    if (!tasks) return [];
    const names = new Set<string>();
    tasks.forEach(t => {
      if (t.assignee_name) names.add(t.assignee_name);
    });
    return Array.from(names).sort();
  };

  const checkConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/integrations/hubspot/connection`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to check connection status');
      }

      const data = await response.json();
      setConnected(data.connected);
      
      if (data.connected) {
        fetchDeals();
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
      setError('Failed to check HubSpot connection. Please refresh the page.');
      setLoading(false);
    }
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${BASE_URL}/integrations/hubspot/deals`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch HubSpot deals');
      }

      const data = await response.json();
      setDealsByPipeline(data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      setError('Failed to fetch deals from HubSpot. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const trackSelectedDealsAndTasks = async () => {
    if (syncing) return;
  
    if (selectedDealIds.length === 0 && Object.keys(selectedTaskMap).length === 0) {
      alert('Please select at least one deal or task to track');
      return;
    }
  
    setSyncing(true);
    setError(null);
  
    try {
      let dealsTracked = 0;
      let tasksTracked = 0;
  
      if (selectedDealIds.length > 0) {
        const dealsResponse = await fetch(`${BASE_URL}/integrations/hubspot/deals/select`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ deal_ids: selectedDealIds })
        });
  
        if (!dealsResponse.ok) {
          const errorText = await dealsResponse.text();
          throw new Error(`Failed to track deals: ${errorText}`);
        }
        dealsTracked = selectedDealIds.length;
      }
  
      if (Object.keys(selectedTaskMap).length > 0) {
        const tasksToSave = Object.values(selectedTaskMap);
        const tasksResponse = await fetch(`${BASE_URL}/integrations/hubspot/tasks/select-batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`
          },
          body: JSON.stringify({ tasks: tasksToSave })
        });
  
        if (!tasksResponse.ok) {
          const errorText = await tasksResponse.text();
          throw new Error(`Failed to track tasks: ${errorText}`);
        }
        tasksTracked = tasksToSave.length;
      }
  
      alert(`✓ Successfully tracked!\n${dealsTracked} deal(s)\n${tasksTracked} task(s)`);
  
      setSelectedDealIds([]);
      setSelectedTaskMap({});
      navigate('/');
      await fetchDeals();
  
    } catch (error) {
      console.error('=== TRACKING ERROR ===', error);
      setError(error instanceof Error ? error.message : 'Failed to track selection');
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to track selection'}`);
    } finally {
      setSyncing(false);
    }
  };
  
  const handleConnect = async () => {
    try {
      const response = await fetch(`${BASE_URL}/integrations/hubspot/auth/initiate`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth');
      }

      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      setError('Failed to connect to HubSpot. Please try again.');
    }
  };

  const toggleDealSelection = (dealId: string) => {
    setSelectedDealIds(prev =>
      prev.includes(dealId) ? prev.filter(id => id !== dealId) : [...prev, dealId]
    );
  };

  const getUniqueStages = (): string[] => {
    const stages = new Set<string>();
    Object.values(dealsByPipeline).forEach((pipelineData: any) => {
      pipelineData.deals.forEach((deal: any) => {
        if (deal.stage) stages.add(deal.stage);
      });
    });
    return Array.from(stages).sort();
  };

  const getUniquePriorities = (): string[] => {
    const priorities = new Set<string>();
    Object.values(dealsByPipeline).forEach((pipelineData: any) => {
      pipelineData.deals.forEach((deal: any) => {
        if (deal.priority) priorities.add(deal.priority);
      });
    });
    return Array.from(priorities).sort();
  };

  const getFilteredDealsByPipeline = () => {
    if (selectedStages.length === 0 && selectedPriorities.length === 0) {
      return dealsByPipeline;
    }

    const filtered: any = {};
    Object.entries(dealsByPipeline).forEach(([pipelineId, pipelineData]: [string, any]) => {
      const filteredDeals = pipelineData.deals.filter((deal: any) => {
        const stageMatch = selectedStages.length === 0 || selectedStages.includes(deal.stage);
        const priorityMatch = selectedPriorities.length === 0 || selectedPriorities.includes(deal.priority);
        return stageMatch && priorityMatch;
      });

      if (filteredDeals.length > 0) {
        filtered[pipelineId] = {
          ...pipelineData,
          deals: filteredDeals
        };
      }
    });

    return filtered;
  };

  const toggleStageFilter = (stage: string) => {
    setSelectedStages(prev =>
      prev.includes(stage) ? prev.filter(s => s !== stage) : [...prev, stage]
    );
  };

  const togglePriorityFilter = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const clearFilters = () => {
    setSelectedStages([]);
    setSelectedPriorities([]);
  };

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount);
    if (isNaN(num)) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  };

  const formatCloseDate = (dateStr: string | null) => {
    if (!dateStr) return 'No date';
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)}w`;
    return `${Math.ceil(diffDays / 30)}mo`;
  };

  const isOverdue = (dateStr: string | null): boolean => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const getStageStyle = (stage: string) => {
    const stageLower = stage.toLowerCase();
    if (stageLower.includes('qualified') || stageLower.includes('appointment')) {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    }
    if (stageLower.includes('demo') || stageLower.includes('presentation')) {
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
    }
    if (stageLower.includes('negotiation') || stageLower.includes('proposal')) {
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
    if (stageLower.includes('closed') || stageLower.includes('won')) {
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    }
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getContactInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredDealsByPipeline = getFilteredDealsByPipeline();
  const activeFilterCount = selectedStages.length + selectedPriorities.length;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="text-center">
          <Loader className={`w-12 h-12 animate-spin mx-auto mb-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} />
          <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading HubSpot deals...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
        <div className="max-w-2xl mx-auto p-8">
          <div className={`text-center p-12 rounded-2xl ${isDarkMode ? 'bg-slate-800' : 'bg-white shadow-lg'}`}>
            <img
              src="https://cdn.worldvectorlogo.com/logos/hubspot.svg"
              alt="HubSpot"
              className="w-20 h-20 mx-auto mb-6"
            />
            <h2 className={`text-2xl font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Connect HubSpot
            </h2>
            <p className={`mb-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Track your deals during sales meetings with MEDPIC analysis and sync insights automatically.
            </p>
            <button
              onClick={handleConnect}
              className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Connect to HubSpot
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              HubSpot Deals
            </h1>
            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Select deals to track with MEDPIC analysis during meetings
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                showFilters
                  ? 'bg-blue-500 text-white'
                  : isDarkMode
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="px-2 py-0.5 bg-white text-blue-500 rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className={`flex rounded-lg border ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-l-lg transition-colors ${
                  viewMode === 'list'
                    ? isDarkMode
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-r-lg transition-colors ${
                  viewMode === 'grid'
                    ? isDarkMode
                      ? 'bg-slate-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : isDarkMode
                    ? 'text-gray-400 hover:text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={fetchDeals}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 text-gray-300 hover:bg-slate-700'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection Summary */}
        {(selectedDealIds.length > 0 || Object.keys(selectedTaskMap).length > 0) && (
          <div className={`mb-6 p-5 rounded-xl border-2 ${
            isDarkMode ? 'bg-slate-800 border-blue-500/50' : 'bg-blue-50 border-blue-500/50'
          }`}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                {selectedDealIds.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-500" />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedDealIds.length} deal{selectedDealIds.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
                {Object.keys(selectedTaskMap).length > 0 && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {Object.keys(selectedTaskMap).length} task{Object.keys(selectedTaskMap).length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDealIds([]);
                    setSelectedTaskMap({});
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isDarkMode
                      ? 'bg-slate-700 text-white hover:bg-slate-600'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                >
                  Clear
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    trackSelectedDealsAndTasks();
                  }}
                  disabled={syncing}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 shadow-lg ${
                    syncing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white'
                  }`}
                >
                  {syncing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin pointer-events-none" />
                      <span className="pointer-events-none">Tracking...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 pointer-events-none" />
                      <span className="pointer-events-none">Track Selection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <div className={`mb-6 p-5 rounded-xl border ${
            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Filter Deals
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
              {/* Stage Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Deal Stage
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {getUniqueStages().map(stage => (
                    <label
                      key={stage}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStages.includes(stage)}
                        onChange={() => toggleStageFilter(stage)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStageStyle(stage)}`}>
                        {stage}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Priority
                </label>
                <div className="space-y-1 max-h-40 overflow-y-auto pr-2">
                  {getUniquePriorities().map(priority => (
                    <label
                      key={priority}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        isDarkMode ? 'hover:bg-slate-700/50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriorities.includes(priority)}
                        onChange={() => togglePriorityFilter(priority)}
                        className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(priority)}`} />
                        <span className={`text-sm capitalize ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                          {priority}
                        </span>
                      </div>
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

        {/* Deals */}
        {Object.keys(filteredDealsByPipeline).length === 0 ? (
          <div className={`text-center py-16 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
            <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            <p className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {activeFilterCount > 0 ? 'No deals match the selected filters' : 'No deals found'}
            </p>
            <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              {activeFilterCount > 0 ? 'Try adjusting your filters' : 'Create deals in HubSpot and refresh'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(filteredDealsByPipeline).map(([pipelineId, pipelineData]: [string, any]) => (
              <div key={pipelineId}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {pipelineData.pipeline_name}
                  </h2>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-slate-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pipelineData.deals.length} {pipelineData.deals.length === 1 ? 'deal' : 'deals'}
                  </span>
                </div>
                
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
                  {pipelineData.deals.map((deal: any) => (
                    <div
                      key={deal.deal_id}
                      onClick={() => toggleDealSelection(deal.deal_id)}
                      className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedDealIds.includes(deal.deal_id)
                          ? 'border-blue-500 shadow-lg shadow-blue-500/20 scale-[1.02]'
                          : isDarkMode
                          ? 'border-slate-700/50 hover:border-slate-600 hover:shadow-lg bg-slate-800'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
                      }`}
                    >
                      {/* Selection Indicator */}
                      {selectedDealIds.includes(deal.deal_id) && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle className="w-6 h-6 text-blue-500 drop-shadow-lg" />
                        </div>
                      )}

                      {/* Priority Indicator */}
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(deal.priority)}`} />
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStageStyle(deal.stage)}`}>
                          {deal.stage}
                        </span>
                      </div>
                      
                      {/* Deal Name */}
                      <h3 className={`font-semibold mb-2 line-clamp-2 pr-8 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {deal.deal_name}
                      </h3>
                      
                      {/* Amount */}
                      <div className="flex items-center space-x-2 mb-4">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className={`text-lg font-bold ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>
                          {formatAmount(deal.amount)}
                        </span>
                      </div>

                      {/* Deal Metadata */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-700">
                        {/* Contact */}
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                            {getContactInitials(deal.contact_name)}
                          </div>
                          <span className={`text-sm font-medium truncate max-w-[120px] ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            {deal.contact_name}
                          </span>
                        </div>

                        {/* Close Date */}
                        <div className="flex items-center space-x-1.5">
                          <Calendar className={`w-4 h-4 ${isOverdue(deal.close_date) ? 'text-red-500' : 'text-gray-400'}`} />
                          <span className={`text-xs font-medium ${
                            isOverdue(deal.close_date) 
                              ? 'text-red-500' 
                              : isDarkMode ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {formatCloseDate(deal.close_date)}
                          </span>
                        </div>
                      </div>
                      {/* TASKS SECTION FOOTER */}
                      <div onClick={(e) => e.stopPropagation()} className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={() => fetchTasksForDeal(deal.deal_id)}
                          className={`flex items-center space-x-2 text-sm font-medium transition-colors ${
                            expandedDealId === deal.deal_id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {expandedDealId === deal.deal_id ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                          <span>
                             {loadingTasks[deal.deal_id] ? 'Loading Tasks...' : 'Show Tasks'}
                          </span>
                        </button>

                        {/* EXPANDED TASK LIST & FILTERS */}
                        {expandedDealId === deal.deal_id && (
                          <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200 cursor-default">
                            
                            {/* Task Filters */}
                            <div className={`p-3 mb-3 rounded-lg text-xs grid grid-cols-3 gap-2 ${
                               isDarkMode ? 'bg-slate-800' : 'bg-gray-50'
                            }`}>
                               {/* Priority Filter */}
                               <select 
                                 className={`p-1 rounded border bg-transparent ${isDarkMode ? 'border-gray-600 text-gray-200 [&>option]:bg-slate-800' : 'border-gray-300 text-gray-800'}`}
                                 value={taskFilters.priority}
                                 onChange={(e) => setTaskFilters(prev => ({...prev, priority: e.target.value}))}
                               >
                                 <option value="all">Priority</option>
                                 <option value="HIGH">High</option>
                                 <option value="MEDIUM">Medium</option>
                                 <option value="LOW">Low</option>
                               </select>

                               {/* Assignee Filter - NOW A DROPDOWN */}
                               <select 
                                   className={`p-1 rounded border bg-transparent ${isDarkMode ? 'border-gray-600 text-gray-200 [&>option]:bg-slate-800' : 'border-gray-300 text-gray-800'}`}
                                   value={taskFilters.assignee}
                                   onChange={(e) => setTaskFilters(prev => ({...prev, assignee: e.target.value}))}
                                 >
                                   <option value="">All Assignees</option>
                                   {getUniqueAssignees(dealTasks[deal.deal_id]).map(name => (
                                     <option key={name} value={name}>{name}</option>
                                   ))}
                               </select>

                               {/* Due Date Filter */}
                               <div className={`flex items-center border rounded px-1 ${isDarkMode ? 'bg-slate-700 border-gray-600' : 'bg-white border-gray-300'}`}>
                                 <Clock className="w-3 h-3 mr-1 opacity-50"/>
                                 <input 
                                   type="date"
                                   className="w-full bg-transparent outline-none p-1 text-xs"
                                   value={taskFilters.dueDate}
                                   onChange={(e) => setTaskFilters(prev => ({...prev, dueDate: e.target.value}))}
                                 />
                               </div>
                            </div>

                            {/* Tasks List */}
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                              {dealTasks[deal.deal_id] && dealTasks[deal.deal_id].length > 0 ? (
                                getFilteredTasks(dealTasks[deal.deal_id]).map((task) => (
                                  <div 
                                    key={task.task_id}
                                    onClick={() => toggleTaskSelection(task)}
                                    className={`p-2 rounded border cursor-pointer flex items-center justify-between text-xs transition-colors ${
                                      selectedTaskMap[task.task_id] 
                                        ? 'bg-green-50 border-green-500 dark:bg-green-900/30' 
                                        : 'bg-white border-gray-100 hover:bg-gray-50 dark:bg-slate-700 dark:border-slate-600'
                                    }`}
                                  >
                                    <div className="flex-1">
                                       <p className={`font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                         {task.title}
                                       </p>
                                       <div className="flex items-center space-x-2 mt-1 text-gray-500">
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                                            task.priority === 'HIGH' ? 'bg-red-100 text-red-700' : 'bg-gray-100'
                                          }`}>
                                            {task.priority || 'NORMAL'}
                                          </span>
                                          <span>{task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                                          {/* Show assignee name if available */}
                                          {task.assignee_name && task.assignee_name !== 'Unassigned' && (
                                              <span className="flex items-center">
                                                  <User className="w-3 h-3 mr-0.5" />
                                                  {task.assignee_name}
                                              </span>
                                          )}
                                       </div>
                                    </div>
                                    
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                       selectedTaskMap[task.task_id] ? 'bg-green-500 border-green-500' : 'border-gray-300'
                                    }`}>
                                       {selectedTaskMap[task.task_id] && <CheckCircle className="w-3 h-3 text-white" />}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-center text-gray-500 py-2">No tasks found matching filters.</p>
                              )}
                            </div>
                          </div>
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

export default HubSpotDashboard;  