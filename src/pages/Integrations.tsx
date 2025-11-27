import React, { useState } from 'react';
import { Puzzle, Loader, ExternalLink, Moon, Sun } from 'lucide-react';
import { useTheme } from '../ThemeContext';
import { useAuth } from '../AuthContext';

// Correct API URL from your previous code
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Placeholder function for Gain Sights (kept from new UI)
const handleGainSightsConnect = async () => {
    console.log('Attempting to connect to Gain Sights...');
    return new Promise(resolve => setTimeout(resolve, 1500));
};

type Integration = {
    title: string;
    iconUrl: string;
    description: string;
    buttonColor: IntegrationCardProps['buttonColor'];
    onConnect: () => Promise<void> | void;
    isConnecting: boolean;
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
    buttonColor: 'blue' | 'orange' | 'purple';
    onConnect: () => Promise<void> | void;
    isConnecting: boolean;
};

const IntegrationCard = ({ title, iconUrl, description, buttonColor, onConnect, isConnecting }: IntegrationCardProps) => {
    const { isDarkMode } = useTheme();

    // Custom icon logic for Gain Sights
    const getIcon = () => {
        if (title === 'Gain Sights') {
            return (
                <div className="w-12 h-12 flex items-center justify-center bg-purple-600 rounded-xl shadow-lg p-2">
                    <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 8v8m-4-5v5m-4-2v2m-2-1V7a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2z"></path>
                    </svg>
                </div>
            );
        }
        return <img src={iconUrl} alt={title} className="w-12 h-12 rounded-xl object-contain shadow-md" />;
    };

    const buttonClass = `w-full px-4 py-3 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 
        focus:outline-none focus:ring-4 
        ${buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50' : ''}
        ${buttonColor === 'orange' ? 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500/50' : ''}
        ${buttonColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500/50' : ''}
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
                disabled={isConnecting}
                className={buttonClass}
            >
                {isConnecting ? (
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
    
    const [connectingJira, setConnectingJira] = useState(false);
    const [connectingHubSpot, setConnectingHubSpot] = useState(false);
    const [connectingGainSights, setConnectingGainSights] = useState(false);

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
            // Perform actual redirect
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
            // Perform actual redirect
            window.location.href = data.auth_url;
        } catch (error) {
            console.error('Error connecting to HubSpot:', error);
            alert('Failed to connect to HubSpot. Please try again.');
            setConnectingHubSpot(false);
        }
    };
    
    const handleGainSightsConnection = async () => {
        try {
            setConnectingGainSights(true);
            await handleGainSightsConnect(); 
            setConnectingGainSights(false);
            console.log("Gain Sights connection simulated successfully.");
        } catch (error) {
            console.error('Error connecting to Gain Sights:', error);
            setConnectingGainSights(false);
        }
    };
    
    const integrationCategories: IntegrationCategory[] = [
        { 
            title: "Technical", 
            description: "Tools for engineering, product management, and development tracking.",
            integrations: [
                {
                    title: "Jira",
                    iconUrl: "https://cdn.worldvectorlogo.com/logos/jira-1.svg",
                    description: "Track your Jira tasks during meetings and sync updates automatically.",
                    buttonColor: 'blue',
                    onConnect: handleJiraConnect,
                    isConnecting: connectingJira,
                },
            ]
        },
        { 
            title: "Sales", 
            description: "Tools for CRM, deal tracking, and prospect management.",
            integrations: [
                {
                    title: "HubSpot",
                    iconUrl: "https://cdn.worldvectorlogo.com/logos/hubspot.svg",
                    description: "Track deals during sales meetings with MEDPIC analysis and sync insights automatically.",
                    buttonColor: 'orange',
                    onConnect: handleHubSpotConnect,
                    isConnecting: connectingHubSpot,
                },
            ]
        },
        { 
            title: "Customer Support", 
            description: "Tools for customer success, health monitoring, and account management.",
            integrations: [
                {
                    title: "Gain Sights",
                    iconUrl: "placeholder",
                    description: "Connect customer health scores and engagement data to enrich meeting insights.",
                    buttonColor: 'purple',
                    onConnect: handleGainSightsConnection,
                    isConnecting: connectingGainSights,
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
                    Real-time Dual Sync Integrations
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