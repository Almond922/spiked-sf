import React, { useState, FormEvent, FC, useEffect, useCallback } from 'react';
import { 
  Rocket, Mail, Lock, User, Zap, BookOpen, Settings, CheckCircle, XCircle, 
  Clock, Send, Search, Bell, Menu, Tag, Users, Folder, Inbox, Filter, 
  Cpu, TrendingUp, Briefcase, Volume2, VolumeX 
} from 'lucide-react';

// --- INTERFACES (Typescript Definitions) ---

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  type: 'personalization-access-demo' | 'customer-persona-demo' | 'meeting-focus-demo';
}
interface Question { id: string; title: string; emoji: string; description: string; subQuestions?: SubQuestion[]; }
interface Item { id: string; title: string; description: string; questions: Question[]; }
interface Topic { cardId: string; cardTitle: string; cardDescription: string; icon: JSX.Element; emoji: string; items: Item[]; }
interface Topics { [key: string]: Topic; }

// --- CUSTOM HOOK: useSpeechSynthesis (For Text-to-Speech) ---

const useSpeechSynthesis = (text: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to strip HTML for cleaner speech output
  const stripHtml = (html: string) => {
    // Replace HTML tags with spaces and normalize whitespace
    return html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
  };

  const speak = useCallback((content: string) => {
    if (!('speechSynthesis' in window)) {
      setError("Text-to-speech not supported in this browser.");
      return;
    }
    
    // Stop any current speech before starting a new one
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (!isEnabled) return; // Don't speak if voice is disabled

    const utterance = new SpeechSynthesisUtterance(stripHtml(content));
    
    // Optional: Set voice parameters
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Utterance Error:', event);
      setError('An error occurred during speech.');
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [isEnabled]);

  const toggleEnabled = () => {
    setIsEnabled(prev => {
      if (prev) {
        // If disabling, cancel any current speech
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      return !prev;
    });
  };

  // Effect to speak when text changes AND speaking is enabled
  useEffect(() => {
    if (isEnabled && text) {
      speak(text);
    }
    // Cleanup: Stop speech when component unmounts or text/enabled status changes
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
  }, [text, isEnabled, speak]); // Re-run when text, enabled status, or speak changes

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return { isSpeaking, toggleEnabled, isEnabled, error };
};


// --- DEMO COMPONENT 5: PERSONALIZATION ACCESS ---

const PersonalizationAccessDemo: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPersonalizationClicked, setIsPersonalizationClicked] = useState(false);

  return (
    <div
      style={{ aspectRatio: '1.2 / 1', maxWidth: '600px', minWidth: '350px' }}
      className="w-full h-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden relative"
    >
      <div className="p-4 flex items-center justify-between border-b bg-gray-50">
        <h1 className="text-lg font-semibold text-gray-900 flex items-center">
          <span className="text-red-600 font-extrabold text-xl mr-1">!</span>
          SpikedAI Console
        </h1>
        <div className="flex items-center space-x-3">
          <button className="text-gray-500 hover:text-gray-700">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-500 hover:text-gray-700">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex h-full">
        {/* Sidebar/Menu Simulation */}
        <div className="w-1/4 p-4 border-r bg-white space-y-2 relative">
          <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Navigation</p>
          {['Dashboard', 'Meetings', 'Library'].map(label => (
            <div
              key={label}
              className="flex items-center p-2 text-sm text-gray-700 rounded-lg hover:bg-indigo-50 cursor-pointer"
            >
              <Folder className="w-4 h-4 mr-2" />
              <span>{label}</span>
            </div>
          ))}
          {/* Highlighted Personalization Link */}
          <div
            onClick={() => setIsPersonalizationClicked(true)}
            className={`flex items-center p-2 text-sm font-semibold rounded-lg cursor-pointer transition-all border-l-4 ${
              isPersonalizationClicked
                ? 'bg-indigo-100 text-indigo-700 border-indigo-600'
                : 'text-gray-700 hover:bg-indigo-50 border-transparent'
            }`}
          >
            <Settings className="w-4 h-4 mr-2" />
            <span>Personalization</span>
          </div>
          <p className="absolute bottom-4 text-xs text-gray-400">Main Console</p>
        </div>

        {/* Console Content */}
        <div className="w-3/4 p-6 bg-gray-50">
          {!isPersonalizationClicked ? (
            <div className="text-center p-12 bg-white rounded-lg shadow-inner border border-dashed border-gray-300">
              <Zap className="w-8 h-8 mx-auto text-red-600 mb-3" />
              <p className="text-lg font-semibold text-gray-800 mb-1">Ready to Assist</p>
              <p className="text-sm text-gray-500">
                Click on <strong>Personalization</strong> in the navigation menu to configure your settings.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-indigo-50 rounded-lg border-l-4 border-indigo-600">
              <p className="font-bold text-indigo-800 text-sm mb-1">Personalization Settings</p>
              <p className="text-xs text-indigo-700">
                You've successfully accessed the settings! Here you can find Customer Persona and Meeting Focus.
              </p>
            </div>
          )}
          
          <div className="mt-6 space-y-3">
            <div className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
              <span className="text-sm font-medium text-gray-700">Live Transcription</span>
              <span className="text-xs text-green-600 bg-green-100 p-1 rounded">Active</span>
            </div>
            <div className="bg-white p-3 rounded-lg flex justify-between items-center shadow-sm">
              <span className="text-sm font-medium text-gray-700">Metrics & ROI Dashboard</span>
              <span className="text-xs text-gray-500">View</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


// --- DEMO COMPONENT 6: CUSTOMER PERSONA & MEETING FOCUS ---

interface PersonaCardProps {
  icon: JSX.Element;
  title: string;
  description: string;
  isDefault?: boolean;
}

const PersonaCard: FC<PersonaCardProps> = ({ icon, title, description, isDefault = false }) => (
  <div
    className={`p-4 rounded-lg border transition-all ${
      isDefault
        ? 'bg-indigo-50 border-indigo-300 shadow-md'
        : 'bg-white border-gray-200 hover:border-indigo-400 cursor-pointer'
    }`}
  >
    <div className="flex items-center mb-1">
      {icon}
      <h4 className={`text-base font-semibold ml-2 ${isDefault ? 'text-indigo-800' : 'text-gray-900'}`}>
        {title}
      </h4>
      {isDefault && (
        <span className="ml-2 text-xs font-medium text-white bg-indigo-600 px-2 py-0.5 rounded-full">
          Default
        </span>
      )}
    </div>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

const CustomerPersonaDemo: FC = () => {
  const personas: PersonaCardProps[] = [
    {
      icon: <Users className="w-4 h-4 text-indigo-500" />,
      title: 'Balanced',
      description: 'Versatile profile for general business users in B2B settings.',
      isDefault: true
    },
    { icon: <Cpu className="w-4 h-4 text-purple-500" />, title: 'Technical', description: 'Deep technical jargon-friendly responses for engineering teams.' },
    { icon: <TrendingUp className="w-4 h-4 text-yellow-600" />, title: 'Financial', description: 'ROI-driven, cost-benefit analysis focused for finance teams.' },
    { icon: <Briefcase className="w-4 h-4 text-blue-600" />, title: 'Business Executive', description: 'High-impact insights for C-suite executives.' },
  ];

  const meetingFocusOptions = [
    { label: 'Summarize pricing structure', isSelected: true },
    { label: 'Track next steps', isSelected: false },
    { label: 'Identify competition mentions', isSelected: true },
  ];

  return (
    <div
      style={{ maxWidth: '600px', minWidth: '350px' }}
      className="w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-100"
    >
      <h3 className="text-xl font-bold text-gray-900 mb-4">Customer Persona Settings</h3>
      <p className="text-sm text-gray-600 mb-4">
        Choose the persona that matches your meeting audience. The AI's communication style, depth, and focus will adjust
        automatically.
      </p>
      
      <div className="space-y-3 mb-8">
        {personas.map(p => (
          <PersonaCard key={p.title} {...p} />
        ))}
      </div>

      <h3 className="text-xl font-bold text-gray-900 mb-4">Meeting Focus</h3>
      <p className="text-sm text-gray-600 mb-4">
        Define the key objectives and topics to prioritize and track during the meeting.
      </p>
      
      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
        {meetingFocusOptions.map((item, index) => (
          <span
            key={index}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
              item.isSelected
                ? 'bg-red-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer'
            }`}
          >
            {item.label}
          </span>
        ))}
        <input
          type="text"
          placeholder="Add custom topic..."
          className="text-xs px-3 py-1 bg-white border rounded-full w-32"
        />
      </div>
    </div>
  );
};


// --- TOPICS DATA STRUCTURE (Updated to include Personalization) ---
export const topics: Topics = {
  personalization: {
    cardId: 'card-personalization',
    cardTitle: 'Personalization',
    cardDescription: 'Customize your AI\'s behavior for optimal meeting results.',
    icon: <Settings style={{ width: '20px', height: '20px' }} />,
    emoji: '⚙️',
    items: [
      {
        id: 'settings',
        title: 'AI Configuration',
        description: 'Adjust your AI\'s persona and focus before a meeting.',
        questions: [
          {
            id: 'personalization-settings',
            title: 'Personalization Access',
            emoji: '🧭',
            description: 'Locating the AI configuration settings.',
            subQuestions: [
              {
                id: 'access-settings',
                question: 'Where do I find the Personalization settings?',
                type: 'personalization-access-demo',
                answer: `
                  <div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;">
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Accessing Personalization Settings</h2>
                    <p style="margin:0 0 20px 0;">Personalization settings are located in the <strong>Main Console</strong> and must be configured <strong>before starting a meeting</strong>. These settings control your AI's communication style and meeting objectives.</p>
                    
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">How to access:</h3>
                    <ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;">
                      <li style="margin:0 0 12px 0;">Go to the <strong>Main Console</strong>.</li>
                      <li style="margin:0 0 12px 0;">Click on <strong>Personalization</strong> in the navigation menu (see demo on the right).</li>
                      <li style="margin:0;">Configure your settings before joining or starting a meeting.</li>
                    </ol>

                    <p style="margin:0;padding:12px;background:#fefce8;border-left:3px solid #eab308;border-radius:4px;font-size:14px;">
                      <strong>Important:</strong> Changes here only apply to meetings started <strong>after</strong> configuration.
                    </p>
                  </div>
                `
              },
              {
                id: 'choose-persona',
                question: 'How do I choose a Customer Persona?',
                type: 'customer-persona-demo',
                answer: `
                  <div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;">
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Choosing Your AI's Customer Persona</h2>
                    <p style="margin:0 0 20px 0;">The Customer Persona determines your AI's communication style, depth, and focus during meetings. Choose the persona that best matches your audience.</p>
                    
                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">Available Personas:</h3>
                    <ul style="margin:0 0 20px 0;padding-left:0;list-style:none;">
                      <li style="margin:0 0 8px 0;"><span style="font-weight:600;">Balanced:</span> Versatile profile for general business users in B2B settings.</li>
                      <li style="margin:0 0 8px 0;"><span style="font-weight:600;">Technical:</span> Deep technical jargon-friendly responses for engineering teams.</li>
                      <li style="margin:0 0 8px 0;"><span style="font-weight:600;">Financial:</span> ROI-driven, cost-benefit analysis focused for finance teams.</li>
                      <li style="margin:0;"> <span style="font-weight:600;">Business Executive:</span> High-impact insights for C-suite executives.</li>
                    </ul>

                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">How to set your persona:</h3>
                    <ol style="margin:0;padding-left:20px;list-style-type:decimal;">
                      <li style="margin:0 0 12px 0;">Navigate to <strong>Personalization → Customer Persona</strong>.</li>
                      <li style="margin:0;">Select the persona that matches your meeting audience. The AI will automatically adjust its tone and depth accordingly.</li>
                    </ol>
                  </div>
                `
              },
              {
                id: 'meeting-focus',
                question: 'What is Meeting Focus and why is it important?',
                type: 'meeting-focus-demo',
                answer: `
                  <div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;">
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Meeting Focus: Prioritizing Key Objectives</h2>
                    <p style="margin:0 0 20px 0;"><strong>Meeting Focus</strong> is one of the most critical features in spikedAI. It tells your AI what to <strong>prioritize and track</strong> during the meeting.</p>
                    
                    <div style="padding:12px;background:#fffbe0;border-left:3px solid #f59e0b;border-radius:4px;font-size:14px;margin-bottom:20px;">
                      <p style="margin:0 0 5px 0;font-weight:600;"><span style="color:#f59e0b;">&#9888; IMPORTANT:</span> Meeting Focus must be set <strong>before starting a meeting</strong>.</p>
                    </div>

                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">Why it matters:</h3>
                    <ul style="margin:0 0 20px 0;padding-left:20px;">
                      <li style="margin:0 0 8px 0;">Directs your AI's attention to what matters most</li>
                      <li style="margin:0 0 8px 0;">Ensures relevant insights are captured</li>
                      <li style="margin:0 0 8px 0;">Improves post-meeting reports quality</li>
                      <li style="margin:0;">Tracks specific objectives automatically</li>
                    </ul>

                    <h3 style="font-size: 18px; font-weight: 600; margin-bottom: 12px; color: #1f2937;">How to set:</h3>
                    <ol style="margin:0;padding-left:20px;list-style-type:decimal;">
                      <li style="margin:0 0 12px 0;">Go to <strong>Personalization → Meeting Focus</strong>.</li>
                      <li style="margin:0 0 12px 0;">Define what the meeting is about.</li>
                      <li style="margin:0 0 12px 0;">Specify key topics to track.</li>
                      <li style="margin:0;">Save before joining the meeting.</li>
                    </ol>
                  </div>
                `
              }
            ],
          },
        ],
      },
    ],
  },
};


// --- MAIN APP COMPONENT ---

const App: FC = () => {
  // Collect all sub-questions (still useful if you later want to reuse)
  const allSubQuestions = Object.values(topics).flatMap(topic =>
    topic.items.flatMap(item =>
      item.questions.flatMap(question =>
        question.subQuestions || []
      )
    )
  );

  // Pick which article to show (like choosing Sign In vs Sign Up screen)
  // Change this value to: 'access-settings' | 'choose-persona' | 'meeting-focus'
  const [currentArticleId] = useState<string>('access-settings');

  // Find the current topic data based on the ID
  const topicData = allSubQuestions.find(sq => sq.id === currentArticleId);

  if (!topicData) {
    return <div className="p-10 text-center text-red-600">Article not found!</div>;
  }

  const textContent = topicData.answer;

  // --- VOICE INTEGRATION ---
  const { isSpeaking, toggleEnabled, isEnabled, error } = useSpeechSynthesis(textContent);

  // Conditionally render the correct interactive component
  const RightSideComponent = () => {
    if (topicData.type === 'personalization-access-demo') return <PersonalizationAccessDemo />;
    if (topicData.type === 'customer-persona-demo' || topicData.type === 'meeting-focus-demo') {
      return <CustomerPersonaDemo />;
    }
    return null;
  };

  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-inter">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto">

        {/* Header with Title + Voice Button (no steps/tabs) */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {topicData.question}
          </h1>

          {/* Voice Control Button */}
          <button
            onClick={toggleEnabled}
            className={`p-2 rounded-full transition-all flex items-center text-sm font-medium ${
              isEnabled
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title={isEnabled ? 'Disable Voice Playback' : 'Enable Voice Playback'}
          >
            {isEnabled ? (
              isSpeaking ? (
                <>
                  <Volume2 className="w-5 h-5 mr-1 animate-pulse" />
                  Speaking...
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5 mr-1" />
                  Voice On
                </>
              )
            ) : (
              <>
                <VolumeX className="w-5 h-5 mr-1" />
                Voice Off
              </>
            )}
          </button>
        </div>

        {/* Voice Error Notification */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg mb-4 text-sm">
            ⚠️ <strong>Error:</strong> {error}
          </div>
        )}

        {/* Two-Column Layout (Instructions on Left, Interactive Demo on Right) */}
        <div
          style={{ padding: '20px 0' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
        >
          {/* LEFT COLUMN: Instructions (from data structure) */}
          <div dangerouslySetInnerHTML={{ __html: textContent }} />

          {/* RIGHT COLUMN: Interactive Demo */}
          <div className="flex justify-center md:justify-end">
            <RightSideComponent />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
