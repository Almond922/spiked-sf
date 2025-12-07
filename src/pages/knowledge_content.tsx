import React, { useState, FormEvent, FC, useEffect, useRef } from 'react';
import {
  ChevronRight, RefreshCw, Volume2, X, Globe, FileText,
  CheckCircle, Clock, Settings, ArrowLeft, Menu, MoreVertical,
  Search, Plus, RotateCcw, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- INTERFACES ---
interface GuideStep {
  id: number;
  title: string;
}

const FULL_GUIDE_STEPS: GuideStep[] = [
  { id: 1, title: "Go to Admin page" },
  { id: 2, title: "Click on Content Hub in the sidebar" },
  { id: 3, title: "Click on WebAgent AI" },
  { id: 4, title: "Click on Add Website button" },
  { id: 5, title: "Fill in website details and add" },
  { id: 6, title: "Click on Recrawl/Schedule for a website" },
  { id: 7, title: "Schedule automatic recrawl" },
];

// --- DEMO COMPONENT: Admin Dashboard with Content Hub ---
interface AdminDashboardDemoProps {
  currentStep: number;
  onContentHubClick: () => void;
}

const AdminDashboardDemo: FC<AdminDashboardDemoProps> = ({ currentStep, onContentHubClick }) => {
  const shouldHighlightContentHub = currentStep === 2;
  
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">!</span>
          </div>
          <div>
            <h2 className="text-sm font-bold">SpikedAI</h2>
            <p className="text-xs text-gray-400">Conversational AI Platform v2.1</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">I</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="space-y-1">
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Dashboard
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Coach-Assist
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Meeting Logs
            </div>
            <button
              onClick={onContentHubClick}
              className={`w-full p-2 text-sm rounded cursor-pointer transition-all flex items-center ${
                shouldHighlightContentHub
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Content Hub
            </button>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Support
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Tutorial
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              User Journey
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600">Metric {i}</div>
                <div className="text-2xl font-bold">0                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
            Dashboard content area
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DEMO COMPONENT: Content Hub with WebAgent AI ---
interface ContentHubDemoProps {
  currentStep: number;
  onWebAgentClick: () => void;
  onBack: () => void;
}

const ContentHubDemo: FC<ContentHubDemoProps> = ({ currentStep, onWebAgentClick, onBack }) => {
  const shouldHighlightWebAgent = currentStep === 3;
  
  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">!</span>
          </div>
          <div>
            <h2 className="text-sm font-bold">SpikedAI</h2>
            <p className="text-xs text-gray-400">Conversational AI Platform v2.1</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">I</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Menu className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Content</div>
          <div className="space-y-1 mb-4">
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              KnowledgeHub AI
            </div>
            <button
              onClick={onWebAgentClick}
              className={`w-full p-2 text-sm rounded cursor-pointer transition-all flex items-center ${
                shouldHighlightWebAgent
                  ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4 mr-2" />
              WebAgent AI
            </button>
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Index</div>
          <div className="space-y-1 mb-4">
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Browse Chunks
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Vector Configuration
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Responses</div>
          <div className="space-y-1">
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Retrieval
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Business Rules
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Answer Configuration
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Content Hub</h1>
          <p className="text-gray-600 mb-6">Manage your knowledge base content</p>
          <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
            Content Hub main area
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DEMO COMPONENT: Add Website Modal ---
interface AddWebsiteModalProps {
  currentStep: number;
  onAdd: (url: string, description: string, spaces: string) => void;
  onClose: () => void;
}

const AddWebsiteModal: FC<AddWebsiteModalProps> = ({ currentStep, onAdd, onClose }) => {
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [spaces, setSpaces] = useState('');
  const shouldHighlight = currentStep === 5;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd(url, description, spaces);
      setUrl('');
      setDescription('');
      setSpaces('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Add Website</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Website URL */}
          <div>
            <label htmlFor="website-url" className="block text-sm font-medium text-gray-700 mb-2">
              Website URL
            </label>
            <input
              type="url"
              id="website-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                shouldHighlight
                  ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] focus:ring-indigo-500 animate-pulse'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A brief description of the site"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                shouldHighlight
                  ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] focus:ring-indigo-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Spaces */}
          <div>
            <label htmlFor="spaces" className="block text-sm font-medium text-gray-700 mb-2">
              Spaces <span className="text-gray-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              id="spaces"
              value={spaces}
              onChange={(e) => setSpaces(e.target.value)}
              placeholder="Add a space..."
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                shouldHighlight
                  ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)] focus:ring-indigo-500'
                  : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-6 py-2.5 text-white rounded-lg font-medium transition-all ${
                shouldHighlight && url.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_25px_rgba(99,102,241,0.8)] animate-pulse'
                  : url.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
              disabled={!url.trim()}
            >
              Add Website
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- DEMO COMPONENT: WebAgent AI with Website Cards ---
interface Website {
  id: string;
  url: string;
  addedOn: string;
  description: string;
  spaces: string;
}

interface WebAgentDemoProps {
  currentStep: number;
  onAddWebsiteClick: () => void;
  onRecrawlClick: (websiteId: string) => void;
  onBack: () => void;
  websites: Website[];
}

const WebAgentDemo: FC<WebAgentDemoProps> = ({ currentStep, onAddWebsiteClick, onRecrawlClick, onBack, websites }) => {
  const shouldHighlightAddWebsite = currentStep === 4;
  const shouldHighlightRecrawl = currentStep === 6;

  const [showMenu, setShowMenu] = useState<string | null>(null);

  return (
    <div className="w-full max-w-6xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
            <span className="text-white font-bold">!</span>
          </div>
          <div>
            <h2 className="text-sm font-bold">SpikedAI</h2>
            <p className="text-xs text-gray-400">Conversational AI Platform v2.1</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-gray-400" />
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">I</span>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Menu className="w-5 h-5 text-gray-600" />
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Content</div>
          <div className="space-y-1 mb-4">
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              KnowledgeHub AI
            </div>
            <div className="p-2 text-sm bg-indigo-600 text-white rounded flex items-center">
              <Globe className="w-4 h-4 mr-2" />
              WebAgent AI
            </div>
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Index</div>
          <div className="space-y-1 mb-4">
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Browse Chunks
            </div>
            <div className="p-2 text-sm text-gray-600 hover:bg-gray-100 rounded cursor-pointer">
              Vector Configuration
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Search className="w-6 h-6 mr-2" />
                WebAgent AI
              </h1>
              <p className="text-gray-600 mt-1">Crawl and index website content.</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Web Crawls: {websites.length}/10</div>
              <button
                onClick={onAddWebsiteClick}
                className={`px-4 py-2 rounded-lg flex items-center font-medium transition-all ${
                  shouldHighlightAddWebsite
                    ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse hover:bg-indigo-700'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Website
              </button>
            </div>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Search websites..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Website Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {websites.map((website, index) => {
              const isNewlyAdded = shouldHighlightRecrawl && index === websites.length - 1;
              return (
                <div
                  key={website.id}
                  className={`bg-white border-2 rounded-lg p-4 relative transition-all ${
                    isNewlyAdded
                      ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                      <Globe className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{website.url}</div>
                      <div className="text-xs text-gray-500">Added on {website.addedOn}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === website.id ? null : website.id);
                        }}
                        className={`p-1 hover:bg-gray-100 rounded transition-all ${
                          isNewlyAdded
                            ? 'bg-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
                            : ''
                        }`}
                      >
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                      {showMenu === website.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRecrawlClick(website.id);
                              setShowMenu(null);
                            }}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center transition-all ${
                              isNewlyAdded
                                ? 'bg-indigo-50 text-indigo-600 shadow-[0_0_10px_rgba(99,102,241,0.3)] font-semibold'
                                : ''
                            }`}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Recrawl/Schedule
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center text-red-600"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Description</div>
                  <div className="text-sm text-gray-700 min-h-[20px]">
                    {website.description || 'Double-click to add description...'}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Spaces</div>
                  <div className="text-sm text-gray-700">
                    {website.spaces ? (
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {website.spaces}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Double-click to add spaces...</span>
                    )}
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- DEMO COMPONENT: Recrawl Schedule Modal ---
interface RecrawlModalProps {
  websiteUrl: string;
  currentStep: number;
  onSchedule: (frequency: string) => void;
  onRecrawlNow: () => void;
  onClose: () => void;
}

const RecrawlModal: FC<RecrawlModalProps> = ({ websiteUrl, currentStep, onSchedule, onRecrawlNow, onClose }) => {
  const [selectedFrequency, setSelectedFrequency] = useState<string>('none');
  const shouldHighlightSchedule = currentStep === 7;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Manage Recrawl for "{websiteUrl}"
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Schedule Automatic Recrawl */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <RotateCcw className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">Schedule Automatic Recrawl</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Set a recurring schedule for the system to fetch and re-index content automatically.
            </p>
            
            <div className="flex flex-wrap gap-3 mb-4">
              {['none', 'daily', 'weekly', 'monthly'].map((freq) => (
                <button
                  key={freq}
                  onClick={() => setSelectedFrequency(freq)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedFrequency === freq
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {freq === 'none' ? 'No Automatic Recrawl' : freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>

            <button
              onClick={() => onSchedule(selectedFrequency)}
              disabled={selectedFrequency === 'none'}
              className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-all ${
                shouldHighlightSchedule && selectedFrequency !== 'none'
                  ? 'bg-indigo-600 shadow-[0_0_25px_rgba(99,102,241,0.8)] animate-pulse'
                  : selectedFrequency !== 'none'
                  ? 'bg-indigo-600 hover:bg-indigo-700'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4 inline-block mr-2" />
              Save Schedule ({selectedFrequency === 'none' ? 'No Automatic Recrawl' : selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)})
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="px-4 text-sm text-gray-500 font-semibold">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Recrawl Now */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recrawl Now (One-time)</h3>
            <p className="text-sm text-gray-600 mb-4">
              Initiates an immediate re-index. This action will not change your recurring schedule: {selectedFrequency === 'none' ? 'No Automatic Recrawl' : selectedFrequency.charAt(0).toUpperCase() + selectedFrequency.slice(1)}
            </p>
            <button
              onClick={onRecrawlNow}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all"
            >
              Recrawl Website Now
            </button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const KnowledgeContentPage: FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesLoadedRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [showAddWebsiteModal, setShowAddWebsiteModal] = useState(false);
  const [showRecrawlModal, setShowRecrawlModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [websites, setWebsites] = useState<Website[]>([
    { id: '1', url: 'spiked.ai', addedOn: '9/11/2025', description: '🦉🦉🦉', spaces: 'Meow' },
    { id: '2', url: 'www.sphs.edu.in', addedOn: '9/18/2025', description: 'Checking?', spaces: 'school' },
    { id: '3', url: 'aws.amazon.com', addedOn: '11/19/2025', description: 'AWS bedrock documentation & architecture', spaces: '' },
    { id: '4', url: 'business.google.com', addedOn: '11/19/2025', description: 'google ads', spaces: '' },
  ]);

  // Speech synthesis setup
  useEffect(() => {
    if (!voicesLoadedRef.current && 'speechSynthesis' in window) {
      const loadVoices = () => {
        voicesLoadedRef.current = true;
      };
      window.speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();
    }
  }, []);

  const getTextContent = () => {
    const steps = FULL_GUIDE_STEPS.map((step, idx) => 
      `Step ${step.id}: ${step.title}`
    ).join('. ');
    
    return `Welcome to the Content Hub Journey. ${steps}. Follow along to learn how to schedule website recrawls in SpikedAI.`;
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const text = getTextContent();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setShowAddWebsiteModal(false);
    setShowRecrawlModal(false);
    setSelectedWebsite('');
    setWebsites([
      { id: '1', url: 'spiked.ai', addedOn: '9/11/2025', description: '🦉🦉🦉', spaces: 'Meow' },
      { id: '2', url: 'www.sphs.edu.in', addedOn: '9/18/2025', description: 'Checking?', spaces: 'school' },
      { id: '3', url: 'aws.amazon.com', addedOn: '11/19/2025', description: 'AWS bedrock documentation & architecture', spaces: '' },
      { id: '4', url: 'business.google.com', addedOn: '11/19/2025', description: 'google ads', spaces: '' },
    ]);
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleNext = () => {
    if (currentStep < FULL_GUIDE_STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleContentHubClick = () => {
    if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleWebAgentClick = () => {
    if (currentStep === 3) {
      setCurrentStep(4);
    }
  };

  const handleAddWebsiteClick = () => {
    // Always open modal when button is clicked at step 4 or 5
    setShowAddWebsiteModal(true);
    if (currentStep === 4) {
      setCurrentStep(5); // Advance to step 5 when modal opens
    }
  };

  const handleAddWebsite = (url: string, description: string, spaces: string) => {
    if (!url.trim()) {
      alert('Please enter a website URL');
      return;
    }
    
    const newWebsite: Website = {
      id: String(Date.now()), // Use timestamp for unique ID
      url: url.replace(/^https?:\/\//, '').replace(/\/$/, ''),
      addedOn: new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }),
      description: description || '',
      spaces: spaces || '',
    };
    
    // Add the new website to the list
    setWebsites(prev => [...prev, newWebsite]);
    setShowAddWebsiteModal(false);
    
    // After adding website, advance to step 6 (Recrawl/Schedule)
    // The newly added website will be the last one in the list
    if (currentStep === 5) {
      setTimeout(() => {
        setCurrentStep(6);
      }, 300); // Small delay to ensure state update and UI refresh
    }
  };

  const handleRecrawlClick = (websiteId: string) => {
    // Allow recrawl click at step 6 or later
    if (currentStep >= 6) {
      const website = websites.find(w => w.id === websiteId);
      setSelectedWebsite(website?.url || 'example.com');
      setShowRecrawlModal(true);
      if (currentStep === 6) {
        setCurrentStep(7);
      }
    }
  };

  const handleSchedule = (frequency: string) => {
    if (currentStep === 7) {
      alert(`Recrawl scheduled: ${frequency}`);
      setShowRecrawlModal(false);
      // Journey complete
    }
  };

  const handleRecrawlNow = () => {
    alert('Recrawl initiated!');
    setShowRecrawlModal(false);
  };

  const renderDemo = () => {
    if (currentStep === 1) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <button
            onClick={() => setCurrentStep(2)}
            className={`px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-all ${
              currentStep === 1 ? 'shadow-[0_0_20px_rgba(99,102,241,0.6)] animate-pulse' : ''
            }`}
          >
            Go to Admin
          </button>
        </div>
      );
    } else if (currentStep === 2) {
      return <AdminDashboardDemo currentStep={currentStep} onContentHubClick={handleContentHubClick} />;
    } else if (currentStep === 3) {
      // Show WebAgent AI view with websites when clicked
      return (
        <WebAgentDemo
          currentStep={currentStep}
          onAddWebsiteClick={handleAddWebsiteClick}
          onRecrawlClick={handleRecrawlClick}
          onBack={handleBack}
          websites={websites}
        />
      );
    } else if (currentStep >= 4) {
      return (
        <>
          <WebAgentDemo
            currentStep={currentStep}
            onAddWebsiteClick={handleAddWebsiteClick}
            onRecrawlClick={handleRecrawlClick}
            onBack={handleBack}
            websites={websites}
          />
          {/* Show Add Website Modal */}
          {showAddWebsiteModal && (
            <AddWebsiteModal
              currentStep={currentStep}
              onAdd={handleAddWebsite}
              onClose={() => {
                setShowAddWebsiteModal(false);
                // If user closes modal at step 5, go back to step 4
                if (currentStep === 5) {
                  setCurrentStep(4);
                }
              }}
            />
          )}
          {showRecrawlModal && (
            <RecrawlModal
              websiteUrl={selectedWebsite}
              currentStep={currentStep}
              onSchedule={handleSchedule}
              onRecrawlNow={handleRecrawlNow}
              onClose={() => setShowRecrawlModal(false)}
            />
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      {/* Header */}
      <div className="w-full bg-[#020617] text-white py-3 px-4 md:px-10 flex flex-wrap items-center justify-between gap-2 md:gap-4 shadow-md rounded-b-xl">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
          <span className="text-sm md:text-base lg:text-lg uppercase tracking-widest font-semibold text-white whitespace-nowrap">
            <span className="hidden sm:inline">CONTENT HUB JOURNEY</span>
            <span className="sm:hidden">CONTENT HUB</span>
          </span>
        </div>
        <div className="flex items-center gap-1 md:gap-2 overflow-x-auto">
          {FULL_GUIDE_STEPS.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            return (
              <div
                key={step.id}
                className="flex items-center gap-1 md:gap-2 text-[10px] md:text-xs cursor-pointer transition-all flex-shrink-0"
                onClick={() => {
                  if (stepNumber <= currentStep || stepNumber === currentStep + 1) {
                    setCurrentStep(stepNumber);
                  }
                }}
              >
                <div
                  className={`
                    w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full border text-[10px] md:text-[11px] font-semibold
                    ${isActive ? 'bg-white text-black border-white' : ''}
                    ${isCompleted && !isActive ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-600 text-gray-300' : ''}
                  `}
                >
                  {isCompleted && !isActive ? <CheckCircle className="w-3 h-3" /> : step.id}
                </div>
                <span
                  className={`
                    hidden md:inline-block whitespace-nowrap
                    ${isActive ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center ml-0 md:ml-4 space-x-2 md:space-x-3 flex-wrap gap-2">
          <button
            onClick={handleSpeak}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              isSpeaking
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
            }`}
          >
            {isSpeaking ? (
              <>
                <X className="w-4 h-4 mr-2" /> Stop Reading
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" /> Read Aloud
              </>
            )}
          </button>
          <button
            onClick={handleReset}
            disabled={currentStep === 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              currentStep > 1
                ? 'bg-white text-gray-800 border border-gray-700 hover:bg-gray-100'
                : 'bg-gray-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Undo
          </button>
          <button
            onClick={handleNext}
            disabled={currentStep >= FULL_GUIDE_STEPS.length}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              currentStep < FULL_GUIDE_STEPS.length
                ? 'bg-indigo-400 text-gray-900 font-semibold hover:bg-indigo-300 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Next Step ({currentStep}/{FULL_GUIDE_STEPS.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-10">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Article: Schedule Website Recrawl
          </h1>
          <p className="text-gray-600">
            Learn how to schedule automatic recrawls for websites in the Content Hub.
          </p>
        </div>

        {/* Interactive Guide */}
        <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-md shadow-sm">
          <p className="font-semibold">Current Action:</p>
          {currentStep === 1 && <p>Click the <b>Go to Admin</b> button to start.</p>}
          {currentStep === 2 && <p>Click the <b>Content Hub</b> option in the sidebar.</p>}
          {currentStep === 3 && <p>You are now viewing <b>WebAgent AI</b> with existing websites. Click the <b>+ Add Website</b> button (highlighted) to proceed.</p>}
          {currentStep === 4 && <p>Click the <b>+ Add Website</b> button (highlighted with glow) to open the add website modal.</p>}
          {currentStep === 5 && <p>Fill in the <b>Website URL</b> field (required, highlighted). Optionally add description and spaces. Then click the <b>Add Website</b> button (highlighted) to add the website to your list.</p>}
          {currentStep === 6 && <p>Click the <b>three-dot menu</b> on a website card, then select <b>Recrawl/Schedule</b>.</p>}
          {currentStep === 7 && <p>Select a recrawl frequency (Daily, Weekly, or Monthly) and click <b>Save Schedule</b>.</p>}
        </div>

        {/* Demo Component */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          {renderDemo()}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeContentPage;

