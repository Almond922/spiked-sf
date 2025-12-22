import React, { useState } from 'react';

import { Puzzle, Loader, ExternalLink, Moon, Sun } from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';

import { useAuth } from '../AuthContext';

import HelpChatWidget from './HelpChatWidget';



// Correct API URL from your previous code

const BASE_URL = import.meta.env.VITE_API_URL || "https://recall-backend-production-409019309412.us-central1.run.app";



type Integration = {

    title: string;

    iconUrl: string;

    description: string;

    buttonColor: IntegrationCardProps['buttonColor'];

    onConnect: () => Promise<void> | void;

    isConnecting: boolean;

    isComingSoon?: boolean;

};



type IntegrationCategory = {

    title: string;

    description: string;

    integrations: Integration[];

};



// Component to render an individual integration card

type IntegrationCardProps = {

    title: string;

    iconUrl: string;

    description: string;

    buttonColor: 'blue' | 'orange' | 'purple' | 'gray';

    onConnect: () => Promise<void> | void;

    isConnecting: boolean;

    isComingSoon?: boolean;

};



const IntegrationCard = ({ title, iconUrl, description, buttonColor, onConnect, isConnecting, isComingSoon }: IntegrationCardProps) => {

    const { isDarkMode } = useTheme();



    const getIcon = () => {

        return <img src={iconUrl} alt={title} className="w-12 h-12 rounded-xl object-contain shadow-md" />;

    };



    const buttonClass = `w-full px-4 py-3 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 

        focus:outline-none focus:ring-4 

        ${buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50' : ''}

        ${buttonColor === 'orange' ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500/50' : ''}

        ${buttonColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500/50' : ''}

        ${buttonColor === 'gray' ? 'bg-gray-500 hover:bg-gray-600 focus:ring-gray-400/50 cursor-not-allowed' : ''}

    `;



    const cardClass = `p-6 rounded-3xl border transition-all hover:shadow-2xl hover:scale-[1.01] 

        ${isDarkMode

            ? 'bg-slate-800 border-slate-700 text-white shadow-xl shadow-slate-900/40'

            : 'bg-white border-gray-200 text-gray-900 shadow-xl shadow-gray-200/50'

        }

    `;



    return (

        <div className={cardClass}>

            <div className="flex items-center justify-between mb-4">

                {getIcon()}

                <Puzzle className={`w-6 h-6 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />

            </div>

            

            <h3 className={`text-xl font-extrabold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>

                {title}

            </h3>

            

            <p className={`text-sm mb-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>

                {description}

            </p>

            

            <button

                onClick={onConnect}

                disabled={isConnecting || isComingSoon}

                className={buttonClass}

            >

                {isComingSoon ? (

                    <span>Coming Soon</span>

                ) : isConnecting ? (

                    <>

                        <Loader className="w-5 h-5 animate-spin" />

                        <span>Connecting...</span>

                    </>

                ) : (

                    <span>Connect Now</span>

                )}

            </button>

        </div>

    );

};



const Integrations = () => {

    // Using real contexts instead of mocks

    const { isDarkMode, toggleDarkMode } = useTheme();

    const { session } = useAuth();
    const navigate = useNavigate();

    

    const [connectingJira, setConnectingJira] = useState(false);

    const [connectingAsana, setConnectingAsana] = useState(false);

    const [connectingSalesforce, setConnectingSalesforce] = useState(false);

    const [connectingHubSpot, setConnectingHubSpot] = useState(false);

    const [connectingNotion, setConnectingNotion] = useState(false);

    const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
    
    const [allTasksSelected, setAllTasksSelected] = useState(false);

    // Handle select all tasks
    const handleSelectAllTasks = (tasks: any[]) => {
    if (allTasksSelected) {
        setSelectedTasks(new Set());
        setAllTasksSelected(false);
    } else {
        setSelectedTasks(new Set(tasks.map(t => t.task_id)));
        setAllTasksSelected(true);
    }
    };

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



    const handleAsanaConnect = async () => {

        try {

            setConnectingAsana(true);

            const response = await fetch(`${BASE_URL}/integrations/asana/auth/initiate`, {

                headers: { Authorization: `Bearer ${session?.access_token}` }

            });



            if (!response.ok) {

                throw new Error('Failed to initiate Asana OAuth');

            }



            const data = await response.json();

            window.location.href = data.auth_url;

        } catch (error) {

            console.error('Error connecting to Asana:', error);

            alert('Failed to connect to Asana. Please try again.');

            setConnectingAsana(false);

        }

    };



  const handleSalesforceConnect = async () => {
    try {
      setConnectingSalesforce(true);

      const res = await fetch(`${BASE_URL}/integrations/salesforce/auth/initiate`, {
        headers: { Authorization: `Bearer ${session?.access_token}` }
      });

      if (!res.ok) {
        // fallback to the redirect endpoint
        console.warn('Initiate endpoint failed, falling back to redirect');
        window.location.href = `${BASE_URL}/auth/salesforce/login`;
        return;
      }

      const data = await res.json();

      // Validate the returned URL to avoid misconfigured backends redirecting to the wrong host
      try {
        const parsed = new URL(data.auth_url);
        const host = parsed.hostname.toLowerCase();
        if (!/salesforce\.com$/.test(host) && !host.includes('salesforce.com')) {
          console.error('Rejecting non-salesforce auth_url', host, data.auth_url);
          alert('Salesforce integration is misconfigured on the backend (invalid SF login host). Please check SF_LOGIN_URL env var.');
          setConnectingSalesforce(false);
          return;
        }
      } catch (err) {
        console.error('Invalid auth_url returned from server', err, data);
        alert('Salesforce auth URL returned from backend is invalid. See console for details.');
        setConnectingSalesforce(false);
        return;
      }

      window.location.href = data.auth_url;
    } catch (err) {
      console.error('Error initiating Salesforce connect', err);
      // final fallback: redirect to server login endpoint
      window.location.href = `${BASE_URL}/auth/salesforce/login`;
    } finally {
      setConnectingSalesforce(false);
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



    const handleNotionConnect = async () => {

        try {

            setConnectingNotion(true);

            const response = await fetch(`${BASE_URL}/integrations/notion/auth/initiate`, {

                headers: { Authorization: `Bearer ${session?.access_token}` }

            });



            if (!response.ok) {

                throw new Error('Failed to initiate Notion OAuth');

            }



            const data = await response.json();

            window.location.href = data.auth_url;

        } catch (error) {

            console.error('Error connecting to Notion:', error);

            alert('Failed to connect to Notion. Please try again.');

            setConnectingNotion(false);

        }

    };

    

    const integrationCategories: IntegrationCategory[] = [

        { 

            title: "Technical", 

            description: "Tools for project management, task tracking, and development workflows.",

            integrations: [

                {

                    title: "Jira",

                    iconUrl: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",

                    description: "Track your Jira tasks during meetings and sync updates automatically.",

                    buttonColor: 'gray',

                    onConnect: handleJiraConnect,

                    isConnecting: connectingJira,

                    isComingSoon: true,

                },

                {

                    title: "Asana",

                    iconUrl: "https://cdn.worldvectorlogo.com/logos/asana-1.svg",

                    description: "Manage Asana projects and tasks, sync meeting action items directly.",

                    buttonColor: 'gray',

                    onConnect: handleAsanaConnect,

                    isConnecting: connectingAsana,

                    isComingSoon: true,

                },

            ]

        },

        { 

            title: "CRM", 

            description: "Tools for sales, deal tracking, and customer relationship management.",

            integrations: [

                {

                    title: "HubSpot",

                    iconUrl: "https://cdn.worldvectorlogo.com/logos/hubspot.svg",

                    description: "Track deals during sales meetings with MEDPIC analysis and sync insights automatically.",

                    buttonColor: 'orange',

                    onConnect: handleHubSpotConnect,

                    isConnecting: connectingHubSpot,

                    isComingSoon: false,

                },

                {

                    title: "Salesforce",

                    iconUrl: "https://cdn.worldvectorlogo.com/logos/salesforce-2.svg",

                    description: "Track deals and customer interactions with Salesforce integration.",

                    buttonColor: 'orange',

                    onConnect: handleSalesforceConnect,

                    isConnecting: connectingSalesforce,

                    isComingSoon: false,

                },

            ]

        },

        { 

            title: "Documentation", 

            description: "Tools for knowledge management, documentation, and information sharing.",

            integrations: [

                {

                    title: "Notion",

                    iconUrl: "https://cdn.worldvectorlogo.com/logos/notion-2.svg",

                    description: "Sync meeting notes and insights to Notion databases automatically.",

                    buttonColor: 'gray',

                    onConnect: handleNotionConnect,

                    isConnecting: connectingNotion,

                    isComingSoon: true,

                },

            ]

        },

    ];



    const tutorialLinks = [

        { text: "See the tutorial for initial setup", link: "https://example.com/initial-setup" },

        { text: "See the tutorial for pre-call setup", link: "https://example.com/pre-call-setup" },

    ];



    const backgroundClass = isDarkMode ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900';

    const linkClass = "text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300";



    return (

        <div className={`min-h-screen ${backgroundClass} font-sans transition-colors duration-300`}>

            <HelpChatWidget />

            {/* Dark Mode Toggle Button */}

            <button

                onClick={toggleDarkMode}

                className={`fixed top-4 right-4 p-3 rounded-full shadow-lg z-50 transition-colors ${

                    isDarkMode ? 'bg-slate-700 text-yellow-300 hover:bg-slate-600' : 'bg-white text-indigo-600 hover:bg-gray-100'

                }`}

                aria-label="Toggle dark mode"

            >

                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}

            </button>

            

            <div className="max-w-7xl mx-auto p-4 sm:p-8 pt-12">

                

                {/* Updated Heading */}

                <h1 className="text-5xl font-extrabold mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-blue-500 dark:from-indigo-300 dark:to-blue-400">

                    Unified Real-Time Bi-Directional Sync Platform

                </h1>

                <p className={`text-xl mb-16 max-w-3xl ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>

                    Connect your mission-critical tools to enable seamless, bidirectional data flow, enriching your meeting insights and automating post-call workflows.

                </p>

                

                {/* Divided Boxes into 3 Vertical Columns */}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

                    {integrationCategories.map((category) => (

                        <div key={category.title} className="flex flex-col space-y-8">

                            {/* Category Heading Block */}

                            <div className="p-4 rounded-xl border border-dashed border-indigo-300/50 dark:border-indigo-700/50">

                                <h2 className="text-2xl font-bold tracking-wide text-indigo-600 dark:text-indigo-400">

                                    {category.title}

                                </h2>

                                <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{category.description}</p>

                            </div>

                            

                            {/* Integration Cards for the Category */}

                            {category.integrations.map((integration) => (

                                <IntegrationCard

                                    key={integration.title}

                                    title={integration.title}

                                    iconUrl={integration.iconUrl}

                                    description={integration.description}

                                    buttonColor={integration.buttonColor}

                                    onConnect={integration.onConnect}

                                    isConnecting={integration.isConnecting}

                                    isComingSoon={integration.isComingSoon}

                                />

                            ))}

                        </div>

                    ))}

                </div>



                {/* Tutorial Links at the Bottom */}

                <div className="mt-20 pt-10 border-t border-gray-300 dark:border-slate-700">

                    <h2 className={`text-2xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>

                        Quick Setup Guides

                    </h2>

                    <ul className="space-y-4">

                        {tutorialLinks.map((item, index) => (

                            <li key={index}>

                                <a 

                                    href={item.link}

                                    target="_blank" 

                                    rel="noopener noreferrer"

                                    className={`flex items-center ${linkClass} font-medium text-lg transition-all hover:translate-x-1`}

                                >

                                    {item.text}

                                    <ExternalLink className="w-5 h-5 ml-3 opacity-80" />

                                </a>

                            </li>

                        ))}

                    </ul>

                </div>

            </div>

        </div>

    );

};



export default Integrations;