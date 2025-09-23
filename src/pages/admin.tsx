import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../AuthContext';
import {
  ArrowLeft,
  Settings,
  Users,
  FileText,
  MessageSquare,
  LogOut,
  BarChart2,
  Shield,
  Database,
  Zap,
  Bell,
  Search,
  Plus,
  MoreHorizontal,
  ChevronDown,
  User as UserIcon,
  Activity,
  PieChart,
  TrendingUp,
  CreditCard,
  KeyRound,
  Globe,
  Clock,
  Calendar,
  ClipboardList,
  Video,
  UserPlus,
  BookOpen,
  FlaskConical,
  Trash2,
  Copy,
  ToggleLeft,
  Mail,
  Save,
  LogIn,
  LayoutGrid,
  Palette,
  Target,
  Focus,
  BrainCircuit,
  FilePlus2,
  Smile,
  CheckSquare,
  ArrowUp,
  ArrowDown,
  X,
  Link,
  Wrench,
  FileStack,
  ChevronLeft,
} from 'lucide-react';
import SpikedAILogo from '/SpikedAI.png';
import RecallLogo from '/recall.png';

// --- TYPES ---
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  duration: string;
  participants: { name: string; avatarUrl?: string }[];
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  transcriptSnippet: string;
}

// --- DUMMY DATA ---
const dummyAnalytics = {
  totalMeetings: { value: 482, change: 8.2 },
  activeSessions: { value: 12, change: -5.1 },
  avgMeetingDuration: { value: '42 min', change: 3.5 },
  totalParticipants: { value: 1923, change: 15.3 },
};

const meetingsThisWeekData = [
  { day: 'Mon', meetings: 5 },
  { day: 'Tue', meetings: 8 },
  { day: 'Wed', meetings: 12 },
  { day: 'Thu', meetings: 7 },
  { day: 'Fri', meetings: 15 },
  { day: 'Sat', meetings: 4 },
  { day: 'Sun', meetings: 6 },
];

const secondaryAnalytics = {
  documentsProcessed: { value: 7890, change: 25.1 },
  avgSentimentScore: { value: '8.2', subValue: '/ 10', change: 0.5 },
  sentimentTrend: { value: 'Improving', change: 1.2 },
  meddpiccCompletion: { value: 72, change: 11.8, unit: '%' },
};

const dummyMeetings: Meeting[] = [
  {
    id: 'm1',
    title: 'Q3 Strategy Review',
    date: 'Sep 22, 2025',
    duration: '45 min',
    participants: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
    sentiment: 'Positive',
    transcriptSnippet:
      "Overall, the quarterly results are strong. We've seen significant growth in the new market segment...",
  },
  {
    id: 'm2',
    title: 'Project Phoenix Kick-off',
    date: 'Sep 21, 2025',
    duration: '1h 15m',
    participants: [{ name: 'D' }, { name: 'E' }],
    sentiment: 'Neutral',
    transcriptSnippet:
      "Let's outline the key deliverables for phase one. The timeline is tight, so we need to stay on track...",
  },
  {
    id: 'm3',
    title: 'Client Onboarding - Acme Corp',
    date: 'Sep 20, 2025',
    duration: '30 min',
    participants: [
      { name: 'F' },
      { name: 'G' },
      { name: 'H' },
      { name: 'I' },
    ],
    sentiment: 'Positive',
    transcriptSnippet:
      "We're thrilled to partner with SpikedAI. The platform's capabilities are exactly what we need...",
  },
];

const dummyActiveMeetings = [
  { id: 'am1', title: 'Weekly Sync', participants: 5, timeElapsed: '15:32' },
  { id: 'am2', title: 'Design Review', participants: 3, timeElapsed: '48:11' },
];

const dummyTeamMembers = [
  {
    id: 1,
    name: 'You (Admin)',
    email: 'admin@spikedai.com',
    role: 'Administrator',
    avatarChar: 'A',
  },
  {
    id: 2,
    name: 'Jane Doe',
    email: 'jane.d@spikedai.com',
    role: 'Member',
    avatarChar: 'J',
  },
  {
    id: 3,
    name: 'John Smith',
    email: 'john.s@spikedai.com',
    role: 'Member',
    avatarChar: 'J',
  },
  {
    id: 4,
    name: 'Sam Wilson',
    email: 'sam.w@spikedai.com',
    role: 'Viewer',
    avatarChar: 'S',
  },
];

