import React, { useState, useCallback } from 'react';
import { Puzzle, Loader, ExternalLink, Moon, Sun, MessageSquare } from 'lucide-react';

// --- MOCK CONTEXTS AND WIDGET FOR SINGLE-FILE EXECUTION ---

// 1. Mock Theme Context
const useTheme = () => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
    return { isDarkMode, toggleDarkMode };
};

// 2. Mock Auth Context
const useAuth = () => {
    // Mock user session data
    const session = {
        access_token: 'mock-auth-token-12345',
        user_id: 'user-001'
    };
    return { session };
};

// 3. Mock Help Chat Widget
const HelpChatWidget = () => (
    <div className="fixed bottom-6 right-6 p-3 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-colors cursor-pointer z-50">
        <MessageSquare className="w-6 h-6" />
    </div>
);

// --- COMPONENT LOGIC ---

// Correct API URL from your previous code
const BASE_URL = "https://recall-backend-production-409019309412.us-central1.run.app"; // Mocked if environment variables are unavailable

// Placeholder function for Asana (now coming soon)
const handleAsanaConnect = async () => {
    console.log('Asana connection is coming soon. Simulation skipped.');
    return Promise.resolve();
};

// --- TYPES ---
type Integration = {
    title: string;
    iconUrl: string;
    description: string;
    buttonColor: IntegrationCardProps['buttonColor'];
    onConnect: () => Promise<void> | void;
    isConnecting: boolean;
    isComingSoon: boolean; // Added for the new requirement
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
    isComingSoon: boolean; // Added
};

const IntegrationCard = ({ title, iconUrl, description, buttonColor, onConnect, isConnecting, isComingSoon }: IntegrationCardProps) => {
    const { isDarkMode } = useTheme();

    const getIcon = () => {
        // The icon logic is simplified to use the iconUrl directly,
        // which now works for all logos (Jira, HubSpot, Asana).
        // Removed custom Gain Sights icon logic.
        return <img src={iconUrl} alt={title} className="w-12 h-12 rounded-xl object-contain shadow-md" onError={(e) => {
            // Placeholder fallback if the image URL fails
            e.currentTarget.onerror = null;
            e.currentTarget.src = `https://placehold.co/48x48/6366f1/ffffff?text=${title.substring(0, 1)}`
        }} />;
    };

    // Determine the base button class
    let baseButtonClass = '';
    switch (buttonColor) {
        case 'blue':
            baseButtonClass = 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500/50';
            break;
        case 'orange':
            baseButtonClass = 'bg-orange-600 hover:bg-orange-700 focus:ring-orange-500/50';
            break;
        case 'purple':
            baseButtonClass = 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500/50';
            break;
    }

    // Apply specific classes for the 'Coming Soon' state
    const buttonClass = `w-full px-4 py-3 text-white font-semibold rounded-xl shadow-lg transition-all transform focus:outline-none focus:ring-4 flex items-center justify-center space-x-2
        ${isComingSoon ? '!bg-gray-400 !shadow-none hover:!bg-gray-400 cursor-not-allowed' : `hover:scale-[1.02] ${baseButtonClass}`}
        ${isConnecting && !isComingSoon ? 'opacity-70 cursor-wait' : ''}
        ${!isConnecting && !isComingSoon ? 'cursor-pointer' : 'disabled:cursor-not-allowed'}
    `;

    // Determine button content based on state
    let buttonContent;
    if (isComingSoon) {
        buttonContent = <span>Coming Soon</span>;
    } else if (isConnecting) {
        buttonContent = (
            <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Connecting...</span>
            </>
        );
    } else {
        buttonContent = <span>Connect Now</span>;
    }


    const cardClass = `p-6 rounded-3xl border transition-all 
        ${!isComingSoon ? 'hover:shadow-2xl hover:scale-[1.01]' : 'opacity-80'}
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
                onClick={!isComingSoon ? onConnect : undefined}
                disabled={isConnecting || isComingSoon}
                className={buttonClass}
            >
                {buttonContent}
            </button>
        </div>
    );
};

const Integrations = () => {
    const { isDarkMode, toggleDarkMode } = useTheme();
    const { session } = useAuth();
    
    const [connectingJira, setConnectingJira] = useState(false);
    const [connectingHubSpot, setConnectingHubSpot] = useState(false);
    // Renamed state variable
    const [connectingAsana, setConnectingAsana] = useState(false); 

    const handleJiraConnect = async () => {
        // This is now 'Coming Soon' so the actual API call logic is not needed for the button state,
        // but keeping the fetch structure for completeness if the 'Coming Soon' status is later removed.
        if (integrationCategories.find(c => c.title === "Technical")?.integrations.find(i => i.title === "Jira")?.isComingSoon) {
            console.log("Jira is coming soon. Skipping connection attempt.");
            return;
        }

        try {
            setConnectingJira(true);
            const response = await fetch(`${BASE_URL}/integrations/jira/auth/initiate`, {
                headers: { Authorization: `Bearer ${session?.access_token}` }
            });

            if (!response.ok) {
                throw new Error('Failed to initiate Jira OAuth');
            }

            const data = await response.json();
            // In a real app, this would redirect
            window.location.href = data.auth_url;
        } catch (error) {
            console.error('Error connecting to Jira:', error);
            // Replaced alert() with console.error()
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
            // In a real app, this would redirect
            window.location.href = data.auth_url;
        } catch (error) {
            console.error('Error connecting to HubSpot:', error);
            // Replaced alert() with console.error()
            setConnectingHubSpot(false);
        }
    };
    
    const handleAsanaConnection = async () => {
        // Asana is marked as 'Coming Soon', so this simulates the eventual connection or provides feedback
        if (integrationCategories.find(c => c.title === "Project Management")?.integrations.find(i => i.title === "Asana")?.isComingSoon) {
             console.log("Asana is coming soon. Skipping connection attempt.");
            return;
        }
        
        try {
            setConnectingAsana(true);
            await handleAsanaConnect(); // Placeholder function
            setConnectingAsana(false);
            console.log("Asana connection simulated successfully.");
        } catch (error) {
            console.error('Error connecting to Asana:', error);
            setConnectingAsana(false);
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
                    isComingSoon: true, // Updated to 'Coming Soon'
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
                    isComingSoon: false, // Remains 'Connect Now'
                },
            ]
        },
        { 
            // Updated title from 'Customer Support'
            title: "Project Management", 
            // Updated description
            description: "Tools for tracking projects, tasks, and team collaboration.",
            integrations: [
                {
                    // Updated from 'Gain Sights' to 'Asana'
                    title: "Asana",
                    // Asana logo URL
                    iconUrl: "https://cdn.worldvectorlogo.com/logos/asana-1.svg",
                    // Updated description
                    description: "Sync project tasks and updates bi-directionally from your meeting notes.",
                    buttonColor: 'purple',
                    // Updated handler
                    onConnect: handleAsanaConnection, 
                    // Updated state variable
                    isConnecting: connectingAsana, 
                    isComingSoon: true, // Updated to 'Coming Soon'
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
                                    isComingSoon={integration.isComingSoon} // Pass new prop
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
