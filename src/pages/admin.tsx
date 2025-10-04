import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
import ReactMarkdown from "react-markdown";
import { useForm, ValidationError } from "@formspree/react";
import {
  ArrowLeft,
  Settings,
  Users,
  FileText,
  LogOut,
  BarChart2,
  Database,
  Bell,
  Plus,
  ChevronDown,
  User as UserIcon,
  Activity,
  TrendingUp,
  CreditCard,
  KeyRound,
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
  Wrench,
  FileStack,
  ChevronLeft,
  Loader2,
  HelpCircle,
  Bug,
  MessageCircleQuestion,
  Lightbulb,
  UploadCloud,
  ChevronsRight,
  Bot,
  File as FileIcon,
} from "lucide-react";
import SpikedAILogo from "/SpikedAI.png";
import RecallLogo from "/recall.png";

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
  sentiment: "Positive" | "Neutral" | "Negative";
  transcriptSnippet: string;
}

interface MeetingDetails extends Meeting {
  ai_summary: string | null;
  talk_to_listen_ratio: number | null;
  buying_signals_score: number | null;
  critical_alerts_count: number | null;
  medpicc_completion: number | null;
}

interface TranscriptSegment {
  id: string;
  speaker_name: string;
  text_segment: string;
  start_offset_seconds: number;
  absolute_timestamp: string | null;
}

// --- DUMMY DATA FOR UNCHANGED SECTIONS ---
const dummyTeamMembers = [
  {
    id: 1,
    name: "You (Admin)",
    email: "avi@spiked.ai",
    role: "Admin",
    avatarChar: "A",
  },
  {
    id: 2,
    name: "Umar Yaksambi",
    email: "umaryaksambi@spiked.ai",
    role: "Member",
    avatarChar: "U",
  },
  {
    id: 3,
    name: "Pranav Jambur",
    email: "pranavjambur@spiked.ai",
    role: "Member",
    avatarChar: "J",
  },
  {
    id: 4,
    name: "Dhruv Dhanker",
    email: "dhruvdhanker@spiked.ai",
    role: "Viewer",
    avatarChar: "D",
  },
];
const dummyActivityLog = [
  {
    id: 1,
    icon: ClipboardList,
    text: "Meeting 'Q3 Strategy Review' was successfully analyzed.",
    time: "2h ago",
  },
  {
    id: 2,
    icon: UserPlus,
    text: "Jane Doe was invited to the team.",
    time: "1 day ago",
  },
  {
    id: 3,
    icon: CreditCard,
    text: "Monthly invoice #INV-2025-09 was paid.",
    time: "2 days ago",
  },
  {
    id: 4,
    icon: KeyRound,
    text: "Recall.ai API Key was updated.",
    time: "4 days ago",
  },
];
const dummyCustomTemplates = [
  {
    id: "t1",
    title: "Sales Discovery Call",
    description: "Focused on MEDDPICC and identifying pain points.",
  },
  {
    id: "t2",
    title: "Quarterly Business Review",
    description: "Template for reviewing performance with existing clients.",
  },
  {
    id: "t3",
    title: "Candidate Interview",
    description: "Structured interview questions and competency tracking.",
  },
];
const dummyActiveMeetings = [
  { id: "am1", title: "Weekly Sync", participants: 5, timeElapsed: "15:32" },
  { id: "am2", title: "Design Review", participants: 3, timeElapsed: "48:11" },
];
const faqs = [
  {
    q: "How long does meeting analysis take?",
    a: "Typically, meeting analysis is completed within 5-10 minutes after the meeting ends, depending on the duration and complexity.",
  },
  {
    q: "Is my data secure?",
    a: "Yes, we use industry-standard encryption for data at rest and in transit. Your data is processed securely and is never shared.",
  },
  {
    q: "Which meeting platforms do you support?",
    a: "We support all major platforms, including Zoom, Google Meet, and Microsoft Teams.",
  },
];

// --- HELPER FUNCTIONS ---
const formatDuration = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined) return "0 min";
  const minutes = Math.floor(seconds / 60);
  return `${minutes} min`;
};

