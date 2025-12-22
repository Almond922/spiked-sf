import React, { useState, FormEvent, FC, useEffect } from 'react';
import {
  Rocket, Mail, Lock, User, Zap, BookOpen, Settings, CheckCircle,
  XCircle, Clock, Send, Search, Bell, Menu, Tag, Users, Folder,
  Inbox, Filter, LogIn, Volume2, ChevronRight, RefreshCw
} from 'lucide-react';

// --- INTERFACES (Typescript Definitions) ---

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
  type: 'signin-form-demo' | 'password-reset-demo' | 'mfa-demo' | 'sso-flow-demo';
}
interface Question { id: string; title: string; emoji: string; description: string; subQuestions?: SubQuestion[]; }
interface Item { id: string; title: string; description: string; questions: Question[]; }
interface Topic { cardId: string; cardTitle: string; cardDescription: string; icon: JSX.Element; emoji: string; items: Item[]; }
interface Topics { [key: string]: Topic; }


// --- CUSTOM HOOK: SPEECH SYNTHESIS ---
// Only speaks when speak() is called, no auto-read.

const useSpeechSynthesis = (contentHTML: string) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const stripHtml = (html: string) => {
    let text = html.replace(/<[^>]+>/g, ' ');
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
    text = text.replace(/style="[^"]*"/g, '');
    text = text.replace(/<div id="[a-z\-]+-content-wrapper"[^>]*>([\s\S]*?)<\/div>/i, '$1');
    text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (match, p1) => `. ${p1.trim()}`);
    text = text.replace(/<\/?(strong|b)[^>]*>/gi, '');
    return text.trim().replace(/\s+/g, ' ');
  };

  const speak = () => {
    if (!isSupported || !contentHTML) return;

    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    const textToSpeak = stripHtml(contentHTML);
    const u = new SpeechSynthesisUtterance(textToSpeak);

    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    u.onerror = () => setIsSpeaking(false);
    u.rate = 1.0;
    u.pitch = 1.0;

    setUtterance(u);
    window.speechSynthesis.speak(u);
  };

  const stop = () => {
    if (isSupported && isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (utterance) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    };
  }, [utterance]);

  return { speak, stop, isSpeaking, isSupported };
};


// Shared checklist pill styles
const ChecklistPill: FC<{ label: string; done: boolean; index: number }> = ({ label, done, index }) => {
  return (
    <div
      className={`
        flex items-center justify-between w-full text-[11px] rounded-full px-3 py-2
        ${done
          ? 'bg-[#ECFDF5] border border-[#22C55E] text-[#16A34A] line-through'
          : 'bg-[#020617] border border-[#1F2937] text-[#E5E7EB]'}
      `}
    >
      <div className="flex items-center gap-1">
        <span
          className={`
            w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-semibold
            ${done ? 'bg-[#22C55E] text-white' : 'bg-[#020617] border border-[#4B5563]'}
          `}
        >
          {done ? <CheckCircle className="w-3 h-3" /> : index + 1}
        </span>
        <span>{label}</span>
      </div>
    </div>
  );
};


// --- DEMO COMPONENT 1: SIGN IN FORM ---

