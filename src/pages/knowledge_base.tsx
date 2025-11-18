import React, { useState, FormEvent, FC, useEffect } from 'react';
import { Rocket, Mail, Lock, User, Zap, BookOpen, Settings, CheckCircle, XCircle, Clock, Send, Search, Bell, Menu, Tag, Users, Folder, Inbox, Filter } from 'lucide-react';

import KnowledgeSign from '../pages/knowledge_sign'
import KnowledgePersona from '../pages/knowledge_persona'
import KnowledgeDocx from '../pages/knowledge_docx'

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  type: 'form-demo' | 'verification-demo' | 'password-checker' | 'gmail-folders-demo'; 
}
interface Question { id: string; title: string; emoji: string; description: string; subQuestions?: SubQuestion[]; }
interface Item { id: string; title: string; description: string; questions: Question[]; }
interface Topic { cardId: string; cardTitle: string; cardDescription: string; icon: JSX.Element; emoji: string; items: Item[]; }
interface Topics { [key: string]: Topic; }


// --- DEMO COMPONENT 1: SIGN UP FORM ---

const SignUpFormDemo: FC = () => {
  const [status, setStatus] = useState<'ready' | 'submitting' | 'success'>('ready');
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const confirmPassword = (form.elements.namedItem('confirm_password') as HTMLInputElement).value;
    if (password !== confirmPassword) { console.error("Passwords do not match!"); return; }
    setStatus('submitting');
    setTimeout(() => { setStatus('success'); }, 1500);
  };

  return (
    <div style={{ aspectRatio: '1.2 / 1', maxWidth: '600px', minWidth: '350px' }} className="flex w-full h-full rounded-xl overflow-hidden shadow-2xl">
      <div className="hidden md:flex flex-col justify-center items-center p-6 md:p-8 w-5/12 bg-[#1A1A1A] text-white">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl md:text-5xl text-red-600 font-extrabold mr-1">!</span>
            <h2 className="text-xl md:text-2xl font-bold font-sans">SpikedAI</h2>
          </div>
          <p className="text-xs opacity-80 mb-4 font-sans">The Revenue OS Platform.</p>
        </div>
      </div>
      <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-sans">Create account</h3>
        <p className="text-sm text-gray-500 mb-6 font-sans">Get started with your free account</p>
        {status === 'success' ? (
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <Zap className="w-6 h-6 mx-auto text-green-600 mb-3" />
            <p className="text-md font-medium text-green-700 font-sans">Success!</p>
            <p className="text-sm text-green-600 font-sans">Verification email sent. Check your inbox to activate your account.</p>
            <button 
              onClick={() => setStatus('ready')}
              className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium font-sans"
            >
              Start Over
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
               <div className="grid grid-cols-2 gap-3">
               <div><label htmlFor="first_name" className="text-xs font-medium text-gray-700 block mb-1 font-sans">First name</label><div className="relative"><User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="text" id="first_name" name="first_name" placeholder="John" required className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans" /></div></div>
               <div><label htmlFor="last_name" className="text-xs font-medium text-gray-700 block mb-1 font-sans">Last name</label><div className="relative"><User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="text" id="last_name" name="last_name" placeholder="Doe" required className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans" /></div></div>
             </div>
             <div><label htmlFor="email" className="text-xs font-medium text-gray-700 block mb-1 font-sans">Email address</label><div className="relative"><Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="email" id="email" name="email" placeholder="john@company.com" required className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans" /></div></div>
             <div><label htmlFor="password" className="text-xs font-medium text-gray-700 block mb-1 font-sans">Password</label><div className="relative"><Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="password" id="password" name="password" placeholder="At least 8 characters" required className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans" /></div></div>
             <div><label htmlFor="confirm_password" className="text-xs font-medium text-gray-700 block mb-1 font-sans">Confirm password</label><div className="relative"><Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" /><input type="password" id="confirm_password" name="confirm_password" placeholder="Confirm your password" required className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans" /></div></div>

             <button type="submit" disabled={status === 'submitting'} className="w-full py-2 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition duration-150 ease-in-out disabled:bg-gray-400 mt-4 font-sans">
               {status === 'submitting' ? 'Creating...' : 'Create account'}
             </button>
             <p className="text-center text-xs text-gray-500 mt-4 font-sans">Already have an account? <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">Sign in</a></p>
           </form>
        )}
      </div>
    </div>
  );
};