const formatTranscriptTimestamp = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const formatAbsoluteTimestamp = (
  timestamp: string | null | undefined
): string => {
  if (!timestamp) return "--:--";
  // Format to HH:MM (24-hour format)
  return new Date(timestamp).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "No date";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const mapSentiment = (
  score: number | null | undefined
): "Positive" | "Neutral" | "Negative" => {
  if (score === null || score === undefined) return "Neutral";
  if (score >= 7) return "Positive";
  if (score < 4) return "Negative";
  return "Neutral";
};

// --- UI COMPONENTS ---

const Section: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  icon?: React.ElementType;
}> = ({ title, children, className, actions, icon: Icon }) => (
  <div
    className={`bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm ${className}`}
  >
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
        {Icon && <Icon className="w-5 h-5 mr-3 text-blue-500" />}
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
          change >= 0 ? "text-green-500" : "text-red-500"
        }`}
      >
        <TrendingUp
          size={16}
          className={`mr-1 ${change < 0 ? "transform rotate-180" : ""}`}
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
          change >= 0 ? "text-green-500" : "text-red-500"
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

const MeetingsThisWeekChart: React.FC<{
  data: { day: string; meetings: number }[];
}> = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => d.meetings), 1);
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm h-full">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Meetings This Week
      </h3>
      <div className="flex justify-between items-end h-48 space-x-2">
        {data.map((dayData) => (
          <div
            key={dayData.day}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            <div
              className="w-full bg-blue-100 dark:bg-blue-900/50 rounded-t-lg group-hover:bg-blue-400 dark:group-hover:bg-blue-600 transition-all duration-300"
              style={{ height: `${(dayData.meetings / maxValue) * 100}%` }}
              title={`${dayData.meetings} meetings`}
            ></div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {dayData.day}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const MeetingLogCard: React.FC<{
  meeting: Meeting;
  onViewDetails: (id: string) => void;
}> = ({ meeting, onViewDetails }) => {
  const sentimentColor = {
    Positive:
      "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
    Neutral:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300",
    Negative: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300",
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
          {/* --- MODIFICATION START --- */}
          {meeting.participants.length > 0 && (
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-2">
              <Users size={12} className="mr-1.5 shrink-0" />
              <span className="truncate">
                <span className="font-medium">Participants:</span>{" "}
                {meeting.participants.map((p) => p.name).slice(0, 2).join(", ")}
                {meeting.participants.length > 2 &&
                  `, and ${meeting.participants.length - 2} more`}
              </span>
            </div>
          )}
          {/* --- MODIFICATION END --- */}
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
          {meeting.participants.slice(0, 4).map((p, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs border-2 border-white dark:border-gray-800"
              title={p.name}
            >
              {p.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {meeting.participants.length > 4 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 text-xs border-2 border-white dark:border-gray-800">
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>
        <button
          onClick={() => onViewDetails(meeting.id)}
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

const StartMeetingModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const navigate = useNavigate();
  const [step, setStep] = React.useState("initial");
  const [meetingUrl, setMeetingUrl] = React.useState("");

  const handleSetupLater = () => {
    onClose();
    navigate("/");
  };

  const renderStep = () => {
    switch (step) {
      case "initial":
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white">
              How would you like to set up your meeting?
            </h3>
            <button
              onClick={() => setStep("customize")}
              className="w-full flex items-center text-left p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <Wrench className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold">Meeting Customization</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Set up a new, one-time configuration.
                </p>
              </div>
            </button>
            <button
              onClick={() => setStep("use_template")}
              className="w-full flex items-center text-left p-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <FileStack className="w-6 h-6 mr-4 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="font-semibold">Use Custom Meeting Templates</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a pre-saved template.
                </p>
              </div>
            </button>
            <button
              onClick={handleSetupLater}
              className="w-full p-3 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Set up later
            </button>
          </div>
        );
      case "customize":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Set Custom Meeting Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <TemplateCard
                icon={UserIcon}
                title="Customer Persona"
                description="Define the target audience."
              />
              <TemplateCard
                icon={Palette}
                title="Answer Styles"
                description="Set the tone and format."
              />
              <TemplateCard
                icon={Target}
                title="Custom Goals"
                description="Outline key objectives."
              />
              <TemplateCard
                icon={Focus}
                title="Meeting Focus"
                description="Specify main topics."
              />
              <TemplateCard
                icon={BrainCircuit}
                title="System Prompt"
                description="Guide the AI's core logic."
              />
              <div className="flex items-center justify-center p-4 rounded-xl border-2 border-dashed dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                <Plus size={20} className="mr-2" /> New Template
              </div>
            </div>
          </div>
        );
      case "use_template":
        return (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Select a Custom Template
            </h3>
            <div className="space-y-2">
              {dummyCustomTemplates.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-lg border dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer"
                >
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.description}
                  </p>
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
            {step !== "initial" && (
              <button
                onClick={() => setStep("initial")}
                className="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <h2 className="text-xl font-bold">Start an Instant Meeting</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <label
              htmlFor="meetingUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Meeting URL
            </label>
            <div className="relative">
              <Link
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
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
        {step !== "initial" && (
          <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end">
            <button
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
              disabled={!meetingUrl}
            >
              Start Meeting
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

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
                  className="bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 text-sm rounded-lg px-3 pr-8 py-2 min-w-[120px]"
                >
                  <option>Admin</option>
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
              style={{ width: "75%" }}
            ></div>
          </div>
          <p className="text-xs text-right mt-1">750 / 1000</p>
        </div>
        <div>
          <p>Storage Used</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-1">
            <div
              className="bg-green-500 h-2.5 rounded-full"
              style={{ width: "40%" }}
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

const MeetingsPage: React.FC<{ onStartMeeting: () => void }> = ({
  onStartMeeting,
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <button
        onClick={onStartMeeting}
        className="flex flex-col items-center justify-center p-6 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
      >
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
        {dummyActiveMeetings.map((m) => (
          <ActiveMeetingCard key={m.id} meeting={m} />
        ))}
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
        <TemplateCard
          icon={UserIcon}
          title="Customer Persona"
          description="Define the target audience."
        />
        <TemplateCard
          icon={Palette}
          title="Answer Styles"
          description="Set the tone and format."
        />
        <TemplateCard
          icon={Target}
          title="Custom Goals"
          description="Outline key objectives."
        />
        <TemplateCard
          icon={Focus}
          title="Meeting Focus"
          description="Specify main topics."
        />
        <TemplateCard
          icon={BrainCircuit}
          title="System Prompt"
          description="Guide the AI's core logic."
        />
      </div>
    </Section>
  </div>
);

const fetchAndFormatMeetings = async (
  userId: string,
  limit?: number
): Promise<Meeting[]> => {
  let query = supabase
    .from("meeting_logs")
    .select("*")
    .eq("user_id", userId)
    .gt("duration_seconds", 120)
    .order("meeting_started_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data: logs, error: logsError } = await query;
  if (logsError) throw logsError;
  if (!logs || logs.length === 0) return [];

  const logIds = logs.map((log) => log.id);

  const [participantsRes, snippetsRes] = await Promise.all([
  supabase.rpc('get_participants_for_meetings_batch', { meeting_ids: logIds }),
  supabase.rpc("get_first_snippets", { log_ids_in: logIds }),
]);

  if (participantsRes.error) throw participantsRes.error;
  if (snippetsRes.error) {
    console.error("Error fetching snippets with RPC:", snippetsRes.error);
    throw snippetsRes.error;
  }

  const participantsByLogId = new Map<string, { name: string }[]>();
  participantsRes.data?.forEach((p) => {
    const existing = participantsByLogId.get(p.log_id) || [];
    participantsByLogId.set(p.log_id, [...existing, { name: p.speaker_name }]);
  });

  const firstTranscriptByLogId = new Map<string, string>();
  snippetsRes.data?.forEach((snippet: any) => {
    firstTranscriptByLogId.set(snippet.log_id, snippet.text_segment);
  });

  return logs.map((log) => ({
    id: log.id,
    title: log.title || `Meet ${formatDate(log.meeting_started_at)}`,
    date: formatDate(log.meeting_started_at),
    duration: formatDuration(log.duration_seconds),
    participants: participantsByLogId.get(log.id) || [],
    sentiment: mapSentiment(log.overall_sentiment_score),
    transcriptSnippet:
      log.one_line_summary ||
      firstTranscriptByLogId.get(log.id) ||
      "No transcript available.",
  }));
};

const MeetingLogsPage: React.FC<{ onViewDetails: (id: string) => void }> = ({
  onViewDetails,
}) => {
  const { session } = useAuth();
  const [meetings, setMeetings] = React.useState<Meeting[]>([]);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => {
    const loadMeetings = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const formattedMeetings = await fetchAndFormatMeetings(session.user.id);
        setMeetings(formattedMeetings);
      } catch (error) {
        console.error("Error fetching all meeting logs:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMeetings();
  }, [session]);
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
  return (
    <Section title="All Meeting Logs">
      {meetings.length > 0 ? (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <MeetingLogCard
              key={meeting.id}
              meeting={meeting}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No meeting logs longer than 2 minutes found.
        </p>
      )}
    </Section>
  );
};

const ProfilePage: React.FC<{
  profile: UserProfile | null;
  session: any;
  userAvatarUrl: string | null;
  userFullName: string;
}> = ({ profile, session, userAvatarUrl, userFullName }) => {
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [loadingProfile, setLoadingProfile] = React.useState(false);
  const [loadingPassword, setLoadingPassword] = React.useState(false);
  React.useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
    }
  }, [profile]);
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      if (!session?.user) throw new Error("User not logged in");
      const updates = {
        id: session.user.id,
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date(),
      };
      const { error } = await supabase.from("profiles").upsert(updates);
      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error: any) {
      alert(`Error updating profile: ${error.message}`);
    } finally {
      setLoadingProfile(false);
    }
  };
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }
    setLoadingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;
      alert("Password updated successfully!");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      alert(`Error updating password: ${error.message}`);
    } finally {
      setLoadingPassword(false);
    }
  };
  return (
    <div className="max-w-2xl mx-auto">
      <Section title="Edit Profile">
        <div className="flex flex-col items-center space-y-4">
          {userAvatarUrl ? (
            <img
              src={userAvatarUrl}
              alt="User Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200 dark:border-gray-600"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-4xl font-semibold">
              {userFullName.charAt(0)}
            </div>
          )}
        </div>
        <form onSubmit={handleProfileUpdate} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Doe"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
              disabled={loadingProfile}
            >
              {loadingProfile ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
        <hr className="my-6 border-gray-200 dark:border-gray-700" />
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
          Change Password
        </h4>
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent focus:ring-2 focus:ring-rose-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-rose-600 text-white px-5 py-2 rounded-lg hover:bg-rose-700 disabled:opacity-50 font-semibold"
              disabled={loadingPassword}
            >
              {loadingPassword ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
};

const SettingsPage: React.FC = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
  </div>
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

const AccordionItem: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h4 className="font-semibold text-gray-800 dark:text-gray-200">{q}</h4>
        <ChevronDown
          size={20}
          className={`transform transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 mt-2" : "max-h-0"
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 pt-2">{a}</p>
      </div>
    </div>
  );
};

