import React, { useState, FormEvent, FC, useEffect, useRef } from 'react';
import {
  Rocket, Mail, Lock, User, Zap, BookOpen, Settings,
  CheckCircle, XCircle, Clock, Send, Search, Bell, Menu,
  Tag, Inbox, Filter, ChevronRight, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import KnowledgeSign from '../pages/knowledge_sign';
import KnowledgePersona from '../pages/knowledge_persona';
import KnowledgeDocx from '../pages/knowledge_docx';
import KnowledgeNote from '../pages/knowledge_note';

// --- TypeScript Interfaces ---
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

interface SignUpFormDemoProps {
  onSignUpComplete: () => void;
  currentStep?: string;
}

const SignUpFormDemo: FC<SignUpFormDemoProps> = ({ onSignUpComplete, currentStep }) => {
  const shouldHighlight = currentStep === 'signup-process';
  const [status, setStatus] = useState<'ready' | 'submitting' | 'success'>('ready');

  // fields for tracking checklist
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const step1Done = true; // user is already on sign up page
  const step2Done = Boolean(firstName && lastName && email && password && confirmPassword);
  const step3Done = status === 'success';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    setStatus('submitting');

    setTimeout(() => {
      setStatus('success');
      onSignUpComplete();
    }, 1500);
  };

  const leftChecklist = [
    {
      id: 1,
      label: 'Navigate to Sign Up page',
      done: step1Done,
      color: 'bg-indigo-50 border-indigo-300 text-indigo-700'
    },
    {
      id: 2,
      label: 'Fill in your details',
      done: step2Done,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-700'
    },
    {
      id: 3,
      label: 'Click “Create Account”',
      done: step3Done,
      color: 'bg-pink-50 border-pink-300 text-pink-700'
    }
  ];

  return (
    <div
      style={{ aspectRatio: '1.2 / 1', maxWidth: '650px', minWidth: '380px' }}
      className="flex w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white"
    >
      {/* LEFT: colourful checklist */}
      <div className="hidden md:flex flex-col justify-between p-5 w-5/12 bg-gradient-to-b from-[#111827] via-[#020617] to-black text-white">
        <div>
          <div className="flex items-center mb-3">
            <span className="text-4xl text-red-500 font-extrabold mr-1">!</span>
            <div>
              <h2 className="text-lg font-bold font-sans tracking-tight">SpikedAI</h2>
              <p className="text-[11px] opacity-70 font-sans">The Revenue OS Platform.</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 mb-4 font-sans">
            Follow these quick steps to complete your SpikedAI sign up. As you do them on the right, they’ll tick off here.
          </p>
        </div>

        <div className="space-y-2">
          {leftChecklist.map(step => (
            <div
              key={step.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-medium shadow-sm transition-all ${step.color}`}
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/10 text-[10px] mr-2">
                  {step.id}
                </span>
                <span className={step.done ? 'line-through opacity-60' : ''}>
                  {step.label}
                </span>
              </div>
              {step.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: actual form */}
      <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-sans"><br/>Create account</h3>
        <p className="text-sm text-gray-500 mb-6 font-sans">Get started with your free SpikedAI workspace</p>

        {status === 'success' ? (
          <div className="text-center p-6 bg-emerald-50 rounded-lg border border-emerald-200">
            <Zap className="w-7 h-7 mx-auto text-emerald-600 mb-3" />
            <p className="text-md font-semibold text-emerald-700 font-sans">Account created!</p>
            <p className="text-xs text-emerald-600 font-sans">
              We’ve sent a verification email to your inbox. Open it and confirm to activate your account.
            </p>
            <button
              onClick={() => {
                setStatus('ready');
                setFirstName('');
                setLastName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 font-medium font-sans underline"
            >
              Reset demo
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="first_name" className="text-xs font-medium text-gray-700 block mb-1 font-sans">
                  First name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                      shouldHighlight 
                        ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="last_name" className="text-xs font-medium text-gray-700 block mb-1 font-sans">
                  Last name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                      shouldHighlight 
                        ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                        : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-xs font-medium text-gray-700 block mb-1 font-sans">
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="john@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight 
                      ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="text-xs font-medium text-gray-700 block mb-1 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight 
                      ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="text-xs font-medium text-gray-700 block mb-1 font-sans">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight 
                      ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                      : 'border-gray-300'
                  }`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={status === 'submitting'}
              className={`w-full py-2 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition duration-150 ease-in-out disabled:bg-gray-400 mt-4 font-sans ${
                shouldHighlight 
                  ? 'bg-gray-900 shadow-[0_0_20px_rgba(34,197,94,0.6)]' 
                  : 'bg-gray-900'
              }`}
            >
              {status === 'submitting' ? 'Creating account…' : 'Create account'}
            </button>

            <p className="text-center text-xs text-gray-500 mt-4 font-sans">
              Already have an account?{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign in
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

// --- DEMO COMPONENT 2: VERIFICATION SUCCESS + CHECKLIST ---

interface VerificationSuccessDemoProps {
  onVerifyComplete: () => void;
  currentStep?: string;
}

const VerificationSuccessDemo: FC<VerificationSuccessDemoProps> = ({ onVerifyComplete, currentStep }) => {
  const shouldHighlight = currentStep === 'signup-verify';
  const [isConfirmed, setIsConfirmed] = useState(false);

  // checklist:
  const step1Done = true;              // open inbox (already on verification screen)
  const step2Done = true;              // found verification email (assume yes if they are here)
  const step3Done = isConfirmed;       // clicked confirm

  const leftChecklist = [
    {
      id: 1,
      label: 'Open your inbox',
      done: step1Done,
      color: 'bg-sky-50 border-sky-300 text-sky-700'
    },
    {
      id: 2,
      label: 'Find “Confirm your email”',
      done: step2Done,
      color: 'bg-violet-50 border-violet-300 text-violet-700'
    },
    {
      id: 3,
      label: 'Click “Confirm your email”',
      done: step3Done,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-700'
    }
  ];

  const handleConfirm = () => {
    setIsConfirmed(true);
    onVerifyComplete();
  };

  return (
    <div style={{ aspectRatio: '1.3 / 1', maxWidth: '650px', minWidth: '380px' }} className="flex w-full h-full rounded-xl overflow-hidden shadow-2xl">
      {/* LEFT checklist */}
      <div className="hidden md:flex flex-col justify-between p-5 w-5/12 bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
        <div>
          <div className="flex items-center mb-3">
            <span className="text-3xl text-red-500 font-extrabold mr-1">!</span>
            <div>
              <h2 className="text-lg font-bold font-sans tracking-tight">Verify Email</h2>
              <p className="text-[11px] opacity-70 font-sans">Finish activating SpikedAI.</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 mb-4 font-sans">
            As you complete the verification steps on the right, they’ll tick off here automatically.
          </p>
        </div>

        <div className="space-y-2">
          {leftChecklist.map(step => (
            <div
              key={step.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-medium shadow-sm transition-all ${step.color}`}
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/10 text-[10px] mr-2">
                  {step.id}
                </span>
                <span className={step.done ? 'line-through opacity-60' : ''}>
                  {step.label}
                </span>
              </div>
              {step.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT content */}
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
              onClick={handleConfirm}
              className={`relative py-3 px-12 text-white font-semibold rounded-full shadow-lg transition duration-300 ease-in-out hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-300 transform scale-100 hover:scale-105 ${
                shouldHighlight 
                  ? 'bg-red-600 shadow-[0_0_25px_rgba(34,197,94,0.7)]' 
                  : 'bg-red-600'
              }`}
            >
              <span className="relative z-10">Confirm your email</span>
            </button>
            <div className="w-full h-px bg-gray-200 my-8"></div>
            <p className="text-xs text-gray-500">
              <span className="text-red-600">✽ Note:</span> Once logged in, please set up your password.
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

// --- DEMO COMPONENT 3: PASSWORD STRENGTH CHECKER + CHECKLIST ---

interface PasswordCheckerDemoProps {
  onPasswordStrong: () => void;
  currentStep?: string;
}

const PasswordCheckerDemo: FC<PasswordCheckerDemoProps> = ({ onPasswordStrong, currentStep }) => {
  const shouldHighlight = currentStep === 'signup-password';
  const [password, setPassword] = useState('');
  const [strongTriggered, setStrongTriggered] = useState(false);

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
  const isStrong = strength.label === 'Strong';

  useEffect(() => {
    if (isStrong && !strongTriggered) {
      setStrongTriggered(true);
      onPasswordStrong();
    }
  }, [isStrong, strongTriggered, onPasswordStrong]);

  // checklist for this tab
  const step1Done = password.length > 0;
  const step2Done = metRulesCount >= 2;
  const step3Done = isStrong;

  const leftChecklist = [
    {
      id: 1,
      label: 'Enter a password',
      done: step1Done,
      color: 'bg-sky-50 border-sky-300 text-sky-700'
    },
    {
      id: 2,
      label: 'Meet at least 2 rules',
      done: step2Done,
      color: 'bg-amber-50 border-amber-300 text-amber-700'
    },
    {
      id: 3,
      label: 'Meet all 4 rules (Strong)',
      done: step3Done,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-700'
    }
  ];

  return (
    <div style={{ maxWidth: '650px', minWidth: '380px' }} className="flex w-full h-full rounded-xl overflow-hidden shadow-2xl bg-white">
      {/* LEFT checklist */}
      <div className="hidden md:flex flex-col justify-between p-5 w-5/12 bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
        <div>
          <div className="flex items-center mb-3">
            <Lock className="w-5 h-5 text-amber-300 mr-2" />
            <div>
              <h2 className="text-lg font-bold font-sans tracking-tight">Password strength</h2>
              <p className="text-[11px] opacity-70 font-sans">Build a strong, safe password.</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 mb-4 font-sans">
            As you type on the right, these checklist items will complete and strike through automatically.
          </p>
        </div>

        <div className="space-y-2">
          {leftChecklist.map(step => (
            <div
              key={step.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-medium shadow-sm transition-all ${step.color}`}
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/10 text-[10px] mr-2">
                  {step.id}
                </span>
                <span className={step.done ? 'line-through opacity-60' : ''}>
                  {step.label}
                </span>
              </div>
              {step.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT checker */}
      <div className="w-full md:w-7/12 p-6 bg-white flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Live Password Strength Check</h3>
        <div className="relative mb-6">
          <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="password"
            placeholder="Enter your new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
              shouldHighlight 
                ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
                : 'border-gray-300'
            }`}
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
    </div>
  );
};

// --- DEMO COMPONENT 4: GMAIL FOLDERS VISUAL DEMO + CHECKLIST ---

interface GmailFoldersDemoProps {
  onInboxMove: () => void;
  currentStep?: string;
}

const GmailFoldersDemo: FC<GmailFoldersDemoProps> = ({ onInboxMove, currentStep }) => {
  const shouldHighlight = currentStep === 'signup-not-received';

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
    setActionMessage('Success! Email moved to Inbox. Future SpikedAI emails should arrive there.');
    onInboxMove();
    setTimeout(() => setActionMessage(''), 5000);
  };

  // checklist for this tab
  const step1Done = activeTab === 'promotions';
  const step2Done = activeTab === 'spam' || activeTab === 'junk';
  const step3Done = !emailInFolder;

  const leftChecklist = [
    {
      id: 1,
      label: 'Check Promotions tab',
      done: step1Done,
      color: 'bg-sky-50 border-sky-300 text-sky-700'
    },
    {
      id: 2,
      label: 'Check Spam/Junk folder',
      done: step2Done,
      color: 'bg-amber-50 border-amber-300 text-amber-700'
    },
    {
      id: 3,
      label: 'Move email to Inbox',
      done: step3Done,
      color: 'bg-emerald-50 border-emerald-300 text-emerald-700'
    }
  ];

  return (
    <div style={{ maxWidth: '650px', minWidth: '380px' }} className="flex w-full h-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
      {/* LEFT checklist */}
      <div className="hidden md:flex flex-col justify-between p-5 w-5/12 bg-gradient-to-b from-[#020617] via-[#020617] to-black text-white">
        <div>
          <div className="flex items-center mb-3">
            <Mail className="w-5 h-5 text-red-400 mr-2" />
            <div>
              <h2 className="text-lg font-bold font-sans tracking-tight">Didn’t get email?</h2>
              <p className="text-[11px] opacity-70 font-sans">Find it in other folders.</p>
            </div>
          </div>
          <p className="text-xs text-gray-300 mb-4 font-sans">
            Click through folders on the right. These steps complete as you explore and move the email.
          </p>
        </div>

        <div className="space-y-2">
          {leftChecklist.map(step => (
            <div
              key={step.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-[11px] font-medium shadow-sm transition-all ${step.color}`}
            >
              <div className="flex items-center">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-black/10 text-[10px] mr-2">
                  {step.id}
                </span>
                <span className={step.done ? 'line-through opacity-60' : ''}>
                  {step.label}
                </span>
              </div>
              {step.done ? (
                <CheckCircle className="w-4 h-4 text-emerald-500" />
              ) : (
                <Clock className="w-4 h-4 text-gray-300" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT Gmail-style demo */}
      <div className="w-full md:w-7/12 bg-white flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center p-3 border-b bg-gray-50">
          <Menu className="w-5 h-5 text-gray-500 mr-4" />
          <h1 className="text-xl font-google-sans text-red-600 font-bold mr-6">Gmail Demo</h1>
          <div className="flex-grow relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input type="text" placeholder="Search mail" className="w-full p-1.5 pl-10 text-sm bg-gray-200/50 rounded-lg focus:outline-none" />
          </div>
          <Bell className="w-5 h-5 text-gray-500 ml-4" />
        </div>

        {/* Main Content */}
        <div className="flex h-[360px]">
          {/* Left Folders */}
          <div className="w-2/5 p-4 border-r bg-white space-y-1">
            <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Folders</p>
            {['Inbox', 'Sent', 'Drafts'].map(label => (
              <div key={label} className="flex items-center p-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer">
                <Inbox className="w-4 h-4 mr-3 text-gray-500" />
                <span>{label}</span>
              </div>
            ))}
            <div className="h-px bg-gray-200 my-3"></div>

            {folderItems.map(item => (
              <div
                key={item.id}
                onClick={() => handleTabClick(item.id as any)}
                className={`flex items-center p-2 text-sm rounded-lg cursor-pointer transition-all border-l-4 ${
                  activeTab === item.id
                    ? `font-bold ${item.highlightColor} text-gray-900`
                    : shouldHighlight && activeTab !== item.id
                    ? 'text-gray-700 hover:bg-gray-100 border-transparent shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'text-gray-700 hover:bg-gray-100 border-transparent'
                }`}
              >
                <item.icon className="w-4 h-4 mr-3 text-gray-500" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          {/* Right Folder View */}
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

            {emailInFolder ? (
              <div className="p-3 bg-white rounded shadow-sm border border-yellow-300">
                <div className="flex items-center mb-1">
                  <span className="text-sm font-medium text-gray-800">SpikedAI - Confirm your email for signup</span>
                </div>
                <p className="text-xs text-gray-500 truncate">
                  This email needs to be moved to your primary Inbox to ensure future delivery.
                </p>
                <button
                  onClick={handleMoveToInbox}
                  className={`mt-2 text-xs text-red-600 hover:text-red-800 font-medium py-1 px-2 rounded border transition ${
                    shouldHighlight 
                      ? 'border-red-600 bg-red-50/50 shadow-[0_0_15px_rgba(34,197,94,0.5)]' 
                      : 'border-red-300 bg-red-50/50'
                  }`}
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
    </div>
  );
};

// --- TOPICS DATA STRUCTURE ---

export const topics: Topics = {
  gettingStarted: {
    cardId: 'card-getting-started',
    cardTitle: 'Getting Started',
    cardDescription: 'Set up your SpikedAI workspace...',
    icon: <Rocket style={{ width: '20px', height: '20px' }} />,
    emoji: '🚀',
    items: [
      {
        id: 'signup',
        title: 'Sign Up',
        description: 'Create your SpikedAI account and start exploring personalized meeting insights.',
        questions: [
          {
            id: 'signup-flow',
            title: 'Sign Up Process',
            emoji: '🆕',
            description: 'Simple steps to create your SpikedAI account.',
            subQuestions: [
              {
                id: 'signup-process',
                question: 'How do I sign up for SpikedAI?',
                type: 'form-demo',
                answer: `<div id="signup-content-wrapper" style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">How to Sign Up</h2><p style="margin:0 0 20px 0;">The sign-up process in <strong>SpikedAI</strong> is quick and straightforward. Follow these steps on the left panel and in the interactive form:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">Navigate to the <strong>Sign Up</strong> page in SpikedAI.</li><li style="margin:0 0 12px 0;">Fill in your details: First Name, Last Name, Email, and Password.</li><li style="margin:0 0 12px 0;">Click <strong>Create Account</strong> to create your workspace.</li><li style="margin:0 0 12px 0;">Check your inbox for a verification email.</li><li style="margin:0;">Click <strong>Verify Email</strong> to activate your account.</li></ol><p style="margin:0;">As you complete each step in the form, the checklist on the left will automatically tick and strike through the finished actions.</p></div>`
              },
              {
                id: 'signup-verify',
                question: 'How do I verify my email after signing up?',
                type: 'verification-demo',
                answer: `<div id="verify-content-wrapper" style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Confirming Your Email</h2><p style="margin:0 0 20px 0;">Email verification activates your SpikedAI account:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">Open the email from <strong>SpikedAI</strong> (arrives within 1-2 minutes)</li><li style="margin:0 0 12px 0;">Click the <strong>Confirm your email</strong> button (Try clicking the button on the right!)</li><li style="margin:0;">Your account activates instantly and you will be redirected to the login screen.</li></ol><p style="margin:0;padding:12px;background:#eef2ff;border-left:3px solid #4f46e5;border-radius:4px;font-size:14px;"><strong>Tip:</strong> If you don't receive the email, please check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</p></div>`
              },
              {
                id: 'signup-password',
                question: 'What are the password requirements?',
                type: 'password-checker',
                answer: `<div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Setting a Strong Password</h2><p style="margin:0 0 20px 0;"><strong>SpikedAI</strong> allows flexible passwords, but we recommend following security best practices:</p><div style="display:grid;grid-template-columns:1fr;gap:20px;margin:0 0 20px 0;"><div><p style="margin:0 0 12px 0;font-weight:600;">Recommended guidelines:</p><ul style="margin:0;padding-left:20px;"><li style="margin:0 0 8px 0;">Minimum <strong>8 characters</strong></li><li style="margin:0 0 8px 0;">Upper & lowercase letters</li><li style="margin:0 0 8px 0;">Include numbers</li><li style="margin:0;">Special characters (!@#$%)</li></ul></div><div><p style="margin:0 0 12px 0;font-weight:600;">Examples:</p><ul style="margin:0;padding-left:0;list-style:none;"><li style="margin:0 0 8px 0;font-family:monospace;">✓ SpikedAI2025! — <span style="color:#059669;">Strong</span></li><li style="margin:0 0 8px 0;font-family:monospace;">✓ Sales#Track24 — <span style="color:#059669;">Strong</span></li><li style="margin:0;font-family:monospace;">✗ password123 — <span style="color:#dc2626;">Weak</span></li></ul></div></div><p style="margin:0;padding:12px;background:#fefce8;border-left:3px solid #eab308;border-radius:4px;font-size:14px;"><strong>Try it out:</strong> Use the live checker on the right to test your password ideas against these rules.</p></div>`
              },
              {
                id: 'signup-not-received',
                question: "I didn't receive my verification email. What should I do?",
                type: 'gmail-folders-demo',
                answer: `
                  <div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;">
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Troubleshooting Email Delivery</h2>
                    <p style="margin:0 0 20px 0;">If the verification email hasn't arrived, it's usually due to your email provider routing it to a separate folder. Follow these steps, referencing the demo on the right:</p>
                    <ol style="margin:0 0 20px 0;padding-left:20px;">
                      <li style="margin:0 0 10px 0;">First, check your <strong>Promotions</strong> tab.</li>
                      <li style="margin:0 0 10px 0;">Next, check the <strong>Spam</strong> or <strong>Junk</strong> folders, as highlighted on the right.</li>
                      <li style="margin:0 0 10px 0;"><strong>If you find it, click "Not Spam? Move to Inbox" on the right to simulate the action.</strong> This trains your mailbox.</li>
                      <li style="margin:0;">If you still cannot find it, please contact <strong>support@Spiked.ai</strong> for manual verification.</li>
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
  const navigate = useNavigate();

  const steps = [
    { id: 'signup-process', label: 'How do I sign up?' },
    { id: 'signup-verify', label: 'How do I verify my email?' },
    { id: 'signup-password', label: 'What are the password requirements?' },
    { id: 'signup-not-received', label: 'I didn’t receive my verification email' },
  ] as const;

  type StepId = (typeof steps)[number]['id'];

  const [currentStep, setCurrentStep] = useState<StepId>('signup-process');
  const [completedSteps, setCompletedSteps] = useState<StepId[]>([]);
  const [currentArticleId, setCurrentArticleId] = useState<'signup-process' | 'signup-verify' | 'signup-password' | 'signup-not-received'>('signup-process');

  const [isSpeaking, setIsSpeaking] = useState(false);
  const voicesLoadedRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const articleItem = topics.gettingStarted.items[0];
  const subQuestions = articleItem.questions[0].subQuestions!;
  const topicData = subQuestions.find(sq => sq.id === currentArticleId)!;
  const textContent = topicData.answer;

  useEffect(() => {
    setCurrentStep(currentArticleId);
  }, [currentArticleId]);

  // Ensure voices are loaded (some browsers load asynchronously)
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;

    const onVoicesChanged = () => {
      const vs = synth.getVoices();
      if (vs && vs.length > 0) voicesLoadedRef.current = true;
    };

    // call once and also listen
    onVoicesChanged();
    synth.addEventListener('voiceschanged', onVoicesChanged);

    return () => {
      try {
        synth.removeEventListener('voiceschanged', onVoicesChanged);
      } catch {
        /* ignore if unavailable */
      }
    };
  }, []);

  // stop any speaking safely
  const stopSpeaking = () => {
    if (!('speechSynthesis' in window)) return;
    // cancel cancels and clears queue
    window.speechSynthesis.cancel();
    // also clear any lingering utterance event handlers
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current = null;
    }
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    // If already speaking -> stop
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // extract plain text from the HTML article
    const parser = new DOMParser();
    const doc = parser.parseFromString(textContent, 'text/html');
    const plainText = doc.body.textContent || '';

    if (!plainText.trim()) return;

    const synth = window.speechSynthesis;
    const voices = synth.getVoices();

    // some browsers require a tiny dummy utterance to "unlock" voices
    if (!voicesLoadedRef.current || (voices && voices.length === 0)) {
      const dummy = new SpeechSynthesisUtterance(' ');
      synth.speak(dummy);
      dummy.onend = () => {
        voicesLoadedRef.current = true;
      };
    }

    const u = new SpeechSynthesisUtterance(plainText);
    utteranceRef.current = u;
    u.rate = 1;
    u.pitch = 1;

    // pick a reasonable English voice if available
    const englishVoice = voices.find(v => v.lang === 'en-US') || voices.find(v => v.lang.startsWith('en')) || undefined;
    if (englishVoice) u.voice = englishVoice;

    let endedOrErrored = false;
    u.onstart = () => {
      setIsSpeaking(true);
    };
    u.onend = () => {
      if (endedOrErrored) return;
      endedOrErrored = true;
      setIsSpeaking(false);
      utteranceRef.current = null;
    };
    u.onerror = () => {
      if (endedOrErrored) return;
      endedOrErrored = true;
      setIsSpeaking(false);
      utteranceRef.current = null;
    };

    synth.speak(u);
  };

  // if user changes article while reading, stop reading
  useEffect(() => {
    if (isSpeaking) {
      stopSpeaking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentArticleId]);

  // top-step completion helpers
  const markStepCompleted = (id: StepId) => {
    setCompletedSteps(prev => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSignUpComplete = () => {
    markStepCompleted('signup-process');
    setCurrentStep('signup-verify');
    setCurrentArticleId('signup-verify');
  };

  const handleVerifyComplete = () => {
    markStepCompleted('signup-verify');
  };

  const handlePasswordStrong = () => {
    markStepCompleted('signup-password');
  };

  const handleInboxMove = () => {
    markStepCompleted('signup-not-received');
  };

  const handleTabClick = (id: typeof currentArticleId) => {
    setCurrentArticleId(id);
  };

  // Reset function
  const handleReset = () => {
    stopSpeaking();
    setCurrentStep('signup-process');
    setCompletedSteps([]);
    setCurrentArticleId('signup-process');
  };

  const RightSideComponent = () => {
    if (topicData.type === 'form-demo') return <SignUpFormDemo onSignUpComplete={handleSignUpComplete} currentStep={currentStep} />;
    if (topicData.type === 'verification-demo') return <VerificationSuccessDemo onVerifyComplete={handleVerifyComplete} currentStep={currentStep} />;
    if (topicData.type === 'password-checker') return <PasswordCheckerDemo onPasswordStrong={handlePasswordStrong} currentStep={currentStep} />;
    if (topicData.type === 'gmail-folders-demo') return <GmailFoldersDemo onInboxMove={handleInboxMove} currentStep={currentStep} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      {/* BEAUTIFUL HEADING SECTION */}
      <div className="w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 md:px-10 border-b border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-700 hover:text-gray-900"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Interactive User Demo
            </h1>
          </div>
          <div className="text-center">
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-6">
            Experience our platform firsthand with this interactive demonstration. Follow the steps below to explore how SpikedAI works in real-time.
          </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <span>Try each step interactively</span>
              <span className="mx-2">•</span>
              <span>Track your progress</span>
              <span className="mx-2">•</span>
              <span>Learn as you go</span>
            </div>
          </div>
        </div>
      </div>

      {/* TOP BLACK BAR */}
      <div className="w-full bg-[#020617] text-white py-3 px-4 md:px-10 flex items-center justify-between shadow-md rounded-b-xl">
        <div className="flex items-center gap-2 md:gap-3">
          <span className="text-xs uppercase tracking-widest text-gray-400">
            SIGN UP JOURNEY
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isActive = currentStep === step.id;
            return (
              <div
                key={step.id}
                className="flex items-center gap-2 text-xs md:text-sm cursor-pointer transition-all"
                onClick={() => setCurrentStep(step.id)}
              >
                <div
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-full border text-[11px] font-semibold
                    ${isActive ? 'bg-white text-black border-white' : ''}
                    ${isCompleted && !isActive ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-600 text-gray-300' : ''}
                  `}
                >
                  {isCompleted && !isActive ? <CheckCircle className="w-3 h-3" /> : index + 1}
                </div>
                <span
                  className={`
                    hidden md:inline-block
                    ${isActive ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center ml-4 space-x-3">
          <button
            onClick={handleReset}
            disabled={currentStep === 'signup-process' && completedSteps.length === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              currentStep !== 'signup-process' || completedSteps.length > 0
                ? 'bg-white text-gray-800 border border-gray-700 hover:bg-gray-100'
                : 'bg-gray-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Undo
          </button>
          <button
            onClick={() => {
              const currentIndex = steps.findIndex(s => s.id === currentStep);
              if (currentIndex < steps.length - 1) {
                const nextStep = steps[currentIndex + 1];
                setCurrentStep(nextStep.id);
                setCurrentArticleId(nextStep.id as typeof currentArticleId);
              }
            }}
            disabled={steps.findIndex(s => s.id === currentStep) >= steps.length - 1}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              steps.findIndex(s => s.id === currentStep) < steps.length - 1
                ? 'bg-indigo-400 text-gray-900 font-semibold hover:bg-indigo-300 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Next Step ({steps.findIndex(s => s.id === currentStep) + 1}/{steps.length})
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="p-6 md:p-10 flex-1 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl w-full">
        {/* Tabs headings (questions) */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto no-scrollbar">
          <BookOpen className="w-5 h-5 text-gray-400 mr-2 self-center flex-shrink-0" />
          {subQuestions.map((q) => {
            const shouldHighlightTab = q.id === currentStep && q.id !== currentArticleId;
            return (
              <button
                key={q.id}
                onClick={() => handleTabClick(q.id as any)}
                className={`py-2 px-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  q.id === currentArticleId
                    ? 'border-indigo-600 text-indigo-600'
                    : shouldHighlightTab
                    ? 'text-gray-500 border-transparent hover:text-gray-700 shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {q.question}
              </button>
            );
          })}
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
                <Send className="w-4 h-4 mr-1 transform -rotate-45" /> Read Aloud
              </>
            )}
          </button>
        </h1>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start py-5">
          <div dangerouslySetInnerHTML={{ __html: textContent }} />
          <div className="flex justify-center md:justify-end">
            <RightSideComponent />
          </div>
        </div>
        </div>
      </div>

      {/* Other knowledge components you already had */}
      <div>
        <KnowledgeSign />
        <KnowledgePersona />
        <KnowledgeDocx />
        <KnowledgeNote />
      </div>
    </div>
  );
};

export default App;