const SignInFormDemo: FC<{ currentArticleId?: string }> = ({ currentArticleId = 'standard-signin' }) => {
  const shouldHighlight = currentArticleId === 'standard-signin';
  const [status, setStatus] = useState<'ready' | 'signingIn' | 'success' | 'error'>('ready');
  const [errorMessage, setErrorMessage] = useState('');

  const loginSteps = [
    'Navigate to Sign In page',
    'Enter email address',
    'Enter password',
    'Click "Sign In" button',
  ];

  const [completedSteps, setCompletedSteps] = useState<boolean[]>([true, false, false, false]);

  const markStepDone = (index: number) => {
    setCompletedSteps(prev => {
      if (prev[index]) return prev;
      const next = [...prev];
      next[index] = true;
      return next;
    });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    if (email) markStepDone(1);
    if (password) markStepDone(2);
    markStepDone(3);

    setStatus('signingIn');
    setErrorMessage('');

    setTimeout(() => {
      if (email === "test@spiked.ai" && password === "StrongPass123!") {
        setStatus('success');
      } else {
        setErrorMessage("Invalid credentials. Please check your email and password.");
        setStatus('error');
        setTimeout(() => setStatus('ready'), 3000);
      }
    }, 1500);
  };

  return (
    <div
      className="flex w-full max-w-full md:max-w-[600px] rounded-xl overflow-hidden shadow-2xl bg-white"
    >
      {/* LEFT DARK PANEL */}
      <div className="hidden md:flex flex-col justify-between p-6 md:p-8 w-5/12 bg-[#080808] text-white">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl md:text-5xl text-red-600 font-extrabold mr-1">!</span>
            <h2 className="text-xl md:text-2xl font-bold font-sans">SpikedAI</h2>
          </div>
          <p className="text-xs opacity-80 mb-4 font-sans">The Revenue OS Platform.</p>
          <p className="text-[11px] text-gray-300 mt-2">
            Follow these steps as you sign in. Completed ones will tick off below.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {loginSteps.map((step, idx) => (
            <ChecklistPill key={idx} label={step} done={completedSteps[idx]} index={idx} />
          ))}
        </div>
      </div>

      {/* RIGHT WHITE PANEL */}
      <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-sans">Welcome Back</h3>
        <p className="text-sm text-gray-500 mb-6 font-sans">Sign in to continue to your dashboard</p>

        {status === 'success' ? (
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <Zap className="w-6 h-6 mx-auto text-green-600 mb-3" />
            <p className="text-md font-medium text-green-700 font-sans">Sign-in Successful!</p>
            <p className="text-sm text-green-600 font-sans">Redirecting you to the SpikedAI dashboard...</p>
            <button
              onClick={() => {
                setStatus('ready');
              }}
              className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium font-sans"
            >
              Start Over
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 text-sm rounded-lg flex items-center">
                <XCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {errorMessage}
              </div>
            )}
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
                  defaultValue="test@spiked.ai"
                  placeholder="john@company.com"
                  required
                  className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-gray-300'
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
                  defaultValue="StrongPass123!"
                  placeholder="Enter your password"
                  required
                  className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium font-sans">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={status === 'signingIn'}
              className={`w-full py-2 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition duration-150 ease-in-out disabled:bg-gray-400 mt-4 font-sans ${
                shouldHighlight ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''
              }`}
            >
              {status === 'signingIn' ? 'Signing In...' : 'Sign In'}
            </button>
            <p className="text-center text-xs text-gray-500 mt-4 font-sans">
              Don't have an account?{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign up here
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};


// --- DEMO COMPONENT 2: PASSWORD RESET FLOW ---

const PasswordResetDemo: FC<{ currentArticleId?: string }> = ({ currentArticleId = 'forgot-password' }) => {
  const shouldHighlight = currentArticleId === 'forgot-password';
  const [step, setStep] = useState<'email' | 'linkSent' | 'resetForm'>('email');
  const [email, setEmail] = useState('');

  const resetSteps = [
    'Click “Forgot Password?”',
    'Enter registered email',
    'Check inbox and open link',
    'Set new password',
  ];

  const [completed, setCompleted] = useState<boolean[]>([true, false, false, false]);

  const markResetStep = (idx: number) => {
    setCompleted(prev => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const handleEmailSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    markResetStep(1);
    setStep('linkSent');
  };

  const handleSimulateLink = () => {
    markResetStep(2);
    setStep('resetForm');
  };

  const handleResetPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    markResetStep(3);
    alert('Password successfully reset! Proceeding to Sign In.');
    setStep('email');
    setEmail('');
  };

  return (
    <div
      className="flex w-full max-w-full md:max-w-[600px] rounded-xl overflow-hidden shadow-2xl bg-white"
    >
      {/* Dark left panel with checklist */}
      <div className="hidden md:flex flex-col justify-between p-6 md:p-8 w-5/12 bg-[#080808] text-white">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl md:text-5xl text-red-600 font-extrabold mr-1">!</span>
            <h2 className="text-xl md:text-2xl font-bold font-sans">SpikedAI</h2>
          </div>
          <p className="text-xs opacity-80 mb-2 font-sans">Password Recovery.</p>
          <p className="text-[11px] text-gray-300">
            Follow the reset steps; they’ll tick off as you move through this demo.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {resetSteps.map((s, idx) => (
            <ChecklistPill key={idx} label={s} done={completed[idx]} index={idx} />
          ))}
        </div>
      </div>

      {/* Right white panel */}
      <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-sans">
          {step === 'email' ? 'Forgot Password?' : step === 'linkSent' ? 'Check Your Email' : 'Set New Password'}
        </h3>
        <p className="text-sm text-gray-500 mb-6 font-sans">
          {step === 'email'
            ? 'Enter your registered email to receive a reset link.'
            : step === 'linkSent'
              ? `A link has been sent to ${email || 'your email address'}.`
              : 'Enter and confirm your new password.'}
        </p>

        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reset-email"
                className="text-xs font-medium text-gray-700 block mb-1 font-sans"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  id="reset-email"
                  name="reset-email"
                  placeholder="john@company.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full p-2 pl-9 border rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight && step === 'email' ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 ${
                shouldHighlight && step === 'email' ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''
              }`}
            >
              Send Reset Link
            </button>
          </form>
        )}

        {step === 'linkSent' && (
          <div className="text-center p-6 bg-yellow-50 rounded-lg border border-yellow-200">
            <Send className="w-6 h-6 mx-auto text-yellow-600 mb-3" />
            <p className="text-md font-medium text-yellow-700 font-sans mb-3">
              Password reset link sent!
            </p>
            <p className="text-sm text-yellow-600 font-sans mb-4">
              Please check your inbox and click the link. (Simulate the link click below)
            </p>
            <button
              onClick={handleSimulateLink}
              className={`text-sm py-2 px-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition ${
                shouldHighlight && step === 'linkSent' ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''
              }`}
            >
              Simulate Link Click / Go to Reset Form
            </button>
          </div>
        )}

        {step === 'resetForm' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label
                htmlFor="new_password"
                className="text-xs font-medium text-gray-700 block mb-1 font-sans"
              >
                New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  id="new_password"
                  name="new_password"
                  placeholder="Minimum 8 characters"
                  required
                  className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="confirm_new_password"
                className="text-xs font-medium text-gray-700 block mb-1 font-sans"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  id="confirm_new_password"
                  name="confirm_new_password"
                  placeholder="Confirm your new password"
                  required
                  className="w-full p-2 pl-9 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 transition font-sans"
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-150 ${
                shouldHighlight && step === 'resetForm' ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''
              }`}
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};


