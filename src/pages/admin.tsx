import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
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
} from "lucide-react";
import SpikedAILogo from "/SpikedAI.png";

// --- TYPES ---
interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
}

// --- DUMMY DATA ---
const dummyAnalytics = {
  totalUsers: { value: 1342, change: 12.5 },
  activeSessions: { value: 87, change: -3.2 },
  documentsProcessed: { value: 7890, change: 25.1 },
  averageResponseTime: { value: 452, change: -8.9, unit: "ms" },
};

const userActivityData = [
  { day: "Mon", signups: 12 },
  { day: "Tue", signups: 19 },
  { day: "Wed", signups: 25 },
  { day: "Thu", signups: 22 },
  { day: "Fri", signups: 31 },
  { day: "Sat", signups: 18 },
  { day: "Sun", signups: 28 },
];

const sentimentData = [
  { name: "Positive", value: 65, color: "text-emerald-500" },
  { name: "Neutral", value: 25, color: "text-yellow-500" },
  { name: "Negative", value: 10, color: "text-red-500" },
];

// --- UI COMPONENTS ---

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

const UserActivityChart: React.FC = () => {
  const maxValue = Math.max(...userActivityData.map((d) => d.signups));
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        User Signups This Week
      </h3>
      <div className="flex justify-between items-end h-48 space-x-2">
        {userActivityData.map((data) => (
          <div
            key={data.day}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            <div
              className="w-full bg-blue-100 dark:bg-blue-900/50 rounded-t-lg group-hover:bg-blue-400 dark:group-hover:bg-blue-600 transition-all duration-300"
              style={{ height: `${(data.signups / maxValue) * 100}%` }}
              title={`${data.signups} signups`}
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

const SentimentBreakdownChart: React.FC = () => {
  let accumulatedOffset = 0;
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Conversation Sentiment
      </h3>
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 36 36" className="transform -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="15.915"
            fill="transparent"
            strokeWidth="3"
            className="text-gray-200 dark:text-gray-700"
          />
          {sentimentData.map((segment, index) => {
            const strokeDasharray = `${segment.value} ${100 - segment.value}`;
            const strokeDashoffset = -accumulatedOffset;
            accumulatedOffset += segment.value;
            return (
              <circle
                key={index}
                cx="18"
                cy="18"
                r="15.915"
                fill="transparent"
                strokeWidth="3.2"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className={segment.color}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900 dark:text-white">
            78%
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Positive
          </span>
        </div>
      </div>
      <div className="mt-4 w-full space-y-2">
        {sentimentData.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-sm"
          >
            <div className="flex items-center">
              <span
                className={`w-3 h-3 rounded-full mr-2 ${item.color.replace(
                  "text-",
                  "bg-"
                )}`}
              ></span>
              <span className="text-gray-600 dark:text-gray-300">
                {item.name}
              </span>
            </div>
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Placeholder component for other pages
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("id, first_name, last_name")
            .eq("id", session.user.id)
            .single();

          if (error) throw error;
          if (data) setProfile(data);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };
    fetchProfile();
  }, [session]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error);
    } else {
      navigate("/login");
    }
  };

  const userFullName = useMemo(() => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    return (
      session?.user?.user_metadata?.full_name ||
      session?.user?.email ||
      "Admin User"
    );
  }, [profile, session]);

  const userAvatarUrl = useMemo(() => {
    return session?.user?.user_metadata?.avatar_url || null;
  }, [session]);

  const sidebarLinks = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "users", label: "Users", icon: Users },
    { id: "content", label: "Content", icon: FileText },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "api_keys", label: "API Keys", icon: KeyRound },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <StatCard
                title="Total Users"
                value={dummyAnalytics.totalUsers.value.toLocaleString()}
                change={dummyAnalytics.totalUsers.change}
                icon={<Users size={20} className="text-blue-500" />}
              />
              <StatCard
                title="Active Sessions"
                value={dummyAnalytics.activeSessions.value.toString()}
                change={dummyAnalytics.activeSessions.change}
                icon={<Activity size={20} className="text-green-500" />}
              />
              <StatCard
                title="Documents Processed"
                value={dummyAnalytics.documentsProcessed.value.toLocaleString()}
                change={dummyAnalytics.documentsProcessed.change}
                icon={<FileText size={20} className="text-purple-500" />}
              />
              <StatCard
                title="Avg. Response Time"
                value={`${dummyAnalytics.averageResponseTime.value}${dummyAnalytics.averageResponseTime.unit}`}
                change={dummyAnalytics.averageResponseTime.change}
                icon={<Zap size={20} className="text-orange-500" />}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UserActivityChart />
              </div>
              <div>
                <SentimentBreakdownChart />
              </div>
            </div>
          </>
        );
      default:
        const link = sidebarLinks.find((l) => l.id === activePage);
        return <PlaceholderPage title={link?.label || "Page"} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-800 dark:text-gray-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col">
        <div className="flex items-center justify-center h-20 border-b border-gray-100 dark:border-gray-700 px-4">
          <div className="flex items-center space-x-1">
            <button
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
              <p>Back to Console</p>
            </button>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
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
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
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
        <header className="flex items-center justify-between h-20 px-6 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <img
              src={SpikedAILogo}
              alt="SpikedAI Logo"
              className="h-20 w-100 mr-3"
            />
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
                  Administrator
                </p>
              </div>
              <ChevronDown size={18} className="text-gray-400" />
            </button>
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-xl z-20">
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <UserIcon size={16} className="mr-2" /> Profile
                </a>
                <a
                  href="#"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Settings size={16} className="mr-2" /> Settings
                </a>
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
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