const dummyActivityLog = [
  {
    id: 1,
    icon: ClipboardList,
    text: "Meeting 'Q3 Strategy Review' was successfully analyzed.",
    time: '2h ago',
  },
  {
    id: 2,
    icon: UserPlus,
    text: 'Jane Doe was invited to the team.',
    time: '1 day ago',
  },
  {
    id: 3,
    icon: CreditCard,
    text: 'Monthly invoice #INV-2025-09 was paid.',
    time: '2 days ago',
  },
  {
    id: 4,
    icon: KeyRound,
    text: 'Recall.ai API Key was updated.',
    time: '4 days ago',
  },
];

const dummyCustomTemplates = [
    { id: 't1', title: 'Sales Discovery Call', description: 'Focused on MEDDPICC and identifying pain points.' },
    { id: 't2', title: 'Quarterly Business Review', description: 'Template for reviewing performance with existing clients.' },
    { id: 't3', title: 'Candidate Interview', description: 'Structured interview questions and competency tracking.' },
];

// --- UI COMPONENTS ---

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}> = ({ title, children, className, actions }) => (
  <div
    className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm ${className}`}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        {title}
      </h3>
      {actions}
    </div>
    {children}
  </div>
);

const StatCard: React.FC<{
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
}> = ({ title, value, change, icon }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow duration-300">
    <div className="flex items-center justify-between mb-4">
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      {icon}
    </div>
    <div className="flex items-end justify-between">
      <p className="text-3xl font-bold text-gray-900 dark:text-white">
        {value}
      </p>
      <span
        className={`flex items-center text-sm font-semibold ${
          change >= 0 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        <TrendingUp
          size={16}
          className={`mr-1 ${change < 0 ? 'transform rotate-180' : ''}`}
        />
        {Math.abs(change)}%
      </span>
    </div>
  </div>
);

const SecondaryStatCard: React.FC<{
  title: string;
  value: string;
  subValue?: string;
  change: number;
  icon: React.ReactNode;
}> = ({ title, value, subValue, change, icon }) => (
  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
    <div className="flex items-center text-gray-500 dark:text-gray-400 mb-2">
      {icon}
      <p className="text-sm font-medium ml-2">{title}</p>
    </div>
    <div className="flex items-baseline justify-between">
      <p className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
        <span className="text-lg text-gray-400 dark:text-gray-500">
          {subValue}
        </span>
      </p>
      <span
        className={`flex items-center text-xs font-semibold ${
          change >= 0 ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {change >= 0 ? (
          <ArrowUp size={12} className="mr-0.5" />
        ) : (
          <ArrowDown size={12} className="mr-0.5" />
        )}
        {Math.abs(change)}%
      </span>
    </div>
  </div>
);

const MeetingsThisWeekChart: React.FC = () => {
  const maxValue = Math.max(...meetingsThisWeekData.map((d) => d.meetings));
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Meetings This Week
      </h3>
      <div className="flex justify-between items-end h-48 space-x-2">
        {meetingsThisWeekData.map((data) => (
          <div
            key={data.day}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            <div
              className="w-full bg-blue-100 dark:bg-blue-900/50 rounded-t-lg group-hover:bg-blue-400 dark:group-hover:bg-blue-600 transition-all duration-300"
              style={{ height: `${(data.meetings / maxValue) * 100}%` }}
              title={`${data.meetings} meetings`}
            ></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {data.day}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MeetingLogCard: React.FC<{ meeting: Meeting }> = ({ meeting }) => {
  const sentimentColor = {
    Positive:
      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
    Neutral:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
    Negative:
      'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  };
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {meeting.title}
          </h4>
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span className="flex items-center">
              <Calendar size={12} className="mr-1.5" />
              {meeting.date}
            </span>
            <span className="flex items-center">
              <Clock size={12} className="mr-1.5" />
              {meeting.duration}
            </span>
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
            sentimentColor[meeting.sentiment]
          }`}
        >
          {meeting.sentiment}
        </span>
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-300 italic p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-2 border-blue-500">
          "{meeting.transcriptSnippet}"
        </p>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center -space-x-2">
          {meeting.participants.map((p, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs border-2 border-white dark:border-gray-800"
            >
              {p.name.charAt(0)}
            </div>
          ))}
          {meeting.participants.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs border-2 border-white dark:border-gray-800">
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>
        <button className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline">
          View Details
        </button>
      </div>
    </div>
  );
};

// --- NEW MODAL COMPONENT ---

const StartMeetingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const navigate = useNavigate();
    const [step, setStep] = React.useState('initial');
    const [meetingUrl, setMeetingUrl] = React.useState('');

    const handleSetupLater = () => {
        onClose();
        navigate('/');
    };

    const renderStep = () => {
        switch (step) {
            case 'initial':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">How would you like to set up your meeting?</h3>
                        <button onClick={() => setStep('customize')} className="w-full flex items-center text-left p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                            <Wrench className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="font-semibold">Meeting Customization</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Set up a new, one-time configuration.</p>
                            </div>
                        </button>
                        <button onClick={() => setStep('use_template')} className="w-full flex items-center text-left p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">
                            <FileStack className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="font-semibold">Use Custom Meeting Templates</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Select a pre-saved template.</p>
                            </div>
                        </button>
                        <button onClick={handleSetupLater} className="w-full p-3 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                            Set up later
                        </button>
                    </div>
                );
            case 'customize':
                return (
                    <div>
                         <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Set Custom Meeting Templates</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <TemplateCard icon={UserIcon} title="Customer Persona" description="Define the target audience." />
                            <TemplateCard icon={Palette} title="Answer Styles" description="Set the tone and format." />
                            <TemplateCard icon={Target} title="Custom Goals" description="Outline key objectives." />
                            <TemplateCard icon={Focus} title="Meeting Focus" description="Specify main topics." />
                            <TemplateCard icon={BrainCircuit} title="System Prompt" description="Guide the AI's core logic." />
                            <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                                <Plus size={20} className="mr-2"/> New Template
                            </div>
                        </div>
                    </div>
                );
            case 'use_template':
                 return (
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select a Custom Template</h3>
                        <div className="space-y-2">
                            {dummyCustomTemplates.map(t => (
                                <div key={t.id} className="p-3 rounded-lg border dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer">
                                    <p className="font-semibold">{t.title}</p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl border dark:border-gray-700">
                <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
                    <div className="flex items-center">
                        {step !== 'initial' && (
                            <button onClick={() => setStep('initial')} className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                                <ChevronLeft size={20} />
                            </button>
                        )}
                        <h2 className="text-xl font-bold">Start an Instant Meeting</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6">
                        <label htmlFor="meetingUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting URL</label>
                        <div className="relative">
                            <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                id="meetingUrl"
                                value={meetingUrl}
                                onChange={(e) => setMeetingUrl(e.target.value)}
                                placeholder="https://zoom.us/j/1234567890"
                                className="w-full pl-9 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    {renderStep()}
                </div>
                {step !== 'initial' && (
                    <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end">
                        <button className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed" disabled={!meetingUrl}>
                            Start Meeting
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- PAGE COMPONENTS ---

const UsersPage: React.FC = () => (
  <Section title="Team Members">
    <div className="flex justify-end mb-4">
      <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
        <UserPlus size={16} className="mr-2" /> Add Team Member
      </button>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 dark:text-gray-400 uppercase bg-gray-50 dark:bg-gray-700">
          <tr>
            <th className="px-6 py-3">Name</th>
            <th className="px-6 py-3">Email</th>
            <th className="px-6 py-3">Role</th>
            <th className="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {dummyTeamMembers.map((member) => (
            <tr
              key={member.id}
              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600/20"
            >
              <td className="px-6 py-4 font-medium flex items-center">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3 font-bold">
                  {member.avatarChar}
                </div>
                {member.name}
              </td>
              <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                {member.email}
              </td>
              <td className="px-6 py-4">
                <select
                  defaultValue={member.role}
                  className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-sm rounded-lg p-1.5"
                >
                  <option>Administrator</option>
                  <option>Member</option>
                  <option>Viewer</option>
                </select>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="p-1 text-gray-500 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Section>
);

const BillingPage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <Section title="Current Plan">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Pro Plan
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              Next payment of $249 on Oct 1, 2025.
            </p>
          </div>
          <button className="font-semibold text-blue-600 dark:text-blue-400 text-sm hover:underline">
            Change Plan
          </button>
        </div>
      </Section>
      <Section title="Payment Method">
        <div className="flex items-center">
          <CreditCard className="text-gray-400 mr-4" />
          <div>
            <p className="font-medium">Visa ending in 1234</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Expires 12/2028
            </p>
          </div>
        </div>
      </Section>
    </div>
    <Section title="Usage This Month">
      <div className="space-y-4">
        <div>
          <p>Meetings Analyzed</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: '75%' }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">750 / 1000</p>
        </div>
        <div>
          <p>Storage Used</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: '40%' }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">40 GB / 100 GB</p>
        </div>
      </div>
    </Section>
    <div className="lg:col-span-3">
      <Section title="Billing History">{/* Dummy invoice history */}</Section>
    </div>
  </div>
);

const ApiKeysPage: React.FC = () => (
  <div className="space-y-6">
    <Section title="Third-Party Integrations">
      <div className="flex items-center space-x-4 p-4 border dark:border-gray-600 rounded-lg">
        <img src={RecallLogo} alt="Recall.ai Logo" className="h-10 w-10" />
        <div className="flex-1">
          <p className="font-semibold">Recall.ai API Key</p>
          <input
            type="password"
            defaultValue="••••••••••••••••••••"
            className="w-full bg-gray-100 dark:bg-gray-700 border-none rounded-md mt-1 p-2 text-sm"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
          Save
        </button>
      </div>
    </Section>
    <Section title="Your SpikedAI API Keys">
      <div className="flex justify-between items-center text-sm p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        <span className="font-mono">prod_sk_a1b2c3d4e5f6...</span>
        <div className="flex items-center space-x-3">
          <button className="p-1 text-gray-500 hover:text-blue-500">
            <Copy size={16} />
          </button>
          <button className="p-1 text-gray-500 hover:text-red-500">
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Section>
  </div>
);

const ActiveMeetingCard: React.FC<{
  meeting: {
    id: string;
    title: string;
    participants: number;
    timeElapsed: string;
  };
}> = ({ meeting }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-600 flex items-center justify-between">
    <div>
      <p className="font-semibold text-gray-900 dark:text-white">
        {meeting.title}
      </p>
      <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span className="flex items-center">
          <Users size={12} className="mr-1.5" />
          {meeting.participants} Participants
        </span>
        <span className="flex items-center">
          <Clock size={12} className="mr-1.5" />
          {meeting.timeElapsed}
        </span>
      </div>
    </div>
    <button className="flex items-center bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
      <LogIn size={16} className="mr-2" /> Enter Meeting
    </button>
  </div>
);

const TemplateCard: React.FC<{
  icon: React.ElementType;
  title: string;
  description: string;
}> = ({ icon: Icon, title, description }) => (
  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors">
    <Icon className="w-6 h-6 mb-2 text-blue-600 dark:text-blue-400" />
    <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
  </div>
);

const MeetingsPage: React.FC<{ onStartMeeting: () => void }> = ({ onStartMeeting }) => (
    <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button onClick={onStartMeeting} className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors">
                <Video size={24} className="mb-2" />
                <span className="font-semibold">Start Instant Meeting</span>
            </button>
            <button className="flex flex-col items-center justify-center p-6 bg-gray-100 dark:bg-gray-800 rounded-2xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Calendar size={24} className="mb-2" />
                <span className="font-semibold">Schedule for Later</span>
            </button>
        </div>
        <Section title="Active Meetings (2)">
            <div className="space-y-3">
                {dummyActiveMeetings.map(m => <ActiveMeetingCard key={m.id} meeting={m} />)}
            </div>
        </Section>
         <Section
            title="Custom Meeting Templates"
            actions={
                <button className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                    <FilePlus2 size={14} className="mr-2" /> New Template
                </button>
            }
         >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <TemplateCard icon={UserIcon} title="Customer Persona" description="Define the target audience." />
                <TemplateCard icon={Palette} title="Answer Styles" description="Set the tone and format." />
                <TemplateCard icon={Target} title="Custom Goals" description="Outline key objectives." />
                <TemplateCard icon={Focus} title="Meeting Focus" description="Specify main topics." />
                <TemplateCard icon={BrainCircuit} title="System Prompt" description="Guide the AI's core logic." />
            </div>
        </Section>
    </div>
);

const MeetingLogsPage: React.FC = () => (
  <Section title="All Meeting Logs">
    <div className="space-y-4">
      {dummyMeetings.map((meeting) => (
        <MeetingLogCard key={meeting.id} meeting={meeting} />
      ))}
      {/* Add pagination controls here */}
    </div>
  </Section>
);

const SettingsPage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <Section title="Profile Settings">{/* Dummy profile form */}</Section>
    <Section title="Workspace">{/* Dummy workspace settings */}</Section>
    <Section title="Security">
      <div className="flex items-center justify-between">
        <p>Two-Factor Authentication (2FA)</p>
        <ToggleLeft
          size={36}
          className="text-gray-300 dark:text-gray-600 cursor-pointer"
        />
      </div>
    </Section>
  </div>
);

const NotificationsPage: React.FC = () => (
  <Section title="Notification Preferences">
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p>Email me for new meeting analysis</p>
        <input type="checkbox" className="toggle" defaultChecked />
      </div>
      <div className="flex items-center justify-between">
        <p>In-app notification for usage alerts</p>
        <input type="checkbox" className="toggle" defaultChecked />
      </div>
    </div>
  </Section>
);

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
    <Database size={48} className="mb-4" />
    <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
      {title}
    </h2>
    <p>This section is under construction. Check back soon for updates!</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showActivityLog, setShowActivityLog] = React.useState(false);
  const [activePage, setActivePage] = React.useState('dashboard');
  const [showStartMeetingModal, setShowStartMeetingModal] = React.useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, first_name, last_name')
            .eq('id', session.user.id)
            .single();

          if (error) throw error;
          if (data) setProfile(data);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    fetchProfile();
  }, [session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      navigate('/login');
    }
  };

  const userFullName = React.useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return (
      session?.user?.user_metadata?.full_name ||
      session?.user?.email ||
      'Admin User'
    );
  }, [profile, session]);

  const userAvatarUrl = React.useMemo(() => {
    return session?.user?.user_metadata?.avatar_url || null;
  }, [session]);

  const sidebarLinks = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
    { id: 'meetings', label: 'Meetings', icon: Video },
    { id: 'meeting_logs', label: 'Meeting Logs', icon: LayoutGrid },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'api_keys', label: 'API Keys', icon: KeyRound },
    { id: 'meeting_simulator', label: 'Simulator', icon: FlaskConical },
    { id: 'tutorial', label: 'Tutorial', icon: BookOpen },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return (
          <>
            {/* --- TOP STATS --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Meetings Recorded"
                value={dummyAnalytics.totalMeetings.value.toLocaleString()}
                change={dummyAnalytics.totalMeetings.change}
                icon={<Video size={20} className="text-blue-500" />}
              />
              <StatCard
                title="Active Sessions"
                value={dummyAnalytics.activeSessions.value.toString()}
                change={dummyAnalytics.activeSessions.change}
                icon={<Activity size={20} className="text-green-500" />}
              />
              <StatCard
                title="Average Meeting Duration"
                value={dummyAnalytics.avgMeetingDuration.value}
                change={dummyAnalytics.avgMeetingDuration.change}
                icon={<Clock size={20} className="text-purple-500" />}
              />
              <StatCard
                title="Total Participants Engaged"
                value={dummyAnalytics.totalParticipants.value.toLocaleString()}
                change={dummyAnalytics.totalParticipants.change}
                icon={<Users size={20} className="text-orange-500" />}
              />
            </div>

            {/* --- CHARTS & SECONDARY STATS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <MeetingsThisWeekChart />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 content-start">
                <SecondaryStatCard
                  title="Documents Processed"
                  value={secondaryAnalytics.documentsProcessed.value.toLocaleString()}
                  change={secondaryAnalytics.documentsProcessed.change}
                  icon={<FileText size={16} />}
                />
                <SecondaryStatCard
                  title="Average Sentiment Score"
                  value={secondaryAnalytics.avgSentimentScore.value}
                  subValue={secondaryAnalytics.avgSentimentScore.subValue}
                  change={secondaryAnalytics.avgSentimentScore.change}
                  icon={<Smile size={16} />}
                />
                <SecondaryStatCard
                  title="Sentiment Trend"
                  value={secondaryAnalytics.sentimentTrend.value}
                  change={secondaryAnalytics.sentimentTrend.change}
                  icon={<TrendingUp size={16} />}
                />
                <SecondaryStatCard
                  title="Avg. MEDDPICC Completion"
                  value={secondaryAnalytics.meddpiccCompletion.value + '%'}
                  change={secondaryAnalytics.meddpiccCompletion.change}
                  icon={<CheckSquare size={16} />}
                />
              </div>
            </div>

            {/* --- RECENT MEETING LOGS --- */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Recent Meeting Logs
              </h2>
              <div className="space-y-4">
                {dummyMeetings.map((meeting) => (
                  <MeetingLogCard key={meeting.id} meeting={meeting} />
                ))}
              </div>
            </div>
          </>
        );
      case 'users':
        return <UsersPage />;
      case 'billing':
        return <BillingPage />;
      case 'api_keys':
        return <ApiKeysPage />;
      case 'meetings':
        return <MeetingsPage onStartMeeting={() => setShowStartMeetingModal(true)} />;
      case 'meeting_logs':
        return <MeetingLogsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'profile':
        return <PlaceholderPage title="Profile Settings" />;
      default:
        const link = sidebarLinks.find((l) => l.id === activePage);
        return <PlaceholderPage title={link?.label || 'Page'} />;
    }
  };

  const handleMenuClick = (page: string) => {
    setActivePage(page);
    setShowUserMenu(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
        {showStartMeetingModal && <StartMeetingModal onClose={() => setShowStartMeetingModal(false)} />}
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-center h-20 border-b border-gray-100 dark:border-gray-700 px-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <p>Back to Console</p>
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => (
            <a
              key={link.id}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActivePage(link.id);
              }}
              className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                activePage === link.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <link.icon size={18} className="mr-3" /> {link.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center space-x-4">
            <img
              src={SpikedAILogo}
              alt="SpikedAI Logo"
              className="h-20 w-100 mr-3"
            />
          </div>
          <div className="flex items-center space-x-4">
            {/* Activity Log Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowActivityLog(!showActivityLog)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ClipboardList
                  size={20}
                  className="text-gray-500 dark:text-gray-400"
                />
              </button>
              {showActivityLog && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-20">
                  <div className="p-3 border-b dark:border-gray-700">
                    <h4 className="font-semibold text-sm">Recent Activity</h4>
                  </div>
                  <div className="p-1 max-h-80 overflow-y-auto">
                    {dummyActivityLog.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      >
                        <item.icon className="w-4 h-4 mr-3 mt-1 text-gray-400 shrink-0" />
                        <div>
                          <p className="text-xs">{item.text}</p>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {item.time}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* User Profile Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3"
              >
                {userAvatarUrl ? (
                  <img
                    src={userAvatarUrl}
                    alt="User Avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-lg font-semibold">
                    {userFullName.charAt(0)}
                  </div>
                )}
                <div className="text-left">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">
                    {userFullName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Administrator
                  </p>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-20">
                  <button
                    onClick={() => handleMenuClick('profile')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <UserIcon size={16} className="mr-2" /> Profile
                  </button>
                  <button
                    onClick={() => handleMenuClick('settings')}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <Settings size={16} className="mr-2" /> Settings
                  </button>
                  <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                  >
                    <LogOut size={16} className="mr-2" /> Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
            {activePage.replace(/_/g, ' ')}
          </h1>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;