const SupportForm: React.FC<{
  formId: string;
  userName: string;
  userEmail: string;
  showFileUpload?: boolean;
}> = ({ formId, userName, userEmail, showFileUpload }) => {
  const [state, handleSubmit] = useForm(formId);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (state.succeeded) {
    return (
      <p className="text-center text-green-600 dark:text-green-400 font-semibold p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
        Thanks for your submission! We'll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Your Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            defaultValue={userName}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 shadow-sm cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            name="email"
            defaultValue={userEmail}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700/50 shadow-sm cursor-not-allowed"
          />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="block text-sm font-medium">
          Subject / Title
        </label>
        <input
          id="subject"
          type="text"
          name="subject"
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium">
          Description
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        ></textarea>
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
          className="text-xs text-red-500 mt-1"
        />
      </div>
      {showFileUpload && (
        <div>
          <label className="block text-sm font-medium">
            Attachment (Optional)
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600 dark:text-gray-400">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="attachment"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>
          {selectedFile && (
            <div className="mt-3 flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
              <div className="flex items-center gap-3">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-10 h-10 rounded-md object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-gray-600 rounded-md">
                    <FileIcon className="w-5 h-5 text-gray-500" />
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={removeFile}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      )}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={state.submitting}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Submit
        </button>
      </div>
    </form>
  );
};

const ZohoBugReportWidget: React.FC = () => {
  React.useEffect(() => {
    // Create the script element
    const script = document.createElement("script");
    script.src =
      "https://desk.zoho.in/portal/api/feedbackwidget/123339000001287003?orgId=60023688581&displayType=embeded";
    script.id = "zoho-feedback-widget-script"; // Give it an ID for easy removal
    script.async = true;

    // Append the script to the body
    document.body.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      const existingScript = document.getElementById(
        "zoho-feedback-widget-script"
      );
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleanup on unmount

  return <div id="zsfeedbackwidgetdiv"></div>;
};

const SupportPage: React.FC<{ userName: string; userEmail: string }> = ({
  userName,
  userEmail,
}) => {
  const [activeTab, setActiveTab] = React.useState("bug");
  const tabs = [
    { id: "bug", label: "Report an Issue", icon: Bug },
    { id: "question", label: "Ask a Question", icon: MessageCircleQuestion },
    { id: "feedback", label: "Feature Request", icon: Lightbulb },
  ];
  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900/20"
            }`}
          >
            <tab.icon size={16} className="mr-2" /> {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "bug" && (
        <Section title="Submit a Bug Report" icon={Bug}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Encountered an issue? Please provide as much detail as possible so
            we can resolve it quickly.
          </p>
          <ZohoBugReportWidget />
        </Section>
      )}
      {activeTab === "question" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3">
            <Section title="Have a Question?" icon={MessageCircleQuestion}>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Fill out the form below, and our team will get back to you.
              </p>
              <SupportForm
                formId="xovkjnen"
                userName={userName}
                userEmail={userEmail}
              />
            </Section>
          </div>
          <div className="lg:col-span-2">
            <Section title="Frequently Asked Questions">
              {faqs.map((faq, i) => (
                <AccordionItem key={i} q={faq.q} a={faq.a} />
              ))}
            </Section>
          </div>
        </div>
      )}
      {activeTab === "feedback" && (
        <Section title="Suggest a Feature or Provide Feedback" icon={Lightbulb}>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            We'd love to hear your ideas on how we can improve SpikedAI!
          </p>
          <SupportForm
            formId="mkgqovjk"
            userName={userName}
            userEmail={userEmail}
          />
        </Section>
      )}
    </div>
  );
};

const SimulatorPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <div className="p-8 md:p-12 text-center">
        <Bot size={48} className="mx-auto text-blue-500 mb-4" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome to the AI Meeting Simulator
        </h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Prepare for any conversation by practicing with a smart, responsive AI
          partner.
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <Target
            size={24}
            className="mx-auto mb-3 text-blue-600 dark:text-blue-400"
          />
          <h3 className="font-semibold text-lg">Refine Your Pitch</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Practice your sales pitch, handle objections, and perfect your
            delivery in a no-pressure environment.
          </p>
        </div>
        <div className="text-center">
          <BrainCircuit
            size={24}
            className="mx-auto mb-3 text-blue-600 dark:text-blue-400"
          />
          <h3 className="font-semibold text-lg">Master Objections</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Train the AI on your product documentation and learn to overcome any
            question or concern that comes your way.
          </p>
        </div>
        <div className="text-center">
          <TrendingUp
            size={24}
            className="mx-auto mb-3 text-blue-600 dark:text-blue-400"
          />
          <h3 className="font-semibold text-lg">Build Confidence</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Walk into your next real meeting fully prepared, confident, and
            ready to close the deal.
          </p>
        </div>
      </div>
      <div className="p-8 text-center">
        <button
          onClick={() => navigate("/meeting-prep")}
          className="inline-flex items-center px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-transform hover:scale-105 shadow-lg"
        >
          Start Simulator <ChevronsRight size={20} className="ml-2" />
        </button>
      </div>
    </div>
  );
};

const MeetingDetailsView: React.FC<{
  meetingId: string;
  onClose: () => void;
}> = ({ meetingId, onClose }) => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [details, setDetails] = React.useState<MeetingDetails | null>(null);
  const [transcript, setTranscript] = React.useState<TranscriptSegment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [summaryStatus, setSummaryStatus] = React.useState<
    "idle" | "loading" | "loaded" | "error"
  >("idle");

  React.useEffect(() => {
    const fetchDetails = async () => {
      if (!meetingId || !session) return;
      setLoading(true);
      try {
        const { data: logData, error: logError } = await supabase
          .from("meeting_logs")
          .select("*")
          .eq("id", meetingId)
          .single();
        if (logError) throw logError;

        if (!logData.ai_generated_summary) {
          setSummaryStatus("loading");
          // Logic to generate summary... (omitted for brevity)
        } else {
          setSummaryStatus("loaded");
        }

        // Fetch transcript and participant data concurrently
        const [transcriptRes, participantsRes] = await Promise.all([
          supabase
            .from("log_transcripts")
            .select(
              "id, speaker_name, text_segment, start_offset_seconds, absolute_timestamp"
            )
            .eq("log_id", meetingId)
            .order("start_offset_seconds"),

          // --- MODIFICATION IS HERE ---
          // This now calls your SQL function instead of querying the table directly
          supabase.rpc('get_participants_for_meeting', { meeting_id: meetingId }),
        ]);

        if (transcriptRes.error) throw transcriptRes.error;
        // Note: The RPC response object structure is slightly different
        if (participantsRes.error) throw participantsRes.error;

        setDetails({
          id: logData.id,
          title:
            logData.title || `Meet ${formatDate(logData.meeting_started_at)}`,
          date: formatDate(logData.meeting_started_at),
          duration: formatDuration(logData.duration_seconds),
          // Use the data from the RPC call
          participants: participantsRes.data.map((p: { speaker_name: string }) => ({
            name: p.speaker_name,
          })),
          sentiment: mapSentiment(logData.overall_sentiment_score),
          transcriptSnippet:
            logData.one_line_summary ||
            transcriptRes.data[0]?.text_segment ||
            "",
          ai_summary: logData.ai_generated_summary,
          talk_to_listen_ratio: logData.talk_to_listen_ratio,
          buying_signals_score: logData.buying_signals_total_score,
          critical_alerts_count: logData.critical_alerts_count,
          medpicc_completion: logData.medpicc_completion_percentage,
        });
        setTranscript(transcriptRes.data);
      } catch (error) {
        console.error("Error fetching meeting details:", error);
        setSummaryStatus("error");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [meetingId, session]);

  const handleGoToNotetaker = () => {
    navigate("/note-taker", {
      state: { transcript: transcript, title: details?.title },
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-white" />
      </div>
    );
  }

  if (!details) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col border dark:border-gray-700">
        <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold">{details.title}</h2>
            <p className="text-xs text-gray-500">
              {details.date} &middot; {details.duration}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </header>
        <main className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
          <div className="lg:col-span-2 flex flex-col overflow-hidden">
            <h3 className="text-lg font-semibold mb-2 shrink-0">
              Full Transcript
            </h3>
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg space-y-4">
              {transcript.map((segment) => (
                <div
                  key={segment.id}
                  className="flex items-start gap-3 text-sm"
                >
                  <span className="font-mono text-xs text-gray-500 pt-0.5">
                    {formatAbsoluteTimestamp(segment.absolute_timestamp)}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {segment.speaker_name}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      {segment.text_segment}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-6 overflow-y-auto">
            <Section title="AI Summary" className="p-4">
              {summaryStatus === "loading" ? (
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating AI summary...</span>
                </div>
              ) : (
                <div className="prose prose-sm text-gray-600 dark:text-gray-400 max-w-none">
                  <ReactMarkdown>
                    {details.ai_summary ||
                      "No AI summary available for this meeting."}
                  </ReactMarkdown>
                </div>
              )}
            </Section>
                        <Section
              title={`Participants (${details.participants.length})`}
              className="p-4"
              icon={Users}
            >
              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {details.participants.length > 0 ? (
                  details.participants.map((p, index) => (
                    <div key={index} className="flex items-center text-sm">
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center mr-2.5 text-xs font-semibold shrink-0">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-gray-700 dark:text-gray-300">
                        {p.name}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-500">
                    No participant data available.
                  </p>
                )}
              </div>
            </Section>
            <Section title="Key Analytics" className="p-4">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Overall Sentiment:</span>
                  <span
                    className={`font-semibold ${
                      details.sentiment === "Positive"
                        ? "text-green-500"
                        : details.sentiment === "Negative"
                        ? "text-red-500"
                        : "text-yellow-500"
                    }`}
                  >
                    {details.sentiment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Talk/Listen Ratio:</span>
                  <span className="font-semibold">
                    {details.talk_to_listen_ratio || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Buying Signals Score:</span>
                  <span className="font-semibold">
                    {details.buying_signals_score || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Critical Alerts:</span>
                  <span className="font-semibold">
                    {details.critical_alerts_count || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>MEDDPICC Completion:</span>
                  <span className="font-semibold">
                    {details.medpicc_completion?.toFixed(0) || 0}%
                  </span>
                </div>
              </div>
            </Section>
          </div>
        </main>
        <footer className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl flex justify-end shrink-0">
          <button
            onClick={handleGoToNotetaker}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Go to Meeting Notetaker
          </button>
        </footer>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = React.useState(true);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [showActivityLog, setShowActivityLog] = React.useState(false);
  const [activePage, setActivePage] = React.useState("dashboard");
  const [showStartMeetingModal, setShowStartMeetingModal] =
    React.useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = React.useState<
    string | null
  >(null);

  const [loading, setLoading] = React.useState(true);
  const [recentMeetings, setRecentMeetings] = React.useState<Meeting[]>([]);
  const [analytics, setAnalytics] = React.useState({
    totalMeetings: 0,
    totalParticipants: 0,
    avgMeetingDuration: 0,
    documentsProcessed: 0,
    avgSentimentScore: 0,
    avgMedpiccCompletion: 0,
  });
  const [meetingsThisWeek, setMeetingsThisWeek] = React.useState([
    { day: "Sun", meetings: 0 },
    { day: "Mon", meetings: 0 },
    { day: "Tue", meetings: 0 },
    { day: "Wed", meetings: 0 },
    { day: "Thu", meetings: 0 },
    { day: "Fri", meetings: 0 },
    { day: "Sat", meetings: 0 },
  ]);

  // Effect for fetching user profile
  React.useEffect(() => {
    const fetchProfile = async () => {
      setIsProfileLoading(true);
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("id", session.user.id)
            .single();
          if (error && error.code !== "PGRST116") throw error;
          if (data) setProfile(data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setIsProfileLoading(false);
        }
      } else {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [session]);

  // Effect for fetching dashboard data
  React.useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;
      setLoading(true);
      try {
        const formattedMeetings = await fetchAndFormatMeetings(
          session.user.id,
          3
        );
        setRecentMeetings(formattedMeetings);
        const { data: logs, error: logsError } = await supabase
          .from("meeting_logs")
          .select(
            "duration_seconds, participant_count, overall_sentiment_score, medpicc_completion_percentage, sentiment_trend, meeting_started_at"
          )
          .eq("user_id", session.user.id);
        if (logsError) throw logsError;
        const { count: docCount } = await supabase
          .from("sources")
          .select("*", { count: "exact", head: true })
          .eq("user_id", session.user.id);
        let totalParticipants = 0,
          totalDuration = 0,
          totalSentiment = 0,
          totalMedpicc = 0;
        if (logs && logs.length > 0) {
          logs.forEach((log) => {
            totalParticipants += log.participant_count || 0;
            totalDuration += log.duration_seconds || 0;
            totalSentiment += log.overall_sentiment_score || 0;
            totalMedpicc += log.medpicc_completion_percentage || 0;
          });
        }
        setAnalytics({
          totalMeetings: logs?.length || 0,
          totalParticipants,
          avgMeetingDuration: logs?.length ? totalDuration / logs.length : 0,
          documentsProcessed: docCount || 0,
          avgSentimentScore: logs?.length ? totalSentiment / logs.length : 0,
          avgMedpiccCompletion: logs?.length ? totalMedpicc / logs.length : 0,
        });
        const weekCounts = new Array(7).fill(0);
        const today = new Date();
        const dayOfWeek = today.getDay();
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - dayOfWeek);
        firstDayOfWeek.setHours(0, 0, 0, 0);
        logs?.forEach((log) => {
          if (log.meeting_started_at) {
            const meetingDate = new Date(log.meeting_started_at);
            if (meetingDate >= firstDayOfWeek) {
              weekCounts[meetingDate.getDay()]++;
            }
          }
        });
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const newMeetingsThisWeek = days.map((day, index) => ({
          day,
          meetings: weekCounts[index],
        }));
        setMeetingsThisWeek(newMeetingsThisWeek);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (activePage === "dashboard") {
      fetchDashboardData();
    }
  }, [session, activePage]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate("/login");
    }
  };
  const userFullName = React.useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return (
      session?.user?.user_metadata?.full_name ||
      session?.user?.email ||
      "Admin User"
    );
  }, [profile, session]);
  const userAvatarUrl = React.useMemo(() => {
    return session?.user?.user_metadata?.avatar_url || null;
  }, [session]);

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    // { id: "meetings", label: "Meetings", icon: Video },
    { id: "meeting_simulator", label: "Simulator", icon: FlaskConical },
    { id: "meeting_logs", label: "Meeting Logs", icon: LayoutGrid },
    { id: "documents", label: "Content Hub", icon: FileText },
    // { id: "users", label: "Users", icon: Users },
    // { id: "billing", label: "Billing", icon: CreditCard },
    // { id: "api_keys", label: "API Keys", icon: KeyRound },
    { id: "support", label: "Support", icon: HelpCircle },
    { id: "tutorial", label: "Tutorial", icon: BookOpen },
  ];

  const handleViewDetails = (id: string) => setSelectedMeetingId(id);

  const renderPage = () => {
    if (loading && activePage === "dashboard") {
      return (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      );
    }
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Meetings Recorded"
                value={analytics.totalMeetings.toLocaleString()}
                change={0}
                icon={<Video size={20} className="text-blue-500" />}
              />
              <StatCard
                title="Active Sessions"
                value={"0"}
                change={0}
                icon={<Activity size={20} className="text-green-500" />}
              />
              <StatCard
                title="Average Meeting Duration"
                value={formatDuration(analytics.avgMeetingDuration)}
                change={0}
                icon={<Clock size={20} className="text-purple-500" />}
              />
              <StatCard
                title="Total Participants Engaged"
                value={analytics.totalParticipants.toLocaleString()}
                change={0}
                icon={<Users size={20} className="text-orange-500" />}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <MeetingsThisWeekChart data={meetingsThisWeek} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 content-start">
                <SecondaryStatCard
                  title="Documents Processed"
                  value={analytics.documentsProcessed.toLocaleString()}
                  change={0}
                  icon={<FileText size={16} />}
                />
                <SecondaryStatCard
                  title="Average Sentiment Score"
                  value={analytics.avgSentimentScore.toFixed(1)}
                  subValue={"/ 10"}
                  change={0}
                  icon={<Smile size={16} />}
                />
                <SecondaryStatCard
                  title="Sentiment Trend"
                  value={"Neutral"}
                  change={0}
                  icon={<TrendingUp size={16} />}
                />
                <SecondaryStatCard
                  title="Avg. MEDDPICC Completion"
                  value={analytics.avgMedpiccCompletion.toFixed(0) + "%"}
                  change={0}
                  icon={<CheckSquare size={16} />}
                />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Recent Meeting Logs
              </h2>
              {recentMeetings.length > 0 ? (
                <div className="space-y-4">
                  {recentMeetings.map((meeting) => (
                    <MeetingLogCard
                      key={meeting.id}
                      meeting={meeting}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No recent meetings found.
                </p>
              )}
            </div>
          </>
        );
      case "users":
        return <UsersPage />;
      case "billing":
        return <BillingPage />;
      case "api_keys":
        return <ApiKeysPage />;
      case "meetings":
        return (
          <MeetingsPage onStartMeeting={() => setShowStartMeetingModal(true)} />
        );
      case "meeting_logs":
        return <MeetingLogsPage onViewDetails={handleViewDetails} />;
      case "settings":
        return <SettingsPage />;
      case "profile":
        return (
          <ProfilePage
            profile={profile}
            session={session}
            userAvatarUrl={userAvatarUrl}
            userFullName={userFullName}
          />
        );
      case "support":
        return (
          <SupportPage
            userName={userFullName}
            userEmail={session?.user?.email || ""}
            isProfileLoading={isProfileLoading}
          />
        );
      case "meeting_simulator":
        return <SimulatorPage />;
      default:
        const link = sidebarLinks.find((l) => l.id === activePage);
        return <PlaceholderPage title={link?.label || "Page"} />;
    }
  };

  const handleMenuClick = (page: string) => {
    setActivePage(page);
    setShowUserMenu(false);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      {showStartMeetingModal && (
        <StartMeetingModal onClose={() => setShowStartMeetingModal(false)} />
      )}
      {selectedMeetingId && (
        <MeetingDetailsView
          meetingId={selectedMeetingId}
          onClose={() => setSelectedMeetingId(null)}
        />
      )}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-center h-20 border-b border-gray-100 dark:border-gray-700 px-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-3 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />

              <div className="flex items-center space-x-2">
                <span>Console</span>
              </div>
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) =>
            link.id === "documents" ? (
              <Link
                key={link.id}
                to="/documents"
                state={{ from: location.pathname }}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700`}
              >
                <link.icon size={18} className="mr-3" /> {link.label}
              </Link>
            ) : (
              <a
                key={link.id}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setActivePage(link.id);
                }}
                className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  activePage === link.id
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <link.icon size={18} className="mr-3" /> {link.label}
              </a>
            )
          )}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shrink-0">
          <div className="flex items-center space-x-4">
            <img
              src={SpikedAILogo}
              alt="SpikedAI Logo"
              className="h-20 w-100 mr-3"
            />
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowActivityLog(!showActivityLog)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Bell size={20} className="text-gray-500 dark:text-gray-400" />
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
                    Admin
                  </p>
                </div>
                <ChevronDown size={18} className="text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-20">
                  <button
                    onClick={() => handleMenuClick("profile")}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <UserIcon size={16} className="mr-2" /> Profile
                  </button>
                  <button
                    onClick={() => handleMenuClick("settings")}
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
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
            {activePage.replace(/_/g, " ")}
          </h1>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;