// --- DEMO COMPONENT 2: VERIFICATION SUCCESS ---

const VerificationSuccessDemo: FC = () => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  return (
      <div style={{ aspectRatio: '1.2 / 1', maxWidth: '600px', minWidth: '350px' }} className="flex w-full h-full rounded-xl overflow-hidden shadow-2xl">
          <div className="hidden md:flex flex-col justify-center items-center p-6 md:p-8 w-5/12 bg-[#1A1A1A] text-white">
              <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                      <span className="text-4xl md:text-5xl text-red-600 font-extrabold mr-1">!</span>
                      <h2 className="text-xl md:text-2xl font-bold font-sans">SpikedAI</h2>
                  </div>
                  <p className="text-xs opacity-80 mb-4 font-sans">The Revenue OS Platform.</p>
              </div>
          </div>
          
          <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col justify-center items-center text-center">
              {isConfirmed ? (
                  <div className="p-6 bg-green-50 rounded-lg border border-green-200 w-full">
                      <Zap className="w-8 h-8 mx-auto text-green-600 mb-3" />
                      <p className="text-xl font-bold text-green-700 font-sans mb-2">Email Confirmed!</p>
                      <p className="text-sm text-green-600 font-sans">Your account is now active. Redirecting to login...</p>
                      <button 
                        onClick={() => setIsConfirmed(false)}
                        className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 font-medium font-sans"
                      >
                        Reset Demo
                      </button>
                  </div>
              ) : (
                  <>
                      <h1 className="text-xl font-bold text-red-600 mb-1">Confirm your signup</h1>
                      <p className="text-sm text-gray-700 mb-6">Welcome to SpikedAI 🚀</p>
                      <p className="text-sm text-gray-600 mb-8">
                          To complete your signup, click the button below:
                      </p>
                      <button 
                        onClick={() => setIsConfirmed(true)}
                        className="relative py-3 px-12 bg-red-600 text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transform scale-100 hover:scale-105"
                      >
                          <span className="relative z-10">Confirm your email</span>
                      </button>
                      <div className="w-full h-px bg-gray-200 my-8"></div>
                      <p className="text-xs text-gray-500">
                          <span className="text-red-600">✽ Note:</span> Once logged in, please reset up your password.
                      </p>
                      <p className="text-xs text-gray-400">
                          If you didn't sign up, you can safely ignore this email.
                      </p>
                  </>
              )}
          </div>
      </div>
  );
};


// --- DEMO COMPONENT 3: PASSWORD STRENGTH CHECKER ---