// --- DEMO COMPONENT 3: MFA (2FA) DEMO ---

const MFADemo: FC<{ currentArticleId?: string }> = ({ currentArticleId = 'mfa-login' }) => {
  const shouldHighlight = currentArticleId === 'mfa-login';
  const [step, setStep] = useState<'code' | 'verified' | 'error'>('code');
  const [code, setCode] = useState('');

  const mfaSteps = [
    'Enter email & password',
    'See MFA screen',
    'Open authenticator app',
    'Enter 6-digit code',
  ];
  const [done, setDone] = useState<boolean[]>([true, true, false, false]);

  const markMfa = (idx: number) => {
    setDone(prev => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const handleCodeSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    markMfa(2);
    markMfa(3);

    if (code === '123456') {
      setStep('verified');
      setTimeout(() => {
        setStep('code');
        setCode('');
      }, 3000);
    } else {
      setStep('error');
      setTimeout(() => {
        setStep('code');
        setCode('');
      }, 1500);
    }
  };

  return (
    <div
      className="flex w-full max-w-full md:max-w-[600px] rounded-xl overflow-hidden shadow-2xl bg-white"
    >
      {/* Left dark panel with MFA checklist */}
      <div className="hidden md:flex flex-col justify-between p-6 md:p-8 w-5/12 bg-[#080808] text-white">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl md:text-5xl text-red-600 font-extrabold mr-1">!</span>
            <h2 className="text-xl md:text-2xl font-bold font-sans">SpikedAI</h2>
          </div>
          <p className="text-xs opacity-80 mb-2 font-sans">Security Check.</p>
          <p className="text-[11px] text-gray-300">
            This demo simulates entering an authenticator code for MFA.
          </p>
        </div>

        <div className="mt-4 space-y-2">
          {mfaSteps.map((s, idx) => (
            <ChecklistPill key={idx} label={s} done={done[idx]} index={idx} />
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="w-full md:w-7/12 p-6 md:p-8 bg-white flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-1 font-sans">
          Two-Factor Authentication
        </h3>
        <p className="text-sm text-gray-500 mb-6 font-sans">
          Enter the 6-digit code from your authenticator app.
        </p>

        {step === 'verified' && (
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="w-6 h-6 mx-auto text-green-600 mb-3" />
            <p className="text-md font-medium text-green-700 font-sans">Code Verified!</p>
            <p className="text-sm text-green-600 font-sans">Access granted to the dashboard.</p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
            <XCircle className="w-6 h-6 mx-auto text-red-600 mb-3" />
            <p className="text-md font-medium text-red-700 font-sans">Error!</p>
            <p className="text-sm text-red-600 font-sans">
              Invalid code. Please try again. (Simulated)
            </p>
          </div>
        )}

        {step === 'code' && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="mfa-code"
                className="text-xs font-medium text-gray-700 block mb-1 font-sans"
              >
                Authentication Code (Hint: 123456)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  id="mfa-code"
                  name="mfa-code"
                  placeholder="e.g., 123456"
                  required
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className={`w-full p-2 pl-9 text-center tracking-widest text-lg border-2 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition font-sans ${
                    shouldHighlight && step === 'code' ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-gray-300'
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-2 bg-gray-900 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-150 ${
                shouldHighlight && step === 'code' ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''
              }`}
            >
              Verify Code
            </button>
          </form>
        )}
        <p className="text-center text-xs text-gray-500 mt-4 font-sans">
          <a href="#" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Lost your device?
          </a>
        </p>
      </div>
    </div>
  );
};


// --- DEMO COMPONENT 4: SSO FLOW DEMO ---

const SSOFlowDemo: FC<{ currentArticleId?: string }> = ({ currentArticleId = 'sso-login' }) => {
  const shouldHighlight = currentArticleId === 'sso-login';
  const [status, setStatus] = useState<'ready' | 'redirecting' | 'authenticated'>('ready');

  const ssoSteps = [
    'Click “Sign In with SSO”',
    'Redirect to IdP (Okta, etc.)',
    'Authenticate on IdP',
    'Return to spikedAI dashboard',
  ];
  const [ssoDone, setSsoDone] = useState<boolean[]>([false, false, false, false]);

  const markSso = (idx: number) => {
    setSsoDone(prev => {
      if (prev[idx]) return prev;
      const next = [...prev];
      next[idx] = true;
      return next;
    });
  };

  const handleSSO = () => {
    setStatus('redirecting');
    markSso(0);
    setTimeout(() => {
      markSso(1);
      markSso(2);
      markSso(3);
      setStatus('authenticated');
    }, 2000);
  };

  const resetDemo = () => {
    setStatus('ready');
    setSsoDone([false, false, false, false]);
  };

  return (
    <div
      className="w-full max-w-full md:max-w-[600px] rounded-xl shadow-2xl border border-gray-100 bg-white flex flex-col md:flex-row overflow-hidden min-h-[400px]"
    >
      {/* Left dark checklist column for SSO */}
      <div className="hidden md:flex flex-col justify-between w-5/12 bg-[#080808] text-white p-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <span className="text-4xl md:text-5xl text-red-600 font-extrabold mr-1">!</span>
            <h2 className="text-xl md:text-2xl font-bold font-sans">SpikedAI</h2>
          </div>
          <p className="text-xs opacity-80 mb-2 font-sans">SSO Authentication.</p>
          <p className="text-[11px] text-gray-300">
            This demo shows the flow when signing in via your corporate identity provider.
          </p>
        </div>
        <div className="mt-4 space-y-2">
          {ssoSteps.map((s, idx) => (
            <ChecklistPill key={idx} label={s} done={ssoDone[idx]} index={idx} />
          ))}
        </div>
      </div>

      {/* Right side */}
      <div className="flex-1 p-6 flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Single Sign-On (SSO) Demo</h3>

        {status === 'authenticated' ? (
          <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200 w-full max-w-md">
            <CheckCircle className="w-8 h-8 mx-auto text-green-600 mb-3" />
            <p className="text-xl font-bold text-green-700 font-sans mb-2">SSO Successful!</p>
            <p className="text-sm text-green-600 font-sans">
              You have been authenticated via your corporate provider.
            </p>
            <button
              onClick={resetDemo}
              className="mt-4 text-xs text-indigo-600 hover:text-indigo-800 font-medium font-sans"
            >
              Reset Demo
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={handleSSO}
              disabled={status === 'redirecting'}
              className={`w-full max-w-sm py-3 px-6 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition duration-150 disabled:bg-indigo-400 flex items-center justify-center mb-4 ${
                shouldHighlight && status === 'ready' ? 'shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''
              }`}
            >
              {status === 'redirecting' ? (
                <Clock className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              {status === 'redirecting' ? 'Redirecting to Provider...' : 'Sign In with SSO'}
            </button>

            <div className="flex items-center w-full max-w-sm my-4">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button
              onClick={() => alert("Simulating Google sign-in...")}
              className="w-full max-w-sm py-3 px-6 border border-gray-300 bg-white text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-50 transition duration-150 flex items-center justify-center"
            >
              <Zap className="w-5 h-5 mr-2 text-red-600" />
              Sign In with Google
            </button>

            <p className="text-xs text-gray-500 mt-6 text-center max-w-sm">
              SSO allows you to use your existing company credentials for a seamless login experience.
            </p>
          </>
        )}
      </div>
    </div>
  );
};


// --- TOPICS DATA STRUCTURE ---

export const topics: Topics = {
  accessingAccount: {
    cardId: 'card-accessing-account',
    cardTitle: 'Accessing Your Account',
    cardDescription: 'Troubleshooting sign-in, password resets, and MFA.',
    icon: <LogIn style={{ width: '20px', height: '20px' }} />,
    emoji: '🔐',
    items: [
      {
        id: 'signin',
        title: 'Sign In',
        description: 'Logging into your spikedAI workspace.',
        questions: [
          {
            id: 'signin-flow',
            title: 'Standard Sign In',
            emoji: '🔑',
            description: 'The standard process for accessing your account.',
            subQuestions: [
              {
                id: 'standard-signin',
                question: 'How do I sign in to spikedAI?',
                type: 'signin-form-demo',
                answer: `<div id="signin-content-wrapper" style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Standard Sign-In Procedure</h2><p style="margin:0 0 20px 0;">To log in to your SpikedAI dashboard, please follow these steps:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">Navigate to the <strong>Sign In</strong> page.</li><li style="margin:0 0 12px 0;">Enter your registered <strong>Email Address</strong>.</li><li style="margin:0 0 12px 0;">Enter your <strong>Password</strong> (The demo on the right uses: <strong>test@spiked.ai</strong> and <strong>StrongPass123!</strong>).</li><li style="margin:0;">Click the <strong>Sign In</strong> button.</li></ol><p style="margin:0;padding:12px;background:#eef2ff;border-left:3px solid #4f46e5;border-radius:4px;font-size:14px;"><strong>Note:</strong> If you are required to use Two-Factor Authentication (MFA), a second screen will appear after submitting this form.</p></div>`
              },
              {
                id: 'forgot-password',
                question: 'I forgot my password. How do I reset it?',
                type: 'password-reset-demo',
                answer: `<div id="reset-content-wrapper" style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Password Reset Flow</h2><p style="margin:0 0 20px 0;">If you can't remember your password, you can easily reset it:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">Click the <strong>Forgot Password?</strong> link on the Sign In screen.</li><li style="margin:0 0 12px 0;">Enter your email address in the field on the right and click <strong>Send Reset Link</strong>.</li><li style="margin:0 0 12px 0;">Check your email for the reset link (check Spam/Junk if necessary).</li><li style="margin:0;">Click the link in the email and set your new password.</li></ol><p style="margin:0;padding:12px;background:#fefce8;border-left:3px solid #eab308;border-radius:4px;font-size:14px;"><strong>Tip:</strong> The demo on the right simulates the entire email and reset process for demonstration.</p></div>`
              },
              {
                id: 'mfa-login',
                question: 'How does Two-Factor Authentication (MFA) work?',
                type: 'mfa-demo',
                answer: `<div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;"><h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Using Two-Factor Authentication (MFA)</h2><p style="margin:0 0 20px 0;">MFA adds an extra layer of security, requiring a unique code in addition to your password:</p><ol style="margin:0 0 20px 0;padding-left:20px;list-style-type:decimal;"><li style="margin:0 0 12px 0;">After entering your correct email and password, the MFA screen appears.</li><li style="margin:0 0 12px 0;">Open your authenticator app (e.g., Google Authenticator, Authy).</li><li style="margin:0 0 12px 0;">Enter the 6-digit, time-sensitive code into the field on the right.</li><li style="margin:0;">Click <strong>Verify Code</strong> to complete the sign-in.</li></ol><p style="margin:0;padding:12px;background:#f0f9ff;border-left:3px solid #0ea5e9;border-radius:4px;font-size:14px;"><strong>Demo:</strong> Enter <strong>123456</strong> into the field on the right to successfully authenticate.</p></div>`
              },
              {
                id: 'sso-login',
                question: 'Can I sign in using my corporate SSO?',
                type: 'sso-flow-demo',
                answer: `
                  <div style="line-height:1.8;color:#374151;font-size:15px;text-align: left;">
                    <h2 style="font-size: 20px; font-weight: 600; margin-bottom: 20px; color: #1f2937;">Single Sign-On (SSO) Integration</h2>
                    <p style="margin:0 0 20px 0;"><strong>spikedAI</strong> supports corporate SSO integration (SAML 2.0) for enterprise customers, allowing sign-in with your existing work credentials.</p>

                    <ul style="margin:0 0 20px 0;padding-left:20px;">
                      <li style="margin:0 0 10px 0;">Click the <strong>Sign In with SSO</strong> button on the login screen.</li>
                      <li style="margin:0 0 10px 0;">You will be redirected to your company's login portal (e.g., Okta, Azure AD).</li>
                      <li style="margin:0;">After successful authentication there, you will be automatically returned to the spikedAI dashboard.</li>
                    </ul>

                    <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #6366f1;border-radius:4px;font-size:14px;">
                      <strong>Note:</strong> SSO must be enabled for your domain by your account administrator. The demo on the right simulates this authentication flow.
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

type ArticleId = 'standard-signin' | 'forgot-password' | 'mfa-login' | 'sso-login';

const App: FC = () => {
  const [currentArticleId, setCurrentArticleId] = useState<ArticleId>('standard-signin');

  const articleTopic = topics.accessingAccount;
  const articleItem = articleTopic.items[0];
  const subQuestions = articleItem.questions[0].subQuestions!;

  const topicData = subQuestions.find(sq => sq.id === currentArticleId)! as SubQuestion;
  const textContent = topicData.answer;

  const { speak, stop, isSpeaking, isSupported } = useSpeechSynthesis(textContent);

  // Decide which right-side interactive demo to show
  const RightSideComponent = () => {
    if (topicData.type === 'signin-form-demo') return <SignInFormDemo currentArticleId={currentArticleId} />;
    if (topicData.type === 'password-reset-demo') return <PasswordResetDemo currentArticleId={currentArticleId} />;
    if (topicData.type === 'mfa-demo') return <MFADemo currentArticleId={currentArticleId} />;
    if (topicData.type === 'sso-flow-demo') return <SSOFlowDemo currentArticleId={currentArticleId} />;
    return null;
  };

  const handleTabClick = (id: ArticleId) => {
    stop();
    setCurrentArticleId(id);
  };

  // Reset function
  const handleReset = () => {
    stop();
    setCurrentArticleId('standard-signin');
  };

  // Top black step bar
  const topSteps = [
    { label: '1', text: 'Sign In basics' },
    { label: '2', text: 'Password reset' },
    { label: '3', text: 'MFA login' },
    { label: '4', text: 'SSO sign-in' },
  ];

  const mapArticleToTopIndex = (id: ArticleId) => {
    if (id === 'standard-signin') return 0;
    if (id === 'forgot-password') return 1;
    if (id === 'mfa-login') return 2;
    if (id === 'sso-login') return 3;
    return 0;
  };

  const activeTopIndex = mapArticleToTopIndex(currentArticleId);

  return (
    <div className="min-h-screen bg-gray-50 font-inter flex flex-col">
      {/* TOP BLACK BAR */}
      <div className="w-full bg-[#020617] text-white py-3 px-4 md:px-10 flex flex-wrap items-center justify-between gap-2 md:gap-4 shadow-md rounded-b-xl">
        <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-shrink">
          <span className="text-sm md:text-base lg:text-lg uppercase tracking-widest font-semibold text-white whitespace-nowrap">
            SIGN IN JOURNEY
          </span>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          {topSteps.map((step, index) => {
            const isActive = index === activeTopIndex;
            const isCompleted = index < activeTopIndex;
            return (
              <div
                key={step.label}
                className="flex items-center gap-2 text-xs md:text-sm cursor-pointer transition-all"
                onClick={() => {
                  if (index === 0) handleTabClick('standard-signin');
                  if (index === 1) handleTabClick('forgot-password');
                  if (index === 2) handleTabClick('mfa-login');
                  if (index === 3) handleTabClick('sso-login');
                }}
              >
                <div
                  className={`
                    w-6 h-6 flex items-center justify-center rounded-full border text-[11px] font-semibold
                    ${isActive ? 'bg-white text-black border-white' : ''}
                    ${isCompleted && !isActive ? 'bg-green-500 border-green-500 text-white' : ''}
                    ${!isActive && !isCompleted ? 'border-gray-600 text-gray-300' : ''}
                  `}
                >
                  {isCompleted && !isActive ? <CheckCircle className="w-3 h-3" /> : step.label}
                </div>
                <span
                  className={`
                    hidden md:inline-block
                    ${isActive ? 'text-white' : 'text-gray-400'}
                  `}
                >
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center ml-0 md:ml-4 space-x-2 md:space-x-3 flex-wrap gap-2">
          <button
            onClick={handleReset}
            disabled={activeTopIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTopIndex > 0
                ? 'bg-white text-gray-800 border border-gray-700 hover:bg-gray-100'
                : 'bg-gray-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Undo
          </button>
          <button
            onClick={() => {
              const nextIndex = activeTopIndex + 1;
              if (nextIndex === 1) handleTabClick('forgot-password');
              else if (nextIndex === 2) handleTabClick('mfa-login');
              else if (nextIndex === 3) handleTabClick('sso-login');
            }}
            disabled={activeTopIndex >= 3}
            className={`flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${
              activeTopIndex < 3
                ? 'bg-indigo-400 text-gray-900 font-semibold hover:bg-indigo-300 shadow-[0_0_20px_rgba(34,197,94,0.6)]'
                : 'bg-indigo-600 opacity-50 text-white cursor-not-allowed'
            }`}
          >
            <ChevronRight className="w-4 h-4 mr-2" />
            Next Step ({activeTopIndex + 1}/4)
          </button>
        </div>
      </div>

      {/* MAIN CARD */}
      <div className="p-6 md:p-10 flex-1 flex items-center justify-center">
        <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100 max-w-6xl w-full">
          {/* Article tabs (top white bar) */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <LogIn className="w-5 h-5 text-gray-400 mr-2 self-center flex-shrink-0" />
            {subQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleTabClick(q.id as ArticleId)}
                className={`py-2 px-4 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  q.id === currentArticleId
                    ? 'border-indigo-600 text-indigo-600 bg-indigo-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {q.question}
              </button>
            ))}
          </div>

          {/* Title + Read Aloud */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
            <h1 className="text-2xl font-bold text-gray-900">
              Article: {topicData.question}
            </h1>

            {isSupported && (
              <button
                onClick={isSpeaking ? stop : speak}
                className={`flex items-center text-sm font-medium py-1 px-3 rounded-full transition-colors ${
                  isSpeaking
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-indigo-500 text-white hover:bg-indigo-600'
                }`}
                title={isSpeaking ? "Stop Reading" : "Read Article Aloud"}
              >
                <Volume2 className={`w-4 h-4 mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
                {isSpeaking ? 'Stop Voice' : 'Read Aloud'}
              </button>
            )}
          </div>

          {/* Content + Demo */}
          <div
            style={{ padding: '20px 0' }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start"
          >
            {/* LEFT COLUMN – article text */}
            <div className="text-content-container">
              <div dangerouslySetInnerHTML={{ __html: textContent }} />
              {isSpeaking && (
                <p className="mt-4 p-3 bg-indigo-50 text-indigo-700 text-xs rounded-lg flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" /> The text is currently being read aloud by your browser.
                </p>
              )}
            </div>

            {/* RIGHT COLUMN – interactive demo */}
            <div className="flex justify-center md:justify-end">
              <RightSideComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