const PasswordCheckerDemo: FC = () => {
    const [password, setPassword] = useState('');
    const rules = [
      { label: "Minimum 8 characters", regex: /.{8,}/, id: 'len' },
      { label: "Upper & lowercase letters", regex: /(?=.*[a-z])(?=.*[A-Z])/, id: 'case' },
      { label: "Include numbers", regex: /(?=.*\d)/, id: 'num' },
      { label: "Special characters (!@#$%)", regex: /(?=.*[!@#$%^&*])/, id: 'special' },
    ];
    const metRulesCount = rules.filter(rule => rule.regex.test(password)).length;
    
    const getStrength = () => {
      if (password.length === 0) return { label: 'Start typing', color: 'text-gray-400', width: 0 };
      if (metRulesCount < 2) return { label: 'Weak', color: 'text-red-500', width: 25 };
      if (metRulesCount < 4) return { label: 'Moderate', color: 'text-yellow-500', width: 75 };
      return { label: 'Strong', color: 'text-green-500', width: 100 };
    };
    const strength = getStrength();

    return (
        <div style={{ maxWidth: '600px', minWidth: '350px' }} className="w-full p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Password Strength Check</h3>
            <div className="relative mb-6">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                    type="password"
                    placeholder="Enter your new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans" 
                />
            </div>
            <div className="mb-4">
                <p className="text-sm font-medium mb-1 flex justify-between">
                    <span>Strength:</span>
                    <span className={strength.color}>{strength.label}</span>
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                        className={`h-2.5 rounded-full transition-all duration-300 
                            ${strength.width > 75 ? 'bg-green-500' : strength.width > 25 ? 'bg-yellow-500' : strength.width > 0 ? 'bg-red-500' : 'bg-transparent'}`}
                        style={{ width: `${strength.width}%` }}
                    ></div>
                </div>
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Checklist:</p>
            <ul className="space-y-2">
                {rules.map((rule) => {
                    const isMet = rule.regex.test(password);
                    const Icon = isMet ? CheckCircle : XCircle;
                    return (
                        <li key={rule.id} className="flex items-center text-sm">
                            <Icon className={`w-4 h-4 mr-2 ${isMet ? 'text-green-500' : 'text-gray-400'}`} />
                            <span className={isMet ? 'text-gray-900' : 'text-gray-500'}>{rule.label}</span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};


// --- DEMO COMPONENT 4: GMAIL FOLDERS VISUAL DEMO ---

const GmailFoldersDemo: FC = () => {
    
    const [activeTab, setActiveTab] = useState<'spam' | 'junk' | 'promotions'>('spam');
    const [emailInFolder, setEmailInFolder] = useState(true);
    const [actionMessage, setActionMessage] = useState('');

    const folderItems = [
        { id: 'spam', icon: Filter, label: 'Spam', highlightColor: 'bg-red-500/10 border-red-500' },
        { id: 'junk', icon: XCircle, label: 'Junk', highlightColor: 'bg-orange-500/10 border-orange-500' },
        { id: 'promotions', icon: Tag, label: 'Promotions', highlightColor: 'bg-green-500/10 border-green-500' },
    ];

    const handleTabClick = (id: 'spam' | 'junk' | 'promotions') => {
        setActiveTab(id);
        setEmailInFolder(true); 
        setActionMessage('');
    };

    const handleMoveToInbox = () => {
        setEmailInFolder(false); 
        setActionMessage(`Success! Email moved to Inbox. Future SpikedAI emails should arrive there.`);
        setTimeout(() => setActionMessage(''), 5000); 
    };

    return (
        <div style={{ maxWidth: '600px', minWidth: '350px' }} className="w-full h-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Top Bar (Simulated Gmail Header) */}
            <div className="flex items-center p-3 border-b bg-gray-50">
                <Menu className="w-5 h-5 text-gray-500 mr-4" />
                <h1 className="text-xl font-google-sans text-red-600 font-bold mr-6">Gmail Demo</h1>
                <div className="flex-grow relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input type="text" placeholder="Search mail" className="w-full p-1.5 pl-10 text-sm bg-gray-200/50 rounded-lg focus:outline-none" />
                </div>
                <Bell className="w-5 h-5 text-gray-500 ml-4" />
            </div>

            {/* Main Content Area */}
            <div className="flex h-[380px]">
                {/* Left Sidebar (Folders) */}
                <div className="w-2/5 p-4 border-r bg-white space-y-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Folders</p>
                    {['Inbox', 'Sent', 'Drafts'].map(label => (
                        <div key={label} className="flex items-center p-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer">
                            <Inbox className="w-4 h-4 mr-3 text-gray-500" />
                            <span>{label}</span>
                        </div>
                    ))}
                    <div className="h-px bg-gray-200 my-3"></div>

                    {/* Highlighted Troubleshooting Folders */}
                    {folderItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => handleTabClick(item.id as any)}
                            className={`flex items-center p-2 text-sm rounded-lg cursor-pointer transition-all border-l-4 ${
                                activeTab === item.id 
                                    ? `font-bold ${item.highlightColor} text-gray-900`
                                    : 'text-gray-700 hover:bg-gray-100 border-transparent'
                            }`}
                        >
                            <item.icon className="w-4 h-4 mr-3 text-gray-500" />
                            <span>{item.label}</span>
                        </div>
                    ))}
                </div>

                {/* Right Content Area (Folder View) */}
                <div className="w-3/5 p-4 bg-gray-50 flex flex-col">
                    <p className="text-sm font-semibold text-gray-700 mb-3 uppercase border-b pb-2">
                        Currently Viewing: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Folder
                    </p>
                    
                    {actionMessage && (
                        <div className="flex items-center p-3 mb-3 bg-green-100 border-l-4 border-green-500 text-green-700">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <p className="text-sm font-medium">{actionMessage}</p>
                        </div>
                    )}

                    {/* Email Listing */}
                    {emailInFolder ? (
                        <div className="p-3 bg-white rounded shadow-sm border border-yellow-300">
                            <div className="flex items-center mb-1">
                                <span className="text-sm font-medium text-gray-800">SpikedAI - Confirm your email for signup</span>
                            </div>
                            <p className="text-xs text-gray-500 truncate">
                                This email needs to be moved to your primary Inbox to ensure future delivery.
                            </p>
                            {/* Functional Button */}
                            <button 
                                onClick={handleMoveToInbox}
                                className="mt-2 text-xs text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded border border-red-300 bg-red-50/50"
                            >
                                Not Spam? Move to Inbox
                            </button>
                        </div>
                    ) : (
                        <div className="text-center mt-8 p-4 text-gray-500 bg-gray-100 border border-dashed rounded">
                            <p className="text-sm">The SpikedAI email has been moved to your Inbox.</p>
                            <p className="text-xs mt-1">Click a folder on the left to reset the demo.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- TOPICS DATA STRUCTURE ---
export const topics: Topics = {
  gettingStarted: {
    cardId: 'card-getting-started',
    cardTitle: 'Getting Started',
    cardDescription: 'Set up your spikedAI workspace...',
    icon: <Rocket style={{ width: '20px', height: '20px' }} />,
    emoji: '🚀',
    items: [
      {
        id: 'signup',
        title: 'Sign Up',
        description: 'Create your spikedAI account and start exploring personalized meeting insights.',
        questions: [
          {
            id: 'signup-flow',
            title: 'Sign Up Process',
            emoji: '🆕',
            description: 'Simple steps to create your spikedAI account.',
            subQuestions: [
              {
                id: 'signup-process',
                question: 'How do I sign up for spikedAI?',
                type: 'form-demo', 
                answer: `<div id="signup-content-wrapper" style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">How to Sign Up</h2><p style="margin:0 0 20px 0;">The sign-up process in <strong>spikedAI</strong> is quick and straightforward. Follow these steps:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">Navigate to the <strong>Sign Up</strong> page.</li><li style="margin:0 0 12px 0;">Fill in your details: First Name, Last Name, Email, and Password.</li><li style="margin:0 0 12px 0;">Click <strong>Create Account</strong> to submit the form.</li><li style="margin:0 0 12px 0;">Check your inbox for a verification email.</li><li style="margin:0;">Click <strong>Verify Email</strong> to activate your account.</li></ol><p style="margin:0;">After verification, you can immediately log in to your workspace and begin setting up your personalized AI.</p></div>`
              },
              {
                id: 'signup-verify',
                question: 'How do I verify my email after signing up?',
                type: 'verification-demo', 
                answer: `<div id="verify-content-wrapper" style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Confirming Your Email</h2><p style="margin:0 0 20px 0;">Email verification activates your spikedAI account:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">Open the email from <strong>spikedAI</strong> (arrives within 1-2 minutes)</li><li style="margin:0 0 12px 0;">Click the <strong>Confirm your email</strong> button (Try clicking the button on the right!)</li><li style="margin:0;">Your account activates instantly and you will be redirected to the login screen.</li></ol><p style="margin:0;padding:12px;background:#eef2ff;border-left:3px solid #4f46e5;border-radius:4px;font-size:14px;"><strong>Tip:</strong> If you don't receive the email, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</p></div>`
              },
              {
                id: 'signup-password',
                question: 'What are the password requirements?',
                type: 'password-checker',
                answer: `<div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Setting a Strong Password</h2><p style="margin:0 0 20px 0;"><strong>spikedAI</strong> allows flexible passwords, but we recommend following security best practices:</p><div style="display:grid;grid-template-columns:1fr;gap:20px;margin:0 0 20px 0;"><div><p style="margin:0 0 12px 0;font-weight:600;">Recommended guidelines:</p><ul style="margin:0;padding-left:20px;"><li style="margin:0 0 8px 0;">Minimum <strong>8 characters</strong></li><li style="margin:0 0 8px 0;">Upper & lowercase letters</li><li style="margin:0 0 8px 0;">Include numbers</li><li style="margin:0;">Special characters (!@#$%)</li></ul></div><div><p style="margin:0 0 12px 0;font-weight:600;">Examples:</p><ul style="margin:0;padding-left:0;list-style:none;"><li style="margin:0 0 8px 0;font-family:monospace;">✓ SpikedAI2025! — <span style="color:#059669;">Strong</span></li><li style="margin:0 0 8px 0;font-family:monospace;">✓ Sales#Track24 — <span style="color:#059669;">Strong</span></li><li style="margin:0;font-family:monospace;">✗ password123 — <span style="color:#dc2626;">Weak</span></li></ul></div></div><p style="margin:0;padding:12px;background:#fefce8;border-left:3px solid #eab308;border-radius:4px;font-size:14px;"><strong>Try it out:</strong> Use the live checker on the right to test your password ideas against these rules.</p></div>`
              },
              {
                id: 'signup-not-received',
                question: 'I didn\'t receive my verification email. What should I do?',
                type: 'gmail-folders-demo',
                answer: `
                  <div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;">
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Troubleshooting Email Delivery</h2>
                    <p style="margin:0 0 20px 0;">If the verification email hasn't arrived, it's usually due to your email provider routing it to a separate folder. Follow these steps, referencing the demo on the right:</p>
                    
                    <ol style="margin:0 0 20px 0;padding-left:20px;">
                      <li style="margin:0 0 10px 0;">First, check your <strong>Promotions</strong> tab.</li>
                      <li style="margin:0 0 10px 0;">Next, check the <strong>Spam</strong> or <strong>Junk</strong> folders, as highlighted on the right.</li>
                      <li style="margin:0 0 10px 0;"><strong>If you find it, click "Not Spam? Move to Inbox" on the right to simulate the action.</strong> This trains your mailbox.</li>
                      <li style="margin:0;">If you still cannot find it, please contact <strong>support@spiked.ai</strong> for manual verification.</li>
                    </ol>

                    <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #EAB308;border-radius:4px;font-size:14px;">
                      <strong>Tip:</strong> Click on the folder names (Spam, Junk, Promotions) in the demo to see where your email might be hiding!
                    </p>
                  </div>
                `
              },
            ], 
          }, 
        ], 
      }, 
    ], 
  }, 
}; 

// --- MAIN APP COMPONENT ---

const App: FC = () => {
    // Setting initial state to the email troubleshooting article
    const [currentArticleId, setCurrentArticleId] = useState<'signup-process' | 'signup-verify' | 'signup-password' | 'signup-not-received'>('signup-not-received'); 
    
    // --- NEW TTS STATE ---
    const [isSpeaking, setIsSpeaking] = useState(false); 
    // ----------------------

    const articleItem = topics.gettingStarted.items[0];
    const subQuestions = articleItem.questions[0].subQuestions!;
    
    const topicData = subQuestions.find(sq => sq.id === currentArticleId)!;
    const textContent = topicData.answer;

    // --- NEW TTS LOGIC ---
    const handleSpeak = () => {
        // 1. Stop any speech currently in progress
        window.speechSynthesis.cancel();
        
        if (isSpeaking) {
            setIsSpeaking(false);
            return;
        }

        // 2. Extract plain text from the HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(textContent, 'text/html');
        // We use textContent on the body to strip all HTML tags
        const plainText = doc.body.textContent || ''; 

        if (!plainText) return;

        // 3. Configure the utterance
        const utterance = new SpeechSynthesisUtterance(plainText);
        utterance.rate = 1; // You can adjust speed (e.g., 0.9 for slightly slower)
        utterance.pitch = 1; // Pitch (default 1)
        
        // Find a US English voice if available for better quality/consistency
        const englishVoice = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US');
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        // 4. Update state on start and end
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        // 5. Start speaking
        window.speechSynthesis.speak(utterance);
    };

    // Stop speaking when the user changes the article tab
    useEffect(() => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [currentArticleId]);
    // ----------------------


    // Conditionally render the correct interactive component
    const RightSideComponent = () => {
        if (topicData.type === 'form-demo') return <SignUpFormDemo />;
        if (topicData.type === 'verification-demo') return <VerificationSuccessDemo />;
        if (topicData.type === 'password-checker') return <PasswordCheckerDemo />;
        if (topicData.type === 'gmail-folders-demo') return <GmailFoldersDemo />; 
        return null;
    };

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen font-inter">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl mx-auto">
             
                <div className="flex border-b border-gray-200 mb-6">
                    <BookOpen className="w-5 h-5 text-gray-400 mr-2 self-center" />
                    {subQuestions.map((q) => (
                        <button
                            key={q.id}
                            onClick={() => setCurrentArticleId(q.id as any)}
                            className={`py-2 px-4 text-sm font-medium transition-all border-b-2 ${
                                q.id === currentArticleId 
                                ? 'border-indigo-600 text-indigo-600'
                                : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                        >
                            {q.question}
                        </button>
                    ))}
                </div>
                
                
                <h1 className="text-2xl font-bold mb-4 text-gray-900 flex items-center justify-between">
                    Article: {topicData.question}
                    <button
                        onClick={handleSpeak}
                        className={`flex items-center text-sm font-semibold py-1 px-3 rounded-full transition-colors whitespace-nowrap ${
                            isSpeaking 
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                        }`}
                    >
                        {isSpeaking ? (
                            <>
                                <XCircle className="w-4 h-4 mr-1" /> Stop Listening
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-1 transform -rotate-45" /> Listen
                            </>
                        )}
                    </button>
                </h1>
                {/* ------------------------------------------- */}
                
                {/* Two-Column Layout (Instructions on Left, Interactive Demo on Right) */}
                <div 
                    style={{padding: '20px 0'}} 
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
                >
                    {/* LEFT COLUMN: Instructions (from data structure) */}
                    <div dangerouslySetInnerHTML={{ __html: textContent }} />
                    
                    {/* RIGHT COLUMN: Interactive Demo (Conditionally Rendered) */}
                    <div className="flex justify-center md:justify-end">
                        <RightSideComponent />
                    </div>
                </div>
                
                
            </div>
           
            <div>
                <KnowledgeSign/>
                <KnowledgePersona/>
                <KnowledgeDocx/>
            </div>
        </div>
        
    );
};


export default App;