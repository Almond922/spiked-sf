import React from 'react';
import { Rocket,Book, Settings, FileText, Mic, Layout, ArrowLeft, ChevronDown, Search,  Zap, Code, Users, Target, NotebookPen, LayoutDashboard, BookOpen, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import style from 'react-syntax-highlighter/dist/esm/styles/hljs/a11y-dark';

interface SubQuestion {
  id: string;
  question: string;
  answer: string;
}

interface Question {
  id: string;
  title: string;
  emoji: string;
  description: string;
  details?: string;
  subQuestions?: SubQuestion[];
}

interface Item {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface Topic {
  cardId: string;
  cardTitle: string;
  cardDescription: string;
  icon: JSX.Element;
  emoji: string;
  items: Item[];
}

interface Topics {
  [key: string]: Topic;
}

export const topics: Topics = {
  gettingStarted: {
    cardId: 'card-getting-started',
    cardTitle: 'Getting Started',
    cardDescription: 'Set up your spikedAI workspace — personalize your AI, upload essential documents, and prepare your environment before starting your first meeting.',
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
          answer: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:flex;flex-direction:column;justify-content:center;">
                <p style="margin:0 0 20px 0;">The sign-up process in <strong>spikedAI</strong> is quick and straightforward. Follow these steps:</p>
                
                <ol style="margin:0 0 20px 0;padding-left:20px;">
                  <li style="margin:0 0 12px 0;">Navigate to the <strong>Sign Up</strong> page</li>
                  <li style="margin:0 0 12px 0;">Fill in your details: First Name, Last Name, Email, and Password</li>
                  <li style="margin:0 0 12px 0;">Click <strong>Create Account</strong></li>
                  <li style="margin:0 0 12px 0;">Check your inbox for a verification email</li>
                  <li style="margin:0;">Click <strong>Verify Email</strong> to activate</li>
                </ol>

                <p style="margin:0;">After verification, you can immediately log in to your workspace.</p>
              </div>
              
              <div style="display:flex;justify-content:center;align-items:start;">
                <img 
                  src="/tutorial/signup.png" 
                  alt="Sign Up Screenshot" 
                  style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'signup-verify',
          question: 'How do I verify my email after signing up?',
          answer: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:flex;flex-direction:column;justify-content:center;">
                <p style="margin:0 0 20px 0;">Email verification activates your spikedAI account:</p>
                
                <ol style="margin:0 0 20px 0;padding-left:20px;">
                  <li style="margin:0 0 12px 0;">Open the email from <strong>spikedAI</strong> (arrives within 1-2 minutes)</li>
                  <li style="margin:0 0 12px 0;">Click the <strong>Verify Email</strong> button</li>
                  <li style="margin:0;">Your account activates instantly</li>
                </ol>

                <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                  <strong>Tip:</strong> Check your <strong>Spam</strong> or <strong>Promotions</strong> folder if you don't see it.
                </p>
              </div>
              
              <div style="display:flex;justify-content:center;align-items:start;">
                <img 
                  src="/tutorial/verificationmail.png" 
                  alt="Email Verification Screenshot" 
                  style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'signup-password',
          question: 'What are the password requirements?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;"><strong>spikedAI</strong> allows flexible passwords, but we recommend following security best practices:</p>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 12px 0;font-weight:600;">Recommended guidelines:</p>
                  <ul style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 8px 0;">Minimum <strong>8 characters</strong></li>
                    <li style="margin:0 0 8px 0;">Upper & lowercase letters</li>
                    <li style="margin:0 0 8px 0;">Include numbers</li>
                    <li style="margin:0;">Special characters (!@#$%)</li>
                  </ul>
                </div>
                <div>
                  <p style="margin:0 0 12px 0;font-weight:600;">Examples:</p>
                  <ul style="margin:0;padding-left:0;list-style:none;">
                    <li style="margin:0 0 8px 0;font-family:monospace;">✓ SpikedAI2025! — <span style="color:#059669;">Strong</span></li>
                    <li style="margin:0 0 8px 0;font-family:monospace;">✓ Sales#Track24 — <span style="color:#059669;">Strong</span></li>
                    <li style="margin:0;font-family:monospace;">✗ password123 — <span style="color:#dc2626;">Weak</span></li>
                  </ul>
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'signup-not-received',
          question: 'I didn\'t receive my verification email. What should I do?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">If the verification email hasn't arrived, try these steps:</p>
              
              <ol style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;">Check <strong>Spam</strong>, <strong>Junk</strong>, or <strong>Promotions</strong> folders</li>
                <li style="margin:0 0 10px 0;">Click <strong>Resend Verification Email</strong> on the login page</li>
                <li style="margin:0 0 10px 0;">Verify your email address was entered correctly</li>
                <li style="margin:0;">Contact <strong>support@spiked.ai</strong> if still not received</li>
              </ol>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Emails typically arrive within <strong>1-2 minutes</strong>.
              </p>
            </div>
          `
        },
        {
          id: 'signup-email-reuse',
          question: 'Can I create multiple accounts with the same email?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;"><strong>No</strong>, each email can only link to <strong>one spikedAI account</strong> for security.</p>

              <p style="margin:0 0 12px 0;font-weight:600;">Alternative options:</p>
              <ul style="margin:0;padding-left:20px;">
                <li style="margin:0 0 8px 0;">Use a different personal email</li>
                <li style="margin:0 0 8px 0;">Create a new email account</li>
                <li style="margin:0;">Use your work email</li>
              </ul>
            </div>
          `
        }
      ]
    }
  ]
},

{
  id: 'signin',
  title: 'Sign In',
  description: 'Learn how to access your spikedAI account securely and quickly.',
  questions: [
    {
      id: 'signin-main',
      title: 'Sign In Process',
      emoji: '🔐',
      description: 'Everything you need to know about logging in to spikedAI.',
      subQuestions: [
        {
          id: 'signin-email',
          question: 'How do I login using my email and password?',
          answer: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:flex;flex-direction:column;justify-content:center;">
                <p style="margin:0 0 20px 0;">Access your spikedAI workspace with your credentials:</p>
                
                <ol style="margin:0 0 20px 0;padding-left:20px;">
                  <li style="margin:0 0 12px 0;">Navigate to the <strong>Sign In</strong> page</li>
                  <li style="margin:0 0 12px 0;">Enter your <strong>Email Address</strong> and <strong>Password</strong></li>
                
                  <li style="margin:0;">Click <strong>Sign In</strong></li>
                </ol>

                <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
  <strong>Security Tip:</strong> Use the <strong>"Keep me signed in"</strong> option only on your personal or trusted devices to protect your account from unauthorized access.
</p>
              </div>
              
              <div style="display:flex;justify-content:center;align-items:start;">
                <img 
                  src="/tutorial/sign in.png" 
                  alt="Sign In Screenshot" 
                  style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'signin-google',
          question: 'How do I login using my Google account?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Sign in faster with Google — no password required:</p>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
                <div>
                  <p style="margin:0 0 12px 0;font-weight:600;">Steps:</p>
                  <ol style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 10px 0;">Click <strong>Sign in with Google</strong></li>
                    <li style="margin:0 0 10px 0;">Select your Google account</li>
                    <li style="margin:0;">Grant access when prompted</li>
                  </ol>
                </div>
                <div>
                  <p style="margin:0 0 12px 0;font-weight:600;">Benefits:</p>
                  <ul style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 10px 0;">Faster login</li>
                    <li style="margin:0 0 10px 0;">More secure</li>
                    <li style="margin:0;">One-click access</li>
                  </ul>
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'signin-forgot',
          question: 'What should I do if I forgot my password?',
          answer: `
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:flex;flex-direction:column;justify-content:center;">
                <p style="margin:0 0 20px 0;">Reset your password in a few steps:</p>
                
                <ol style="margin:0;padding-left:20px;">
                  <li style="margin:0 0 12px 0;">Click <strong>Forgot Password?</strong> on the sign-in page</li>
                  <li style="margin:0 0 12px 0;">Enter your registered email</li>
                  <li style="margin:0 0 12px 0;">Click <strong>Send Reset Link</strong></li>
                  <li style="margin:0 0 12px 0;">Check your email for the reset link</li>
                  <li style="margin:0;">Create a new password</li>
                </ol>
              </div>
              
              <div style="display:flex;justify-content:center;align-items:start;">
                <img 
                  src="/tutorial/passwordreset.png" 
                  alt="Password Reset Screenshot" 
                  style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'signin-troubleshoot',
          question: 'Having trouble signing in?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Try these troubleshooting steps:</p>
              
              <ol style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;">Verify your account is <strong>email-verified</strong></li>
                <li style="margin:0 0 10px 0;">Check for <strong>typos</strong> in email/password</li>
                <li style="margin:0 0 10px 0;">Try a different browser</li>
                <li style="margin:0 0 10px 0;">Clear browser cache and cookies</li>
                <li style="margin:0 0 10px 0;">Disable browser extensions temporarily</li>
                <li style="margin:0;">Use password reset for "Invalid Credentials" errors</li>
              </ol>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Still need help?</strong> Contact <strong>support@spiked.ai</strong>
              </p>
            </div>
          `
        }
      ]
    }
  ]
},

{
  id: 'setup-profile',
  title: 'Setup Profile',
  description: 'Learn how to configure your personal profile settings, update your information, and manage your account details in spikedAI.',
  questions: [
    {
      id: 'setup-profile-main',
      title: 'Profile Settings Overview',
      emoji: '👤',
      description: 'Everything you need to know about managing your profile.',
      subQuestions: [
        {
          id: 'profile-overview',
          question: 'What can I do in the Setup Profile section?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">The Setup Profile section is your personal account control center where you can manage all your profile information and settings.</p>
              
              <p style="margin:0 0 12px 0;font-weight:600;">You can manage the following:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;"><strong>Personal Information</strong> — Update your first name and last name</li>
                <li style="margin:0 0 10px 0;"><strong>Email Address</strong> — View your registered email (contact support to change)</li>
                <li style="margin:0;"><strong>Password</strong> — Reset or change your account password</li>
              </ul>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Quick Access:</strong> Navigate to <strong>Settings → Profile</strong> to access your profile settings anytime.
              </p>
            </div>
          `
        },
        {
          id: 'edit-name',
          question: 'How do I edit my name?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 20px 0;">Updating your name in spikedAI is simple and takes just a few seconds:</p>
                  
                  <ol style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 12px 0;">Go to <strong>Settings → Profile</strong></li>
                    <li style="margin:0 0 12px 0;">Click on the <strong>Edit Profile</strong> button</li>
                    <li style="margin:0 0 12px 0;">Click on the name field you want to update (First Name or Last Name)</li>
                    <li style="margin:0 0 12px 0;">Enter your new name</li>
                    <li style="margin:0;">Click <strong>Save Changes</strong> to apply the update</li>
                  </ol>
                </div>
                
                <div style="display:flex;justify-content:center;align-items:start;">
                  <img 
                    src="/tutorial/editprofile.png" 
                    alt="Edit Profile Screenshot" 
                    style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                  />
                </div>
              </div>

              <p style="margin:0;">Your updated name will be reflected immediately across your spikedAI workspace and in all future meetings.</p>
            </div>
          `
        },
        {
          id: 'change-email',
          question: 'Can I change my email address?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Your registered email address is permanently linked to your spikedAI account for security purposes and cannot be changed directly through the settings.</p>
              
              <p style="margin:0 0 12px 0;font-weight:600;">To update your email address:</p>
              <ol style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 12px 0;">Navigate to <strong>Settings → Help & Support</strong></li>
                <li style="margin:0 0 12px 0;">Click on <strong>Contact Support</strong></li>
                <li style="margin:0 0 12px 0;">Submit a request to change your email address</li>
                <li style="margin:0;">Our support team will verify your identity and process the change</li>
              </ol>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Email changes require verification to protect your account security. The process typically takes 24-48 hours.
              </p>
            </div>
          `
        },
        {
          id: 'reset-password',
          question: 'How can I reset or change my password?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 20px 0;">You can change your password anytime from your profile settings:</p>
                  
                  <p style="margin:0 0 12px 0;font-weight:600;">Method 1: From Profile Settings</p>
                  <ol style="margin:0 0 20px 0;padding-left:20px;">
                    <li style="margin:0 0 10px 0;">Go to <strong>Settings → Security</strong></li>
                    <li style="margin:0 0 10px 0;">Click on <strong>Change Password</strong></li>
                    <li style="margin:0 0 10px 0;">Enter your <strong>current password</strong></li>
                    <li style="margin:0 0 10px 0;">Enter your <strong>new password</strong> and confirm it</li>
                    <li style="margin:0;">Click <strong>Update Password</strong> to save</li>
                  </ol>

                  <p style="margin:0 0 12px 0;font-weight:600;">Method 2: Password Reset (if you forgot your password)</p>
                  <ol style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 10px 0;">Go to the login page</li>
                    <li style="margin:0 0 10px 0;">Click <strong>Forgot Password?</strong></li>
                    <li style="margin:0 0 10px 0;">Enter your registered email</li>
                    <li style="margin:0 0 10px 0;">Check your email for the reset link</li>
                    <li style="margin:0;">Create a new password through the link</li>
                  </ol>
                </div>
                
                <div style="display:flex;justify-content:center;align-items:start;">
                  <img 
                    src="/tutorial/changepassword.png" 
                    alt="Password Change Screenshot" 
                    style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                  />
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'unsaved-changes',
          question: 'What happens if I don\'t save my changes?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">If you make changes to your profile but don't click the <strong>Save Changes</strong> button, your modifications will not be applied.</p>
              
              <p style="margin:0 0 12px 0;font-weight:600;">What happens to unsaved changes:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;">If you navigate away from the page, all unsaved changes will be lost</li>
                <li style="margin:0 0 10px 0;">If you refresh the page, your previous saved details will remain unchanged</li>
                <li style="margin:0 0 10px 0;">If you close the browser, no changes will be saved</li>
                <li style="margin:0;">You may see a warning popup asking you to confirm before leaving (depending on your browser)</li>
              </ul>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Best Practice:</strong> Always click <strong>Save Changes</strong> after updating your profile information to ensure your changes are preserved.
              </p>
            </div>
          `
        },
        {
          id: 'refresh-profile',
          question: 'Can I refresh my profile settings?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Yes, you can refresh your profile settings anytime. This is useful if you want to discard unsaved changes or reload your current saved information.</p>
              
              <p style="margin:0 0 12px 0;font-weight:600;">Ways to refresh your profile:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;"><strong>Browser Refresh</strong> — Press F5 or click the refresh button in your browser</li>
                <li style="margin:0 0 10px 0;"><strong>Cancel Button</strong> — Click the <strong>Cancel</strong> button (if available) to discard changes</li>
                <li style="margin:0 0 10px 0;"><strong>Navigate Away</strong> — Go to another section and return to profile settings</li>
                <li style="margin:0;"><strong>Reload Option</strong> — Use the reload/reset button if provided in the UI</li>
              </ul>

              <p style="margin:0;">Refreshing will reload your last saved profile information and discard any unsaved edits you've made.</p>
            </div>
          `
        }
      ]
    }
  ]
},
    
{
  id: 'personalization',
  title: 'Personalization Before a Meeting',
  description: 'Configure your AI copilot to match your communication style and objectives before every meeting.',
  questions: [
    {
      id: 'setup-personalization',
      title: 'Personalization Settings',
      emoji: '🎨',
      description: 'Complete guide to personalizing your AI for better meeting outcomes.',
      subQuestions: [
        {
          id: 'where-personalization',
          question: 'Where do I find the Personalization settings?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 20px 0;">Personalization settings are located in the main console and must be configured <strong>before starting a meeting</strong>.</p>
                  
                  <p style="margin:0 0 12px 0;font-weight:600;">How to access:</p>
                  <ol style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 12px 0;">Go to the <strong>Main Console</strong></li>
                    <li style="margin:0 0 12px 0;">Click on <strong>Personalization</strong> in the navigation menu</li>
                    <li style="margin:0;">Configure your settings before joining or starting a meeting</li>
                  </ol>
                </div>
                
                <div style="display:flex;justify-content:center;align-items:start;">
                  <img 
                    src="/tutorial/personalizationlocation.png" 
                    alt="Personalization Location Screenshot" 
                    style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                  />
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'bot-configuration',
          question: 'What is Bot Configuration?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Bot Configuration allows you to customize the visible identity of your AI copilot during meetings.</p>
              
              <p style="margin:0 0 12px 0;font-weight:600;">Current settings:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;">Default name: <strong>SpikedAI</strong></li>
                <li style="margin:0;">Name customization is <strong>currently not available</strong> but will be implemented in future updates</li>
              </ul>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Coming Soon:</strong> You'll be able to rename your AI copilot to match your branding or personal preference.
              </p>
            </div>
          `
        },
        {
          id: 'customer-persona',
          question: 'How do I choose a Customer Persona?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 20px 0;">Customer Persona determines your AI's communication style, depth, and focus during meetings. Choose the persona that best matches your audience.</p>
                  
                  <p style="margin:0 0 12px 0;font-weight:600;">Available Personas:</p>
                  
                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0 0 10px 0;background:#fefefe;">
                    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:14px;">📊 Balanced</p>
                    <p style="margin:0;color:#6b7280;font-size:13px;">Versatile profile for general business users in B2B settings.</p>
                  </div>

                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0 0 10px 0;background:#fefefe;">
                    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:14px;">⚙️ Technical</p>
                    <p style="margin:0;color:#6b7280;font-size:13px;">Deep technical jargon-friendly responses for engineering teams.</p>
                  </div>

                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0 0 10px 0;background:#fefefe;">
                    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:14px;">💰 Financial</p>
                    <p style="margin:0;color:#6b7280;font-size:13px;">ROI-driven, cost-benefit analysis focused for finance teams.</p>
                  </div>

                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px;margin:0;background:#fefefe;">
                    <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:14px;">👔 Business Executive</p>
                    <p style="margin:0;color:#6b7280;font-size:13px;">High-impact insights for C-suite executives.</p>
                  </div>
                </div>
                
                <div style="display:flex;justify-content:center;align-items:start;">
                  <img 
                    src="/tutorial/customerpersona.png" 
                    alt="Customer Persona Screenshot" 
                    style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                  />
                </div>
              </div>

              <p style="margin:0 0 12px 0;font-weight:600;">How to set your persona:</p>
              <ol style="margin:0;padding-left:20px;">
                <li style="margin:0 0 10px 0;">Navigate to <strong>Personalization → Customer Persona</strong></li>
                <li style="margin:0 0 10px 0;">Select the persona that matches your meeting audience</li>
                <li style="margin:0;">The AI will automatically adjust its tone and depth accordingly</li>
              </ol>
            </div>
          `
        },
        {
          id: 'meeting-focus',
          question: 'What is Meeting Focus and why is it important?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 20px 0;"><strong>Meeting Focus</strong> is one of the most critical features in spikedAI. It tells your AI what to prioritize and track during the meeting.</p>
                  
                  <div style="padding:16px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;margin:0 0 20px 0;">
                    <p style="margin:0;font-weight:600;color:#92400E;font-size:14px;">⚠️ IMPORTANT</p>
                    <p style="margin:8px 0 0 0;color:#92400E;font-size:13px;">Meeting Focus <strong>must be set before starting a meeting</strong>.</p>
                  </div>

                  <p style="margin:0 0 12px 0;font-weight:600;">Why it matters:</p>
                  <ul style="margin:0 0 20px 0;padding-left:20px;">
                    <li style="margin:0 0 8px 0;">Directs your AI's attention to what matters most</li>
                    <li style="margin:0 0 8px 0;">Ensures relevant insights are captured</li>
                    <li style="margin:0 0 8px 0;">Improves post-meeting reports quality</li>
                    <li style="margin:0;">Tracks specific objectives automatically</li>
                  </ul>

                  <p style="margin:0 0 12px 0;font-weight:600;">How to set:</p>
                  <ol style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 8px 0;">Go to <strong>Personalization → Meeting Focus</strong></li>
                    <li style="margin:0 0 8px 0;">Define what the meeting is about</li>
                    <li style="margin:0 0 8px 0;">Specify key topics to track</li>
                    <li style="margin:0;">Save before joining the meeting</li>
                  </ol>
                </div>
                
                <div style="display:flex;justify-content:center;align-items:start;">
                  <img 
                    src="/tutorial/meetingfocus.png" 
                    alt="Meeting Focus Screenshot" 
                    style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                  />
                </div>
              </div>
            </div>
          `
        },
        {
          id: 'system-prompt',
          question: 'What is the System Prompt and can I customize it?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">The System Prompt is the underlying instruction set that guides your AI's behavior during meetings.</p>
              
              <p style="margin:0 0 12px 0;font-weight:600;">How System Prompt works:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 10px 0;"><strong>Automatic Mode:</strong> Generated based on your chosen Customer Persona</li>
                <li style="margin:0;"><strong>Custom Mode:</strong> Write your own system prompt to fine-tune AI behavior</li>
              </ul>

              <p style="margin:0 0 12px 0;font-weight:600;">When to customize:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 8px 0;">You need specific AI behavior not covered by default personas</li>
                <li style="margin:0 0 8px 0;">You want to add company-specific guidelines</li>
                <li style="margin:0;">You have unique meeting requirements</li>
              </ul>

              <p style="margin:0 0 12px 0;font-weight:600;">How to customize:</p>
              <ol style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 8px 0;">Navigate to <strong>Personalization → System Prompt</strong></li>
                <li style="margin:0 0 8px 0;">Write your custom instructions</li>
                <li style="margin:0;">Save and test in a practice meeting</li>
              </ol>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Tip:</strong> Start with the automatic system prompt and only customize if needed.
              </p>
            </div>
          `
        },
        {
          id: 'answering-styles',
          question: 'What are the 12 Answering Styles?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:start;margin:0 0 20px 0;">
                <div>
                  <p style="margin:0 0 20px 0;">Answering Styles determine how your AI formats and delivers responses during meetings. You can select multiple styles to suit different needs.</p>
                  
                  <p style="margin:0 0 12px 0;font-weight:600;">Available Styles:</p>
                  
                  <div style="display:grid;grid-template-columns:1fr;gap:8px;margin:0 0 20px 0;">
                    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#fefefe;">
                      <p style="margin:0;font-weight:600;color:#111827;font-size:13px;">📝 Concise Answer</p>
                      <p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">Brief, to-the-point responses</p>
                    </div>
                    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#fefefe;">
                      <p style="margin:0;font-weight:600;color:#111827;font-size:13px;">📚 In-Depth Answer</p>
                      <p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">Detailed explanations</p>
                    </div>
                    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#fefefe;">
                      <p style="margin:0;font-weight:600;color:#111827;font-size:13px;">• Answer in Points</p>
                      <p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">Structured bullet-point format</p>
                    </div>
                    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#fefefe;">
                      <p style="margin:0;font-weight:600;color:#111827;font-size:13px;">🔄 Use Analogy</p>
                      <p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">Relatable comparisons</p>
                    </div>
                    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#fefefe;">
                      <p style="margin:0;font-weight:600;color:#111827;font-size:13px;">⚙️ Technical Terms</p>
                      <p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">Simplify complex terminology</p>
                    </div>
                    <div style="border:1px solid #e5e7eb;border-radius:6px;padding:10px;background:#fefefe;">
                      <p style="margin:0;font-weight:600;color:#111827;font-size:13px;">💼 Sales Points</p>
                      <p style="margin:4px 0 0 0;color:#6b7280;font-size:12px;">Value propositions</p>
                    </div>
                  </div>

                  <p style="margin:0 0 12px 0;font-weight:600;">How to select:</p>
                  <ol style="margin:0;padding-left:20px;">
                    <li style="margin:0 0 8px 0;">Go to <strong>Personalization → Answering Styles</strong></li>
                    <li style="margin:0 0 8px 0;">Check boxes for relevant styles</li>
                    <li style="margin:0;">Select multiple styles simultaneously</li>
                  </ol>
                </div>
                
                <div style="display:flex;justify-content:center;align-items:start;">
                  <img 
                    src="/tutorial/answerstyles.png" 
                    alt="Answering Styles Screenshot" 
                    style="width:100%;max-width:500px;height:auto;display:block;border-radius:8px;box-shadow:0 4px 6px rgba(0,0,0,0.1);position:sticky;top:20px;"
                  />
                </div>
              </div>

              <p style="margin:0 0 8px 0;font-weight:600;">Additional Styles:</p>
              <ul style="margin:0;padding-left:20px;">
                <li style="margin:0 0 6px 0;">📊 Key Statistics</li>
                <li style="margin:0 0 6px 0;">📖 Case Study Summary</li>
                <li style="margin:0 0 6px 0;">⚔️ Competitive Comparison</li>
                <li style="margin:0 0 6px 0;">❓ Anticipated Customer Questions</li>
                <li style="margin:0 0 6px 0;">ℹ️ Information Gap</li>
                <li style="margin:0;">💵 Pricing Overview</li>
              </ul>
            </div>
          `
        },
        {
          id: 'custom-goals-intro',
          question: 'Do I need to set Custom Goals before a meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Custom Goals tell your AI what specific outcomes and objectives to track throughout the meeting.</p>

              <div style="padding:16px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin:0 0 20px 0;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:14px;">🎯 DEFAULT GOAL</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:13px;">A default custom goal is automatically created for new users. You'll receive a reminder to add your own custom goals when you're ready.</p>
              </div>

              <p style="margin:0 0 12px 0;font-weight:600;">Why Custom Goals are important:</p>
              <ul style="margin:0 0 20px 0;padding-left:20px;">
                <li style="margin:0 0 8px 0;">Focus AI on your specific meeting objectives</li>
                <li style="margin:0 0 8px 0;">Generate relevant post-meeting summaries</li>
                <li style="margin:0 0 8px 0;">Track measurable outcomes automatically</li>
                <li style="margin:0;">Improve follow-up action items</li>
              </ul>

              <p style="margin:0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> For detailed information on creating and managing Custom Goals, refer to the dedicated Custom Goals tutorial section.
              </p>
            </div>
          `
        },
        {
          id: 'personalization-checklist',
          question: 'Complete Personalization Checklist Before a Meeting',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin:0 0 20px 0;">Use this checklist to ensure you've configured all personalization settings before your meeting:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;background:#fefefe;margin:0 0 20px 0;">
                <p style="margin:0 0 16px 0;font-weight:700;color:#111827;font-size:16px;">✅ Pre-Meeting Checklist</p>
                
                <div style="display:flex;flex-direction:column;gap:10px;">
                  <label style="display:flex;align-items:start;gap:10px;cursor:pointer;">
                    <input type="checkbox" style="margin-top:4px;" />
                    <span style="color:#374151;font-size:14px;"><strong>Bot Configuration:</strong> Verify your AI copilot name</span>
                  </label>
                  
                  <label style="display:flex;align-items:start;gap:10px;cursor:pointer;">
                    <input type="checkbox" style="margin-top:4px;" />
                    <span style="color:#374151;font-size:14px;"><strong>Customer Persona:</strong> Select appropriate persona</span>
                  </label>
                  
                  <label style="display:flex;align-items:start;gap:10px;cursor:pointer;">
                    <input type="checkbox" style="margin-top:4px;" />
                    <span style="color:#374151;font-size:14px;"><strong>Meeting Focus:</strong> ⚠️ Define meeting topic and key points</span>
                  </label>
                  
                  <label style="display:flex;align-items:start;gap:10px;cursor:pointer;">
                    <input type="checkbox" style="margin-top:4px;" />
                    <span style="color:#374151;font-size:14px;"><strong>System Prompt:</strong> Review automatic prompt or customize</span>
                  </label>
                  
                  <label style="display:flex;align-items:start;gap:10px;cursor:pointer;">
                    <input type="checkbox" style="margin-top:4px;" />
                    <span style="color:#374151;font-size:14px;"><strong>Answering Styles:</strong> Select relevant styles</span>
                  </label>
                  
                  <label style="display:flex;align-items:start;gap:10px;cursor:pointer;">
                    <input type="checkbox" style="margin-top:4px;" />
                    <span style="color:#374151;font-size:14px;"><strong>Custom Goals:</strong> Review default goal or add custom ones</span>
                  </label>
                </div>
              </div>

              <div style="padding:16px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;">
                <p style="margin:0;font-weight:600;color:#92400E;font-size:14px;">💡 Pro Tip</p>
                <p style="margin:8px 0 0 0;color:#92400E;font-size:13px;">Save your personalization settings as templates for recurring meeting types.</p>
              </div>
            </div>
          `
        }
      ]
    }
  ]
},

   {
  id: 'upload-documents',
  title: 'Uploading Documents',
  description: 'Add your sales playbooks, product briefs, or FAQs so your AI can reference them during meetings.',
  questions: [
    {
      id: 'upload-docs',
      title: 'Document Management',
      emoji: '📂',
      description: 'Everything you need to know about uploading and managing your documents.',
      subQuestions: [
        {
          id: 'why-upload-docs',
          question: 'Why should I upload documents before a meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Uploading documents <strong>before your meeting starts</strong> is crucial for ensuring your AI provides accurate, relevant answers based on your specific materials.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 KEY BENEFIT</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Your AI fetches answers directly from your uploaded documents, ensuring responses are accurate and aligned with your company's information — not vague or generic answers.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How your AI uses documents:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Primary Source:</strong> AI prioritizes information from your uploaded documents</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Accurate Responses:</strong> Answers are grounded in your actual materials, not generic knowledge</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Fallback Option:</strong> If information isn't in your documents, AI can provide broader context when appropriate</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Contextual Awareness:</strong> AI understands your product details, pricing, features, and policies</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Best Practice:</strong> Upload all relevant documents before your meeting to ensure your AI is fully prepared to assist you.
              </p>
            </div>
          `
        },
        {
          id: 'where-to-upload',
          question: 'Where can I upload my documents?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can access and upload documents from <strong>two different locations</strong> in spikedAI:</p>
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
                
                <div>
                  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;background:#fefefe;">
                    <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:16px;">📋 Method 1: Main Console (Quick Access)</p>
                    <ol style="margin:0 0 12px 0;padding-left:24px;">
                      <li style="margin-bottom:10px;padding-left:8px;">Go to the <strong>Main Console</strong></li>
                      <li style="margin-bottom:10px;padding-left:8px;">Click the <strong>Documents</strong> button in the console</li>
                      <li style="margin-bottom:10px;padding-left:8px;">Click <strong>Choose File</strong> or drag and drop your file</li>
                      <li style="margin-bottom:0;padding-left:8px;">Your document will be uploaded and ready to use</li>
                    </ol>
                    <p style="margin:12px 0 0 0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:13px;">
                      <strong>Use this when:</strong> You need to quickly upload a document right before a meeting.
                    </p>
                  </div>
                </div>

                <div>
                  <img 
                    src="/tutorial/doc-location2.png" 
                    alt="Document Location 2 Screenshot" 
                    style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                  />
                </div>

              </div>

              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
                
                <div>
                  <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;background:#fefefe;">
                    <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:16px;">🗂️ Method 2: Content Hub (Full Management)</p>
                    <ol style="margin:0 0 12px 0;padding-left:24px;">
                      <li style="margin-bottom:10px;padding-left:8px;">Click on your <strong>Profile</strong> (top-right corner)</li>
                      <li style="margin-bottom:10px;padding-left:8px;">Navigate to <strong>Content Hub</strong></li>
                      <li style="margin-bottom:10px;padding-left:8px;">Go to the <strong>Documents</strong> section</li>
                      <li style="margin-bottom:0;padding-left:8px;">Upload files and add descriptions, spaces, and additional metadata</li>
                    </ol>
                    <p style="margin:12px 0 0 0;padding:12px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:13px;">
                      <strong>Use this when:</strong> You want to organize documents, add descriptions, or manage your document library in detail.
                    </p>
                  </div>
                </div>

                <div>
                  <img 
                    src="/tutorial/doc-location.png" 
                    alt="Document Location Screenshot" 
                    style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                  />
                </div>

              </div>
            </div>
          `
        },
        {
          id: 'supported-formats',
          question: 'What file types can I upload?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">spikedAI supports a variety of document formats to accommodate different types of business materials:</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Supported File Formats:</p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:24px;">
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">📄 PDF Files</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Portable Document Format (.pdf)</p>
                </div>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">📝 Word Documents</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Microsoft Word (.doc, .docx)</p>
                </div>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">📊 Presentations</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">PowerPoint (.ppt, .pptx)</p>
                </div>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">📈 Spreadsheets</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Excel (.xls, .xlsx)</p>
                </div>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Common use cases:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sales Playbooks</strong> — Product information, objection handling, pricing guides</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Product Documentation</strong> — Technical specs, feature lists, user guides</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>FAQs</strong> — Frequently asked questions and answers</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Case Studies</strong> — Success stories and customer testimonials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pricing Sheets</strong> — Cost breakdowns and package details</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Competitive Analysis</strong> — Comparison documents and market research</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>File Size Limit:</strong> For best performance, keep individual files under <strong>25MB</strong>.
              </p>
            </div>
          `
        },
        {
          id: 'content-hub-features',
          question: 'What is the Content Hub and how do I use it?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px;">
                
                <div>
                  <p style="margin-bottom:20px;">The <strong>Content Hub</strong> is your centralized document management center where you can organize, describe, and categorize all your uploaded materials.</p>
                  
                  <p style="margin-bottom:12px;font-weight:600;">How to access Content Hub:</p>
                  <ol style="margin:0 0 24px 0;padding-left:24px;">
                    <li style="margin-bottom:10px;padding-left:8px;">Click on your <strong>Profile</strong> icon (top-right corner)</li>
                    <li style="margin-bottom:10px;padding-left:8px;">Select <strong>Content Hub</strong> from the menu</li>
                    <li style="margin-bottom:0;padding-left:8px;">Navigate to the <strong>Documents</strong> section</li>
                  </ol>

                  <p style="margin-bottom:12px;font-weight:600;">Key Features in Content Hub:</p>
                  
                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                    <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">📝 Document Descriptions</p>
                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Add detailed descriptions to help your AI better understand what each document contains. Descriptions improve answer accuracy by providing context about the document's purpose and content.</p>
                  </div>

                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                    <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🏷️ Spaces</p>
                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Organize documents into custom spaces (categories or folders) for better organization. Group related documents together for easier management.</p>
                  </div>

                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                    <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🌐 Website Integration</p>
                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Upload website URLs to allow your AI to reference online content during meetings. This feature enables access to dynamic web-based resources.</p>
                  </div>

                  <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;background:#fefefe;">
                    <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">📥 Download & Delete Options</p>
                    <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Easily download copies of your uploaded documents or remove outdated files with simple one-click actions.</p>
                  </div>

                  <div style="padding:20px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;">
                    <p style="margin:0;font-weight:600;color:#92400E;font-size:14px;">💡 Why Descriptions Matter</p>
                    <p style="margin:8px 0 0 0;color:#92400E;font-size:13px;">Adding descriptions helps your AI understand what information is in each PDF. This makes it easier for the AI to fetch relevant answers from the right document during meetings, improving response accuracy.</p>
                  </div>
                </div>

                <div>
                  <img 
                    src="/tutorial/doocumments.png" 
                    alt="Documents Screenshot" 
                    style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                  />
                </div>

              </div>
            </div>
          `
        },
        {
          id: 'expand-view-button',
          question: 'What does the Expand view do?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The <strong>Expand view</strong> button in the Main Console documents section provides quick access to the full Content Hub interface.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click the <strong>Expand view</strong> button next to your document in the Main Console</li>
                <li style="margin-bottom:10px;padding-left:8px;">You'll be redirected to the <strong>Content Hub</strong></li>
                <li style="margin-bottom:0;padding-left:8px;">You can now add descriptions, organize into spaces, and manage document metadata</li>
              </ol>

              <p style="margin-bottom:20px;">This button essentially bridges the quick upload interface in the Main Console with the comprehensive document management features in the Content Hub.</p>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Upload a document quickly in the Main Console, then click Extend to immediately add descriptions and organize it properly.
              </p>
            </div>
          `
        },
        {
          id: 'manage-docs',
          question: 'How do I download or delete documents?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Both the Main Console and Content Hub provide simple options to manage your uploaded documents.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Download Documents:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to your documents (Main Console or Content Hub)</li>
                <li style="margin-bottom:10px;padding-left:8px;">Locate the document you want to download</li>
                <li style="margin-bottom:0;padding-left:8px;">Click the <strong>Download</strong> button next to the document</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Delete Documents:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Find the document you want to remove</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click the <strong>Delete</strong> button</li>
                <li style="margin-bottom:0;padding-left:8px;">Confirm the deletion when prompted</li>
              </ol>

              <div style="padding:20px;background:#FEE2E2;border-left:4px solid #DC2626;border-radius:8px;">
                <p style="margin:0;font-weight:600;color:#991B1B;font-size:14px;">⚠️ Warning</p>
                <p style="margin:8px 0 0 0;color:#991B1B;font-size:13px;">Deleting a document is permanent and cannot be undone. Make sure you have a backup copy before deleting.</p>
              </div>
            </div>
          `
        },
        {
          id: 'doc-best-practices',
          question: 'What are the best practices for document management?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Follow these best practices to maximize the effectiveness of your uploaded documents:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:15px;">⏰ Upload Before Meetings</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Always upload and organize documents <strong>before starting a meeting</strong>. This ensures your AI has time to process and index the content for accurate responses.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:15px;">📝 Add Meaningful Descriptions</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Write clear descriptions that explain what each document contains. For example: "Product pricing guide for Enterprise customers" or "Technical FAQ for API integration questions."</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:15px;">🗂️ Organize with Spaces</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Group related documents into logical spaces (e.g., "Sales Materials", "Product Docs", "Pricing", "Case Studies"). This makes documents easier to find and manage.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:15px;">🔄 Keep Documents Updated</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Regularly review and update documents when information changes. Remove outdated documents to prevent your AI from referencing incorrect information.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:15px;">📏 Optimize File Sizes</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Keep files under 25MB for optimal performance. If you have large documents, consider splitting them into smaller, more focused files.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:15px;">✅ Use Consistent Naming</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Use clear, descriptive file names. Good: "Product_Pricing_Q1_2025.pdf" | Bad: "Document1.pdf"</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Create a "meeting prep checklist" that includes verifying all relevant documents are uploaded and up-to-date before each important call.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
{
  id: 'theme-setup',
  title: 'Theme & Appearance',
  description: 'Customize your SpikedAI workspace with light and dark themes for optimal viewing comfort.',
  questions: [
    {
      id: 'change-theme',
      title: 'Theme Settings',
      emoji: '🌓',
      description: 'Complete guide to managing your visual preferences.',
      subQuestions: [
        {
          id: 'where-theme-settings',
          question: 'Where do I find the Theme settings?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                
                <div>
                  <p style="margin-bottom:20px;">Theme settings are accessible from your admin page and allow you to customize the visual appearance of your entire SpikedAI workspace.</p>
                  
                  <p style="margin-bottom:12px;font-weight:600;">How to access Theme settings:</p>
                  <ol style="margin:0 0 24px 0;padding-left:24px;">
                    <li style="margin-bottom:12px;padding-left:8px;">Navigate to your <strong>Admin Page</strong></li>
                    <li style="margin-bottom:12px;padding-left:8px;">Click on the <strong>Settings</strong> icon in the navigation menu</li>
                    <li style="margin-bottom:0;padding-left:8px;">Select <strong>Theme & Appearance</strong> from the settings options</li>
                  </ol>
                </div>

                <div>
                  <img 
                    src="/tutorial/theme loc.png" 
                    alt="Theme location Screenshot" 
                    style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                  />
                </div>

              </div>
            </div>
          `
        },
        {
          id: 'enable-dark-mode',
          question: 'How do I switch between light and dark mode?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                
                <div>
                  <p style="margin-bottom:20px;">SpikedAI offers both light and dark themes to match your preference and reduce eye strain during extended use.</p>
                  
                  <p style="margin-bottom:12px;font-weight:600;">Steps to change your theme:</p>
                  <ol style="margin:0 0 24px 0;padding-left:24px;">
                    <li style="margin-bottom:12px;padding-left:8px;">Go to <strong>Admin Page → Settings → Theme & Appearance</strong></li>
                    <li style="margin-bottom:12px;padding-left:8px;">You'll see two theme options:
                      <ul style="margin-top:10px;list-style-type:disc;padding-left:24px;">
                        <li style="margin-bottom:6px;"><strong>Light Mode</strong> – Clean, bright interface ideal for well-lit environments</li>
                        <li style="margin-bottom:0;"><strong>Dark Mode</strong> – Darker color scheme that reduces eye strain in low-light conditions</li>
                      </ul>
                    </li>
                    <li style="margin-bottom:12px;padding-left:8px;">Click on your preferred theme</li>
                    <li style="margin-bottom:0;padding-left:8px;">The change applies <strong>instantly</strong> across your entire workspace</li>
                  </ol>

                  <div style="padding:20px;background:#EFF6FF;border-left:4px solid #2563EB;border-radius:8px;">
                    <p style="margin:0;font-weight:600;color:#1E40AF;font-size:14px;">💡 Pro Tip</p>
                    <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:13px;">Dark mode can help reduce eye fatigue during long meetings or late-night work sessions.</p>
                  </div>
                </div>

                <div>
                  <img 
                    src="/tutorial/theme toggle.png" 
                    alt="Theme Toggle Screenshot" 
                    style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                  />
                </div>

              </div>
            </div>
          `
        },
        {
          id: 'global-theme',
          question: 'Does the theme apply to all pages?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
                
                <div>
                  <p style="margin-bottom:20px;"><strong>Yes</strong>, SpikedAI uses a <strong>global theme system</strong>. When you set a theme, it applies universally across your entire workspace.</p>
                  
                  <p style="margin-bottom:12px;font-weight:600;">What this means:</p>
                  <ul style="margin:0 0 24px 0;padding-left:24px;">
                    <li style="margin-bottom:10px;padding-left:8px;">If you select <strong>Light Mode</strong>, all pages, dashboards, and features will display in light theme</li>
                    <li style="margin-bottom:10px;padding-left:8px;">If you select <strong>Dark Mode</strong>, everything switches to dark theme</li>
                    <li style="margin-bottom:10px;padding-left:8px;">You cannot have different themes for different pages</li>
                    <li style="margin-bottom:0;padding-left:8px;">The theme persists across browser sessions and devices when logged in</li>
                  </ul>

                  <p style="margin-bottom:12px;font-weight:600;">Affected areas include:</p>
                  <ul style="margin:0;padding-left:24px;">
                    <li style="margin-bottom:8px;padding-left:8px;">Main Dashboard</li>
                    <li style="margin-bottom:8px;padding-left:8px;">Console (meeting interface)</li>
                    <li style="margin-bottom:8px;padding-left:8px;">Personalization settings</li>
                    <li style="margin-bottom:8px;padding-left:8px;">Documents section</li>
                    <li style="margin-bottom:8px;padding-left:8px;">Playbook and Note Taker</li>
                    <li style="margin-bottom:8px;padding-left:8px;">Simulator and all other features</li>
                    <li style="margin-bottom:0;padding-left:8px;">Settings pages</li>
                  </ul>
                </div>

                <div>
                  <img
                    src="/tutorial/theme comparision.png"
                    alt="Theme Comparison Screenshot"
                    style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                  />
                </div>

              </div>
            </div>
          `
        },
        {
          id: 'theme-instant-change',
          question: 'How quickly does the theme change take effect?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Theme changes in SpikedAI are <strong>instant</strong> – there's no need to refresh your page or restart your session.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">What happens when you change themes:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">The moment you select a new theme, the interface immediately updates</li>
                <li style="margin-bottom:10px;padding-left:8px;">All colors, backgrounds, and text automatically adjust</li>
                <li style="margin-bottom:10px;padding-left:8px;">No interruption to your current work or active meetings</li>
                <li style="margin-bottom:0;padding-left:8px;">The new theme is saved to your account preferences</li>
              </ol>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Your theme preference is saved automatically, so you'll see the same theme every time you log in, even from different devices.
              </p>
            </div>
          `
        },
        {
          id: 'theme-benefits',
          question: 'What are the benefits of each theme?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Each theme is designed with specific use cases and benefits in mind:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 10px 0;font-weight:600;color:#111827;font-size:16px;">☀️ Light Mode Benefits</p>
                <ul style="margin:0;padding-left:24px;">
                  <li style="margin-bottom:8px;padding-left:8px;">Better readability in bright environments</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Traditional, professional appearance</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Ideal for daytime work</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Higher contrast for text and graphics</li>
                  <li style="margin-bottom:0;padding-left:8px;">Suitable for screen sharing and presentations</li>
                </ul>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;background:#fefefe;">
                <p style="margin:0 0 10px 0;font-weight:600;color:#111827;font-size:16px;">🌙 Dark Mode Benefits</p>
                <ul style="margin:0;padding-left:24px;">
                  <li style="margin-bottom:8px;padding-left:8px;">Reduces eye strain in low-light environments</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Less blue light emission for evening use</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Modern, sleek aesthetic</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Saves battery life on OLED screens</li>
                  <li style="margin-bottom:8px;padding-left:8px;">Perfect for late-night meetings or work sessions</li>
                  <li style="margin-bottom:0;padding-left:8px;">Reduces screen glare</li>
                </ul>
              </div>

              <p style="margin:24px 0 0 0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Recommendation:</strong> Try both themes to see which works best for your environment and personal preference. You can switch anytime without affecting your data or settings.
              </p>
            </div>
          `
        },
        {
          id: 'theme-reset',
          question: 'Can I reset my theme to default?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">SpikedAI's default theme is <strong>Light Mode</strong>. You can return to the default theme anytime by following these steps:</p>
              
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Navigate to <strong>Admin Page → Settings → Theme & Appearance</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Select <strong>Light Mode</strong></li>
                <li style="margin-bottom:0;padding-left:8px;">Your interface will immediately switch back to the default light theme</li>
              </ol>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Changing themes does not affect any of your other settings, personalization preferences, or saved data.
              </p>
            </div>
          `
        },
        {
          id: 'theme-troubleshooting',
          question: 'What if my theme doesn\'t change?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">If you're experiencing issues with theme changes not applying, try these troubleshooting steps:</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Common solutions:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;"><strong>Refresh your browser</strong> – Press F5 or Ctrl+R (Cmd+R on Mac)</li>
                <li style="margin-bottom:12px;padding-left:8px;"><strong>Clear browser cache</strong> – Sometimes cached files can prevent theme updates
                  <ul style="margin-top:8px;list-style-type:disc;padding-left:24px;">
                    <li style="margin-bottom:4px;">Chrome/Edge: Ctrl+Shift+Delete</li>
                    <li style="margin-bottom:0;">Firefox: Ctrl+Shift+Delete</li>
                  </ul>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;"><strong>Try a different browser</strong> – Test if the issue is browser-specific</li>
                <li style="margin-bottom:12px;padding-left:8px;"><strong>Disable browser extensions</strong> – Some extensions can interfere with themes</li>
                <li style="margin-bottom:12px;padding-left:8px;"><strong>Log out and log back in</strong> – This refreshes your session</li>
                <li style="margin-bottom:0;padding-left:8px;">If the issue persists, contact <strong>support@spiked.ai</strong></li>
              </ol>

              <div style="padding:20px;background:#FEF2F2;border-left:4px solid #EF4444;border-radius:8px;">
                <p style="margin:0;font-weight:600;color:#991B1B;font-size:14px;">⚠️ Still Having Issues?</p>
                <p style="margin:8px 0 0 0;color:#991B1B;font-size:13px;">Reach out to our support team with details about your browser, operating system, and the specific issue you're experiencing.</p>
              </div>
            </div>
          `
        }
      ]
    }
  ]
},
{
  id: 'account-settings',
  title: 'Account & Security',
  description: 'Manage your credentials and keep your account safe.',
  questions: [
    {
      id: 'security-setup',
      title: 'How do I manage my security settings?',
      emoji: '🔒',
      description: 'Everything related to login and account access.',
      subQuestions: [
        {
          id: 'change-password',
          question: 'Can I change my password manually?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Yes. Go to <strong>Settings → Security → Change Password</strong> and follow the steps.</p>
            </div>
          `
        },
        {
          id: 'two-factor',
          question: 'Does spikedAI support two-factor authentication?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Two-factor authentication (2FA) is coming soon as part of our advanced security update.</p>
            </div>
          `
        }
      ]
    }
  ]
}  ]
},
console: {
  cardId: 'card-console',
  cardTitle: 'Console',
  cardDescription: 'Your main workspace — connect your bot, explore live transcriptions, ask questions about your documents, and monitor smart suggestions in real time.',
  icon: <Layout style={{ width: '20px', height: '20px' }} />,
  emoji: '🖥️',
  items: [
{
  id: 'bot-connection',
  title: 'Connect Your Bot',
  description: 'Learn how to connect your AI copilot to your workspace and start analyzing meetings in real time.',
  questions: [
    {
      id: 'connect-bot-setup',
      title: 'Bot Connection',
      emoji: '🤖',
      description: 'Everything you need to know about connecting your SpikedAI bot to meetings.',
      subQuestions: [
        {
          id: 'how-to-connect-bot',
          question: 'How do I connect the bot to my meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Connecting your SpikedAI bot to a meeting is simple and takes just a few steps.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Steps to connect:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Copy your meeting URL from <strong>Google Meet</strong>, <strong>Microsoft Teams</strong>, or <strong>Zoom</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Go to the <strong>Console</strong> in SpikedAI</li>
                <li style="margin-bottom:12px;padding-left:8px;">Paste the meeting URL in the <strong>Meeting URL</strong> section</li>
                <li style="margin-bottom:12px;padding-left:8px;">Click the <strong>Connect Meet</strong> button</li>
                <li style="margin-bottom:12px;padding-left:8px;">In your meeting platform, you'll receive a request to <strong>admit the SpikedAI bot</strong></li>
                <li style="margin-bottom:0;padding-left:8px;">Click <strong>Admit</strong> to allow the bot to join</li>
              </ol>

             

              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⏱️ QUICK START</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">After admitting the bot, it will start recording and transcribing within <strong>5-10 seconds</strong>.</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Connect your bot before the meeting starts to ensure it captures the entire conversation from the beginning.
              </p>
            </div>
          `
        },
        {
          id: 'supported-platforms',
          question: 'Which meeting platforms are supported?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">SpikedAI currently supports the three most popular meeting platforms for bot connection.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Supported Platforms:</p>
              <div style="display:grid;grid-template-columns:1fr;gap:12px;margin-bottom:24px;">
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">🔹 Google Meet</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Fully supported – paste your meet.google.com URL</p>
                </div>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">💼 Microsoft Teams</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Fully supported – paste your teams.microsoft.com URL</p>
                </div>
                <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;background:#fefefe;">
                  <p style="margin:0 0 6px 0;font-weight:600;color:#111827;font-size:15px;">🎥 Zoom</p>
                  <p style="margin:0;color:#6b7280;font-size:13px;">Fully supported – paste your zoom.us URL</p>
                </div>
              </div>

              <div style="padding:20px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;">
                <p style="margin:0;font-weight:600;color:#92400E;font-size:14px;">⚠️ Important Note</p>
                <p style="margin:8px 0 0 0;color:#92400E;font-size:13px;">Other meeting platforms are not currently supported. Only Google Meet, Microsoft Teams, and Zoom URLs will work with the bot connection feature.</p>
              </div>
            </div>
          `
        },
        {
          id: 'bot-admission-process',
          question: 'What happens when the bot joins my meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">When you connect the SpikedAI bot, here's what happens step by step:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:16px;">1️⃣ Bot Request Appears</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Your meeting platform will show a request notification that <strong>"SpikedAI"</strong> wants to join the meeting. This appears to all meeting participants with host/co-host permissions.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:16px;">2️⃣ Admit the Bot</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Click <strong>Admit</strong> to allow the bot into your meeting. The bot will appear as a participant named "SpikedAI".</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:16px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:16px;">3️⃣ Recording Begins</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Within <strong>5-10 seconds</strong> of admission, the bot starts capturing audio and generating real-time transcriptions.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:10px;padding:20px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#111827;font-size:16px;">4️⃣ Live Analysis Active</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">The bot begins analyzing conversations in real-time, providing transcriptions, sentiment analysis, and smart suggestions in your Console.</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Privacy Note:</strong> The bot only processes audio for transcription and analysis. All participants will see the bot in the meeting, ensuring transparency.
              </p>
            </div>
          `
        },
        {
          id: 'bot-connection-troubleshooting',
          question: 'What if the bot doesn\'t connect?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">If you're having trouble connecting your bot, try these troubleshooting steps:</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Common Issues & Solutions:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">❌ Invalid URL Format</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Make sure you're copying the <strong>complete meeting URL</strong> from Google Meet, Microsoft Teams, or Zoom. The URL should start with the correct domain (meet.google.com, teams.microsoft.com, or zoom.us).</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🔒 Meeting Permissions</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Ensure you have <strong>host or co-host permissions</strong> to admit participants. If you're a regular attendee, ask the host to admit the bot.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">⏱️ Connection Delay</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Wait a few moments after clicking "Connect Meet". The bot request may take 10-15 seconds to appear in your meeting.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🌐 Platform Compatibility</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Verify you're using a <strong>supported platform</strong> (Google Meet, Microsoft Teams, or Zoom). Other platforms won't accept the bot connection.</p>
              </div>

              <p style="margin:0;padding:16px;background:#FEE2E2;border-left:3px solid #DC2626;border-radius:4px;font-size:14px;">
                <strong>Still having issues?</strong> Try refreshing your Console page and reconnecting, or contact support at <strong>support@spiked.ai</strong> for assistance.
              </p>
            </div>
          `
        },
        {
          id: 'disconnect-bot',
          question: 'How do I disconnect the bot from a meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can disconnect the SpikedAI bot at any time during or after your meeting.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Method 1: Stop the bot in Console</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Go to your <strong>Console</strong></li>
                <li style="margin-bottom:10px;padding-left:8px;">Click the <strong>Stop Bot</strong> button in the bot controls</li>
                <li style="margin-bottom:0;padding-left:8px;">The bot will disconnect and leave the meeting immediately</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Method 2: Kick from meeting platform</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Locate <strong>"SpikedAI"</strong> in your participants list</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the bot participant</li>
                <li style="margin-bottom:0;padding-left:8px;">Select <strong>Remove</strong> or <strong>Kick</strong> from the menu</li>
              </ol>

              <div style="padding:20px;background:#FEE2E2;border-left:4px solid #DC2626;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#991B1B;font-size:15px;">⚠️ CRITICAL WARNING</p>
                <p style="margin:8px 0 0 0;color:#991B1B;font-size:14px;"><strong>Always disconnect or stop the bot before ending your meeting.</strong> If you end the meeting without properly disconnecting the bot, it may lead to a <strong>dark blue screen error</strong>. Be careful to stop the bot first!</p>
              </div>

              <div style="padding:20px;background:#EFF6FF;border-left:4px solid #2563EB;border-radius:8px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:14px;">💡 Good to Know</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:13px;">All transcriptions and insights captured before disconnection are automatically saved and remain accessible in your Console.</p>
              </div>
            </div>
          `
        }
      ]
    }
  ]
},
{
  id: 'live-transcription',
  title: 'Live Transcription',
  description: 'See real-time transcriptions and sentiment analysis during your meetings.',
  questions: [
    {
      id: 'transcription-features',
      title: 'Live Transcription Features',
      emoji: '🎤',
      description: 'Real-time voice-to-text transcription and meeting insights.',
      subQuestions: [
        {
          id: 'what-is-live-transcription',
          question: 'What is Live Transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Live Transcription</strong> is SpikedAI's real-time meeting analysis feature that captures every spoken word and provides instant insights during your calls.</p>
              
             

              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 KEY CAPABILITY</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Live Transcription captures conversations in real-time, analyzes speaker patterns, and provides actionable meeting insights as the conversation unfolds.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What Live Transcription captures:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker Identification:</strong> Automatically identifies and labels different speakers in the conversation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-Time Text:</strong> Converts speech to text instantly as people speak</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sentiment Analysis:</strong> Analyzes the emotional tone and sentiment of speakers</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting Insights:</strong> Provides AI-powered suggestions and highlights key moments</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Action Items:</strong> Automatically identifies tasks, questions, and follow-up items</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Recording Starts:</strong> Live Transcription begins automatically 5-10 seconds after you admit the SpikedAI bot to your meeting.
              </p>
            </div>
          `
        },
        {
          id: 'transcription-languages',
          question: 'What languages are supported for transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Currently, SpikedAI Live Transcription supports <strong>English language only</strong>.</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 10px 0;font-weight:600;color:#111827;font-size:15px;">🗣️ Current Language Support</p>
                <ul style="margin:0;padding-left:24px;">
                  <li style="margin-bottom:8px;padding-left:8px;"><strong>English:</strong> Fully supported with high accuracy</li>
                  <li style="margin-bottom:0;padding-left:8px;"><strong>Other Languages:</strong> Not currently supported</li>
                </ul>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Best Results:</strong> For optimal transcription accuracy, ensure speakers speak clearly and minimize background noise during English conversations.
              </p>
            </div>
          `
        },
        {
          id: 'transcription-accuracy',
          question: 'How accurate is the Live Transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">SpikedAI uses advanced AI models to provide high-accuracy transcriptions in real-time.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Factors affecting accuracy:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Audio Quality:</strong> Clear audio with minimal background noise produces the best results</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker Clarity:</strong> Clear pronunciation and normal speaking pace improves accuracy</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Technical Terms:</strong> Industry jargon or specialized vocabulary may occasionally require context</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Multiple Speakers:</strong> The AI handles overlapping speech but works best when speakers take turns</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Accents:</strong> Various English accents are supported with high accuracy</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Tips for best accuracy:</p>
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🎧 Use Good Audio Equipment</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">High-quality microphones or headsets significantly improve transcription accuracy.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🔇 Minimize Background Noise</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Choose quiet environments and mute when not speaking to reduce audio interference.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">💬 Speak Naturally</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Normal conversational pace works best – no need to speak slowly or unnaturally.</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> You can review and highlight transcriptions after the meeting in your Console.
              </p>
            </div>
          `
        },
       
        {
          id: 'view-transcriptions',
          question: 'How can I view my transcriptions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can view all your meeting transcriptions in the Meeting Logs section of the Admin page.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">How to access transcriptions:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Navigate to the <strong>Admin Page</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Click on <strong>Meeting Logs</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Select the meeting you want to review</li>
                <li style="margin-bottom:0;padding-left:8px;">View the complete transcription with timestamps and speaker identification</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">What you can do with transcriptions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review Conversations:</strong> Read through the complete meeting transcript</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Search Content:</strong> Find specific keywords or topics discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Highlight Key Points:</strong> Mark important sections for future reference</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Reference Later:</strong> Access past meetings anytime from Meeting Logs</li>
              </ul>

              <div style="padding:20px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#92400E;font-size:14px;">📝 Note</p>
                <p style="margin:8px 0 0 0;color:#92400E;font-size:13px;">Export and download features for transcriptions are not currently available. You can only view transcriptions within the Meeting Logs section.</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use the Meeting Logs regularly to review past conversations and track important discussions over time.
              </p>
            </div>
          `
        },
        
      ]
    }
  ]
},
      {
  id: 'ai-copilot',
  title: 'AI Copilot',
  description: 'Your intelligent assistant that answers questions from your documents, transcriptions, and beyond.',
  questions: [
    {
      id: 'ai-copilot-features',
      title: 'AI Copilot Features',
      emoji: '🤖',
      description: 'Get instant answers from your meeting transcriptions and documents.',
      subQuestions: [
        {
          id: 'what-is-ai-copilot',
          question: 'What is the AI Copilot?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The <strong>AI Copilot</strong> is your intelligent assistant that provides instant answers based on your meeting transcriptions, uploaded documents, and beyond.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 KEY CAPABILITY</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">AI Copilot analyzes your live transcriptions and document knowledge base to provide contextual answers during and after meetings.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What AI Copilot can do:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Answer from Transcriptions:</strong> Get insights from your live and past meeting conversations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Search Documents:</strong> Find answers from your uploaded knowledge base</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Smart Meeting Questions:</strong> Auto-generated questions based on your meeting focus</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Ask Beyond:</strong> Access web information when answers aren't in your documents</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Track History:</strong> Review past questions and answers with toggle history</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> The AI Copilot gets smarter as you add more documents and conduct more meetings.
              </p>
            </div>
          `
        },
        {
          id: 'how-to-ask-questions',
          question: 'How do I ask questions to the AI Copilot?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">There are multiple ways to interact with your AI Copilot and get instant answers.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Method 1: Manual Questions</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Go to your <strong>Console</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Find the <strong>AI Copilot</strong> section</li>
                <li style="margin-bottom:12px;padding-left:8px;">Type your question in the input field</li>
                <li style="margin-bottom:0;padding-left:8px;">The AI will search your documents and transcriptions to provide an answer</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Method 2: Meeting Questions (Smart Suggestions)</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">During your meeting, check the <strong>Smart Suggestions</strong> panel</li>
                <li style="margin-bottom:12px;padding-left:8px;">Look for the <strong>Meeting Questions</strong> section</li>
                <li style="margin-bottom:12px;padding-left:8px;">AI-generated questions appear based on your <strong>Meeting Focus</strong> (set in Personalization)</li>
                <li style="margin-bottom:12px;padding-left:8px;">Click on any question to automatically get an answer</li>
                <li style="margin-bottom:0;padding-left:8px;">The AI searches your documents and provides relevant information</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Method 3: Transcription-Based Questions</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">During live transcription, locate the <strong>question button</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Click the button to capture the entire transcription</li>
                <li style="margin-bottom:0;padding-left:8px;">The AI analyzes the conversation and answers any questions that were asked in the meeting but not captured in Meeting Questions</li>
              </ol>

              

              <div style="padding:20px;background:#EFF6FF;border-left:4px solid #2563EB;border-radius:8px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:14px;">💡 Smart Integration</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:13px;">Meeting Questions are generated based on the Meeting Focus you set during Personalization in the Getting Started section.</p>
              </div>
            </div>
          `
        },
        {
          id: 'meeting-questions-feature',
          question: 'What are Meeting Questions in Smart Suggestions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Meeting Questions</strong> are AI-generated questions that appear in the Smart Suggestions panel based on your meeting focus.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 HOW IT WORKS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Before your meeting, you set a <strong>Meeting Focus</strong> in the Personalization section (Getting Started). The AI uses this focus to generate relevant questions during your meeting that can be answered from your document knowledge base.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">How to use Meeting Questions:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Navigate to <strong>Smart Suggestions</strong> during your meeting</li>
                <li style="margin-bottom:12px;padding-left:8px;">Find the <strong>Meeting Questions</strong> section</li>
                <li style="margin-bottom:12px;padding-left:8px;">Review the AI-generated questions relevant to your meeting focus</li>
                <li style="margin-bottom:12px;padding-left:8px;">Click on any question</li>
                <li style="margin-bottom:0;padding-left:8px;">The AI automatically searches your documents and provides an answer</li>
              </ol>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Set a clear and specific Meeting Focus in Personalization to get the most relevant Meeting Questions.
              </p>
            </div>
          `
        },
        {
          id: 'ask-beyond-feature',
          question: 'What is "Ask Beyond" and how does it work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Ask Beyond</strong> is a feature that allows the AI Copilot to search beyond your documents and access information from the web.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🌐 WEB ACCESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">When the answer to your question is not found in your uploaded documents or transcriptions, you can use Ask Beyond to get information from the internet.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to use Ask Beyond:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Ask your question in the AI Copilot</li>
                <li style="margin-bottom:12px;padding-left:8px;">If the answer is not in your documents, a <strong>dropdown button</strong> will appear</li>
                <li style="margin-bottom:12px;padding-left:8px;">Click the dropdown and select <strong>"Ask Beyond"</strong></li>
                <li style="margin-bottom:0;padding-left:8px;">The AI will search the web and provide an answer with web access enabled</li>
              </ol>

              
              <p style="margin-bottom:12px;font-weight:600;">When to use Ask Beyond:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">When information is not available in your documents</li>
                <li style="margin-bottom:10px;padding-left:8px;">For real-time or current information needs</li>
                <li style="margin-bottom:10px;padding-left:8px;">To supplement your knowledge base with external data</li>
                <li style="margin-bottom:0;padding-left:8px;">When you need broader context beyond your uploaded materials</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Ask Beyond provides web-sourced information to complement your document-based answers.
              </p>
            </div>
          `
        },
        {
          id: 'ai-copilot-controls',
          question: 'What controls are available in the AI Copilot?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The AI Copilot includes several control buttons to help you manage your questions and answers effectively.</p>
              
              <p style="margin-bottom:12px;font-weight:600;">Available controls:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🔄 Toggle History</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">View your past questions and answers. Click the toggle history button to show or hide your conversation history with the AI Copilot.</p>
              </div>

              

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">📝 Question Input</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Type custom questions directly to get answers from your documents and transcriptions.</p>
              </div>

              

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use toggle history to review previous answers and build on earlier conversations.
              </p>
            </div>
          `
        },
        {
          id: 'transcription-questions',
          question: 'How does the transcription question capture work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">During live transcription, you can capture questions directly from the conversation to get immediate answers.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 SMART CAPTURE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">This feature helps you capture questions that were asked during the meeting but didn't appear in the Meeting Questions section.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">During your live meeting transcription, locate the <strong>question capture button</strong></li>
                <li style="margin-bottom:12px;padding-left:8px;">Click the button when you want to capture a question from the conversation</li>
                <li style="margin-bottom:12px;padding-left:8px;">The AI takes the <strong>entire transcription</strong> up to that point</li>
                <li style="margin-bottom:12px;padding-left:8px;">It identifies questions that were asked in the meeting</li>
                <li style="margin-bottom:0;padding-left:8px;">The AI answers those questions directly if the information is available in your documents</li>
              </ol>

             
              <p style="margin-bottom:12px;font-weight:600;">Benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Catch Missed Questions:</strong> Capture questions that weren't auto-generated</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Contextual Answers:</strong> Get answers based on the full conversation context</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-Time Support:</strong> Answer client or team questions on the spot</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Comprehensive Coverage:</strong> Ensure no important question goes unanswered</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Perfect for meetings where participants ask questions that need document-backed answers.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'smart-suggestions',
  title: 'Smart Suggestions',
  description: 'Get AI-powered real-time insights during and after meetings with intelligent analysis and recommendations.',
  questions: [
    {
      id: 'smart-suggestions-features',
      title: 'Smart Suggestions Features',
      emoji: '💡',
      description: 'Real-time AI insights during meetings—questions, sentiment, and more.',
      subQuestions: [
        {
          id: 'what-are-smart-suggestions',
          question: 'What are Smart Suggestions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Smart Suggestions</strong> is your AI-powered assistant that provides real-time insights, analysis, and recommendations during your meetings.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 INTELLIGENT MEETING COMPANION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Smart Suggestions analyzes your live conversations to provide contextual questions, track sentiment, identify buying signals, and recommend actions—all in real-time.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Smart Suggestions includes:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting Questions:</strong> AI-generated questions relevant to your meeting focus</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sources:</strong> Reference sources for answers and insights</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Client Questions:</strong> Track questions asked by clients during the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>User Questions:</strong> Monitor questions asked by your team</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Live Sentiment:</strong> Real-time sentiment analysis with buying signals and concerns</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Playbook Suggestions:</strong> AI-recommended actions based on conversation flow</li>
              </ul>

              

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Smart Suggestions work best when you set a clear Meeting Focus in Personalization before starting your meeting.
              </p>
            </div>
          `
        },
        {
          id: 'meeting-questions-smart-suggestions',
          question: 'How do Meeting Questions work in Smart Suggestions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Meeting Questions</strong> are AI-generated questions that appear automatically during your meeting, tailored to your specific meeting focus and topic.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 CONTEXTUAL INTELLIGENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI analyzes your Meeting Focus (set in Personalization) and generates relevant questions that can be answered using your document knowledge base.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How Meeting Questions work:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Set your <strong>Meeting Focus</strong> in Personalization (Getting Started section)</li>
                <li style="margin-bottom:12px;padding-left:8px;">Start your meeting with transcription enabled</li>
                <li style="margin-bottom:12px;padding-left:8px;">Navigate to the <strong>Smart Suggestions</strong> panel</li>
                <li style="margin-bottom:12px;padding-left:8px;">View AI-generated questions in the <strong>Meeting Questions</strong> section</li>
                <li style="margin-bottom:0;padding-left:8px;">Click any question to get instant answers from your documents</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Topic-Specific:</strong> Questions are relevant to your meeting focus and subject</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Document-Backed:</strong> Answers come from your uploaded knowledge base</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>One-Click Access:</strong> Click any question for instant answers</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Dynamic Generation:</strong> Questions adapt based on conversation context</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> The more specific your Meeting Focus, the more relevant and useful your Meeting Questions will be.
              </p>
            </div>
          `
        },
        {
          id: 'sources-references',
          question: 'What are Sources in Smart Suggestions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Sources</strong> provide references and documentation for the answers and insights provided by the AI during your meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📚 REFERENCE TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">When the AI answers questions or provides insights, Sources show you exactly which documents or transcriptions were used to generate the response.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What Sources provide:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Document References:</strong> Shows which uploaded documents were used</li>
               
               
              </ul>

              
              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Always check Sources to ensure the AI's answers align with your most current documentation.
              </p>
            </div>
          `
        },
        {
          id: 'client-user-questions',
          question: 'What are Client Questions and User Questions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Smart Suggestions tracks questions asked during your meetings separately for <strong>Client Questions</strong> and <strong>User Questions</strong>.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 QUESTION TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI identifies and categorizes questions asked by clients versus questions asked by your team, helping you track engagement and information needs.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Client Questions:</p>
              <ul style="margin:0 0 20px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Questions asked by clients or external participants during the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Helps identify client concerns and information needs</li>
                <li style="margin-bottom:0;padding-left:8px;">Useful for follow-up and ensuring all client queries are addressed</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">User Questions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Questions asked by you or your team members during the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Track internal queries and knowledge gaps</li>
                <li style="margin-bottom:0;padding-left:8px;">Identify areas where additional documentation may be needed</li>
              </ul>

              

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Review Client Questions after meetings to ensure comprehensive follow-up and client satisfaction.
              </p>
            </div>
          `
        },
        {
          id: 'live-sentiment-analysis',
          question: 'What is Live Sentiment Analysis?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Live Sentiment Analysis</strong> provides real-time emotional and engagement insights during your meetings, helping you understand participant sentiment, buying signals, and concerns.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 REAL-TIME INTELLIGENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI continuously analyzes conversation tone, participant engagement, and decision-making signals to give you actionable insights during live meetings.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Key Features of Live Sentiment:</p>
              
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🔇 Mute Control</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Mute individual participants to stop recording their transcriptions. Useful for selective recording or privacy management during meetings.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">📊 Speaking Percentage</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Track each participant's contribution to the conversation. Shows what percentage of the meeting each person is speaking—whether it's 100%, 50%, or any other distribution.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">✅ Buying Signals</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">AI detects positive indicators showing interest in your product or service. When a client shows interest or moves toward finalizing a decision, these are captured as buying signals.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">⚠️ Concerns</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Identifies when participants express hesitation, uncertainty, or disinterest. Helps you address objections in real-time and plan follow-up strategies.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🎯 Recommended Actions</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">AI generates suggested actions based on the conversation flow and sentiment. Get intelligent recommendations on how to proceed or respond.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🚨 Critical Alerts</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Receive high-priority alerts based on conversation content. Negative signals appear as concerns, while positive signals strengthen your buying signals.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:12px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">👔 Decision Maker Identification</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">The AI identifies whether participants are decision makers based on their language and engagement patterns.</p>
              </div>

              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:24px;background:#fefefe;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#111827;font-size:15px;">🔄 Reset Sentiment</p>
                <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">Reset the sentiment analysis to start fresh. Useful when transitioning to a new topic or starting a new discussion phase.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Sentiment Indicators:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Positive (Speaking Positively):</strong> Participant shows enthusiasm and interest</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Neutral:</strong> Balanced conversation without strong emotional indicators</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Negative:</strong> Participant expresses concerns or disinterest—triggers high alerts</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Monitor Live Sentiment throughout your meeting to adjust your approach in real-time and maximize engagement.
              </p>
            </div>
          `
        },
        {
          id: 'playbook-suggestions',
          question: 'What are Playbook Suggestions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Playbook Suggestions</strong> provide AI-powered recommendations and action items based on your meeting conversation and flow.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 INTELLIGENT GUIDANCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI analyzes your conversation in real-time and suggests next steps, talking points, or actions that can help you navigate the meeting more effectively.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What Playbook Suggestions provide:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recommended Actions:</strong> AI suggests next steps based on conversation context</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Talking Points:</strong> Get prompts for important topics to cover</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Response Strategies:</strong> Suggestions on how to address concerns or objections</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Conversation Guidance:</strong> Stay on track with meeting objectives</li>
              </ul>

              

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Follow Playbook Suggestions to improve meeting outcomes and ensure you cover all critical points.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
  {
  id: 'layout-options',
  title: 'Layout Options',
  description: 'Customize your workspace view with flexible layout configurations for optimal meeting experience.',
  questions: [
    {
      id: 'layout-features',
      title: 'Layout Features',
      emoji: '🖥️',
      description: 'Choose the perfect view for your meeting workflow.',
      subQuestions: [
        {
          id: 'what-are-layout-options',
          question: 'What are Layout Options?',
          answer: `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;">
              <div style="flex:1;min-width:300px;line-height:1.8;color:#374151;font-size:15px;">
                <p style="margin-bottom:20px;"><strong>Layout Options</strong> allow you to customize your workspace view to match your meeting needs, giving you control over which panels are visible and how they're emphasized.</p>

                <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                  <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 FLEXIBLE WORKSPACE</p>
                  <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Choose from four different layout configurations to optimize your screen space and focus on what matters most during your meetings.</p>
                </div>

                <p style="margin-bottom:12px;font-weight:600;">Available Layout Options:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li style="margin-bottom:10px;padding-left:8px;"><strong>Full View:</strong> All panels visible for complete overview</li>
                  <li style="margin-bottom:10px;padding-left:8px;"><strong>Focused:</strong> All panels visible with chat emphasized</li>
                  <li style="margin-bottom:10px;padding-left:8px;"><strong>Convo + AI:</strong> Only chat and suggestions panels</li>
                  <li style="margin-bottom:0;padding-left:8px;"><strong>Chat Only:</strong> Pure conversation view without distractions</li>
                </ul>

                <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                  <strong>Pro Tip:</strong> Switch between layouts during meetings to adapt to different phases—use Full View for monitoring, Focused for active conversation.
                </p>
              </div>
              <div style="flex:1;min-width:300px;display:flex;justify-content:center;align-items:center;">
                <img 
                  src="/tutorial/layout.png" 
                  alt="Layout Options Screenshot" 
                  style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'full-view-layout',
          question: 'What is Full View layout?',
          answer: `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;">
              <div style="flex:1;min-width:300px;line-height:1.8;color:#374151;font-size:15px;">
                <p style="margin-bottom:20px;"><strong>Full View</strong> displays all available panels simultaneously, giving you complete visibility of all meeting features and information.</p>
                
                <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                  <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 COMPLETE OVERVIEW</p>
                  <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Full View shows all panels including chat, transcriptions, Smart Suggestions, AI Copilot, and any other available features on your screen at once.</p>
                </div>

                <p style="margin-bottom:12px;font-weight:600;">What's visible in Full View:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li><strong>Chat Panel:</strong> All conversation messages</li>
                  <li><strong>Transcription Panel:</strong> Live meeting transcriptions</li>
                  <li><strong>Smart Suggestions Panel:</strong> AI insights and recommendations</li>
                  <li><strong>AI Copilot Panel:</strong> Question and answer interface</li>
                  <li><strong>Additional Panels:</strong> Any other enabled features</li>
                </ul>

                <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li>Monitoring all aspects of your meeting simultaneously</li>
                  <li>Users with large screens or multiple monitors</li>
                  <li>Meetings where you need quick access to all features</li>
                  <li>Power users who want maximum information density</li>
                </ul>

                <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                  <strong>Use Case:</strong> Ideal for complex meetings where you need to track conversations, sentiment, and questions all at once.
                </p>
              </div>
              <div style="flex:1;min-width:300px;display:flex;justify-content:center;align-items:center;">
                <img 
                  src="/tutorial/full view.png" 
                  alt="Full View Screenshot" 
                  style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'focused-layout',
          question: 'What is Focused layout?',
          answer: `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;">
              <div style="flex:1;min-width:300px;line-height:1.8;color:#374151;font-size:15px;">
                <p style="margin-bottom:20px;"><strong>Focused</strong> layout displays all panels like Full View, but emphasizes and prioritizes the chat panel for active conversation engagement.</p>

                <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                  <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💬 CONVERSATION PRIORITY</p>
                  <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">While all panels remain visible, Focused layout makes the chat larger and more prominent, helping you stay engaged in the conversation while maintaining access to other features.</p>
                </div>

                <p style="margin-bottom:12px;font-weight:600;">Key characteristics:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li><strong>Chat Emphasized:</strong> Chat panel is larger and more prominent</li>
                  <li><strong>All Panels Available:</strong> Other features remain accessible but smaller</li>
                  <li><strong>Balanced View:</strong> Focus on conversation without losing overview</li>
                  <li><strong>Easy Switching:</strong> Quickly glance at suggestions and insights</li>
                </ul>

                <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li>Active participation in meeting conversations</li>
                  <li>When you need to respond quickly in chat</li>
                  <li>Balancing conversation focus with feature access</li>
                  <li>Most common meeting scenarios</li>
                </ul>

                <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                  <strong>Pro Tip:</strong> Focused is the perfect middle ground—stay engaged in conversations while keeping AI insights in your peripheral vision.
                </p>
              </div>
              <div style="flex:1;min-width:300px;display:flex;justify-content:center;align-items:center;">
                <img 
                  src="/tutorial/focused.png" 
                  alt="Focused View Screenshot" 
                  style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'convo-ai-layout',
          question: 'What is Convo + AI layout?',
          answer: `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;">
              <div style="flex:1;min-width:300px;line-height:1.8;color:#374151;font-size:15px;">
                <p style="margin-bottom:20px;"><strong>Convo + AI</strong> layout shows only the chat panel and Smart Suggestions panel, providing a streamlined view focused on conversation and AI insights.</p>

                <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                  <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🤝 CONVERSATION + INTELLIGENCE</p>
                  <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">This layout combines your conversation interface with AI-powered suggestions, removing other panels to give you more space for what matters most.</p>
                </div>

                <p style="margin-bottom:12px;font-weight:600;">What's visible:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li><strong>Chat Panel:</strong> Full conversation interface</li>
                  <li><strong>Smart Suggestions Panel:</strong> Meeting Questions, sentiment, buying signals, and playbook</li>
                </ul>

                <p style="margin-bottom:12px;font-weight:600;">What's hidden:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li>Transcription panel</li>
                  <li>AI Copilot panel</li>
                  <li>Other auxiliary features</li>
                </ul>

                <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li>Sales and client meetings where sentiment tracking is crucial</li>
                  <li>When you want AI insights without extra clutter</li>
                  <li>Smaller screens or laptops with limited space</li>
                  <li>Users who primarily interact through chat with AI support</li>
                </ul>

                <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                  <strong>Use Case:</strong> Perfect for sales professionals who need to monitor buying signals and concerns while actively chatting with clients.
                </p>
              </div>
              <div style="flex:1;min-width:300px;display:flex;justify-content:center;align-items:center;">
                <img 
                  src="/tutorial/convo ai.png" 
                  alt="Convo Plus AI Screenshot" 
                  style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                />
              </div>
            </div>
          `
        },
        {
          id: 'chat-only-layout',
          question: 'What is Chat Only layout?',
          answer: `
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:24px;flex-wrap:wrap;">
              <div style="flex:1;min-width:300px;line-height:1.8;color:#374151;font-size:15px;">
                <p style="margin-bottom:20px;"><strong>Chat Only</strong> layout displays exclusively the chat panel, removing all other features for a pure, distraction-free conversation experience.</p>

                <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                  <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💬 PURE CONVERSATION</p>
                  <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Chat Only gives you maximum screen space for conversation, hiding all AI features, suggestions, transcriptions, and other panels.</p>
                </div>

                <p style="margin-bottom:12px;font-weight:600;">What's visible:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li><strong>Chat Panel Only:</strong> Full-screen conversation interface</li>
                </ul>

                <p style="margin-bottom:12px;font-weight:600;">What's hidden:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li>Smart Suggestions panel</li>
                  <li>Transcription panel</li>
                  <li>AI Copilot panel</li>
                  <li>All other features and panels</li>
                </ul>

                <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
                <ul style="margin:0 0 24px 0;padding-left:24px;">
                  <li>Simple, focused conversations without distractions</li>
                  <li>When you don't need AI features or transcriptions</li>
                  <li>Smaller screens where space is at a premium</li>
                  <li>Casual meetings that don't require advanced features</li>
                  <li>Users who prefer minimal interface design</li>
                </ul>

                <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                  <strong>Pro Tip:</strong> Use Chat Only when you need maximum focus on conversation content without any visual distractions.
                </p>
              </div>
              <div style="flex:1;min-width:300px;display:flex;justify-content:center;align-items:center;">
                <img 
                  src="/tutorial/chat only.png" 
                  alt="Chat Only Screenshot" 
                  style="width:100%;height:auto;display:block;border-radius:8px;object-fit:contain;image-rendering:-webkit-optimize-contrast;"
                />
              </div>
            </div>
          `
        }
      ]
    }
  ]
},

    
    
   {
  id: 'integrations',
  title: 'Integrations',
  description: 'Connect your favorite tools and platforms with our meeting assistant.',
  questions: [
    {
      id: 'integrations-info',
      title: 'Integrations',
      emoji: '🔗',
      description: 'Third-party integrations and connections.',
      subQuestions: [
        {
          id: 'what-are-integrations',
          question: 'What integrations are available?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Integrations</strong> allow you to connect our platform with your favorite tools and services to streamline your workflow.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🚀 COMING SOON</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Integrations with popular platforms and tools are currently under development and will be available in future updates.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What to expect:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Seamless connectivity with third-party applications</li>
                <li style="margin-bottom:10px;padding-left:8px;">Enhanced workflow automation</li>
                <li style="margin-bottom:10px;padding-left:8px;">Data synchronization across platforms</li>
                <li style="margin-bottom:0;padding-left:8px;">Improved productivity through connected tools</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Stay Tuned:</strong> Integrations are part of our future development roadmap and will be announced when available.
              </p>
            </div>
          `
        }
      ]
    }
  ]
}
  ]
},
livePlaybook: {
  cardId: 'card-liveplaybook',
  cardTitle: 'Live Playbook',
  cardDescription:
    'Access real-time insights during meetings — track performance metrics, analyze buyer signals, review custom goals, and monitor live sentiment to make smarter decisions instantly.',
  icon: <BookOpen style={{ width: '20px', height: '20px' }} />,
  emoji: '📘',
  items: [
    {
  id: 'playbook-analysis-section',
  title: 'Playbook Analysis',
  description: 'Automatically analyze sales meetings and track key decision-making factors in real-time.',
  questions: [
    {
      id: 'playbook-analysis-features',
      title: 'Playbook Analysis Features',
      emoji: '📊',
      description: 'Track metrics, decision criteria, pain points, and key stakeholders during sales meetings.',
      subQuestions: [
        {
          id: 'what-is-playbook-analysis',
          question: 'What is Playbook Analysis?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Playbook Analysis</strong> automatically analyzes your sales meetings and tracks critical information like metrics, ROI, economic buyers, decision criteria, pain points, and champions as the conversation unfolds.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 SALES INTELLIGENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">When the bot joins a meeting and transcriptions are recorded, Playbook Analysis automatically identifies and tracks key sales information discussed during the conversation.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Key analysis categories:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Metrics and ROI:</strong> Financial metrics and return on investment discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Economic Buyer:</strong> Identifies who controls the budget and makes financial decisions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decision Criteria:</strong> What factors influence the buying decision</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decision Process:</strong> How the organization makes purchasing decisions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pain Points:</strong> Problems and challenges the prospect is facing</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Champion:</strong> Internal advocate supporting your solution</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Bot joins the meeting and starts recording transcriptions</li>
                <li style="margin-bottom:10px;padding-left:8px;">Analysis automatically identifies relevant information as it's discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;">Each category shows status: Discussed, Analyzed, or Not Discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;">Generate summary button provides detailed insights for each category</li>
                <li style="margin-bottom:0;padding-left:8px;">Information updates automatically during the meeting</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> If someone mentions "Sundar Pichai is our champion at Google," Playbook Analysis will record this in the Champion category, mark it as "Discussed," and generate a summary explaining why this was identified.
              </p>
            </div>
          `
        },
        {
          id: 'why-playbook-necessary',
          question: 'Why is Playbook Analysis necessary?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Playbook Analysis is essential for sales teams to capture and track critical deal information automatically, ensuring no important details are missed during customer conversations.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💼 SALES SUCCESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">In sales, understanding decision-makers, pain points, and buying criteria is crucial for closing deals. Playbook Analysis ensures you capture all this information automatically.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Why it matters for sales:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Never miss key information:</strong> Automatically captures critical sales intelligence</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify decision-makers:</strong> Know who has buying authority and who champions your solution</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Understand pain points:</strong> Track customer challenges to position your solution effectively</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Map decision process:</strong> Understand how customers make buying decisions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quantify value:</strong> Capture metrics and ROI discussions to justify investments</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Better deal strategy:</strong> Use insights to develop winning sales strategies</li>
              </ul>


              <p style="margin-bottom:12px;font-weight:600;">Sales benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Faster deal progression:</strong> Clear visibility into what information you have and what's missing</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Improved accuracy:</strong> Automated tracking reduces human error in note-taking</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Team alignment:</strong> Everyone has access to the same deal intelligence</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better forecasting:</strong> Complete information leads to more accurate predictions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Coaching opportunities:</strong> Managers can see what questions are being asked</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Deal review efficiency:</strong> Quick summary of all critical deal factors</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Bottom Line:</strong> Playbook Analysis ensures your sales team captures all the critical information needed to understand customer needs, navigate decision processes, and close deals successfully.
              </p>
            </div>
          `
        },
        {
          id: 'analysis-categories',
          question: 'What are the key analysis categories?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Playbook Analysis tracks six critical categories of sales information: Metrics and ROI, Economic Buyer, Decision Criteria, Decision Process, Pain Points, and Champion.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📋 KEY CATEGORIES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Each category is analyzed only when discussed in the meeting, with status indicators showing whether information has been captured.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">1. Metrics and ROI</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Financial metrics and measurements discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;">Return on investment calculations and expectations</li>
                <li style="margin-bottom:10px;padding-left:8px;">Quantifiable business outcomes and targets</li>
                <li style="margin-bottom:0;padding-left:8px;">Success metrics and KPIs mentioned</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">2. Economic Buyer</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Person who controls the budget and has financial authority</li>
                <li style="margin-bottom:10px;padding-left:8px;">Final decision-maker on purchasing decisions</li>
                <li style="margin-bottom:10px;padding-left:8px;">Who signs off on investments and contracts</li>
                <li style="margin-bottom:0;padding-left:8px;">Budget holder and financial approver</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">3. Decision Criteria</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Factors that influence the buying decision</li>
                <li style="margin-bottom:10px;padding-left:8px;">Requirements and must-haves for the solution</li>
                <li style="margin-bottom:10px;padding-left:8px;">Evaluation criteria and priorities</li>
                <li style="margin-bottom:0;padding-left:8px;">What matters most in making the decision</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">4. Decision Process</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">How the organization makes purchasing decisions</li>
                <li style="margin-bottom:10px;padding-left:8px;">Steps and stages in the buying process</li>
                <li style="margin-bottom:10px;padding-left:8px;">Who is involved in the decision and their roles</li>
                <li style="margin-bottom:0;padding-left:8px;">Timeline and approval workflow</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">5. Pain Points</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Problems and challenges the prospect is facing</li>
                <li style="margin-bottom:10px;padding-left:8px;">Current issues and frustrations mentioned</li>
                <li style="margin-bottom:10px;padding-left:8px;">Business impact of existing problems</li>
                <li style="margin-bottom:0;padding-left:8px;">Urgency and severity of pain points</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">6. Champion</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Internal advocate who supports your solution</li>
                <li style="margin-bottom:10px;padding-left:8px;">Person promoting your product within their organization</li>
                <li style="margin-bottom:10px;padding-left:8px;">Ally who helps navigate internal processes</li>
                <li style="margin-bottom:0;padding-left:8px;">Influencer who champions your cause</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Analysis for each category only occurs when that topic is discussed in the meeting. Each category shows its status: Discussed, Analyzed, or Not Discussed.
              </p>
            </div>
          `
        },
        {
          id: 'status-indicators',
          question: 'What do the status indicators mean?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Each analysis category displays a status indicator showing whether the topic has been discussed and analyzed during the meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🚦 STATUS TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Status indicators help you quickly see which critical sales information has been covered in the conversation.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Status types:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Discussed:</strong> The topic was mentioned and information was captured</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Analyzed:</strong> The information has been processed and summarized</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Not Discussed:</strong> The topic hasn't been covered in the meeting yet</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">How to use status indicators:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick assessment:</strong> See at a glance what information you've captured</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify gaps:</strong> Know which topics haven't been discussed yet</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Guide conversation:</strong> Use gaps to direct discussion to missing topics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Track completeness:</strong> Ensure all critical categories are covered</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Meeting preparation:</strong> Know what questions to ask in follow-up meetings</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use status indicators during the meeting to ensure you cover all critical topics before the conversation ends.
              </p>
            </div>
          `
        },
        {
          id: 'generate-summary',
          question: 'How does the Generate Summary feature work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The Generate Summary button creates detailed summaries for each analysis category, explaining what was discussed and why it's relevant.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📝 SUMMARY GENERATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Generate detailed summaries that explain what was discussed in each category and provide context for the information captured.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Information is captured as the category is discussed in the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click the Generate Summary button for that category</li>
                <li style="margin-bottom:10px;padding-left:8px;">System analyzes the captured information</li>
                <li style="margin-bottom:10px;padding-left:8px;">Summary is generated explaining what was discussed and why</li>
                <li style="margin-bottom:0;padding-left:8px;">Summary includes context and relevant details</li>
              </ol>

             
              <p style="margin-bottom:12px;font-weight:600;">Example:</p>
              <div style="padding:16px;background:#f9fafb;border-left:3px solid #10B981;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;font-weight:600;">Meeting discussion:</p>
                <p style="margin:0 0 12px 0;font-style:italic;color:#6B7280;">"Sundar Pichai is our champion at Google and he's really pushing for this solution internally."</p>
                <p style="margin:0 0 8px 0;font-weight:600;">Generated summary:</p>
                <p style="margin:0;color:#374151;">The champion identified is Sundar Pichai at Google. This is significant because having an executive-level champion indicates strong internal support. Sundar is actively advocating for the solution within Google, which can help navigate decision-making processes and overcome potential objections.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What summaries include:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Key information:</strong> What was specifically mentioned</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> Why this information matters</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevance:</strong> How it impacts the sales process</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Details:</strong> Supporting information from the conversation</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Insights:</strong> What this tells you about the deal</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Summaries are generated based on what was actually discussed in the meeting, providing accurate and contextual information.
              </p>
            </div>
          `
        },
        {
          id: 'auto-refresh',
          question: 'How does the auto-refresh feature work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Playbook Analysis automatically refreshes every 90 seconds to show the latest information as the meeting progresses. You can also manually refresh or customize the refresh interval.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔄 AUTO-REFRESH</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Analysis updates automatically every 90 seconds to capture new information as the conversation unfolds.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Auto-refresh features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>90-second interval:</strong> Default automatic refresh every 90 seconds</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Manual refresh:</strong> Refresh button available for immediate updates</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Settings control:</strong> Customize auto-refresh interval in settings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time updates:</strong> Latest information appears as it's analyzed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Continuous monitoring:</strong> Works throughout the entire meeting</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">Using the refresh button:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Manual refresh:</strong> Click the refresh button for immediate update</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Available anytime:</strong> Use when you want to see latest information immediately</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Do not spam:</strong> Avoid clicking multiple times in quick succession</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Wait for completion:</strong> Let the refresh complete before clicking again</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Settings configuration:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click the settings button</li>
                <li style="margin-bottom:10px;padding-left:8px;">Locate the auto-refresh interval option</li>
                <li style="margin-bottom:10px;padding-left:8px;">Set your preferred refresh interval</li>
                <li style="margin-bottom:10px;padding-left:8px;">Save settings</li>
                <li style="margin-bottom:0;padding-left:8px;">Auto-refresh starts working with new interval</li>
              </ol>

              
              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #EF4444;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Do not click the refresh button multiple times. It is advised to wait for the current refresh to complete before clicking again to avoid system overload.
              </p>
            </div>
          `
        },
        {
          id: 'using-playbook-effectively',
          question: 'How do I use Playbook Analysis effectively?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Use Playbook Analysis to guide your sales conversations, ensure all critical information is captured, and develop winning strategies based on real-time insights.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💡 BEST PRACTICES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Maximize the value of Playbook Analysis by actively using it during meetings and following up on insights after.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">During the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Monitor status:</strong> Check which categories have been discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Fill gaps:</strong> Ask questions about categories marked "Not Discussed"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review regularly:</strong> Check analysis periodically during longer meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Capture details:</strong> Ensure important information is being recorded</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Guide conversation:</strong> Use missing categories to direct discussion</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">After the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Generate summaries:</strong> Create detailed summaries for all discussed categories</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review insights:</strong> Analyze what was learned about the deal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify next steps:</strong> Plan follow-up actions based on gaps</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Share with team:</strong> Distribute summaries to relevant stakeholders</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Update CRM:</strong> Transfer key information to your CRM system</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Plan follow-up:</strong> Schedule meetings to address missing information</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">Key strategies:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Complete coverage:</strong> Try to discuss all six categories in discovery calls</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prioritize gaps:</strong> Focus on missing critical information like Economic Buyer</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use in qualification:</strong> Determine if opportunity is worth pursuing</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Support coaching:</strong> Managers can review what was asked and discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Improve consistency:</strong> Ensure all reps cover the same ground</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Track progress:</strong> Compare analysis across multiple meetings</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use Playbook Analysis as your meeting checklist - aim to have all six categories marked as "Discussed" by the end of your discovery call.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'buying-signals-section',
  title: 'Buying Signals',
  description: 'Automatically detect and track buying intent signals during sales conversations.',
  questions: [
    {
      id: 'buying-signals-features',
      title: 'Buying Signals Features',
      emoji: '🎯',
      description: 'Identify customer interest and buying intent with AI-powered signal detection.',
      subQuestions: [
        {
          id: 'what-are-buying-signals',
          question: 'What are Buying Signals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Buying Signals</strong> automatically detects and tracks signs of customer interest and purchase intent during sales conversations. When prospects express interest, ask about implementation, or discuss finalizing the product, these signals are captured and scored.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 INTENT DETECTION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">During the meeting conversation, Buying Signals identifies when prospects show purchase interest and automatically assigns point values to each signal detected.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic detection:</strong> Identifies buying signals as they occur in conversation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Point scoring:</strong> Each signal is assigned points (e.g., 25 points per signal)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>AI summaries:</strong> Explains why each statement is considered a buying signal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time tracking:</strong> Captures signals during the meeting</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Intent scoring:</strong> Quantifies overall buying interest</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Examples of buying signals:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">"I am interested in the product"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"We are looking to finalize this soon"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"When can we start implementation?"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"What's the next step in the process?"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"I'd like to discuss pricing"</li>
                <li style="margin-bottom:0;padding-left:8px;">"Can you send over the contract?"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>How it works:</strong> When a prospect says something like "I am finalizing the product," Buying Signals detects this, assigns points (e.g., 25 points), and generates an AI summary explaining why this indicates buying intent.
              </p>
            </div>
          `
        },
        {
          id: 'how-detection-works',
          question: 'How does buying signal detection work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Buying Signals uses AI to analyze the meeting conversation in real-time and identify statements that indicate purchase interest or intent to buy.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🤖 AI-POWERED DETECTION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Advanced AI analyzes conversation context to identify genuine buying signals and distinguish them from casual mentions.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Detection process:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Meeting conversation is transcribed in real-time</li>
                <li style="margin-bottom:10px;padding-left:8px;">AI analyzes statements for indicators of buying intent</li>
                <li style="margin-bottom:10px;padding-left:8px;">Buying signal is detected when intent is identified</li>
                <li style="margin-bottom:10px;padding-left:8px;">Signal is recorded with the specific statement</li>
                <li style="margin-bottom:10px;padding-left:8px;">Points are automatically assigned to the signal</li>
                <li style="margin-bottom:0;padding-left:8px;">AI summary explains why it's a buying signal</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">What the AI looks for:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Interest statements:</strong> Direct expressions of interest in the product</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decision language:</strong> Words indicating readiness to move forward</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Implementation questions:</strong> Asking about next steps or timelines</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Commitment indicators:</strong> References to finalizing or purchasing</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Budget discussions:</strong> Talking about pricing or approval</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Timeline mentions:</strong> Setting dates or deadlines</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> When a prospect says "I am interested in the product," the AI detects this as a buying signal, assigns 25 points, and generates a summary explaining that the customer has explicitly expressed interest.
              </p>
            </div>
          `
        },
        {
          id: 'point-scoring-system',
          question: 'How does the point scoring system work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Each detected buying signal is assigned a point value to quantify the level of buying intent. Points accumulate throughout the conversation to provide an overall intent score.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 SCORING SYSTEM</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Buying signals are assigned point values to help you quantify customer interest and prioritize opportunities.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Point assignment:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Points per signal:</strong> Each buying signal receives a point value (e.g., 25 points)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic scoring:</strong> Points assigned when signal is detected</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Cumulative total:</strong> Points add up throughout the conversation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Intent measurement:</strong> Higher scores indicate stronger buying interest</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Signal tracking:</strong> Each signal contributes to overall score</li>
              </ul>

             
              <p style="margin-bottom:12px;font-weight:600;">How to use the score:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prioritize leads:</strong> Focus on prospects with higher scores</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Assess interest:</strong> Understand level of buying intent</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time follow-up:</strong> Reach out quickly to high-scoring prospects</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Track progress:</strong> Compare scores across multiple meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Forecast accuracy:</strong> Use scores to improve pipeline predictions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Resource allocation:</strong> Invest more time in high-intent opportunities</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Scoring example:</p>
              <div style="padding:16px;background:#f9fafb;border-left:3px solid #10B981;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;"><strong>Signal 1:</strong> "I am interested in the product" → 25 points</p>
                <p style="margin:0 0 8px 0;"><strong>Signal 2:</strong> "When can we start implementation?" → 25 points</p>
                <p style="margin:0 0 8px 0;"><strong>Signal 3:</strong> "Let's discuss pricing details" → 25 points</p>
                <p style="margin:12px 0 0 0;font-weight:600;color:#059669;"><strong>Total Score: 75 points</strong> - Strong buying intent detected</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Point values help you objectively measure and compare buying intent across different conversations and opportunities.
              </p>
            </div>
          `
        },
        {
          id: 'ai-summary-generation',
          question: 'What are AI summaries for buying signals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">For each detected buying signal, AI generates a summary explaining why the particular statement indicates buying intent and what it means for your sales process.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📝 AI EXPLANATIONS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Each buying signal comes with an AI-generated summary that explains the significance and context of the detected intent.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What summaries include:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Signal explanation:</strong> Why the statement is considered a buying signal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Intent analysis:</strong> What type of buying interest is being expressed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> Additional details about the signal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Significance:</strong> What this means for the sales opportunity</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Recommended actions:</strong> Potential next steps based on the signal</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Example summary:</p>
              <div style="padding:16px;background:#f9fafb;border-left:3px solid #10B981;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;font-weight:600;">Detected Signal:</p>
                <p style="margin:0 0 12px 0;font-style:italic;color:#6B7280;">"I am finalizing the product and we want to move forward."</p>
                <p style="margin:0 0 8px 0;font-weight:600;">AI Summary:</p>
                <p style="margin:0;color:#374151;">This is a strong buying signal indicating high purchase intent. The prospect has explicitly stated they are in the finalization stage and ready to proceed. The use of "finalizing" suggests they've completed evaluation and are prepared to commit. This is an excellent opportunity to discuss next steps, contracts, and implementation timelines.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of AI summaries:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Clear understanding:</strong> Know exactly why something is a buying signal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context awareness:</strong> Understand the full meaning of the signal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Training tool:</strong> Learn to recognize signals yourself</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Confidence building:</strong> Trust the detection with clear explanations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Action guidance:</strong> Know how to respond to each signal</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Deal strategy:</strong> Use insights to advance the opportunity</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Review AI summaries to better understand your prospect's mindset and tailor your follow-up approach accordingly.
              </p>
            </div>
          `
        },
        {
          id: 'using-buying-signals',
          question: 'How do I use Buying Signals effectively?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Use Buying Signals to identify hot prospects, prioritize follow-ups, and take action when intent is high. The feature helps you strike while the iron is hot.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💡 BEST PRACTICES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Leverage buying signal detection to optimize your sales process and close more deals.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">During the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Monitor signals:</strong> Watch for buying signals being detected</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recognize opportunities:</strong> When signals appear, capitalize on the moment</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Ask follow-up questions:</strong> Dig deeper when interest is shown</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Address concerns:</strong> Remove obstacles when intent is high</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Move forward:</strong> Suggest next steps when multiple signals detected</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">After the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review total score:</strong> Assess overall buying intent level</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Read AI summaries:</strong> Understand context of each signal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prioritize follow-up:</strong> Contact high-scoring prospects first</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Tailor approach:</strong> Use signal insights in follow-up communications</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Update CRM:</strong> Record buying signals and scores</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Plan next steps:</strong> Create action plan based on detected intent</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Using scores for prioritization:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>High scores (75+ points):</strong> Strong intent - follow up immediately</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Medium scores (50-75 points):</strong> Moderate interest - follow up within 24 hours</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Low scores (25-50 points):</strong> Some interest - nurture the relationship</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>No signals:</strong> Early stage - continue education and discovery</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Strategic applications:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pipeline management:</strong> Focus on opportunities with buying signals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Forecasting:</strong> Use signal data to predict close probability</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Team coaching:</strong> Review signals to improve discovery skills</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timing decisions:</strong> Know when to push for close vs. nurture</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Resource allocation:</strong> Assign best reps to high-intent leads</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Win rate analysis:</strong> Correlate signals with closed deals</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Key Insight:</strong> Buying Signals help you identify when prospects are ready to buy, allowing you to act at the right moment and maximize conversion rates.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
   {
  id: 'custom-goals-section',
  title: 'Custom Goals',
  description: 'AI-powered goal tracking that analyzes your meeting in real-time against your specific objectives.',
  questions: [
    {
      id: 'custom-goals-features',
      title: 'Custom Goals Features',
      emoji: '🎯',
      description: 'Track and analyze specific meeting objectives automatically.',
      subQuestions: [
        {
          id: 'what-are-custom-goals',
          question: 'What are Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Custom Goals</strong> allow you to define specific objectives for your meeting that are automatically tracked and analyzed in real-time as the conversation unfolds. The AI monitors the transcription and provides insights on whether your goals are being met.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 INTELLIGENT GOAL TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Custom Goals work automatically to detect whether your meeting objectives are being addressed, providing real-time analysis as your conversation progresses.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pre-meeting setup:</strong> Define goals before your meeting starts</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time analysis:</strong> AI analyzes transcription against your goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Progress tracking:</strong> See which goals have been addressed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>AI-generated summaries:</strong> Get instant insights on goal completion</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Customizable analysis:</strong> Configure how and when goals are analyzed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Universal access:</strong> Available in both Note-Taker and main console</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Add custom goals in the Personalization section before meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Goals become active when meeting starts and transcription begins</li>
                <li style="margin-bottom:10px;padding-left:8px;">AI monitors conversation and detects goal-related discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;">Analysis updates automatically or on-demand via refresh button</li>
                <li style="margin-bottom:0;padding-left:8px;">View detailed insights on goal completion and relevant excerpts</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Custom Goals must be added before the meeting starts through the Personalization section. They cannot be added during an ongoing meeting.
              </p>
            </div>
          `
        },
        {
          id: 'how-to-add-custom-goals',
          question: 'How do I add Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Goals must be added before your meeting starts through the Personalization section. This ensures the AI is prepared to track your objectives from the very beginning.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚙️ PRE-MEETING SETUP</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Adding goals before the meeting allows the AI to track them from the start, ensuring no relevant content is missed.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Step-by-step guide:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Navigate to Personalization section</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Before your meeting starts, go to the Personalization area</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Find Custom Goals option</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Locate the Custom Goals feature within Personalization</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Define your goals</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Write clear, specific objectives you want to track</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Configure analysis settings (optional)</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Customize how goals are analyzed using Goal Analysis Settings</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Save your goals</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Confirm and save before starting your meeting</span>
                </li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">Writing effective goals:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Be specific:</strong> Clearly define what you want to achieve</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Make it measurable:</strong> Use concrete criteria the AI can detect</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Keep it focused:</strong> One clear objective per goal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use action words:</strong> Discuss, review, decide, confirm, etc.</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Be realistic:</strong> Goals should be achievable within the meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Example goals:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">"Discuss Q4 budget allocation for marketing"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Review and approve new product feature timeline"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Address customer feedback on recent release"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Confirm project deliverables and deadlines"</li>
                <li style="margin-bottom:0;padding-left:8px;">"Identify blockers preventing team progress"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Critical:</strong> For more details on accessing the Personalization section and adding Custom Goals, check out the Personalization documentation. Goals cannot be added once the meeting has started.
              </p>
            </div>
          `
        },
        {
          id: 'viewing-custom-goals',
          question: 'Where can I view Custom Goals during a meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Goals can be viewed in two locations during your meeting: within the Note-Taker interface and on the main console. Both views provide the same functionality and real-time analysis.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📍 DUAL ACCESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Access your Custom Goals from either Note-Taker or main console - both display the same information and update in real-time.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Note-Taker view:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Integrated interface:</strong> Custom Goals appear alongside other meeting features</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Click on Note-Taker:</strong> Select Custom Goals tab when bot joins meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>All-in-one view:</strong> See goals with transcription, chat, and AI features</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Convenient access:</strong> Switch between features without leaving interface</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Same functionality:</strong> All features available as in main console</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Main console view:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Dedicated space:</strong> Full screen dedicated to Custom Goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Direct access:</strong> Navigate to Custom Goals section in console</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Larger display:</strong> More screen real estate for goal analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Detailed view:</strong> See all goal details and analysis at once</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Same information:</strong> Identical content as Note-Taker view</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What you'll see in both views:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active goals count:</strong> Number of custom goals currently being tracked</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Goal status:</strong> Whether each goal has been analyzed or is pending</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>AI analysis:</strong> Real-time insights on goal progress</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Refresh controls:</strong> Manual and automatic refresh options</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Settings access:</strong> Configure analysis preferences</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Choose Note-Taker view for multitasking during meetings, or main console view when you want to focus specifically on goal tracking.
              </p>
            </div>
          `
        },
        {
          id: 'goal-analysis-tracking',
          question: 'How does goal analysis tracking work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">As your meeting transcription is recorded, the AI continuously detects whether your custom goals are being discussed and analyzed. You can see which goals have been addressed and which are still pending.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔍 INTELLIGENT DETECTION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI monitors your transcription in real-time, identifying when topics related to your custom goals are being discussed and providing analysis.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">How tracking works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Continuous monitoring:</strong> AI watches transcription for goal-related content</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic detection:</strong> Identifies when a goal is being addressed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status indicators:</strong> Shows which goals have been analyzed vs pending</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context extraction:</strong> Captures relevant conversation segments</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time updates:</strong> Analysis refreshes as conversation progresses</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Progress visibility:</strong> Clear indication of goal completion status</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Analysis indicators:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Analyzed:</strong> Goal has been detected and analyzed in the conversation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pending:</strong> Goal hasn't been addressed yet or analysis is in progress</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Partial:</strong> Some aspects of the goal discussed, others pending</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Active count:</strong> Total number of goals being tracked</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What gets analyzed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevant discussions:</strong> Conversation segments matching your goal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Key points:</strong> Important statements related to the objective</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decisions made:</strong> Conclusions or action items for the goal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> Surrounding conversation for better understanding</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Completion status:</strong> Whether goal was fully addressed</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Tracking benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Stay on track:</strong> Know which goals still need attention</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Save time:</strong> No manual note-taking for specific objectives</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better focus:</strong> Ensure all planned topics are covered</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Accountability:</strong> Clear record of what was discussed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Follow-up:</strong> Easy identification of unaddressed goals</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Goal tracking happens in real-time as transcription occurs, so ensure Live Transcription is active for goals to be analyzed.
              </p>
            </div>
          `
        },
        {
          id: 'ai-generated-summaries',
          question: 'What are AI-generated summaries for Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">AI-generated summaries provide instant insights on your custom goals, showing whether they were addressed, key points discussed, and relevant excerpts from the conversation.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🤖 INTELLIGENT SUMMARIES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Get instant AI-powered insights on goal completion with contextual information, timestamps, speaker attribution, and exact quotes from your meeting.</p>
              </div>

             
              <p style="margin-bottom:12px;font-weight:600;">What summaries include:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Goal status:</strong> Whether the objective was addressed in the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Key insights:</strong> Main points discussed related to the goal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevant excerpts:</strong> Important quotes from the conversation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decisions made:</strong> Any conclusions or action items</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> Situational information for better understanding</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Completeness:</strong> Assessment of whether goal was fully addressed</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Getting summaries:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic refresh:</strong> Summaries update every 90 seconds by default</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Manual refresh:</strong> Click the refresh button for instant updates</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time generation:</strong> AI analyzes current transcription state</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Progressive updates:</strong> Summaries improve as more is discussed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>On-demand access:</strong> Available anytime during or after meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Customizable information:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timestamps:</strong> Option to include when topics were discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker names:</strong> Attribution of who said what</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Exact quotes:</strong> Verbatim excerpts from transcription</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Word limit:</strong> Control summary length (50-500 words)</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Additional instructions:</strong> Custom requirements for analysis</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Using summaries effectively:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick reference:</strong> Review goal completion at a glance</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting notes:</strong> Copy summaries for documentation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Action items:</strong> Identify next steps from goal discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Follow-up:</strong> Share relevant summaries with team members</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Accountability:</strong> Track what was actually discussed vs planned</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Configure Goal Analysis Settings to customize exactly what information appears in your AI-generated summaries.
              </p>
            </div>
          `
        },
        {
          id: 'refresh-options',
          question: 'How do the refresh options work for Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Goals offer both manual and automatic refresh options to keep your goal analysis up-to-date. You can refresh on-demand or let the system update automatically every 90 seconds.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔄 FLEXIBLE UPDATES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Choose between instant manual updates or automatic 90-second refreshes to keep your goal analysis current throughout the meeting.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">Manual refresh button:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Instant updates:</strong> Click to refresh goal analysis immediately</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>On-demand control:</strong> Update exactly when you want</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Important moments:</strong> Refresh after key discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>No waiting:</strong> Get latest analysis without delay</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Always available:</strong> Use anytime during the meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Automatic 90-second refresh:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Set-and-forget:</strong> Automatic updates every 90 seconds</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Continuous monitoring:</strong> Stay current without manual action</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Regular intervals:</strong> Consistent update schedule</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Background operation:</strong> Updates happen automatically</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Reliable tracking:</strong> Never miss goal progress</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">When to use manual refresh:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>After important topics:</strong> When a goal-related discussion just finished</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Critical decisions:</strong> Immediately after key conclusions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Before sharing:</strong> Get latest data before presenting to others</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Mid-meeting check:</strong> Quick status update on all goals</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>On-demand insight:</strong> When you need immediate information</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">When to use automatic refresh:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Long meetings:</strong> Extended sessions where manual updates are impractical</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Hands-free operation:</strong> When you're actively participating</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Continuous tracking:</strong> Want goals always up-to-date</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Background monitoring:</strong> Focus on meeting while tracking happens</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Consistent updates:</strong> Prefer regular, predictable refreshes</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Best practices:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Combine both:</strong> Use automatic refresh with occasional manual updates</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Strategic timing:</strong> Manual refresh after completing agenda items</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Save resources:</strong> Manual refresh if analyzing many goals</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>End-of-meeting:</strong> Final manual refresh before meeting ends</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Enable automatic 90-second refresh for hands-free operation, but use manual refresh button after critical discussions for immediate insights.
              </p>
            </div>
          `
        },
        {
          id: 'goal-analysis-settings',
          question: 'What are Goal Analysis Settings?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Goal Analysis Settings</strong> allow you to customize exactly how your custom goals are analyzed, including timing intervals, output format, word limits, and what information to include in the analysis.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚙️ CUSTOMIZABLE ANALYSIS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Configure how goals are analyzed to get exactly the information you need in the format that works best for your workflow.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Available settings:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Analysis time interval:</strong> Set how often goals are automatically analyzed (30-300 seconds)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Output word limit:</strong> Control summary length from 50 to 500 words</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include timestamps:</strong> Add time markers showing when topics were discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include speaker names:</strong> Show who said what in the analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include exact quotes:</strong> Add verbatim excerpts from transcription</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Additional instructions:</strong> Provide custom requirements for AI analysis</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Time interval configuration:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Default: 30 seconds</strong> - Quick updates for fast-paced meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Range: 30-300 seconds</strong> - Choose interval that matches meeting pace</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Shorter intervals:</strong> More frequent updates, better for rapid discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Longer intervals:</strong> Less frequent updates, suitable for slower meetings</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Adjustable:</strong> Change anytime during the meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Word limit options:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Minimum: 50 words</strong> - Brief, concise summaries</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Maximum: 500 words</strong> - Detailed, comprehensive analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recommended: 150-250 words</strong> - Balanced detail and readability</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Short summaries:</strong> Quick reference, less detail</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Long summaries:</strong> Complete context, more information</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Information inclusion options:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Timestamps</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Shows when each goal-related topic was discussed (e.g., "at 15:32")</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Speaker names</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Identifies who made specific statements or decisions</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Exact quotes</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Includes verbatim excerpts from the transcription for accuracy</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Additional instructions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Optional field:</strong> Provide custom requirements for analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specific focus:</strong> Ask for emphasis on certain aspects</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Format preferences:</strong> Request particular summary structures</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Contextual needs:</strong> Specify information most relevant to you</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Custom analysis:</strong> Tailor output to your requirements</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How to access settings:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to Custom Goals in Note-Taker or main console</li>
                <li style="margin-bottom:10px;padding-left:8px;">Look for "Goal Analysis Settings" button or option</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click to open settings panel</li>
                <li style="margin-bottom:10px;padding-left:8px;">Configure your preferred options</li>
                <li style="margin-bottom:0;padding-left:8px;">Save settings to apply changes</li>
              </ol>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Configure Goal Analysis Settings to get exactly what you want from your goal tracking. Customize once and your preferences will be remembered for future meetings.
              </p>
            </div>
          `
        },
        {
          id: 'active-goals-count',
          question: 'What does the active goals count show?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The active goals count displays how many custom goals are currently being tracked during your meeting. This gives you a quick overview of all objectives being monitored.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 GOAL OVERVIEW</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">See at a glance how many objectives are being tracked, helping you ensure all planned goals are active and being monitored.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">What it indicates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Total goals:</strong> Number of custom goals set for this meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active tracking:</strong> All goals being monitored by the AI</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick reference:</strong> Instant overview without scrolling through goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status check:</strong> Confirm all planned goals are active</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Meeting scope:</strong> Understand how many objectives you're tracking</li>
              </ul>

              

             
              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Quick Check:</strong> Look at the active goals count when joining a meeting to confirm all your planned objectives are being tracked.
              </p>
            </div>
          `
        },
        {
          id: 'custom-goals-best-practices',
          question: 'What are best practices for using Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Following best practices for Custom Goals ensures you get the most value from AI-powered goal tracking and never miss important meeting objectives.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✨ MAXIMIZE EFFECTIVENESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Use these proven strategies to get exactly what you want from Custom Goals tracking and ensure comprehensive meeting coverage.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Before the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Add goals early:</strong> Set up Custom Goals in Personalization before meeting starts</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Be specific:</strong> Write clear, measurable objectives the AI can detect</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prioritize goals:</strong> Focus on 3-7 key objectives for best tracking</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Configure settings:</strong> Set up Goal Analysis Settings to match your needs</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Review goals:</strong> Double-check all objectives are correct before starting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">During the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Start transcription immediately:</strong> Click Note-Taker when bot joins to capture from beginning</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Monitor progress:</strong> Check goal status periodically throughout meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use refresh strategically:</strong> Manual refresh after covering important topics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reference in real-time:</strong> Check which goals still need attention</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Verify completion:</strong> Ensure all goals addressed before ending meeting</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Stay on track:</strong> Use goal status to guide conversation flow</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Goal writing tips:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Use action verbs:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Start with discuss, review, decide, confirm, address, resolve</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Include specifics:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Mention exact topics, names, dates, or metrics to track</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>One objective per goal:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Keep each goal focused on a single outcome for better tracking</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Make it detectable:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Use clear language the AI can recognize in conversation</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Avoid vague statements:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Replace "discuss stuff" with "discuss Q4 budget allocation"</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Settings optimization:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Short meetings (15-30 min):</strong> Use 30-second intervals, 100-150 word summaries</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Standard meetings (30-60 min):</strong> Use 60-90 second intervals, 150-250 words</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Long meetings (60+ min):</strong> Use 90-120 second intervals, 200-300 words</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include timestamps:</strong> Always enable for easy reference</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include speaker names:</strong> Essential for attribution and accountability</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Include exact quotes:</strong> Enable for critical decisions or technical discussions</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Common mistakes to avoid:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Adding goals mid-meeting:</strong> Can't be done - must add before meeting starts</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Too many goals:</strong> More than 10 becomes difficult to track effectively</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Vague objectives:</strong> Makes AI detection and analysis less accurate</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Forgetting to activate:</strong> Must click Note-Taker for tracking to work</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Never refreshing:</strong> Won't see latest analysis without updates</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Ignoring unaddressed goals:</strong> Check status and address missed objectives</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">After the meeting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Final refresh:</strong> Get complete analysis of all goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review summaries:</strong> Check which goals were fully addressed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Document results:</strong> Copy relevant analyses for meeting notes</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Follow up:</strong> Address any unmet goals in next meeting</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Share insights:</strong> Distribute goal summaries to relevant team members</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Remember:</strong> Custom Goals is very nice because you're getting what you want - configure it properly and you'll have comprehensive meeting tracking that ensures nothing important is missed!
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'live-sentiment-section',
  title: 'Live Sentiment Analysis',
  description: 'Real-time sentiment tracking that captures emotions, buying signals, and concerns during conversations.',
  questions: [
    {
      id: 'live-sentiment-features',
      title: 'Live Sentiment Analysis Features',
      emoji: '💭',
      description: 'Monitor participant emotions and engagement in real-time during your meetings.',
      subQuestions: [
        {
          id: 'what-is-live-sentiment',
          question: 'What is Live Sentiment Analysis?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Live Sentiment Analysis</strong> captures and tracks the emotional tone and sentiment of transcriptions in real-time during your meetings. It identifies who is speaking, their sentiment, buying signals, concerns, and provides critical alerts and recommended actions.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💭 REAL-TIME EMOTION TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Live Sentiment Analysis monitors the emotional state of each participant, detecting buying signals, concerns, and disinterest as the conversation happens.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time tracking:</strong> Captures sentiment as transcriptions are recorded</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker identification:</strong> Shows who is speaking and their sentiment</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Buying signals:</strong> Detects when participants show interest or intent to purchase</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Concern detection:</strong> Identifies when someone is not interested or has doubts</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Critical alerts:</strong> Highlights important sentiment changes that need attention</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Mute controls:</strong> Mic button to mute specific participants</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Recommended actions:</strong> AI-suggested responses based on sentiment</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What you can see:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Who is speaking at any given moment</li>
                <li style="margin-bottom:10px;padding-left:8px;">The emotional tone of each participant</li>
                <li style="margin-bottom:10px;padding-left:8px;">Buying signals from specific people</li>
                <li style="margin-bottom:10px;padding-left:8px;">Concerns or disinterest indicators</li>
                <li style="margin-bottom:10px;padding-left:8px;">Critical sentiment alerts requiring immediate attention</li>
                <li style="margin-bottom:0;padding-left:8px;">Recommended actions to address sentiment</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Live Sentiment Analysis has already been discussed in the console page documentation. This feature works the same way in both locations, providing consistent sentiment tracking across the platform.
              </p>
            </div>
          `
        },
        {
          id: 'speaker-sentiment-tracking',
          question: 'How does speaker sentiment tracking work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Live Sentiment Analysis identifies each speaker and tracks their emotional state throughout the conversation, showing you who is saying what and how they feel about it.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">👤 SPEAKER IDENTIFICATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The system identifies who is speaking and analyzes their sentiment, giving you a complete picture of each participant's emotional state.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Speaker information displayed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker name:</strong> Identifies who is currently speaking</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sentiment indicator:</strong> Shows their emotional tone (positive, neutral, negative)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Buying signals:</strong> Highlights when that person shows purchase interest</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Concerns:</strong> Flags when they express doubts or disinterest</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time updates:</strong> Sentiment changes as the conversation progresses</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Individual tracking:</strong> Each participant has their own sentiment profile</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">What the system tracks:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Positive sentiment:</strong> Enthusiasm, agreement, interest</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Neutral sentiment:</strong> Factual discussion, information gathering</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Negative sentiment:</strong> Concerns, objections, disinterest</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Engagement level:</strong> How actively involved each person is</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Sentiment shifts:</strong> Changes in emotional state during the meeting</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Monitor individual speaker sentiment to understand which participants are engaged and which may need more attention or different messaging.
              </p>
            </div>
          `
        },
        {
          id: 'buying-signals-concerns',
          question: 'How are buying signals and concerns detected?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Live Sentiment Analysis automatically detects buying signals when participants show interest or intent to purchase, and identifies concerns when they express doubts, disinterest, or hesitation.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 SIGNALS & CONCERNS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The system identifies both positive buying signals and negative concerns from each participant in real-time.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Buying signals detected:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Interest expressions:</strong> "This looks promising" or "I like this"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Intent to purchase:</strong> "We want to move forward"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Implementation questions:</strong> "When can we start?"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Positive engagement:</strong> Active participation and enthusiasm</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decision indicators:</strong> "Let's discuss pricing"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Per-person tracking:</strong> Shows which specific person expressed the signal</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Concerns identified:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Disinterest:</strong> "I'm not sure this is for us"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Hesitation:</strong> "We need to think about this"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Objections:</strong> Specific concerns or problems raised</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Budget concerns:</strong> "This seems expensive"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timing issues:</strong> "Now might not be the right time"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Thinking/considering:</strong> "Let me think about it"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Speaker attribution:</strong> Shows exactly who has the concern</li>
              </ul>

             
              <p style="margin-bottom:12px;font-weight:600;">How detection helps:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify hot prospects:</strong> See who is showing buying intent</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Address concerns early:</strong> Catch and resolve objections immediately</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Focus efforts:</strong> Know which participants need more attention</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Adjust messaging:</strong> Change approach based on sentiment</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Track individual perspectives:</strong> Understand each stakeholder's position</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> If the system detects that John shows a buying signal ("This solution looks perfect") but Sarah expresses a concern ("I'm worried about implementation time"), you can address Sarah's concern while building on John's enthusiasm.
              </p>
            </div>
          `
        },
        {
          id: 'critical-alerts',
          question: 'What are critical alerts?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Critical alerts</strong> highlight significant sentiment changes or important moments that require immediate attention during the meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚠️ CRITICAL ALERTS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The system flags critical moments when sentiment shifts dramatically or when important concerns are raised that need immediate action.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What triggers critical alerts:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sudden sentiment drop:</strong> Participant goes from positive to negative</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Strong objections:</strong> Serious concerns or deal-breakers raised</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Disengagement:</strong> Key stakeholder becomes disinterested</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Multiple concerns:</strong> Several negative signals in quick succession</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decision-maker negativity:</strong> Important person expresses doubts</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Risk indicators:</strong> Signals that the deal may be at risk</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Alert information includes:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Alert type:</strong> What kind of critical moment occurred</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker involved:</strong> Who triggered the alert</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> What was said or what happened</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Severity level:</strong> How urgent the alert is</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timestamp:</strong> When the alert occurred</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Recommended action:</strong> Suggested response to address the issue</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Why critical alerts matter:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Immediate awareness:</strong> Know when problems arise instantly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prevent deal loss:</strong> Address concerns before they derail the opportunity</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Course correction:</strong> Change your approach in real-time</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Priority focus:</strong> Know what needs attention most urgently</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Risk mitigation:</strong> Catch and resolve issues early</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #EF4444;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> When a critical alert appears, take immediate action to address the concern. These alerts indicate moments that could significantly impact the outcome of your meeting.
              </p>
            </div>
          `
        },
        {
          id: 'mute-controls',
          question: 'How do the mute controls work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Live Sentiment Analysis includes a mic button for each participant that allows you to mute specific speakers when needed.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎤 MUTE CONTROLS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Each participant has a mic button that allows you to mute that person as needed during the meeting.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Mute functionality:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Mic button:</strong> Available for each speaker in the sentiment display</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Individual control:</strong> Mute specific participants independently</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick access:</strong> One-click mute functionality</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Visual indicator:</strong> Shows mute status for each speaker</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Easy management:</strong> Control audio for multiple participants</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">When to use mute:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Background noise:</strong> Mute participants with audio disruptions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Side conversations:</strong> Mute those having off-topic discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Audio issues:</strong> Temporarily mute speakers with technical problems</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Focus control:</strong> Ensure key speakers are heard clearly</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Meeting management:</strong> Maintain productive conversation flow</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> The mic button provides quick access to mute functionality, helping you maintain audio quality and meeting focus.
              </p>
            </div>
          `
        },
        {
          id: 'recommended-actions',
          question: 'What are recommended actions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Recommended actions</strong> are AI-generated suggestions for how to respond to sentiment changes, concerns, or buying signals detected during the conversation.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💡 AI RECOMMENDATIONS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The system provides intelligent action suggestions based on detected sentiment, helping you respond appropriately to each situation.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Types of recommendations:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Address concerns:</strong> Suggestions for handling objections or worries</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Capitalize on interest:</strong> Actions to take when buying signals appear</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Re-engage participants:</strong> Ways to bring disengaged people back</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Provide reassurance:</strong> How to address hesitation or uncertainty</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Next steps:</strong> Suggestions for moving the conversation forward</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Response strategies:</strong> Tailored approaches for different sentiment scenarios</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Example recommendations:</p>
              <div style="padding:16px;background:#f9fafb;border-left:3px solid #10B981;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;font-weight:600;">Scenario: Concern detected</p>
                <p style="margin:0 0 12px 0;font-style:italic;color:#6B7280;">Speaker: "I'm worried about the implementation timeline"</p>
                <p style="margin:0 0 8px 0;font-weight:600;">Recommended Action:</p>
                <p style="margin:0;color:#374151;">"Address the implementation concern directly by sharing specific timelines and success stories from similar clients. Offer to connect them with a customer who completed implementation recently."</p>
              </div>

              <div style="padding:16px;background:#f9fafb;border-left:3px solid #10B981;border-radius:4px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;font-weight:600;">Scenario: Buying signal detected</p>
                <p style="margin:0 0 12px 0;font-style:italic;color:#6B7280;">Speaker: "This looks like exactly what we need"</p>
                <p style="margin:0 0 8px 0;font-weight:600;">Recommended Action:</p>
                <p style="margin:0;color:#374151;">"Capitalize on this interest by asking about their decision timeline. Suggest discussing next steps and propose a trial or pilot program to move forward."</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to use recommendations:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time guidance:</strong> Follow suggestions during the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Adapt to your style:</strong> Use recommendations as a framework</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Immediate response:</strong> Act on critical recommendations quickly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Learn from AI:</strong> Improve your skills by studying suggestions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Strategic planning:</strong> Use for post-meeting follow-up actions</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Recommended actions help you respond effectively to sentiment in real-time, ensuring you address concerns, capitalize on interest, and keep the conversation moving in a positive direction.
              </p>
            </div>
          `
        }
      ]
    }
  ]
}
  ]
},
notetaker: {
  cardId: 'card-notetaker',
  cardTitle: 'Note Taker',
  cardDescription:
    'Your intelligent meeting assistant — capture insights, build templates, set goals, and generate summaries effortlessly.',
  icon: <Layout style={{ width: '20px', height: '20px' }} />,
  emoji: '🧾',
  items: [
    {
  id: 'ai-template-notetaker',
  title: 'AI Template in Note-Taker',
  description: 'Leverage pre-built and custom AI templates to automatically generate meeting insights, summaries, and analysis.',
  questions: [
    {
      id: 'ai-template-features',
      title: 'AI Template Features',
      emoji: '🤖',
      description: 'Intelligent templates for automated meeting documentation and analysis.',
      subQuestions: [
        {
          id: 'what-is-ai-template',
          question: 'What is AI Template in Note-Taker?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>AI Template</strong> is a powerful feature that allows you to automatically generate structured meeting outputs with a single click. When you select a template, it instantly directs you to the AI assistant and generates the requested content.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚡ ONE-CLICK INTELLIGENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">AI Templates eliminate manual work by automatically generating summaries, analysis, and insights based on your meeting content. Simply click a template to get instant, structured outputs.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How AI Templates work:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Choose a template that matches your needs</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the template</li>
                <li style="margin-bottom:10px;padding-left:8px;">Automatically redirected to AI assistant</li>
                <li style="margin-bottom:0;padding-left:8px;">Template generates the requested content instantly</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Two types of AI Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pre-built Templates:</strong> Ready-to-use templates for common meeting needs</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Custom Templates:</strong> Personalized templates you create for specific requirements</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> Need a meeting summary? Click the Summary template and instantly get a comprehensive overview of highlights, actions, and key decisions.
              </p>
            </div>
          `
        },
        {
          id: 'prebuilt-templates',
          question: 'What are Pre-built Templates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Pre-built Templates</strong> are professionally designed, ready-to-use AI templates that cover common meeting documentation and analysis needs without any setup required.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📋 INSTANT PRODUCTIVITY</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Pre-built templates are designed by experts and ready to use immediately. No configuration needed—just click and get results.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Available Pre-built Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Summary:</strong> Quickly summarize meeting highlights, actions, and key decisions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Stakeholder Mapper:</strong> Map and analyze key stakeholder relationships</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Battle Card Intelligence:</strong> Extract competitive intelligence and positioning insights</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Playbook Command:</strong> Apply MEDIC qualification framework to your meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>CRM Sync Studio:</strong> Synchronize and optimize CRM data from meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Deal Health Monitor:</strong> Track and monitor deal progression and health</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pre-built Composer:</strong> Craft personalized follow-up emails</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Executive Briefing:</strong> Generate executive-level summaries and briefs</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Participant Analysis:</strong> Individual analysis for each meeting participant</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of Pre-built Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">No setup or configuration required</li>
                <li style="margin-bottom:10px;padding-left:8px;">Professionally structured outputs</li>
                <li style="margin-bottom:10px;padding-left:8px;">Cover most common meeting needs</li>
                <li style="margin-bottom:0;padding-left:8px;">Consistent, reliable results</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> After a sales call, use Stakeholder Mapper to identify decision-makers, then Battle Card Intelligence to understand competitive positioning, and finish with Deal Health Monitor to assess opportunity status.
              </p>
            </div>
          `
        },
        {
          id: 'custom-templates',
          question: 'What are Custom Templates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Custom Templates</strong> allow you to create personalized AI templates tailored to your specific needs, workflows, and preferences for even more precise and relevant outputs.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎨 PERSONALIZED INTELLIGENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Custom Templates give you complete control over what information is extracted and how it's formatted. Create templates that match your exact workflow and requirements.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Why use Custom Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Built by You:</strong> Design templates that match your unique needs</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>More Clarity:</strong> Get exactly the information you want in your preferred format</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specific Focus:</strong> Target particular aspects of meetings important to your role</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Workflow Integration:</strong> Create outputs that fit seamlessly into your processes</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Reusable:</strong> Save time by reusing templates across similar meetings</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Creating Custom Templates:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to <strong>Create Custom Template</strong></li>
                <li style="margin-bottom:10px;padding-left:8px;">Define what information you want to extract</li>
                <li style="margin-bottom:10px;padding-left:8px;">Specify the format and structure</li>
                <li style="margin-bottom:10px;padding-left:8px;">Save your template for future use</li>
                <li style="margin-bottom:0;padding-left:8px;">Use it with a single click in any meeting</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Custom Template advantages over Pre-built:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">More precise and relevant to your specific needs</li>
                <li style="margin-bottom:10px;padding-left:8px;">Can focus on industry-specific terminology or metrics</li>
                <li style="margin-bottom:10px;padding-left:8px;">Adaptable to your company's unique processes</li>
                <li style="margin-bottom:0;padding-left:8px;">Greater control over output format and detail level</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Start with Pre-built Templates to understand what's possible, then create Custom Templates for your recurring meeting types to get even more relevant and actionable insights.
              </p>
            </div>
          `
        },
        {
          id: 'template-functions',
          question: 'What functions do the different templates perform?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Each AI template is designed for specific use cases and generates different types of insights and outputs from your meetings.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔧 SPECIALIZED FUNCTIONS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Each template serves a unique purpose, from basic summaries to advanced competitive analysis and CRM integration.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Template Functions:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">📝 Summary</p>
                <p style="margin:0;font-size:14px;">Quickly summarizes meeting highlights, action items, and key decisions in a concise format.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">👥 Stakeholder Mapper</p>
                <p style="margin:0;font-size:14px;">Maps and analyzes key stakeholder relationships, identifying decision-makers, influencers, and their positions.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">⚔️ Battle Card Intelligence</p>
                <p style="margin:0;font-size:14px;">Extracts competitive intelligence and positioning insights from meeting discussions.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">📊 Playbook Command</p>
                <p style="margin:0;font-size:14px;">Applies MEDIC qualification framework (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion) to your meeting.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🔄 CRM Sync Studio</p>
                <p style="margin:0;font-size:14px;">Synchronizes and optimizes CRM data from meeting content, ensuring accurate and up-to-date records.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">💊 Deal Health Monitor</p>
                <p style="margin:0;font-size:14px;">Tracks and monitors deal progression, identifying risks and opportunities in your sales pipeline.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">✉️ Pre-built Composer</p>
                <p style="margin:0;font-size:14px;">Crafts personalized follow-up emails based on meeting content and conversation context.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">👔 Executive Briefing</p>
                <p style="margin:0;font-size:14px;">Generates executive-level summaries and briefs suitable for leadership review.</p>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🔍 Participant Analysis</p>
                <p style="margin:0;font-size:14px;">Provides individual analysis for each meeting participant, including engagement levels, concerns, and interests.</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Combine multiple templates for comprehensive meeting analysis—use Summary for quick reference, Stakeholder Mapper for relationship insights, and Deal Health Monitor for opportunity assessment.
              </p>
            </div>
          `
        },
        {
          id: 'using-ai-templates',
          question: 'How do I use AI Templates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Using AI Templates is incredibly simple and requires just a single click to generate comprehensive meeting insights.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🚀 SIMPLE WORKFLOW</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">AI Templates streamline your post-meeting workflow with automatic generation of structured insights and documentation.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Using Pre-built Templates:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to the <strong>AI Template</strong> section in Note-Taker</li>
                <li style="margin-bottom:10px;padding-left:8px;">Browse available Pre-built Templates</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the template that matches your needs</li>
                <li style="margin-bottom:10px;padding-left:8px;">Automatically redirected to AI assistant</li>
                <li style="margin-bottom:0;padding-left:8px;">Template instantly generates the requested output</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Creating and using Custom Templates:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click on <strong>Create Custom Template</strong></li>
                <li style="margin-bottom:10px;padding-left:8px;">Define your template parameters and structure</li>
                <li style="margin-bottom:10px;padding-left:8px;">Save the template with a descriptive name</li>
                <li style="margin-bottom:10px;padding-left:8px;">Use it in any meeting by clicking on your saved template</li>
                <li style="margin-bottom:0;padding-left:8px;">Get customized outputs tailored to your specifications</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Best practices:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use immediately after meetings:</strong> Generate insights while context is fresh</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Combine templates:</strong> Use multiple templates for comprehensive analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Build custom library:</strong> Create templates for recurring meeting types</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review outputs:</strong> Templates provide great starting points but can be refined</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Share with team:</strong> Standardize documentation across your organization</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Time Saver:</strong> AI Templates can reduce post-meeting documentation time from 30+ minutes to just seconds with a single click.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'custom-template-creation',
  title: 'Custom Template Creation',
  description: 'Design personalized AI templates tailored to your specific meeting needs and workflow.',
  questions: [
    {
      id: 'custom-template-features',
      title: 'Custom Template Features',
      emoji: '🎨',
      description: 'Build your own AI templates for specialized meeting analysis.',
      subQuestions: [
        {
          id: 'what-is-custom-template',
          question: 'What is a Custom Template?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">A <strong>Custom Template</strong> is a personalized AI template that you create yourself to extract specific information and insights from your meetings in exactly the format you need.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 TAILORED TO YOUR NEEDS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Unlike pre-built templates, Custom Templates are built by you for your unique workflow, ensuring you get exactly the information you need in the format you prefer.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Key characteristics of Custom Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Personalized:</strong> Designed specifically for your needs and workflow</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Flexible:</strong> You define what information to extract and how to format it</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reusable:</strong> Create once, use across multiple similar meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Precise:</strong> Get exactly what you want without unnecessary information</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>One-click generation:</strong> Same easy access as pre-built templates</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Why use Custom Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Pre-built templates don't match your specific requirements</li>
                <li style="margin-bottom:10px;padding-left:8px;">You need industry-specific or company-specific analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;">You want to standardize documentation across your team</li>
                <li style="margin-bottom:10px;padding-left:8px;">You have recurring meeting types with consistent information needs</li>
                <li style="margin-bottom:0;padding-left:8px;">You want more control over the output format and structure</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> A product manager creates a "Feature Request Analysis" template that extracts customer pain points, requested features, priority levels, and implementation complexity from discovery calls.
              </p>
            </div>
          `
        },
        {
          id: 'create-custom-template',
          question: 'How do I create a Custom Template?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Creating a Custom Template allows you to design personalized AI-powered meeting outputs tailored to your specific workflow and requirements.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✨ BUILD YOUR PERFECT TEMPLATE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Custom Templates give you complete control over what insights are extracted and how they're presented, ensuring outputs perfectly match your needs.</p>
              </div>

              <p style="margin-bottom:20px;">In the AI Template section, you'll find the <strong>Create Custom Template</strong> option. Click on it to begin building your personalized template.</p>

              

              <p style="margin-bottom:12px;font-weight:600;">When you click Create Custom Template, you'll see a form with the following fields:</p>

              

              <p style="margin-bottom:12px;font-weight:600;">Template configuration fields:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Template Name:</strong> Gives you an idea of what the template actually does</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Description:</strong> Explains what this template does</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Theme Color:</strong> Can be anything of your choice for visual identification</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Analysis Prompt:</strong> Describe exactly what it will be doing so it creates a very good version and understands better</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Field details:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">📝 Template Name</p>
                <p style="margin:0;font-size:14px;">The template name gives you an idea of what the template is actually doing. Choose a clear, descriptive name that immediately indicates the template's purpose.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">📄 Description</p>
                <p style="margin:0;font-size:14px;">The description explains what this template does. It helps you and your team understand when and why to use this particular template.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🎨 Theme Color</p>
                <p style="margin:0;font-size:14px;">Theme color can be anything of your choice. Select any color you prefer to visually identify and organize your custom templates.</p>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🤖 Analysis Prompt</p>
                <p style="margin:0;font-size:14px;">This is the most important field. Describe exactly what you want the AI to extract and analyze. The more detailed and specific your prompt, the better the AI understands what you need, creating a very good version with clearer and more relevant outputs.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How custom templates work:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click on <strong>Create Custom Template</strong> in the AI Template section</li>
                <li style="margin-bottom:10px;padding-left:8px;">Fill in the Template Name, Description, Theme Color, and Analysis Prompt</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click <strong>Create Template</strong> button</li>
                <li style="margin-bottom:0;padding-left:8px;">Your template is created and ready to use</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">Advantages of custom templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Built by you:</strong> Designed specifically for your unique needs and workflow</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>More clarity:</strong> Since it's built by you, it provides a clearer version of exactly what you want</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better understanding:</strong> Custom prompts help AI understand your specific requirements better</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reusable:</strong> Use the same template across multiple meetings</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Flexible:</strong> Create as many templates as you need for different meeting types</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> The Analysis Prompt is key to getting great results. Be specific about what information you want extracted and how you want it formatted for the best output.
              </p>
            </div>
          `
        },
        {
          id: 'custom-vs-prebuilt',
          question: 'What is the difference between Custom and Pre-built Templates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Templates and Pre-built Templates serve different purposes, each with unique advantages depending on your needs.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚖️ CHOOSING THE RIGHT TEMPLATE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Pre-built templates are ready to use immediately, while Custom Templates offer personalization for your specific workflow.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Pre-built Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Ready to use:</strong> No setup or configuration required</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Professional design:</strong> Created by experts for common use cases</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Standardized output:</strong> Consistent format every time</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick start:</strong> Perfect for getting started immediately</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>General purpose:</strong> Cover most common meeting scenarios</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Custom Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Built by you:</strong> Designed for your specific needs</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>More clarity:</strong> Get exactly what you want, nothing more or less</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better understanding:</strong> AI understands your specific requirements better</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Flexible format:</strong> Define your own structure and output style</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Industry-specific:</strong> Include terminology and metrics unique to your field</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Company-specific:</strong> Align with your organization's processes</li>
              </ul>


              <p style="margin-bottom:12px;font-weight:600;">When to use Pre-built Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">You need quick results without configuration</li>
                <li style="margin-bottom:10px;padding-left:8px;">Standard meeting types (sales calls, demos, reviews)</li>
                <li style="margin-bottom:10px;padding-left:8px;">You're new to AI templates and exploring features</li>
                <li style="margin-bottom:0;padding-left:8px;">General-purpose documentation is sufficient</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">When to use Custom Templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Pre-built templates don't match your needs</li>
                <li style="margin-bottom:10px;padding-left:8px;">You have recurring meeting types with specific information requirements</li>
                <li style="margin-bottom:10px;padding-left:8px;">You need industry or company-specific analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;">You want to standardize team documentation</li>
                <li style="margin-bottom:0;padding-left:8px;">You require precise control over output format</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Best Approach:</strong> Start with Pre-built Templates to understand capabilities, then create Custom Templates for your specific recurring needs.
              </p>
            </div>
          `
        },
        {
          id: 'edit-custom-template',
          question: 'Can I edit or delete Custom Templates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Yes, you can easily edit and delete Custom Templates to keep your template library organized and up-to-date with your evolving needs.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔧 TEMPLATE MANAGEMENT</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Keep your templates relevant by editing them as your needs change or removing ones you no longer use.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Editing Custom Templates:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to your Custom Templates list</li>
                <li style="margin-bottom:10px;padding-left:8px;">Find the template you want to edit</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the edit option</li>
                <li style="margin-bottom:10px;padding-left:8px;">Modify Template Name, Description, Theme Color, or Analysis Prompt</li>
                <li style="margin-bottom:0;padding-left:8px;">Save your changes</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Deleting Custom Templates:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Locate the template you want to remove</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the delete option</li>
                <li style="margin-bottom:10px;padding-left:8px;">Confirm deletion when prompted</li>
                <li style="margin-bottom:0;padding-left:8px;">Template is permanently removed from your library</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Why edit templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Refine prompts:</strong> Improve outputs based on experience</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Update requirements:</strong> Adapt to changing business needs</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Fix issues:</strong> Correct prompts that aren't producing desired results</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Add details:</strong> Include additional information you want extracted</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Change formatting:</strong> Adjust output structure and style</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Don't delete templates immediately if they're not perfect. Edit and refine them over several uses to get optimal results.
              </p>
            </div>
          `
        },
        {
          id: 'template-name-best-practices',
          question: 'What should I name my Custom Template?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Choosing a clear, descriptive template name helps you and your team quickly identify the right template for each meeting type.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📛 NAMING BEST PRACTICES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Good template names are specific, action-oriented, and immediately convey the template's purpose.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Template naming guidelines:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Be specific:</strong> Clearly indicate what the template does</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use action words:</strong> Include verbs like "Analysis", "Summary", "Tracker", "Report"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include context:</strong> Mention the meeting type or purpose</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Keep it concise:</strong> Aim for 2-5 words when possible</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Avoid generic names:</strong> "Template 1" doesn't help identify purpose</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Good template name examples:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>"Discovery Call Summary"</strong> - Clear meeting type and output</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>"Technical Requirements Tracker"</strong> - Specific focus area</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>"Customer Pain Points Analysis"</strong> - Indicates what's being analyzed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>"Product Demo Follow-up"</strong> - Shows meeting type and purpose</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>"Competitor Intelligence Report"</strong> - Describes content focus</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>"QBR Action Items Tracker"</strong> - Specific to meeting type</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Naming patterns to consider:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>[Meeting Type] + [Output Type]:</strong> "Sales Call Summary"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>[Focus Area] + [Analysis Type]:</strong> "Feature Requests Analysis"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>[Stakeholder] + [Information Type]:</strong> "Executive Briefing"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>[Process] + [Stage]:</strong> "Onboarding Kickoff Notes"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> If you have multiple similar templates, use prefixes to group them (e.g., "Sales - Discovery", "Sales - Demo", "Sales - Closing").
              </p>
            </div>
          `
        },
        {
          id: 'analysis-prompt-tips',
          question: 'How do I write an effective Analysis Prompt?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The Analysis Prompt is the most critical part of your Custom Template. A well-written prompt ensures the AI extracts exactly the information you need in the format you prefer.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✍️ PROMPT WRITING MASTERY</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The quality of your output directly depends on the quality of your prompt. Specific, detailed prompts create better, more useful results.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Essential elements of a good Analysis Prompt:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Clear objective:</strong> State what you want to achieve</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specific information:</strong> List exactly what to extract</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Categories or sections:</strong> Organize output into logical groups</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Format preferences:</strong> Specify structure (bullets, tables, paragraphs)</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Priority indicators:</strong> Highlight what's most important</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Prompt writing best practices:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Be extremely specific:</strong> Don't say "summarize the meeting", say "extract customer pain points mentioned, categorize by severity, and list proposed solutions"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use numbered lists:</strong> Break down what you want into clear points (1, 2, 3)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Define categories:</strong> If you want grouping, specify categories upfront</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Request structure:</strong> "Format as a report with sections" or "Use bullet points"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Include examples:</strong> Show what you're looking for when possible</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specify depth:</strong> "Brief overview" vs "Detailed analysis"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Request actionables:</strong> Ask for next steps, decisions, or recommendations</li>
              </ul>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#1E40AF;">Example: Poor Prompt</p>
                <p style="margin:0 0 12px 0;font-size:14px;color:#6B7280;font-style:italic;">"Summarize this sales call"</p>
                <p style="margin:0;font-size:13px;color:#DC2626;">❌ Too vague, lacks structure and specific requirements</p>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 12px 0;font-weight:600;color:#1E40AF;">Example: Good Prompt</p>
                <p style="margin:0 0 12px 0;font-size:14px;color:#6B7280;font-style:italic;">"Analyze this sales call and extract: 1) Customer pain points (categorized as Critical/High/Medium), 2) Budget and timeline discussed, 3) Decision-makers identified and their concerns, 4) Competitors mentioned and specific objections, 5) Next steps and action items with owners. Format as a structured report with clear sections and bullet points."</p>
                <p style="margin:0;font-size:13px;color:#059669;">✅ Specific, structured, actionable with clear categories</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Advanced prompt techniques:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Conditional extraction:</strong> "If budget is mentioned, include range and approval process"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Comparative analysis:</strong> "Compare our solution vs competitors mentioned"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sentiment analysis:</strong> "Rate customer enthusiasm level for each feature discussed"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Risk identification:</strong> "Highlight any red flags or potential deal blockers"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Prioritization:</strong> "Rank action items by urgency and impact"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Start with a detailed prompt, then refine it after testing. If outputs are too verbose, ask for "brief summaries". If missing info, add more specific extraction requests.
              </p>
            </div>
          `
        },
        {
          id: 'how-many-templates',
          question: 'How many Custom Templates can I create?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can create as many Custom Templates as you need to cover all your different meeting types and analysis requirements.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">♾️ UNLIMITED CUSTOMIZATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Build a comprehensive library of templates for every meeting scenario you encounter.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Template library strategies:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>By meeting type:</strong> Discovery calls, demos, QBRs, standups, reviews</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>By department:</strong> Sales, Product, Engineering, Customer Success</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>By analysis focus:</strong> Technical requirements, competitive intel, customer feedback</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>By stakeholder:</strong> Executive summaries, team updates, client reports</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>By stage:</strong> Early discovery, mid-cycle, closing, post-sale</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Recommended template sets:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">For Sales Teams:</p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;">Discovery Call Analysis</li>
                  <li style="margin-bottom:6px;font-size:14px;">Product Demo Summary</li>
                  <li style="margin-bottom:6px;font-size:14px;">Competitive Intelligence Report</li>
                  <li style="margin-bottom:6px;font-size:14px;">Stakeholder Mapping</li>
                  <li style="margin-bottom:0;font-size:14px;">Deal Health Check</li>
                </ul>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">For Product Teams:</p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;">Feature Request Tracker</li>
                  <li style="margin-bottom:6px;font-size:14px;">User Feedback Analysis</li>
                  <li style="margin-bottom:6px;font-size:14px;">Technical Requirements Doc</li>
                  <li style="margin-bottom:6px;font-size:14px;">Sprint Planning Notes</li>
                  <li style="margin-bottom:0;font-size:14px;">Roadmap Discussion Summary</li>
                </ul>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">For Customer Success:</p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;">Onboarding Kickoff Notes</li>
                  <li style="margin-bottom:6px;font-size:14px;">QBR Action Items</li>
                  <li style="margin-bottom:6px;font-size:14px;">Health Check Assessment</li>
                  <li style="margin-bottom:6px;font-size:14px;">Escalation Summary</li>
                  <li style="margin-bottom:0;font-size:14px;">Renewal Conversation Tracker</li>
                </ul>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Tips for managing multiple templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use consistent naming:</strong> Group similar templates with prefixes</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Leverage colors:</strong> Use theme colors to categorize templates</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Write good descriptions:</strong> Help others understand when to use each template</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Regular cleanup:</strong> Archive or delete templates you no longer use</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Share with team:</strong> Standardize templates across your organization</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Start with 3-5 templates for your most common meeting types, then expand your library as you identify new needs.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'custom-goals-section',
  title: 'Custom Goals',
  description: 'Track and analyze your meeting objectives in real-time with AI-powered goal monitoring.',
  questions: [
    {
      id: 'custom-goals-features',
      title: 'Custom Goals Features',
      emoji: '🎯',
      description: 'Monitor meeting goals with automatic status tracking and evidence detection.',
      subQuestions: [
        {
          id: 'what-are-custom-goals',
          question: 'What are Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Custom Goals</strong> are meeting objectives that you define before your meeting in the Personalize section. The AI automatically tracks these goals during your meeting, detects evidence of discussion, and provides status updates.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 INTELLIGENT GOAL TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Custom Goals analyze your meeting transcript in real-time, detecting when goals are discussed and automatically updating their status so you always know if your meeting objectives are being achieved.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">How Custom Goals work:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pre-meeting setup:</strong> Goals are added in the Personalize section before the meeting starts</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time analysis:</strong> AI analyzes the transcript as the meeting progresses</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evidence detection:</strong> Automatically detects when goals are being discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status tracking:</strong> Updates goal status (In Progress, Achieved, etc.)</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Detailed reporting:</strong> Provides evidence and analysis for each goal</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic tracking:</strong> No manual effort needed during meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evidence-based:</strong> Shows specific moments when goals were discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status updates:</strong> Clear indication of goal progress and achievement</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Customizable analysis:</strong> Control output format and detail level</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Refresh capability:</strong> Update goal status at any time during or after the meeting</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> If your goal is "Get budget approval", the AI detects when budget is discussed, identifies relevant quotes, and updates the status to show whether approval was achieved.
              </p>
            </div>
          `
        },
        {
          id: 'where-to-add-custom-goals',
          question: 'Where do I add Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Goals are added in the <strong>Personalize section</strong> before your meeting starts. This allows the AI to track these specific objectives from the beginning of your meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📝 PRE-MEETING SETUP</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Goals must be configured before the meeting begins so the AI can track them throughout the entire conversation.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to add Custom Goals:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to the <strong>Personalize section</strong> before your meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Find the Custom Goals option</li>
                <li style="margin-bottom:10px;padding-left:8px;">Add your meeting objectives and goals</li>
                <li style="margin-bottom:10px;padding-left:8px;">Save your goals</li>
                <li style="margin-bottom:0;padding-left:8px;">Start your meeting - goals will be tracked automatically</li>
              </ol>

             

              <p style="margin-bottom:12px;font-weight:600;">Once added, Custom Goals appear in:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">The Custom Goals section during your meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Real-time tracking interface with status updates</li>
                <li style="margin-bottom:0;padding-left:8px;">Post-meeting analysis and reports</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Goals must be added in the Personalize section before the meeting starts. They cannot be added during an active meeting.
              </p>
            </div>
          `
        },
        {
          id: 'how-goals-analyzed',
          question: 'How does the AI analyze Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The AI continuously analyzes your meeting transcript to detect evidence of goal discussions and automatically updates the status of each Custom Goal.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔍 INTELLIGENT ANALYSIS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI examines the transcript to find when and how your goals are being discussed, providing evidence-based status updates.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Analysis process:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Transcript monitoring:</strong> AI continuously reads the meeting transcript</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evidence detection:</strong> Identifies when goals are being discussed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context analysis:</strong> Understands the context and relevance of discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status determination:</strong> Evaluates if the goal is in progress or achieved</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Report generation:</strong> Creates detailed analysis with evidence</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">What the AI detects:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Discussion moments:</strong> When the goal topic is being talked about</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker contributions:</strong> Who discussed the goal and what they said</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevant quotes:</strong> Exact statements related to the goal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timestamps:</strong> When evidence occurred during the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Achievement indicators:</strong> Signals that the goal was accomplished</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Progress markers:</strong> Signs of ongoing discussion without conclusion</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> The AI provides evidence for its status determinations, so you can verify and understand why a goal is marked as "In Progress" or "Achieved".
              </p>
            </div>
          `
        },
        {
          id: 'goal-status-types',
          question: 'What are the different goal status types?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Goals display different status types based on the AI's analysis of whether and how the goal has been discussed during your meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 STATUS INDICATORS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Goal statuses help you quickly understand which objectives have been achieved and which are still in progress.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Common status types:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🟡 In Progress</p>
                <p style="margin:0;font-size:14px;">The goal is being discussed but hasn't been fully achieved or concluded yet. The AI has detected relevant conversation but no clear resolution.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">✅ Achieved</p>
                <p style="margin:0;font-size:14px;">The goal has been successfully discussed and accomplished. The AI detected clear evidence that the objective was met.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">⚪ Not Discussed</p>
                <p style="margin:0;font-size:14px;">The goal hasn't been mentioned or discussed in the meeting yet. No relevant evidence found in the transcript.</p>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🔄 Pending Review</p>
                <p style="margin:0;font-size:14px;">The goal was discussed but requires follow-up or additional action. May indicate partial completion or need for future discussion.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">How to use status information:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>During meetings:</strong> Check status to ensure important goals are being addressed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Before ending:</strong> Review any goals still "In Progress" or "Not Discussed"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>After meetings:</strong> Use status for follow-up planning and next meeting prep</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>For reporting:</strong> Quick overview of meeting effectiveness and goal completion</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Click on any goal to see detailed analysis, evidence, and the specific reasons for its current status.
              </p>
            </div>
          `
        },
        {
          id: 'refresh-custom-goals',
          question: 'How do I refresh Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can manually refresh Custom Goals at any time using the <strong>Refresh button</strong> to get the latest status updates based on the current meeting transcript.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔄 REAL-TIME UPDATES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The Refresh button allows you to manually trigger goal analysis to see updated status and evidence based on the latest transcript.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to refresh goals:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Locate the <strong>Refresh button</strong> in the Custom Goals section</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click the Refresh button</li>
                <li style="margin-bottom:10px;padding-left:8px;">AI re-analyzes the transcript with current content</li>
                <li style="margin-bottom:0;padding-left:8px;">Goal statuses and evidence update automatically</li>
              </ol>

             

              <p style="margin-bottom:12px;font-weight:600;">When to refresh:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>After key discussions:</strong> When you've just talked about a goal</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Mid-meeting check:</strong> To see current progress on all goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Before wrapping up:</strong> Final status check before ending the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>After long discussions:</strong> When significant conversation has occurred</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Any time you want:</strong> Refresh as frequently as needed</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Automatic refresh settings:</p>
              <p style="margin-bottom:20px;">You can also configure automatic refresh intervals in the Update Settings to have goals refresh periodically without manual clicks.</p>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Refresh goals strategically after discussing important topics rather than constantly, to avoid interrupting your flow.
              </p>
            </div>
          `
        },
        {
          id: 'update-settings',
          question: 'What are Update Settings and how do I configure them?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Update Settings</strong> allow you to customize how Custom Goals are analyzed and refreshed, including refresh intervals, word limits, output formats, and detail levels.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚙️ CUSTOMIZE YOUR ANALYSIS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Update Settings give you complete control over how goals are tracked, analyzed, and reported.</p>
              </div>


              <p style="margin-bottom:12px;font-weight:600;">Available settings:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🔄 Refresh Interval</p>
                <p style="margin:0;font-size:14px;"><strong>Range:</strong> 30 to 300 seconds (30 seconds to 5 minutes)</p>
                <p style="margin:8px 0 0 0;font-size:14px;">Set how frequently goals automatically refresh during your meeting. Lower values provide more real-time updates but may be more distracting.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">📝 Word Limit</p>
                <p style="margin:0;font-size:14px;"><strong>Range:</strong> 50 to 500 words</p>
                <p style="margin:8px 0 0 0;font-size:14px;">Control the length of goal analysis outputs. Lower limits give brief summaries, higher limits provide detailed analysis.</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">📋 Output Format</p>
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>Options:</strong></p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;"><strong>Summary:</strong> Brief overview of goal status and key points</li>
                  <li style="margin-bottom:6px;font-size:14px;"><strong>Detailed:</strong> Comprehensive analysis with full context</li>
                  <li style="margin-bottom:0;font-size:14px;"><strong>Speakers Only:</strong> Focus on who discussed the goal</li>
                </ul>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">🔍 Details to Include</p>
                <p style="margin:0 0 8px 0;font-size:14px;"><strong>Checkboxes:</strong></p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;"><strong>Include timestamps with evidence:</strong> Show when evidence occurred</li>
                  <li style="margin-bottom:6px;font-size:14px;"><strong>Include speakers who uttered the evidence:</strong> Identify who said what</li>
                  <li style="margin-bottom:0;font-size:14px;"><strong>Include exact quotes in the output:</strong> Display verbatim transcript excerpts</li>
                </ul>
              </div>

             

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">💬 Additional Prompt</p>
                <p style="margin:0;font-size:14px;">Add custom instructions to be more clear about what you want from the goal analysis. This helps the AI understand your specific requirements and generate more relevant outputs.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to configure Update Settings:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click on <strong>Update Settings</strong> in the Custom Goals section</li>
                <li style="margin-bottom:10px;padding-left:8px;">Adjust <strong>Refresh Interval</strong> (30-300 seconds)</li>
                <li style="margin-bottom:10px;padding-left:8px;">Set <strong>Word Limit</strong> (50-500 words)</li>
                <li style="margin-bottom:10px;padding-left:8px;">Choose your preferred <strong>Output Format</strong></li>
                <li style="margin-bottom:10px;padding-left:8px;">Select <strong>Details to Include</strong> (timestamps, speakers, quotes)</li>
                <li style="margin-bottom:10px;padding-left:8px;">Add any <strong>Additional Prompt</strong> instructions</li>
                <li style="margin-bottom:0;padding-left:8px;">Click <strong>Save Settings</strong></li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">Recommended settings by use case:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">Quick Updates:</p>
                <p style="margin:0;font-size:14px;">Interval: 60 seconds, Word Limit: 100, Format: Summary, Details: None</p>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">Detailed Analysis:</p>
                <p style="margin:0;font-size:14px;">Interval: 180 seconds, Word Limit: 400, Format: Detailed, Details: All enabled</p>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">Attribution Focus:</p>
                <p style="margin:0;font-size:14px;">Interval: 120 seconds, Word Limit: 250, Format: Speakers Only, Details: Speakers and timestamps</p>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use the Additional Prompt field to specify exactly what you're looking for, like "Focus on commitment statements" or "Highlight any concerns raised about the goal".
              </p>
            </div>
          `
        },
        {
          id: 'view-goal-details',
          question: 'How do I view detailed analysis for a specific goal?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can click on any Custom Goal to view its detailed analysis, including status, evidence, timestamps, and speaker information.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 DETAILED INSIGHTS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Each goal provides comprehensive analysis showing exactly when and how it was discussed, with evidence from your meeting transcript.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to view goal details:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">In the Custom Goals section, locate the goal you want to review</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the goal</li>
                <li style="margin-bottom:10px;padding-left:8px;">View the detailed analysis panel</li>
                <li style="margin-bottom:0;padding-left:8px;">Review status, evidence, and insights</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">What's included in goal details:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Current Status:</strong> In Progress, Achieved, Not Discussed, etc.</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evidence Summary:</strong> Overview of relevant discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timestamps:</strong> When the goal was discussed (if enabled in settings)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker Information:</strong> Who discussed the goal (if enabled in settings)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Exact Quotes:</strong> Verbatim transcript excerpts (if enabled in settings)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> Why the AI determined this status</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Analysis:</strong> AI-generated insights about goal progress</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Understanding the analysis:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status explanation:</strong> Clear reasoning for why the goal has its current status</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evidence-based:</strong> All conclusions backed by specific transcript moments</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Verifiable:</strong> You can verify claims using timestamps and quotes</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Actionable:</strong> Insights help you decide next steps</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use goal details to create follow-up action items or to verify that important objectives were truly achieved before ending the meeting.
              </p>
            </div>
          `
        },
        {
          id: 'goal-status-achieved-vs-progress',
          question: 'What is the difference between "Achieved" and "In Progress" status?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Understanding the difference between <strong>Achieved</strong> and <strong>In Progress</strong> helps you know whether your meeting goals have been fully accomplished or still need attention.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✅ vs 🟡 STATUS DISTINCTION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The AI evaluates not just if a goal was discussed, but whether it reached a clear conclusion or resolution.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Achieved Status (✅):</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Goal completed:</strong> The objective has been fully accomplished</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Clear resolution:</strong> A definite decision, answer, or outcome was reached</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>No further action needed:</strong> The goal doesn't require additional discussion</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evidence of completion:</strong> Transcript shows conclusive statements or agreements</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Example:</strong> "Get budget approval" → Client says "Yes, budget is approved"</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">In Progress Status (🟡):</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Goal discussed:</strong> The topic was addressed but not concluded</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Ongoing conversation:</strong> Discussion is happening but no final decision yet</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Partial completion:</strong> Some progress made but more work needed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Requires follow-up:</strong> Goal needs additional discussion or action</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Example:</strong> "Get budget approval" → Client says "I need to discuss with finance team"</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">How the AI determines status:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Analyzes language:</strong> Looks for conclusive vs exploratory statements</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identifies commitments:</strong> Detects firm decisions vs tentative discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Evaluates completeness:</strong> Assesses if all aspects of the goal were addressed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Considers context:</strong> Understands the full conversation around the goal</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> If a goal shows "In Progress" near the end of your meeting, consider circling back to reach a conclusion before wrapping up.
              </p>
            </div>
          `
        },
        {
          id: 'multiple-goals-tracking',
          question: 'Can I track multiple Custom Goals simultaneously?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Yes, you can track multiple Custom Goals simultaneously during a single meeting. The AI monitors all goals in parallel and updates their status independently.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📋 MULTI-GOAL TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Track as many goals as you need for your meeting. Each goal is analyzed independently with its own status, evidence, and insights.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of tracking multiple goals:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Comprehensive coverage:</strong> Ensure all meeting objectives are monitored</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Independent tracking:</strong> Each goal has its own status and analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Priority management:</strong> See which goals are achieved and which need attention</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting efficiency:</strong> Quickly identify if you're missing any objectives</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Complete documentation:</strong> Full record of all intended outcomes</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Best practices for multiple goals:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Keep goals specific:</strong> Each goal should be clear and distinct</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prioritize effectively:</strong> Know which goals are must-haves vs nice-to-haves</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review regularly:</strong> Check status mid-meeting to ensure coverage</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use descriptive names:</strong> Make goals easy to identify at a glance</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Avoid overlap:</strong> Don't create redundant goals that track the same thing</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Recommended number of goals:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Short meetings (15-30 min):</strong> 2-3 goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Standard meetings (30-60 min):</strong> 3-5 goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Long meetings (60+ min):</strong> 5-8 goals</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Strategy sessions:</strong> As many as needed, organized by category</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Before ending a meeting, do a final refresh and review all goals to ensure you haven't missed any important objectives.
              </p>
            </div>
          `
        },
        {
          id: 'custom-goals-use-cases',
          question: 'What are common use cases for Custom Goals?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Custom Goals are versatile and can be used across different meeting types to ensure specific objectives are achieved and properly documented.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 REAL-WORLD APPLICATIONS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">From sales calls to product planning, Custom Goals help ensure every meeting achieves its intended outcomes.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Sales & Business Development:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Discovery calls:</strong> "Identify top 3 pain points", "Understand decision-making process"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Product demos:</strong> "Show integration capabilities", "Address security concerns"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Negotiations:</strong> "Get budget approval", "Agree on timeline", "Secure executive sponsor"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>QBRs:</strong> "Review ROI metrics", "Identify expansion opportunities", "Address any concerns"</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Product & Engineering:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>User research:</strong> "Validate feature concept", "Understand user workflow"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Planning:</strong> "Define MVP scope", "Agree on technical approach", "Identify dependencies"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reviews:</strong> "Get design approval", "Identify performance bottlenecks"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Retrospectives:</strong> "Document key learnings", "Define process improvements"</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Customer Success:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Onboarding:</strong> "Complete setup checklist", "Schedule training sessions"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Check-ins:</strong> "Assess product adoption", "Identify blockers", "Gather feedback"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Escalations:</strong> "Understand root cause", "Define resolution plan", "Set timeline"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Renewals:</strong> "Confirm renewal intent", "Discuss contract terms"</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Leadership & Strategy:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Planning sessions:</strong> "Align on quarterly goals", "Set budget priorities"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>1-on-1s:</strong> "Discuss career development", "Address performance concerns"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Board meetings:</strong> "Get strategic initiative approval", "Present financial updates"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>All-hands:</strong> "Announce new initiative", "Address employee questions"</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">Example goal sets by meeting type:</p>
              
              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">Sales Discovery Call:</p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;">Identify current solution and pain points</li>
                  <li style="margin-bottom:6px;font-size:14px;">Understand budget and timeline</li>
                  <li style="margin-bottom:6px;font-size:14px;">Map decision-makers and process</li>
                  <li style="margin-bottom:0;font-size:14px;">Schedule technical demo</li>
                </ul>
              </div>

              <div style="margin-bottom:16px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">Product Feature Discussion:</p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;">Validate user need and impact</li>
                  <li style="margin-bottom:6px;font-size:14px;">Define success metrics</li>
                  <li style="margin-bottom:6px;font-size:14px;">Agree on technical approach</li>
                  <li style="margin-bottom:0;font-size:14px;">Estimate development timeline</li>
                </ul>
              </div>

              <div style="margin-bottom:24px;padding:16px;background:#f9fafb;border-radius:6px;">
                <p style="margin:0 0 8px 0;font-weight:600;color:#1E40AF;">Customer Onboarding Kickoff:</p>
                <ul style="margin:0;padding-left:20px;">
                  <li style="margin-bottom:6px;font-size:14px;">Complete account setup</li>
                  <li style="margin-bottom:6px;font-size:14px;">Schedule training sessions</li>
                  <li style="margin-bottom:6px;font-size:14px;">Define success criteria</li>
                  <li style="margin-bottom:0;font-size:14px;">Assign stakeholder contacts</li>
                </ul>
              </div>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Create goal templates for recurring meeting types to save time and ensure consistency across similar meetings.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
   {
  id: 'live-transcription-section',
  title: 'Live Transcription',
  description: 'Real-time meeting transcription that captures every word as your conversation unfolds.',
  questions: [
    {
      id: 'live-transcription-features',
      title: 'Live Transcription Features',
      emoji: '📝',
      description: 'Automatic speech-to-text conversion for your entire meeting.',
      subQuestions: [
        {
          id: 'what-is-live-transcription',
          question: 'What is Live Transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Live Transcription</strong> automatically converts spoken words into text in real-time during your meetings. It captures everything that's said and displays it as the conversation unfolds.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎙️ REAL-TIME SPEECH-TO-TEXT</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Live Transcription works automatically to convert every spoken word into written text, creating a complete record of your meeting as it happens.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic transcription:</strong> Starts recording text as soon as activated</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time display:</strong> See words appear as they're being spoken</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker identification:</strong> Identifies who said what</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Complete coverage:</strong> Captures the entire meeting conversation</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Searchable text:</strong> Easy to search and reference later</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click on Note-Taker when the bot joins the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Transcription starts with a 10-15 second delay</li>
                <li style="margin-bottom:10px;padding-left:8px;">Words appear in real-time as people speak</li>
                <li style="margin-bottom:10px;padding-left:8px;">Continues recording throughout the entire meeting</li>
                <li style="margin-bottom:0;padding-left:8px;">Complete transcript available after the meeting ends</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> Live Transcription works the same as the live transcriptions in the main console, providing consistent and reliable text capture.
              </p>
            </div>
          `
        },
        {
          id: 'how-to-start-transcription',
          question: 'How do I start Live Transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Live Transcription starts automatically when you click on the Note-Taker after the bot joins your meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">▶️ QUICK START</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Simply click on Note-Taker as soon as the bot joins to ensure you capture the complete meeting from the very beginning.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Step-by-step guide:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Wait for the bot to join your meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the <strong>Note-Taker</strong> option</li>
                <li style="margin-bottom:10px;padding-left:8px;">Wait 10-15 seconds for transcription to initialize</li>
                <li style="margin-bottom:10px;padding-left:8px;">Transcription begins and text starts appearing</li>
                <li style="margin-bottom:0;padding-left:8px;">Continue your meeting normally while transcription runs</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">Initial delay explained:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>10-15 second delay:</strong> Normal initialization time for the transcription service</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Processing setup:</strong> System prepares audio processing and speech recognition</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>One-time delay:</strong> Only occurs at the start, then runs continuously</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Expected behavior:</strong> This delay is normal and doesn't indicate an issue</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Click on Note-Taker immediately when the bot joins to ensure no content is missed from the beginning of your meeting.
              </p>
            </div>
          `
        },
        {
          id: 'transcription-delay',
          question: 'Why is there a delay when starting transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Live Transcription has a 10-15 second delay at the start. This is a normal initialization period required to set up the speech recognition system.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⏱️ INITIALIZATION TIME</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The delay allows the system to properly set up audio processing, speaker identification, and real-time transcription capabilities.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What happens during the delay:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Audio connection setup:</strong> Establishes connection to meeting audio stream</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speech recognition initialization:</strong> Prepares AI models for transcription</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker detection setup:</strong> Configures speaker identification system</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quality calibration:</strong> Adjusts to audio quality and environment</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>System synchronization:</strong> Ensures all components are ready</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Understanding the delay:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Duration:</strong> Typically 10-15 seconds</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Frequency:</strong> Only occurs once at the start</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Normal behavior:</strong> Expected and not a technical issue</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>One-time only:</strong> After initialization, transcription is continuous</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Cannot be skipped:</strong> Required for proper functionality</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How to minimize missed content:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Click immediately:</strong> Activate Note-Taker as soon as the bot joins</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Wait before starting:</strong> Give the system 15 seconds to initialize before important discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use introductions:</strong> Allow delay time for greetings and small talk</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Plan accordingly:</strong> Factor in initialization time when scheduling</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> The 10-15 second delay is a necessary technical requirement and ensures high-quality, accurate transcription once it begins.
              </p>
            </div>
          `
        },
        {
          id: 'capture-from-beginning',
          question: 'How do I ensure transcription captures from the beginning?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">To capture your meeting from the very beginning, it's crucial to click on Note-Taker immediately when the bot joins, before any important discussion starts.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎬 COMPLETE CAPTURE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Activating Note-Taker immediately ensures no transcriptions are missing and you have a complete record of your entire meeting.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Best practices for complete capture:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Click immediately when bot joins</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Don't wait - activate Note-Taker the moment the bot enters the meeting</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Account for 10-15 second delay</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Remember transcription takes a few seconds to start, so click early</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Start with introductions</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Use initial greetings and introductions to allow initialization time</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Wait for confirmation</strong><br>
                  <span style="font-size:14px;color:#6B7280;">See that transcription has started before diving into important topics</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Verify it's running</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Check that text is appearing before proceeding with key discussions</span>
                </li>
              </ol>

             
              <p style="margin-bottom:12px;font-weight:600;">What happens if you click late:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Missing content:</strong> Any conversation before activation won't be captured</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Incomplete record:</strong> Your transcript will start from when you clicked</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Gap in documentation:</strong> Important early discussions may be lost</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Cannot retrieve:</strong> Past audio cannot be recovered once missed</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Meeting preparation tips:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Schedule bot early:</strong> Have the bot join a minute before meeting start</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Be ready to click:</strong> Know where the Note-Taker button is located</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Brief participants:</strong> Let others know you're waiting for transcription to start</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Buffer time:</strong> Build in 20-30 seconds before agenda items begin</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Visual confirmation:</strong> Always verify transcription is running before proceeding</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Critical:</strong> To ensure no transcriptions are missing, click on Note-Taker immediately when the bot joins the meeting. This is the most important step for complete capture.
              </p>
            </div>
          `
        },
        {
          id: 'transcription-vs-main-console',
          question: 'How does Live Transcription compare to main console transcription?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Live Transcription in Note-Taker works the same as the live transcriptions in the main console, providing consistent functionality and quality across both interfaces.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔄 CONSISTENT EXPERIENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Both transcription views use the same underlying technology and provide identical transcription quality and features.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Similarities:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Same technology:</strong> Both use identical speech recognition systems</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Equal accuracy:</strong> Transcription quality is the same in both views</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time updates:</strong> Text appears at the same speed in both locations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker identification:</strong> Both identify and label speakers</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Complete coverage:</strong> Both capture the entire meeting</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Same content:</strong> Transcript text is identical in both views</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">Key differences:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Interface location:</strong> Note-Taker provides integrated view with other meeting tools</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Layout:</strong> May be displayed differently based on available space</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Context:</strong> Note-Taker shows transcription alongside goals, chat, and AI features</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Workflow integration:</strong> Better integrated with other Note-Taker features</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Why use Note-Taker transcription:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>All-in-one view:</strong> Access transcription alongside other features</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Contextual reference:</strong> See transcription while using Custom Goals or AI Templates</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Simplified workflow:</strong> Everything you need in one place</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Efficient multi-tasking:</strong> View multiple features simultaneously</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Bottom Line:</strong> Live Transcription works exactly the same as main console transcription - you're getting the same quality and features, just in a more integrated interface.
              </p>
            </div>
          `
        },
        {
          id: 'viewing-transcription',
          question: 'How do I view Live Transcription during a meeting?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Once activated, Live Transcription appears in the transcription panel where you can see the conversation being converted to text in real-time.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">👀 VIEWING EXPERIENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Watch your meeting unfold in written form as the transcription captures every word spoken by participants.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What you'll see:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time text:</strong> Words appear as they're being spoken</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker labels:</strong> Each statement identified by speaker name or label</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Continuous scroll:</strong> Transcript automatically scrolls as new text appears</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timestamps:</strong> Time markers showing when statements were made</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Formatted text:</strong> Clear, readable format with proper spacing</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Transcription features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Auto-scroll:</strong> Follows along with the conversation automatically</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Manual scroll:</strong> Scroll back to review earlier content</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Searchable:</strong> Can search through transcript content</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Copyable:</strong> Select and copy text as needed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Persistent:</strong> Stays visible throughout the meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Using transcription during meetings:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reference tool:</strong> Look back at what was just said</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Clarity check:</strong> Verify understanding of complex points</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Note-taking aid:</strong> Copy important sections for your own notes</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Accessibility:</strong> Helps those who prefer reading to listening</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Focus support:</strong> Follow along in text while listening</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> You can view the transcription while using other Note-Taker features like Custom Goals or AI Templates for a complete meeting management experience.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
   {
  id: 'ai-assistant',
  title: 'AI Assistant',
  description: 'Powerful AI-driven assistant that answers questions, generates summaries, and creates professional meeting documentation.',
  questions: [
    {
      id: 'ai-assistant-features',
      title: 'AI Assistant Features',
      emoji: '🤖',
      description: 'Leverage AI intelligence to extract insights and create professional meeting outputs.',
      subQuestions: [
        {
          id: 'what-is-ai-assistant',
          question: 'What is AI Assistant?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>AI Assistant</strong> is your intelligent meeting companion that can answer questions about your transcription, generate summaries, compose follow-up emails, and create comprehensive meeting documentation.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🧠 INTELLIGENT MEETING ANALYSIS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Ask any question about your meeting transcription and get instant, accurate answers powered by advanced AI that understands context and nuance.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Key Capabilities:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Manual Questions:</strong> Type any question about your transcription</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Template Queries:</strong> One-click access to common questions and summaries</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Follow-up Questions:</strong> AI suggests relevant next questions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Email Composer:</strong> Generate professional follow-up emails</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>PDF Export:</strong> Save AI responses and transcripts as PDFs</li>
              </ul>


              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Start with template queries to see what AI Assistant can do, then ask custom questions to dive deeper into specific meeting topics.
              </p>
            </div>
          `
        },
        {
          id: 'manual-questions',
          question: 'How do I ask manual questions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">You can manually type any question about your meeting transcription in the AI Assistant chat interface to get instant, intelligent answers.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💬 CONVERSATIONAL QUERIES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Ask questions in natural language just like you would to a colleague—the AI understands context and provides detailed, relevant answers.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to ask manual questions:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Locate the text input field in the AI Assistant panel</li>
                <li style="margin-bottom:12px;padding-left:8px;">Type your question about any aspect of the meeting transcription</li>
                <li style="margin-bottom:12px;padding-left:8px;">Press Enter or click the send button</li>
                <li style="margin-bottom:0;padding-left:8px;">AI Assistant analyzes the transcription and provides a detailed answer</li>
              </ol>

              

              <p style="margin-bottom:12px;font-weight:600;">Example questions you can ask:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">"What were the main action items discussed?"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Who expressed concerns about the timeline?"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"What pricing was mentioned during the call?"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Summarize the technical requirements discussed"</li>
                <li style="margin-bottom:0;padding-left:8px;">"What are the next steps mentioned in this meeting?"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Be specific with your questions for more precise answers. Instead of "What happened?", ask "What concerns did the client raise about implementation?"
              </p>
            </div>
          `
        },
        {
          id: 'refresh-chat',
          question: 'What does the refresh button do?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The green refresh button allows you to clear the current chat conversation and start fresh with new questions.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔄 FRESH START</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Refresh the chat section to clear previous conversations and begin a new line of questioning without any context carryover.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">When to use refresh:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>New Topic:</strong> When switching to a completely different aspect of the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Clear History:</strong> When you want to remove previous Q&A from view</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Start Over:</strong> If you want to approach questions from a different angle</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Clean Slate:</strong> Before sharing your screen or presenting results</li>
              </ul>

              

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Refreshing doesn't delete your transcription or meeting data—it only clears the AI Assistant conversation history for a fresh start.
              </p>
            </div>
          `
        },
        {
          id: 'template-queries',
          question: 'What are template queries?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Template queries</strong> are pre-built question formats that provide instant answers to common meeting analysis needs with just one click.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚡ ONE-CLICK INSIGHTS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Click any template button to automatically generate comprehensive answers for common meeting analysis tasks—no typing required.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Available template options:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Summary:</strong> Comprehensive meeting overview with key points</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Follow-up Email:</strong> Professional email draft for post-meeting communication</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Participant Analysis:</strong> Who said what and engagement insights</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Risk Assessment:</strong> Potential concerns and red flags identified</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Custom Templates:</strong> Your personally created query templates</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Action Items:</strong> Tasks and next steps mentioned in the meeting</li>
              </ul>

                  <p style="margin-bottom:12px;font-weight:600;">How template queries work:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Click on any template button (e.g., "Summary" or "Follow-up Email")</li>
                <li style="margin-bottom:12px;padding-left:8px;">The query automatically populates in the chat section</li>
                <li style="margin-bottom:12px;padding-left:8px;">AI Assistant processes the transcription immediately</li>
                <li style="margin-bottom:0;padding-left:8px;">Detailed answer appears with relevant follow-up questions</li>
              </ol>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Start with templates to quickly get standard insights, then use manual questions to dig deeper into specific topics that interest you.
              </p>
            </div>
          `
        },
        {
          id: 'follow-up-questions',
          question: 'How do follow-up questions work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">AI Assistant automatically generates relevant follow-up questions after each response, making it easy to explore related topics and dive deeper into the conversation.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔗 INTELLIGENT EXPLORATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">After answering your question, AI Assistant suggests contextually relevant follow-up questions to help you discover insights you might not have thought to ask about.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">You ask a question or use a template</li>
                <li style="margin-bottom:12px;padding-left:8px;">AI Assistant provides a comprehensive answer</li>
                <li style="margin-bottom:12px;padding-left:8px;">Below the answer, you see suggested follow-up questions</li>
                <li style="margin-bottom:0;padding-left:8px;">Click any follow-up question to instantly get that answer</li>
              </ol>


              <p style="margin-bottom:12px;font-weight:600;">Benefits of follow-up questions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Save Time:</strong> No need to think of what to ask next</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Discover Insights:</strong> Uncover important details you might have missed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Contextual:</strong> Questions are specifically relevant to the current topic</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Guided Analysis:</strong> Helps you conduct thorough meeting reviews</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Easy Navigation:</strong> One-click access to deeper information</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Example:</strong> After asking "What were the main objections?", AI might suggest "What solutions were proposed for these objections?" or "How did the client respond to our proposals?"
              </p>
            </div>
          `
        },
        {
          id: 'email-composer',
          question: 'How does the follow-up email composer work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The follow-up email composer automatically generates professional, context-aware emails based on your meeting transcription, ready to send to participants.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✉️ PROFESSIONAL COMMUNICATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Create polished follow-up emails that reference specific meeting points, action items, and next steps—all generated automatically from your transcription.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to generate a follow-up email:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Click the "Follow-up Email" template button</li>
                <li style="margin-bottom:12px;padding-left:8px;">The template query appears in the chat section</li>
                <li style="margin-bottom:12px;padding-left:8px;">AI Assistant generates a professional email draft</li>
                <li style="margin-bottom:0;padding-left:8px;">Copy and customize the email as needed before sending</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">What's included in generated emails:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting Recap:</strong> Brief summary of key discussion points</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Action Items:</strong> Clear list of tasks and owners</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Next Steps:</strong> Timeline and upcoming milestones</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Open Questions:</strong> Items requiring clarification or decision</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Professional Tone:</strong> Business-appropriate language and structure</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Customizable:</strong> Edit any section before sending</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Generate the email immediately after your meeting while details are fresh, then review and personalize it before sending to participants.
              </p>
            </div>
          `
        },
        {
          id: 'save-pdf',
          question: 'How do I save AI responses as PDF?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The Save PDF feature allows you to export AI Assistant responses, summaries, and transcripts as professional PDF documents for sharing and archiving.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📄 PROFESSIONAL DOCUMENTATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Create polished PDF reports combining multiple AI analyses, templates, and transcripts—perfect for sharing with stakeholders or archiving meeting records.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to save as PDF:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Click the "Save PDF" button in the AI Assistant panel</li>
                <li style="margin-bottom:12px;padding-left:8px;">Select which templates to include in the PDF:
                  <ul style="margin:8px 0 0 0;padding-left:24px;">
                    <li style="margin-bottom:6px;">Choose one template (e.g., just Summary)</li>
                    <li style="margin-bottom:6px;">Select multiple templates (e.g., Summary + Action Items + Risk Assessment)</li>
                    <li style="margin-bottom:0;">Include all pre-built and custom templates</li>
                  </ul>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">Choose whether to include the full meeting transcript</li>
                <li style="margin-bottom:12px;padding-left:8px;">Click "Run and Generate PDF"</li>
                <li style="margin-bottom:0;padding-left:8px;">Wait for processing, then download your PDF</li>
              </ol>

             

              <p style="margin-bottom:12px;font-weight:600;">Template selection options:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Summary:</strong> Executive overview of the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Participant Analysis:</strong> Who spoke, engagement levels, sentiment</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Risk Assessment:</strong> Concerns, objections, and potential issues</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Action Items:</strong> Tasks, owners, and deadlines</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Custom Templates:</strong> Your personally created analysis templates</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Full Transcript:</strong> Complete conversation record (optional)</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Create different PDF combinations for different audiences—a summary-only PDF for executives, and a detailed PDF with transcript for project teams.
              </p>
            </div>
          `
        },
        {
          id: 'share-summary',
          question: 'How do I share a professional summary?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The Share option allows you to send professional meeting summaries directly via email through Gmail, Yahoo, or Outlook with customizable signatures.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📧 INSTANT SHARING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Share polished meeting summaries directly from AI Assistant to participants via your preferred email platform with just a few clicks.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to share a summary:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">Click the "Share" button in the AI Assistant panel</li>
                <li style="margin-bottom:12px;padding-left:8px;">Choose your email platform:
                  <ul style="margin:8px 0 0 0;padding-left:24px;">
                    <li style="margin-bottom:6px;">Gmail</li>
                    <li style="margin-bottom:6px;">Yahoo Mail</li>
                    <li style="margin-bottom:0;">Outlook</li>
                  </ul>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">Select or customize your email signature</li>
                <li style="margin-bottom:12px;padding-left:8px;">Review the pre-filled professional summary</li>
                <li style="margin-bottom:0;padding-left:8px;">Add recipients and send</li>
              </ol>


              <p style="margin-bottom:12px;font-weight:600;">Email signature options:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Default Signature:</strong> "Powered by Spiked AI" branding</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Custom Signature:</strong> Create and save your own professional signature</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Company Branding:</strong> Include your organization's contact info and logo</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What's included in shared summaries:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Professional meeting summary with key takeaways</li>
                <li style="margin-bottom:10px;padding-left:8px;">Action items and next steps</li>
                <li style="margin-bottom:10px;padding-left:8px;">Important decisions and agreements</li>
                <li style="margin-bottom:10px;padding-left:8px;">Your customized email signature</li>
                <li style="margin-bottom:0;padding-left:8px;">Clean, professional formatting</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Create a custom email signature once with your full contact details, then reuse it for all meeting summaries to maintain consistent professional branding.
              </p>
            </div>
          `
        },
        {
          id: 'custom-templates',
          question: 'Can I create custom templates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Yes! You can create and save custom templates for questions or analyses you frequently need, making your workflow even more efficient.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 PERSONALIZED WORKFLOWS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Build your own library of custom templates tailored to your specific meeting types, industry needs, or analysis preferences.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of custom templates:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Industry-Specific:</strong> Create templates for your field (sales, HR, legal, etc.)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Repeatable Analysis:</strong> Standard questions for recurring meeting types</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Save Time:</strong> One-click access to your most-used queries</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Consistency:</strong> Ensure the same analysis approach across all meetings</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Team Sharing:</strong> Share effective templates with colleagues</li>
              </ul>

              
              <p style="margin-bottom:12px;font-weight:600;">Example custom template ideas:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sales Calls:</strong> "What buying signals were present?" or "Competitive mentions analysis"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Project Reviews:</strong> "List all blockers and dependencies mentioned"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Client Check-ins:</strong> "What satisfaction indicators appeared in the conversation?"</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Team Meetings:</strong> "Identify morale indicators and team concerns"</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Discovery Calls:</strong> "Extract all technical requirements and specifications"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Build a custom template library for each meeting type you regularly host—you'll save significant time and ensure consistent, thorough analysis.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
  ]
},

    simulator: {
  cardId: 'card-simulator',
  cardTitle: 'Simulator',
  cardDescription:
    'Transform your sales performance through interactive simulations — access training materials, select your target audience, configure questions, and run AI-driven quiz sessions.',
  icon: <BrainCircuit style={{ width: '20px', height: '20px', color: '#2563eb' }} />,
  emoji: '🎮',
  items: [
    {
  id: 'training-materials-section',
  title: 'Training Materials',
  description: 'Upload and manage materials to train yourself and enhance your knowledge through the simulator.',
  questions: [
    {
      id: 'training-materials-overview',
      title: 'Training Materials Overview',
      emoji: '📚',
      description: 'Everything you need to know about uploading and using training materials.',
      subQuestions: [
        {
          id: 'what-are-training-materials',
          question: 'What are Training Materials?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Training Materials</strong> are documents, files, and resources that you upload to the simulator to gain knowledge and train yourself on specific topics or content.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📖 KNOWLEDGE ENHANCEMENT</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Training Materials allow you to upload your own content and learn from it systematically, creating a personalized learning experience tailored to your needs.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">What you can upload:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Documents:</strong> PDFs, Word files, presentations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Study guides:</strong> Course materials, textbooks, reference guides</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Training content:</strong> Company policies, procedures, best practices</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reference materials:</strong> Manuals, specifications, documentation</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Educational resources:</strong> Articles, research papers, tutorials</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Upload your materials to the simulator</li>
                <li style="margin-bottom:10px;padding-left:8px;">System processes and organizes the content</li>
                <li style="margin-bottom:10px;padding-left:8px;">Access materials whenever you need to study or reference</li>
                <li style="margin-bottom:10px;padding-left:8px;">Train yourself at your own pace</li>
                <li style="margin-bottom:0;padding-left:8px;">Build comprehensive knowledge over time</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Key benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Personalized learning:</strong> Use your own materials for targeted training</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Centralized knowledge:</strong> All training resources in one place</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>On-demand access:</strong> Study whenever and wherever you need</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Organized content:</strong> Easy to manage and navigate materials</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Continuous improvement:</strong> Build knowledge progressively</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Purpose:</strong> Training Materials help you systematically learn and master content by providing a dedicated space for your educational resources.
              </p>
            </div>
          `
        },
        {
          id: 'how-to-upload-materials',
          question: 'How do I upload Training Materials?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Uploading Training Materials is a straightforward process that allows you to quickly add new content to your learning library.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⬆️ UPLOAD PROCESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Simply select your files and upload them to the simulator to begin building your personalized training library.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Step-by-step upload process:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Access the Training Materials section</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Navigate to the simulator and find the Training Materials area</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Click the Upload button</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Look for the upload option or drag-and-drop zone</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Select your files</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Choose one or multiple files from your device</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Wait for processing</strong><br>
                  <span style="font-size:14px;color:#6B7280;">System processes and organizes your materials</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Start using your materials</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Access and study from your uploaded content</span>
                </li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Supported file types:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>PDF files:</strong> Most common format for documents and guides</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Word documents:</strong> .doc and .docx files</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Presentations:</strong> PowerPoint and similar formats</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Text files:</strong> Plain text and formatted documents</li>
                </ul>

              <p style="margin-bottom:12px;font-weight:600;">Upload best practices:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Organize before uploading:</strong> Name files clearly and logically</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Check file quality:</strong> Ensure materials are readable and complete</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Upload in batches:</strong> Group related materials together</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Verify uploads:</strong> Confirm files uploaded successfully</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Update regularly:</strong> Keep materials current and relevant</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Organize your materials into categories or topics before uploading to make it easier to find and study specific content later.
              </p>
            </div>
          `
        },
        {
          id: 'managing-materials',
          question: 'How do I manage and organize my Training Materials?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Effective management and organization of your Training Materials ensures easy access and efficient learning.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🗂️ ORGANIZATION TOOLS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Keep your training library organized with tools to categorize, search, and manage your materials effectively.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Organization features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>File listing:</strong> View all uploaded materials in one place</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Search function:</strong> Quickly find specific materials by name</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sorting options:</strong> Organize by date, name, or type</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Categories:</strong> Group materials by topic or subject</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Delete option:</strong> Remove outdated or unnecessary materials</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Management actions you can take:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>View materials:</strong> Open and review uploaded content</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Download files:</strong> Save copies to your device</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Rename materials:</strong> Update file names for clarity</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Delete materials:</strong> Remove unwanted or outdated files</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Replace files:</strong> Upload updated versions of materials</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Organization strategies:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use clear naming:</strong> Name files descriptively (e.g., "Sales_Training_Module_1")</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Create logical groups:</strong> Organize by topic, course, or difficulty level</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Regular cleanup:</strong> Remove outdated materials periodically</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Version control:</strong> Include dates or version numbers in file names</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Priority marking:</strong> Keep most-used materials easily accessible</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Maintenance tips:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Weekly review:</strong> Check for new materials to add</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Archive old content:</strong> Remove materials no longer needed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Update regularly:</strong> Replace outdated versions with current ones</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Test accessibility:</strong> Ensure files open and display correctly</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Backup important files:</strong> Keep copies of critical materials</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Best Practice:</strong> Spend a few minutes each week organizing your Training Materials to maintain an efficient and effective learning library.
              </p>
            </div>
          `
        },
        {
          id: 'using-materials-for-training',
          question: 'How do I use Training Materials effectively?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Maximize your learning by using Training Materials strategically and incorporating them into your regular study routine.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 EFFECTIVE LEARNING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Transform uploaded materials into actionable knowledge through structured study and consistent practice.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Ways to use your materials:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Self-paced study:</strong> Review materials at your own speed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reference during practice:</strong> Look up information while working</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pre-meeting preparation:</strong> Study materials before important discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick refreshers:</strong> Review key concepts before using them</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Knowledge verification:</strong> Confirm understanding of complex topics</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Learning strategies:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Active reading:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Engage with materials actively by taking notes and highlighting key points</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Spaced repetition:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Review materials multiple times over increasing intervals</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Practice application:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Apply what you learn in real scenarios or simulations</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Progressive learning:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Start with basics and gradually move to advanced materials</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Regular assessment:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Test your understanding periodically</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Study schedule suggestions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Daily review:</strong> Spend 15-30 minutes with materials each day</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Weekly deep dive:</strong> Dedicate longer sessions for comprehensive study</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pre-task preparation:</strong> Review relevant materials before related work</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Monthly review:</strong> Revisit all materials to reinforce learning</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>On-demand access:</strong> Reference materials whenever questions arise</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Tracking your progress:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Mark completed materials:</strong> Track what you've studied</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Note difficulty levels:</strong> Identify areas needing more focus</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Set learning goals:</strong> Define what you want to achieve</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Track time spent:</strong> Monitor study hours for each topic</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Assess understanding:</strong> Regularly evaluate your knowledge</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Success Tip:</strong> Consistency is key - regular, shorter study sessions with your Training Materials are more effective than infrequent long sessions.
              </p>
            </div>
          `
        },
        {
          id: 'materials-storage-limits',
          question: 'Are there any limits on Training Materials?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Understanding storage limits and file restrictions helps you make the most of your Training Materials space.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💾 STORAGE GUIDELINES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Be aware of file size limits and total storage capacity to ensure smooth operation and optimal performance.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">Managing storage effectively:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Compress files:</strong> Reduce file sizes before uploading</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Remove duplicates:</strong> Delete redundant or duplicate materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Archive old content:</strong> Remove materials no longer needed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Optimize formats:</strong> Use efficient file formats (PDF over large images)</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Regular cleanup:</strong> Periodically review and remove unused files</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What to do if you reach limits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Prioritize materials:</strong> Keep only the most important content</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Delete outdated files:</strong> Remove materials you no longer use</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Split large files:</strong> Break large documents into smaller sections</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use external storage:</strong> Keep backup copies elsewhere</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Contact support:</strong> Inquire about increased storage options</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Best practices for optimization:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Monitor usage:</strong> Regularly check your storage status</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Upload strategically:</strong> Only upload materials you'll actively use</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quality over quantity:</strong> Focus on valuable, high-quality materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Update instead of duplicate:</strong> Replace old versions rather than keeping both</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Plan ahead:</strong> Organize and clean up before uploading new content</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Storage Tip:</strong> Maintain a lean and organized library by regularly reviewing your Training Materials and removing content that's no longer relevant or needed.
              </p>
            </div>
          `
        },
        {
          id: 'troubleshooting-materials',
          question: 'What if my Training Materials won\'t upload or display?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">If you encounter issues with uploading or viewing Training Materials, there are several troubleshooting steps you can take.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔧 TROUBLESHOOTING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Resolve common issues with Training Materials to ensure smooth uploading and reliable access to your content.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Common upload issues and solutions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>File too large:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Compress the file or split it into smaller parts before uploading</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Unsupported format:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Convert the file to a supported format (PDF, DOCX, etc.)</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Upload interrupted:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Check your internet connection and try uploading again</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Storage limit reached:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Delete old materials to free up space</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Corrupted file:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Try re-saving or re-exporting the file from the original source</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Display and access issues:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>File won't open:</strong> Try downloading and opening locally</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Text appears garbled:</strong> Check file encoding or convert to standard format</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Images missing:</strong> Ensure embedded images are included in the upload</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Slow loading:</strong> Large files may take time; be patient or compress them</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Can't find material:</strong> Use search function or check sorting options</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">General troubleshooting steps:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Refresh your browser or restart the application</li>
                <li style="margin-bottom:10px;padding-left:8px;">Check your internet connection stability</li>
                <li style="margin-bottom:10px;padding-left:8px;">Clear browser cache and cookies</li>
                <li style="margin-bottom:10px;padding-left:8px;">Try using a different browser or device</li>
                <li style="margin-bottom:10px;padding-left:8px;">Verify file isn't corrupted by opening it locally first</li>
                <li style="margin-bottom:0;padding-left:8px;">Contact support if issues persist</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Prevention tips:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Test files first:</strong> Open materials locally before uploading</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use standard formats:</strong> Stick to commonly supported file types</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Stable connection:</strong> Upload during times of good internet connectivity</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Optimize files:</strong> Compress large files before uploading</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Verify uploads:</strong> Check that materials uploaded successfully</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Keep backups:</strong> Maintain copies of important materials elsewhere</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Need Help?</strong> If you continue experiencing issues with Training Materials after trying these solutions, contact technical support with details about the error and the file you're trying to upload.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'target-audience-section',
  title: 'Target Audience',
  description: 'Identify and understand your audience to generate tailored questions and AI quizzes that resonate with their specific needs.',
  questions: [
    {
      id: 'target-audience-overview',
      title: 'Target Audience Overview',
      emoji: '🎯',
      description: 'Customize your approach by selecting the right audience profile.',
      subQuestions: [
        {
          id: 'what-is-target-audience',
          question: 'What is Target Audience selection?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Target Audience</strong> selection allows you to identify who your audience is before training, enabling the system to generate customized questions and AI quizzes tailored to their specific background and expertise level.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">👥 KNOW YOUR AUDIENCE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">By selecting your target audience type, you ensure your training materials and questions are perfectly aligned with their knowledge level and interests.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">Available audience types:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Technical audience:</strong> Engineers, developers, technical specialists</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Business audience:</strong> Sales teams, business analysts, managers</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>C-Suite audience:</strong> Executives, directors, senior leadership</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Why it matters:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevant content:</strong> Questions match audience expertise level</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better engagement:</strong> Content resonates with their background</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Impressive presentations:</strong> Show you understand your customers</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Effective training:</strong> Learning materials aligned with their needs</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Key Benefit:</strong> Target Audience selection helps you know your customers better and deliver content that truly speaks to their specific role and expertise.
              </p>
            </div>
          `
        },
        {
          id: 'how-to-select-audience',
          question: 'How do I select my Target Audience?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Selecting your Target Audience is simple and ensures that generated questions and quizzes are appropriate for the people you're working with.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✅ AUDIENCE SELECTION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Choose the audience type that best matches the people you'll be presenting to or training.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Selection process:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to the Target Audience section in the simulator</li>
                <li style="margin-bottom:10px;padding-left:8px;">Review the available audience types</li>
                <li style="margin-bottom:10px;padding-left:8px;">Select the option that matches your audience</li>
                <li style="margin-bottom:10px;padding-left:8px;">System adjusts content generation accordingly</li>
                <li style="margin-bottom:0;padding-left:8px;">Generated questions will now be tailored to your selection</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">When to select each type:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Technical:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Choose when presenting to engineers, developers, or technical teams who need deep technical details</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Business:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Select for sales teams, business analysts, or managers focused on ROI and business value</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>C-Suite:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Use for executives and senior leadership who need strategic, high-level insights</span>
                </li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Always select your Target Audience before generating questions or quizzes to ensure the content matches your audience's expectations and knowledge level.
              </p>
            </div>
          `
        },
        {
          id: 'technical-audience',
          question: 'What does Technical audience generate?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Selecting <strong>Technical audience</strong> generates questions and content focused on technical details, implementation, and deep technical knowledge.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚙️ TECHNICAL FOCUS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Content emphasizes technical specifications, architecture, integration details, and hands-on implementation aspects.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Content characteristics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Technical depth:</strong> Detailed technical specifications and features</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Implementation focus:</strong> How to build, integrate, and deploy</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Architecture details:</strong> System design and technical architecture</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>API and integration:</strong> Technical integration methods and APIs</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Troubleshooting:</strong> Technical problem-solving scenarios</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Software engineers and developers</li>
                <li style="margin-bottom:10px;padding-left:8px;">Technical architects and specialists</li>
                <li style="margin-bottom:10px;padding-left:8px;">DevOps and infrastructure teams</li>
                <li style="margin-bottom:10px;padding-left:8px;">Technical consultants</li>
                <li style="margin-bottom:0;padding-left:8px;">IT professionals implementing solutions</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Choose Technical audience when your customers are engineers who need to understand how to implement and work with your product at a technical level.
              </p>
            </div>
          `
        },
        {
          id: 'business-audience',
          question: 'What does Business audience generate?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Selecting <strong>Business audience</strong> generates questions and content focused on business value, ROI, and practical business applications.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💼 BUSINESS VALUE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Content emphasizes business benefits, cost savings, efficiency improvements, and practical use cases.</p>
              </div>

           

              <p style="margin-bottom:12px;font-weight:600;">Content characteristics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>ROI focus:</strong> Return on investment and cost-benefit analysis</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Business outcomes:</strong> How solution improves business metrics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Use cases:</strong> Practical business scenarios and applications</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Competitive advantage:</strong> How solution creates business value</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Process improvement:</strong> Workflow optimization and efficiency gains</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Sales professionals and account managers</li>
                <li style="margin-bottom:10px;padding-left:8px;">Business analysts and consultants</li>
                <li style="margin-bottom:10px;padding-left:8px;">Product managers</li>
                <li style="margin-bottom:10px;padding-left:8px;">Department managers and team leads</li>
                <li style="margin-bottom:0;padding-left:8px;">Operations professionals</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Choose Business audience when your customers are focused on understanding business value, ROI, and how your solution solves their business challenges.
              </p>
            </div>
          `
        },
        {
          id: 'csuite-audience',
          question: 'What does C-Suite audience generate?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Selecting <strong>C-Suite audience</strong> generates questions and content focused on strategic value, high-level business impact, and executive decision-making.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎩 EXECUTIVE PERSPECTIVE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Content emphasizes strategic value, company-wide impact, competitive positioning, and long-term business transformation.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Content characteristics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Strategic vision:</strong> Long-term business strategy and goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Company-wide impact:</strong> Organization-level transformation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Competitive positioning:</strong> Market advantage and differentiation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Risk and compliance:</strong> Governance and risk management</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Financial impact:</strong> Bottom-line results and shareholder value</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Best for:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">CEOs, CFOs, CTOs, and other C-level executives</li>
                <li style="margin-bottom:10px;padding-left:8px;">Board members and directors</li>
                <li style="margin-bottom:10px;padding-left:8px;">Senior vice presidents</li>
                <li style="margin-bottom:10px;padding-left:8px;">Executive decision-makers</li>
                <li style="margin-bottom:0;padding-left:8px;">Strategic planning leaders</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Use Case:</strong> Choose C-Suite audience when presenting to executives who need to understand strategic value, company-wide impact, and how your solution aligns with organizational goals.
              </p>
            </div>
          `
        },
        {
          id: 'audience-benefits',
          question: 'How does Target Audience selection help me impress customers?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Target Audience selection demonstrates that you understand your customers' specific needs, priorities, and level of expertise, making your presentations and training more impactful.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⭐ CUSTOMER UNDERSTANDING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">By tailoring your approach to your audience, you show professionalism and deep understanding of their role and concerns.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Benefits for customer interactions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevant conversations:</strong> Discuss topics that matter to them</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Right level of detail:</strong> Not too technical, not too simple</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Targeted questions:</strong> Ask questions that resonate with their role</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Professional approach:</strong> Show you've done your homework</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Better engagement:</strong> Content that captures their interest</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Impact on sales success:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Build credibility:</strong> Demonstrate expertise in their domain</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Stronger relationships:</strong> Connect on topics they care about</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Faster buy-in:</strong> Speak their language from day one</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reduced objections:</strong> Address concerns proactively</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Competitive edge:</strong> Stand out from generic presentations</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Example scenarios:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Meeting with CTO:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Select Technical audience to discuss architecture and integration</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Presenting to Sales Director:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Select Business audience to focus on ROI and sales enablement</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Board presentation:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Select C-Suite audience to emphasize strategic value and business transformation</span>
                </li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Key Advantage:</strong> Target Audience selection helps you know your customers better and deliver content that truly resonates, making you more effective and impressive in every interaction.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'question-answers-section',
  title: 'Question & Answers',
  description: 'Generate customized questions and answers based on your uploaded training materials to prepare for customer interactions.',
  questions: [
    {
      id: 'question-answers-overview',
      title: 'Question & Answers Overview',
      emoji: '❓',
      description: 'Create tailored questions from your training materials to better prepare for meetings and presentations.',
      subQuestions: [
        {
          id: 'what-is-question-answers',
          question: 'What is Question & Answers?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Question & Answers</strong> generates customized questions based on your uploaded training materials, helping you prepare for customer interactions and meetings.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💡 SMART PREPARATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The system analyzes your training documents and generates relevant questions and answers to help you prepare effectively.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Upload your training materials to the simulator</li>
                <li style="margin-bottom:10px;padding-left:8px;">Select your target audience type</li>
                <li style="margin-bottom:10px;padding-left:8px;">Choose between Auto or Custom mode</li>
                <li style="margin-bottom:10px;padding-left:8px;">System generates relevant questions and answers</li>
                <li style="margin-bottom:0;padding-left:8px;">Review and practice with the generated content</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Key benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automated preparation:</strong> Questions generated from your materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Audience-specific:</strong> Content tailored to your target audience</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Customizable focus:</strong> Add custom instructions for specific topics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting ready:</strong> Practice before customer interactions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Continuous improvement:</strong> Better results with more context</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Purpose:</strong> Question & Answers helps you prepare thoroughly by generating relevant questions based on your training materials and target audience.
              </p>
            </div>
          `
        },
        {
          id: 'auto-mode',
          question: 'What is Auto mode?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Auto mode</strong> automatically generates questions and answers from your uploaded training materials without requiring any additional input.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🤖 AUTOMATIC GENERATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Simply select Auto mode and let the system analyze your documents to create relevant questions and answers automatically.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">How Auto mode works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Analyzes documents:</strong> Reviews your uploaded training materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identifies key topics:</strong> Finds important concepts and information</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Generates questions:</strong> Creates relevant questions automatically</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Provides answers:</strong> Includes comprehensive answers for each question</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Aligns with audience:</strong> Tailors content to your selected target audience</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">When to use Auto mode:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick preparation:</strong> When you need questions fast</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>General coverage:</strong> For broad topic preparation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>First-time use:</strong> Getting started with new materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>No specific focus:</strong> When you don't need targeted questions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Standard training:</strong> For typical customer interactions</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Advantages:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Fast and easy:</strong> No additional input required</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Comprehensive coverage:</strong> Questions from all document content</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Balanced approach:</strong> Even distribution across topics</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Time-saving:</strong> Instant question generation</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Quick Start:</strong> Auto mode is perfect when you want quick, comprehensive question generation without spending time on customization.
              </p>
            </div>
          `
        },
        {
          id: 'custom-mode',
          question: 'What is Custom mode?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Custom mode</strong> allows you to provide specific instructions to focus question generation on particular topics or areas that matter most to you.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 FOCUSED PREPARATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Add custom instructions to generate questions focused on specific topics, scenarios, or areas of interest.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">How Custom mode works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Add instructions:</strong> Specify what you want to focus on</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>System processes:</strong> Analyzes your custom requirements</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Targeted generation:</strong> Creates questions based on your focus areas</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Relevant answers:</strong> Provides answers aligned with your instructions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Better targeting:</strong> More focused preparation for specific needs</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">When to use Custom mode:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specific topics:</strong> When you need questions on particular subjects</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Targeted preparation:</strong> Preparing for specific customer concerns</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Advanced scenarios:</strong> Complex or specialized situations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Known challenges:</strong> Addressing anticipated objections or questions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Deep focus:</strong> When you need depth over breadth</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Example custom instructions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">"Focus on pricing and ROI questions"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Generate questions about integration with existing systems"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Create questions related to security and compliance"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Focus on competitive advantages"</li>
                <li style="margin-bottom:0;padding-left:8px;">"Generate questions about implementation timeline"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use Custom mode when you know specific topics will be discussed in your meeting and want to prepare thoroughly for those areas.
              </p>
            </div>
          `
        },
        {
          id: 'meeting-objective',
          question: 'What is Meeting Objective and how does it help?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Meeting Objective</strong> is an optional field where you can specify the goal of your upcoming meeting to generate even more relevant and focused questions.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 ENHANCED CONTEXT</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Adding Meeting Objective provides additional context that helps generate more relevant questions aligned with your specific meeting goals.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How Meeting Objective works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Optional field:</strong> Not required but highly recommended</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Adds context:</strong> Helps system understand meeting purpose</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better results:</strong> More you add, better the questions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Goal-aligned:</strong> Questions match your meeting objectives</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Focused preparation:</strong> Prepares you for specific outcomes</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Example Meeting Objectives:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">"Close a deal with enterprise customer"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Present technical demo to engineering team"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Address security concerns from C-Suite"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Discuss implementation timeline and resources"</li>
                <li style="margin-bottom:0;padding-left:8px;">"Overcome pricing objections"</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of adding Meeting Objective:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>More relevant questions:</strong> Aligned with your actual goals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better preparation:</strong> Questions address likely discussion points</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Improved focus:</strong> Concentrate on what matters most</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Higher success rate:</strong> Better prepared for specific objectives</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Confidence boost:</strong> Know you're ready for the meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">When to add Meeting Objective:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Important meetings:</strong> High-stakes customer interactions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specific goals:</strong> When you have clear objectives</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Known challenges:</strong> Anticipated difficult discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Decision meetings:</strong> Meetings that lead to decisions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Always recommended:</strong> More context always helps</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Best Practice:</strong> The more context you add through Meeting Objective, the better and more focused your generated questions will be.
              </p>
            </div>
          `
        },
        {
          id: 'auto-vs-custom',
          question: 'Should I use Auto mode or Custom mode?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Choose between Auto and Custom mode based on your preparation needs, time available, and how specific your requirements are.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⚖️ MODE SELECTION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Select the mode that best matches your preparation needs and the specificity of your upcoming meeting.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Choose Auto mode when:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Limited time:</strong> You need questions quickly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>General preparation:</strong> No specific focus areas needed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Broad coverage:</strong> Want questions across all topics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>First review:</strong> Getting familiar with materials</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Standard meetings:</strong> Typical customer interactions</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Choose Custom mode when:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Specific topics:</strong> Need focus on particular areas</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Known concerns:</strong> Customer has expressed specific interests</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Targeted preparation:</strong> Preparing for specific scenarios</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Deep expertise needed:</strong> Need detailed knowledge in certain areas</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Complex situations:</strong> Handling advanced or specialized topics</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Combining both approaches:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Start with Auto:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Get broad coverage first, then identify gaps</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Follow with Custom:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Use Custom mode to fill in specific areas that need more focus</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Iterate as needed:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Generate multiple sets with different custom instructions</span>
                </li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Recommendation:</strong> For important meetings, use Auto mode first for general preparation, then Custom mode with Meeting Objective for focused deep-dive preparation.
              </p>
            </div>
          `
        },
        {
          id: 'using-generated-questions',
          question: 'How do I use the generated questions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Use generated questions to prepare for meetings, practice responses, and ensure you're ready for any customer interaction.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📝 PRACTICE & PREPARATION</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Review questions and answers to build confidence and expertise before your customer meetings.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Preparation strategies:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review answers:</strong> Study provided answers thoroughly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Practice responses:</strong> Rehearse answering questions aloud</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify gaps:</strong> Note areas where you need more preparation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Create notes:</strong> Make quick reference sheets from questions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Regular review:</strong> Go through questions before each meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">During meetings:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reference material:</strong> Keep questions handy for quick lookup</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Anticipate questions:</strong> Recognize similar customer questions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Confident responses:</strong> Answer with preparation behind you</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Handle objections:</strong> Address concerns you've practiced</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Guide discussion:</strong> Steer conversation to prepared topics</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Post-meeting improvement:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Note new questions:</strong> Record questions you weren't prepared for</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Update materials:</strong> Add new information to training documents</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Regenerate questions:</strong> Create new sets with updated materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Refine approach:</strong> Adjust custom instructions based on experience</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Share insights:</strong> Help team with learned information</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Success Tip:</strong> Regular practice with generated questions builds confidence and expertise, making you more effective in every customer interaction.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'ai-quiz-section',
  title: 'AI Quiz Setup',
  description: 'Take interactive AI-powered quizzes to test your knowledge and track your progress with customizable session timing.',
  questions: [
    {
      id: 'ai-quiz-overview',
      title: 'AI Quiz Setup Overview',
      emoji: '🧠',
      description: 'Test your knowledge with AI-generated quizzes based on your training materials.',
      subQuestions: [
        {
          id: 'what-is-ai-quiz',
          question: 'What is AI Quiz Setup?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>AI Quiz Setup</strong> allows you to take interactive quizzes generated from your training materials to test your knowledge and track your learning progress.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎓 INTERACTIVE LEARNING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">AI Quiz generates up to 10 questions based on your uploaded materials to help you assess and improve your knowledge.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Up to 10 questions:</strong> Comprehensive quiz covering key topics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Progress tracking:</strong> See your performance and improvement</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Customizable timing:</strong> Set session duration from 5 to 60 minutes</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>AI-generated content:</strong> Questions based on your training materials</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Instant feedback:</strong> Know your results immediately</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How it works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Click on AI Quiz Setup in the simulator</li>
                <li style="margin-bottom:10px;padding-left:8px;">Set your session timing preference</li>
                <li style="margin-bottom:10px;padding-left:8px;">Start the quiz and answer questions</li>
                <li style="margin-bottom:10px;padding-left:8px;">Review your progress and results</li>
                <li style="margin-bottom:0;padding-left:8px;">Track improvement over time</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Purpose:</strong> AI Quiz Setup helps you test your knowledge, identify weak areas, and track your learning progress effectively.
              </p>
            </div>
          `
        },
        {
          id: 'how-to-start-quiz',
          question: 'How do I start an AI Quiz?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Starting an AI Quiz is simple - just click on AI Quiz, configure your preferences, and begin testing your knowledge.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">▶️ START QUIZ</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Set up your quiz session with your preferred timing and start answering AI-generated questions.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">Step-by-step process:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Click on AI Quiz Setup</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Navigate to the AI Quiz section in the simulator</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Set session timing</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Choose your preferred duration (5 to 60 minutes)</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Click Start Quiz</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Begin the quiz session</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Answer questions</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Respond to up to 10 AI-generated questions</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Review results</strong><br>
                  <span style="font-size:14px;color:#6B7280;">See your progress and performance</span>
                </li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Before starting:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Upload materials:</strong> Ensure training materials are uploaded</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Select audience:</strong> Choose your target audience type</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Set aside time:</strong> Allocate enough time based on your session setting</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Minimize distractions:</strong> Focus on the quiz for best results</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Quick Start:</strong> Click AI Quiz, set your timing preference, and start the quiz to begin testing your knowledge immediately.
              </p>
            </div>
          `
        },
        {
          id: 'session-timing',
          question: 'How do I set session timing?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Session timing</strong> allows you to customize how long you want to spend on the quiz, ranging from 5 minutes for quick reviews to 60 minutes for thorough assessments.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⏱️ FLEXIBLE TIMING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Choose a session duration that fits your schedule and learning goals, from 5 to 60 minutes.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Available time options:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>5 minutes:</strong> Quick knowledge check</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>10-15 minutes:</strong> Short practice session</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>20-30 minutes:</strong> Standard quiz session</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>45-60 minutes:</strong> Comprehensive assessment</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Custom duration:</strong> Set any time between 5-60 minutes</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Choosing the right timing:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>5-10 minutes:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Quick review before a meeting or rapid knowledge check</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>15-30 minutes:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Regular practice sessions and thorough topic coverage</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>45-60 minutes:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Deep assessment and comprehensive knowledge testing</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How timing works:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Countdown timer:</strong> See remaining time during quiz</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pace yourself:</strong> Distribute time across all questions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>No pressure:</strong> Timer is for guidance, not strict limits</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Flexible completion:</strong> Finish at your own pace</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Start with shorter sessions (10-15 minutes) to build confidence, then gradually increase timing for more comprehensive assessments.
              </p>
            </div>
          `
        },
        {
          id: 'quiz-questions',
          question: 'What types of questions are in the quiz?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">AI Quiz generates up to 10 questions from your training materials, tailored to your selected target audience and covering key topics.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">❓ QUESTION TYPES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Questions are generated based on your uploaded materials and aligned with your target audience's expertise level.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Question characteristics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Maximum 10 questions:</strong> Comprehensive but manageable quiz length</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Material-based:</strong> Generated from your uploaded training documents</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Audience-aligned:</strong> Difficulty matches your target audience</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Topic coverage:</strong> Questions span key concepts from materials</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Progressive difficulty:</strong> Questions may increase in complexity</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What questions cover:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Key concepts:</strong> Main ideas from training materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Important details:</strong> Specific information you should know</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Practical application:</strong> How to use the knowledge</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Common scenarios:</strong> Real-world situations</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Critical information:</strong> Must-know facts and processes</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Question adaptation:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Technical audience:</strong> In-depth technical questions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Business audience:</strong> ROI and business value questions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>C-Suite audience:</strong> Strategic and high-level questions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Custom focus:</strong> Questions match your training objectives</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Each quiz contains up to 10 carefully selected questions designed to effectively test your knowledge of the training materials.
              </p>
            </div>
          `
        },
        {
          id: 'tracking-progress',
          question: 'How do I track my quiz progress?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Progress tracking</strong> shows your performance on each quiz, helping you identify strengths and areas that need improvement.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 PERFORMANCE TRACKING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Monitor your quiz results and see your improvement over time to ensure you're mastering the training materials.</p>
              </div>

             
              <p style="margin-bottom:12px;font-weight:600;">What you can track:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quiz scores:</strong> Your performance on each quiz session</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Correct answers:</strong> Number of questions answered correctly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Completion rate:</strong> How many questions you completed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time taken:</strong> How long each quiz session took</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Overall progress:</strong> Improvement trends over multiple quizzes</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Using progress data:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify weak areas:</strong> Focus on topics you struggle with</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Measure improvement:</strong> See how you're getting better</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Build confidence:</strong> Track mastery of materials</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Guide study time:</strong> Allocate effort where needed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Validate readiness:</strong> Know when you're prepared for meetings</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Progress indicators:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Score percentage:</strong> Overall accuracy rate</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Question breakdown:</strong> Performance by topic</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Historical data:</strong> Past quiz results for comparison</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Improvement trends:</strong> Visual representation of progress</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Recommendations:</strong> Suggested areas for further study</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Success Metric:</strong> Regular quizzes with tracked progress help you maintain and improve your knowledge, ensuring you're always prepared for customer interactions.
              </p>
            </div>
          `
        }
      ]
    }
  ]
}
  ]
},
    dashboard: {
  cardId: 'card-dashboard',
  cardTitle: 'Dashboard',
  cardDescription:
    'Your main workspace hub — track meetings, view logs, access session recordings, and monitor recent activities to stay on top of your performance.',
  icon: <LayoutDashboard style={{ width: '20px', height: '20px', color: '#2563eb' }} />,
  emoji: '📊',
  items: [
   {
  id: 'meeting-overview-section',
  title: 'Meeting Overview',
  description: 'Monitor and analyze your meeting metrics, trends, and performance from your centralized dashboard.',
  questions: [
    {
      id: 'meeting-overview-dashboard',
      title: 'Meeting Overview Dashboard',
      emoji: '📊',
      description: 'Access comprehensive meeting analytics and insights from your dashboard.',
      subQuestions: [
        {
          id: 'what-is-meeting-overview',
          question: 'What is Meeting Overview?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Meeting Overview</strong> is your centralized dashboard that displays comprehensive analytics and metrics about all your recorded meetings in one place.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📈 COMPREHENSIVE ANALYTICS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">View all your meeting statistics, trends, and performance metrics from a single dashboard interface.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Available metrics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Total meetings recorded:</strong> Count of all your recorded meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active sessions:</strong> Currently ongoing meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Average meeting duration:</strong> Typical length of your meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Total participants engaged:</strong> Number of people across all meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Documents processed:</strong> Total training materials and documents analyzed</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Average sentiment score:</strong> Overall sentiment across meetings</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Dashboard features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sentiment trends:</strong> See if meetings are mostly positive, neutral, or negative</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>MedPick completion:</strong> Track completion rates</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Weekly meeting graph:</strong> Visual timeline of meetings this week</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time updates:</strong> Metrics update as meetings are recorded</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Performance insights:</strong> Understand your meeting patterns</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Access:</strong> Meeting Overview is available on your dashboard, providing instant access to all your meeting analytics and performance data.
              </p>
            </div>
          `
        },
        {
          id: 'recording-requirements',
          question: 'What do I need to do for meetings to be recorded properly?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">For meetings to be recorded and appear in your Meeting Overview, you must follow specific steps and meet minimum duration requirements.</p>
              
              <div style="padding:20px;background:#FEF3C7;border-left:4px solid #F59E0B;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#92400E;font-size:15px;">⚠️ CRITICAL RECORDING REQUIREMENTS</p>
                <p style="margin:8px 0 0 0;color:#78350F;font-size:14px;">Following these steps is essential to ensure your meetings are properly recorded and tracked in the system.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Required steps for proper recording:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Stop the bot properly</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Always stop the bot before ending the meeting</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Close the meeting</strong><br>
                  <span style="font-size:14px;color:#6B7280;">End the meeting session properly through the platform</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Close the page properly</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Don't just close the browser - exit through proper channels</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Meet minimum duration</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Ensure meeting lasts at least 2 minutes</span>
                </li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Minimum duration requirement:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>At least 2 minutes:</strong> Meetings must be longer than 2 minutes to be recorded</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Full tracking:</strong> Only qualifying meetings appear in Meeting Overview</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Data integrity:</strong> Ensures meaningful meeting data is captured</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Automatic filtering:</strong> Very short meetings are excluded automatically</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What happens if steps are missed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Incomplete recording:</strong> Meeting may not be saved properly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Missing data:</strong> Metrics won't update in Meeting Overview</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Lost insights:</strong> Analytics and trends won't reflect the meeting</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Cannot retrieve:</strong> Improperly closed meetings cannot be recovered</li>
              </ul>

              <p style="margin:0;padding:16px;background:#FEF3C7;border-left:3px solid #F59E0B;border-radius:4px;font-size:14px;">
                <strong>IMPORTANT:</strong> Always stop the bot, close the meeting properly, and close the page correctly. Meetings must be at least 2 minutes long to be recorded in Meeting Overview.
              </p>
            </div>
          `
        },
        {
          id: 'meeting-metrics',
          question: 'What metrics can I see in Meeting Overview?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Meeting Overview provides detailed metrics about your meetings, helping you understand your meeting patterns and performance.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 KEY METRICS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Track essential meeting statistics and performance indicators from your dashboard.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Core metrics displayed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Total meetings recorded:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Complete count of all successfully recorded meetings</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Active sessions:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Number of meetings currently in progress</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Average meeting duration:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Typical length of your meetings</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Total participants engaged:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Cumulative number of participants across all meetings</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Documents processed:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Number of training materials and documents analyzed</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Performance indicators:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Average sentiment score:</strong> Overall sentiment across meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sentiment trends:</strong> Whether meetings are positive, neutral, or negative</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>MedPick completion:</strong> Completion rates and progress</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Meeting frequency:</strong> How often meetings occur</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Insight:</strong> These metrics help you understand your meeting patterns, participant engagement, and overall performance trends.
              </p>
            </div>
          `
        },
        {
          id: 'sentiment-analysis',
          question: 'How does sentiment tracking work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Sentiment tracking</strong> analyzes the tone and mood of your meetings, showing whether conversations are mostly positive, neutral, or negative.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">😊 SENTIMENT INSIGHTS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Understand the emotional tone of your meetings and track sentiment trends over time.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Sentiment categories:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Positive:</strong> Upbeat, enthusiastic, and constructive conversations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Neutral:</strong> Factual, informational, and balanced discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Negative:</strong> Concerns, objections, or challenging conversations</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What sentiment tracking shows:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Average sentiment score:</strong> Overall sentiment across all meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sentiment trends:</strong> Distribution of positive, neutral, and negative</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Individual meeting sentiment:</strong> Sentiment for specific meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Trend over time:</strong> How sentiment changes across meetings</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Pattern identification:</strong> Recognize sentiment patterns</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Using sentiment data:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Gauge meeting success:</strong> Positive sentiment indicates good meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify concerns:</strong> Negative sentiment highlights issues to address</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Track improvement:</strong> See if sentiment improves over time</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Adjust approach:</strong> Modify strategy based on sentiment trends</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Customer satisfaction:</strong> Understand how customers feel</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Value:</strong> Sentiment tracking helps you understand the emotional tone of meetings and identify opportunities to improve customer interactions.
              </p>
            </div>
          `
        },
        {
          id: 'weekly-meeting-graph',
          question: 'What is the weekly meeting graph?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">The <strong>weekly meeting graph</strong> provides a visual timeline showing when your meetings took place during the week, helping you understand your meeting patterns.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📅 MEETING TIMELINE</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Visualize your meeting schedule and frequency with an easy-to-read weekly graph.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Graph features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Visual timeline:</strong> See meetings plotted across the week</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Daily breakdown:</strong> Number of meetings per day</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting frequency:</strong> Identify busy and light days</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pattern recognition:</strong> Spot recurring meeting patterns</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>At-a-glance view:</strong> Quickly understand your week</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What you can learn:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Peak meeting days:</strong> Which days have most meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting distribution:</strong> How meetings are spread across the week</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Workload balance:</strong> Identify overloaded or light days</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Scheduling patterns:</strong> Common meeting times and days</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Productivity insights:</strong> Optimize your meeting schedule</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better planning:</strong> Schedule meetings more effectively</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time management:</strong> Balance meeting load across the week</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Pattern awareness:</strong> Understand your meeting habits</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick reference:</strong> See your weekly activity at a glance</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Historical view:</strong> Compare different weeks</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Usage:</strong> The weekly meeting graph helps you visualize and optimize your meeting schedule for better time management and productivity.
              </p>
            </div>
          `
        },
        {
          id: 'dashboard-benefits',
          question: 'How does Meeting Overview help me improve?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Meeting Overview provides actionable insights that help you improve your meeting effectiveness, customer interactions, and overall performance.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 CONTINUOUS IMPROVEMENT</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Use dashboard insights to identify strengths, address weaknesses, and continuously improve your meeting performance.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Performance insights:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Track progress:</strong> See how metrics improve over time</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Identify trends:</strong> Recognize patterns in your meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Measure effectiveness:</strong> Understand what works and what doesn't</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Spot issues early:</strong> Address problems before they escalate</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Validate improvements:</strong> Confirm changes have positive impact</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Actionable improvements:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Optimize meeting length:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Adjust duration based on average meeting time data</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Improve sentiment:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Address negative trends to create more positive interactions</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Increase engagement:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Use participant data to boost involvement</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Balance schedule:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Distribute meetings more evenly across the week</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>Enhance preparation:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Use document processing data to improve training</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Long-term benefits:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better outcomes:</strong> More successful meetings and deals</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Customer satisfaction:</strong> Improved customer experiences</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time efficiency:</strong> Optimized meeting schedules</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Team performance:</strong> Enhanced overall effectiveness</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Data-driven decisions:</strong> Make informed improvements</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Impact:</strong> Meeting Overview transforms your meeting data into actionable insights, helping you continuously improve and achieve better results.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'meeting-logs-section',
  title: 'Meeting Logs',
  description: 'Access, review, and analyze detailed logs and records of all your past meetings with comprehensive analytics.',
  questions: [
    {
      id: 'meeting-logs-overview',
      title: 'Meeting Logs Overview',
      emoji: '📝',
      description: 'View and manage detailed records of your meeting history.',
      subQuestions: [
        {
          id: 'what-are-meeting-logs',
          question: 'What are Meeting Logs?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Meeting Logs</strong> provide comprehensive records of all your past meetings, including transcripts, summaries, analytics, and detailed information about each session.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📚 COMPLETE RECORDS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Access detailed logs of every meeting with AI-generated summaries, transcripts, analytics, and participant information.</p>
              </div>

              

              <p style="margin-bottom:12px;font-weight:600;">Where to access Meeting Logs:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Dashboard section:</strong> View recent meeting logs directly from dashboard</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Dedicated section:</strong> Access complete Meeting Logs section for full history</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Quick access:</strong> Both locations provide the same comprehensive information</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What Meeting Logs include:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting details:</strong> Date, time, and duration of each meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>AI summary:</strong> Automatically generated meeting overview</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Full transcripts:</strong> Complete text record of conversations</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Participant information:</strong> Number and details of attendees</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Key analytics:</strong> Performance metrics and insights</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Note-Taker access:</strong> Direct link to meeting note-taker</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Purpose:</strong> Meeting Logs serve as your comprehensive meeting archive, allowing you to review, analyze, and reference past meetings anytime.
              </p>
            </div>
          `
        },
        {
          id: 'viewing-meeting-details',
          question: 'How do I view meeting details?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">View detailed information about any meeting by clicking on "View Details" from the Meeting Logs section.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔍 DETAILED VIEW</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Click "View Details" on any meeting to access comprehensive information, transcripts, and analytics.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Steps to view details:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to Meeting Logs section</li>
                <li style="margin-bottom:10px;padding-left:8px;">Find the meeting you want to review</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on "View Details" button</li>
                <li style="margin-bottom:10px;padding-left:8px;">Access full meeting information and analytics</li>
                <li style="margin-bottom:0;padding-left:8px;">Review all available data and insights</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Information displayed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting timestamp:</strong> When the meeting took place</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting name:</strong> Title or name of the meeting (editable)</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Duration:</strong> How long the meeting lasted</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Participants:</strong> Number and details of attendees</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Status:</strong> Completion status and recording state</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Quick actions:</strong> Options to edit, access note-taker, or export</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Access:</strong> Click "View Details" on any meeting log to see comprehensive information about that specific meeting.
              </p>
            </div>
          `
        },
        {
          id: 'editing-meeting-name',
          question: 'Can I edit the meeting name?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Yes, you can edit the meeting name to customize how meetings are identified in your logs, making them easier to find and reference.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">✏️ CUSTOMIZABLE NAMES</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Edit meeting names to whatever you want, helping you organize and identify meetings more effectively.</p>
              </div>


              <p style="margin-bottom:12px;font-weight:600;">How to edit meeting name:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Open the meeting details you want to edit</li>
                <li style="margin-bottom:10px;padding-left:8px;">Look for the meeting name field</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the edit option (pencil icon or edit button)</li>
                <li style="margin-bottom:10px;padding-left:8px;">Enter your desired meeting name</li>
                <li style="margin-bottom:0;padding-left:8px;">Save the changes</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">Why edit meeting names:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better organization:</strong> Use meaningful names for easy identification</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick reference:</strong> Find specific meetings faster</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Client names:</strong> Label meetings with customer or project names</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting topics:</strong> Identify by subject or purpose</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Personal system:</strong> Create your own naming convention</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Naming suggestions:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">"Client Name - Discovery Call"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Q4 Planning - Team Meeting"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Product Demo - Enterprise Customer"</li>
                <li style="margin-bottom:10px;padding-left:8px;">"Weekly Check-in - Jan 15"</li>
                <li style="margin-bottom:0;padding-left:8px;">"Technical Review - Integration Discussion"</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Use consistent naming conventions across all meetings to make your logs more organized and searchable.
              </p>
            </div>
          `
        },
        {
          id: 'ai-summary',
          question: 'What is the AI Summary?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>AI Summary</strong> is an automatically generated overview of your meeting, created by AI to capture the key points, decisions, and highlights of the conversation.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🤖 AUTO-GENERATED OVERVIEW</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">AI analyzes your meeting and generates a concise summary highlighting the most important points and outcomes.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">What AI Summary includes:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Key discussion points:</strong> Main topics covered in the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Important decisions:</strong> Decisions made during the conversation</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Action items:</strong> Next steps and tasks identified</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Critical insights:</strong> Notable observations and takeaways</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Overall context:</strong> General flow and outcome of the meeting</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of AI Summary:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick review:</strong> Understand meeting without reading full transcript</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time-saving:</strong> Get key points in seconds</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Easy sharing:</strong> Share summary with team members</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Reference tool:</strong> Quickly recall meeting highlights</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Automatic generation:</strong> No manual note-taking required</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">How to use AI Summary:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick reference:</strong> Review before follow-up meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Team updates:</strong> Share with colleagues who missed the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Report creation:</strong> Use as basis for meeting reports</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Follow-up:</strong> Reference when following up with customers</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Documentation:</strong> Keep as record of meeting outcomes</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Automatic:</strong> AI Summary is generated automatically for every meeting, providing instant access to key information without manual effort.
              </p>
            </div>
          `
        },
        {
          id: 'transcripts-participants',
          question: 'How do I access transcripts and participant information?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Meeting Logs provide complete <strong>transcripts</strong> of your conversations and detailed <strong>participant information</strong> for every recorded meeting.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📄 COMPLETE RECORDS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Access full meeting transcripts and participant details directly from the meeting log details page.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Accessing transcripts:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>View details page:</strong> Click on meeting to see transcript</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Full conversation:</strong> Complete text record of everything said</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaker labels:</strong> Identifies who said what</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Timestamps:</strong> Shows when statements were made</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Searchable:</strong> Find specific topics or keywords</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Exportable:</strong> Copy or export transcript as needed</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Participant information shown:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Number of participants:</strong> Total count of meeting attendees</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Participant names:</strong> Who attended the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Speaking time:</strong> How much each person contributed</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Engagement level:</strong> Participation metrics</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Role identification:</strong> Customer vs team members</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Using transcript and participant data:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review conversations:</strong> Reference exact words and discussions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quote accuracy:</strong> Get exact quotes from meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Analyze engagement:</strong> See who participated most</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Training material:</strong> Use transcripts for training examples</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Compliance:</strong> Maintain accurate meeting records</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Access:</strong> Both transcripts and participant information are available in the detailed view of each meeting log.
              </p>
            </div>
          `
        },
        {
          id: 'key-analytics',
          question: 'What are Key Analytics in Meeting Logs?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Key Analytics</strong> provide important metrics and insights about your meeting performance, helping you understand effectiveness and identify improvement areas.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 PERFORMANCE METRICS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Track important meeting metrics including sentiment, talk-to-listen ratio, buying signals, and more.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Available analytics metrics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Overall Sentiment:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Emotional tone of the meeting (positive, neutral, negative)</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Talk-to-Listen Ratio:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Balance between speaking and listening during the meeting</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Buying Signal Score:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Indicators of customer interest and purchase intent</span>
                </li>
                <li style="margin-bottom:12px;padding-left:8px;">
                  <strong>Critical Alerts:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Important issues or concerns raised during meeting</span>
                </li>
                <li style="margin-bottom:0;padding-left:8px;">
                  <strong>MedPick Completion:</strong><br>
                  <span style="font-size:14px;color:#6B7280;">Progress and completion status of MedPick methodology</span>
                </li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Implementation status:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Currently available:</strong> Some analytics are active now</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Further implementation:</strong> Additional metrics will be added</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Continuous improvement:</strong> Analytics features are being enhanced</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Future updates:</strong> More insights coming in future releases</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Using Key Analytics:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Improve performance:</strong> Identify areas for improvement</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Track effectiveness:</strong> Measure meeting success</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Sales insights:</strong> Understand buying signals better</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Communication balance:</strong> Optimize talk-to-listen ratio</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Sentiment tracking:</strong> Ensure positive customer interactions</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Key Analytics features are being implemented further to provide even more comprehensive insights into your meeting performance.
              </p>
            </div>
          `
        },
        {
          id: 'accessing-note-taker',
          question: 'How do I access the Note-Taker from Meeting Logs?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Meeting Logs provide a direct link to access the <strong>Note-Taker</strong> for any recorded meeting, allowing you to review all meeting features in one place.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔗 DIRECT ACCESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Click on "Go to Note-Taker" to access the full note-taking interface for any past meeting.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">How to access Note-Taker:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Open Meeting Logs section</li>
                <li style="margin-bottom:10px;padding-left:8px;">Find the meeting you want to review</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click "View Details" on the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;">Look for "Go to Note-Taker" button or link</li>
                <li style="margin-bottom:0;padding-left:8px;">Click to access the full Note-Taker interface</li>
              </ol>

              <p style="margin-bottom:12px;font-weight:600;">What you can do in Note-Taker:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Review transcription:</strong> See live transcription from the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Check custom goals:</strong> View custom goals that were set</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Access AI templates:</strong> Review AI-generated templates used</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>View chat history:</strong> See all chat interactions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Export content:</strong> Download or share meeting content</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Benefits of Note-Taker access:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Complete context:</strong> Access all meeting features in one place</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Detailed review:</strong> See everything that happened during meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Easy navigation:</strong> Jump between logs and Note-Taker seamlessly</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Comprehensive view:</strong> All meeting tools and data available</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Quick reference:</strong> Access specific meeting features instantly</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Quick Access:</strong> The "Go to Note-Taker" option provides seamless access from Meeting Logs to the full Note-Taker interface for comprehensive meeting review.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},{
  id: 'recording-sessions-section',
  title: 'Recording and Sessions',
  description: 'Track and manage your meeting recordings and active sessions with detailed duration insights.',
  questions: [
    {
      id: 'recording-sessions-features',
      title: 'Recording and Sessions Features',
      emoji: '🎥',
      description: 'Monitor active sessions, recording duration, and meeting metrics.',
      subQuestions: [
        {
          id: 'what-is-recording-sessions',
          question: 'What is Recording and Sessions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Recording and Sessions</strong> allows you to track active meeting sessions, monitor recording duration, and view meeting metrics directly from your dashboard. This feature provides visibility into your meeting activity and recording status.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📊 SESSION MONITORING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Recording and Sessions displays active session information, meeting duration, and recording status to help you stay informed about your meeting activity.</p>
              </div>

              
              <p style="margin-bottom:12px;font-weight:600;">Key features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active sessions:</strong> View currently running meeting sessions</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting duration:</strong> Track how long meetings have been running</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recording status:</strong> Monitor recording activity and status</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Dashboard visibility:</strong> Access information directly from the main dashboard</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Real-time updates:</strong> See current session information as it happens</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Currently available:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">View active session count</li>
                <li style="margin-bottom:10px;padding-left:8px;">Monitor meeting duration</li>
                <li style="margin-bottom:10px;padding-left:8px;">Track recording status</li>
                <li style="margin-bottom:0;padding-left:8px;">Access basic session metrics</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> This feature is currently in development. Additional functionality and detailed session information will be implemented in future updates.
              </p>
            </div>
          `
        },
        {
          id: 'viewing-active-sessions',
          question: 'How do I view active sessions?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Active sessions can be viewed directly from your dashboard, showing you which meetings are currently running with the bot present.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">👁️ SESSION VISIBILITY</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">The dashboard displays active sessions, giving you a quick overview of ongoing meetings and recording activity.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">What you can see:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active session count:</strong> Number of currently running meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Meeting duration:</strong> How long each session has been active</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recording status:</strong> Whether recording is active or paused</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Session information:</strong> Basic details about each active meeting</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">Accessing session information:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to your dashboard</li>
                <li style="margin-bottom:10px;padding-left:8px;">Locate the Recording and Sessions section</li>
                <li style="margin-bottom:10px;padding-left:8px;">View active session count and duration</li>
                <li style="margin-bottom:0;padding-left:8px;">Monitor recording status for each session</li>
              </ol>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> Detailed session information and additional management features will be available in future updates as this feature continues to be developed.
              </p>
            </div>
          `
        },
        {
          id: 'meeting-duration-tracking',
          question: 'How does meeting duration tracking work?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Meeting duration tracking shows you how long your meetings have been running, helping you stay aware of time and manage your schedule effectively.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">⏱️ DURATION MONITORING</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Track meeting length in real-time to ensure efficient time management and stay on schedule.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Duration tracking features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time tracking:</strong> See how long the meeting has been running</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Automatic updates:</strong> Duration updates continuously during the meeting</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Dashboard display:</strong> View duration directly from the dashboard</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Session tracking:</strong> Monitor duration for multiple active sessions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Time awareness:</strong> Stay informed about meeting length</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">How it helps:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time management:</strong> Keep meetings within scheduled timeframes</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Schedule awareness:</strong> Know when meetings are running long</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Planning tool:</strong> Use duration data for future meeting planning</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Productivity tracking:</strong> Monitor how much time is spent in meetings</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Efficiency insights:</strong> Identify opportunities to streamline meetings</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Best practices:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Regular checks:</strong> Periodically review duration during meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time limits:</strong> Use duration tracking to stay within time limits</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Schedule respect:</strong> Be mindful of other commitments</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Efficiency focus:</strong> Use data to improve meeting efficiency</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Coming Soon:</strong> Additional duration analytics and insights will be available in future updates to provide even more detailed time tracking information.
              </p>
            </div>
          `
        },
        {
          id: 'recording-status',
          question: 'What does the recording status show?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Recording status provides visibility into whether your meeting is being recorded and the current state of the recording process.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔴 RECORDING STATUS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Monitor recording activity to ensure your meetings are being properly captured and documented.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Status indicators:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recording active:</strong> Indicates when recording is currently running</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recording status:</strong> Shows the current state of the recording</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Session information:</strong> Links recording status to active sessions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Real-time updates:</strong> Status updates reflect current recording state</li>
              </ul>

             

              <p style="margin-bottom:12px;font-weight:600;">Why monitoring matters:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Confirmation:</strong> Verify that important meetings are being recorded</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Troubleshooting:</strong> Identify if recording fails to start</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Documentation:</strong> Ensure complete meeting capture</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Compliance:</strong> Meet recording requirements for your organization</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Peace of mind:</strong> Know your meeting is being documented</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Current capabilities:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">View recording status from dashboard</li>
                <li style="margin-bottom:10px;padding-left:8px;">Monitor active recording sessions</li>
                <li style="margin-bottom:10px;padding-left:8px;">Track recording activity</li>
                <li style="margin-bottom:0;padding-left:8px;">Access basic recording information</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Future Development:</strong> Enhanced recording controls and detailed status information will be added as this feature continues to be developed.
              </p>
            </div>
          `
        },
        {
          id: 'dashboard-access',
          question: 'How do I access Recording and Sessions from the dashboard?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Recording and Sessions information is conveniently located on your main dashboard, providing quick access to active session data and recording status.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🎯 DASHBOARD ACCESS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Access session and recording information directly from your central dashboard for quick monitoring and management.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Accessing the feature:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Log in to your account</li>
                <li style="margin-bottom:10px;padding-left:8px;">Navigate to the main dashboard</li>
                <li style="margin-bottom:10px;padding-left:8px;">Locate the Recording and Sessions section</li>
                <li style="margin-bottom:0;padding-left:8px;">View active session and recording information</li>
              </ol>

             

              <p style="margin-bottom:12px;font-weight:600;">Dashboard features:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Centralized view:</strong> All session information in one location</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Quick access:</strong> No need to navigate through multiple menus</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Real-time data:</strong> See current session status immediately</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>At-a-glance monitoring:</strong> Quick overview of all active sessions</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Efficient management:</strong> Monitor multiple sessions simultaneously</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What's displayed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active session count:</strong> Number of ongoing meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Duration information:</strong> How long sessions have been running</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recording status:</strong> Current recording state</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Session metrics:</strong> Basic activity information</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Pro Tip:</strong> Check your dashboard regularly to stay updated on active sessions and ensure recordings are running as expected.
              </p>
            </div>
          `
        },
        {
          id: 'future-features',
          question: 'What features are planned for future updates?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Recording and Sessions is currently in development with many exciting features planned for future releases to enhance your meeting management capabilities.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🚀 COMING SOON</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">This feature is being actively developed with additional functionality and detailed information coming in future updates.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Currently available:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active session visibility:</strong> View count of running meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Duration tracking:</strong> Monitor meeting length</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Basic recording status:</strong> See if recording is active</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Dashboard integration:</strong> Access from main dashboard</li>
              </ul>

              

              <p style="margin-bottom:12px;font-weight:600;">Planned enhancements:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Detailed session information:</strong> Comprehensive data about each session</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recording management:</strong> Enhanced control over recording settings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Session history:</strong> Access to past session data and analytics</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Advanced metrics:</strong> Deeper insights into meeting patterns</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Export capabilities:</strong> Download session and recording data</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Enhanced filtering:</strong> Sort and filter sessions by various criteria</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">Development status:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Active development:</strong> Feature is currently being built</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Staged rollout:</strong> New features will be added incrementally</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>User feedback:</strong> Development guided by user needs and requests</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Continuous improvement:</strong> Regular updates and enhancements</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Future announcements:</strong> Updates will be communicated as features launch</li>
              </ul>

              <p style="margin-bottom:12px;font-weight:600;">What to expect:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>More detailed information:</strong> Comprehensive session and recording data</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Better management tools:</strong> Enhanced control over sessions and recordings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Improved analytics:</strong> Deeper insights into meeting activity</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Additional features:</strong> New capabilities based on user needs</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Enhanced usability:</strong> Improved interface and user experience</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Stay Tuned:</strong> Recording and Sessions functionality will be expanded in future updates. As of now, you can view duration, meeting duration, and active sessions from the dashboard.
              </p>
            </div>
          `
        }
      ]
    }
  ]
},
    {
  id: 'recent-activity-section',
  title: 'Recent Activity',
  description: 'View your recent meeting activities and what was discussed.',
  questions: [
    {
      id: 'recent-activity-features',
      title: 'Recent Activity Features',
      emoji: '🔔',
      description: 'Track recent meeting activities and discussions.',
      subQuestions: [
        {
          id: 'what-is-recent-activity',
          question: 'What is Recent Activity?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;"><strong>Recent Activity</strong> shows your latest meeting activities, what was discussed, and when it happened.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">🔔 ACTIVITY FEED</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">View recent meeting activities, discussions, and when they occurred (hours/days ago).</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">What you can see:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Recent activities:</strong> Latest meeting events</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Discussions:</strong> What was discussed in meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time stamps:</strong> When activities occurred (hours/days ago)</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Activity timeline:</strong> Chronological view of events</li>
              </ul>

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Important:</strong> This feature is currently in development and will be fully functional soon.
              </p>
            </div>
          `
        },
        {
          id: 'accessing-recent-activity',
          question: 'How do I access Recent Activity?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Recent Activity is accessible through the bell icon located beside the admin profile.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">📍 BELL ICON</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">Click the bell icon beside your admin profile to view recent activities.</p>
              </div>

             

              <p style="margin-bottom:12px;font-weight:600;">Steps to access:</p>
              <ol style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;">Find the bell icon beside your admin profile</li>
                <li style="margin-bottom:10px;padding-left:8px;">Click on the bell icon</li>
                <li style="margin-bottom:0;padding-left:8px;">View your recent activities</li>
              </ol>

              

              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Note:</strong> The bell icon is always visible in the navigation bar for quick access.
              </p>
            </div>
          `
        },
        {
          id: 'viewing-discussions',
          question: 'What information is shown in Recent Activity?',
          answer: `
            <div style="line-height:1.8;color:#374151;font-size:15px;">
              <p style="margin-bottom:20px;">Recent Activity displays what was discussed in your meetings and when those discussions occurred.</p>
              
              <div style="padding:20px;background:#DBEAFE;border-left:4px solid #2563EB;border-radius:8px;margin-bottom:24px;">
                <p style="margin:0;font-weight:600;color:#1E40AF;font-size:15px;">💬 ACTIVITY DETAILS</p>
                <p style="margin:8px 0 0 0;color:#1E3A8A;font-size:14px;">See what was discussed and how long ago each activity happened.</p>
              </div>

              <p style="margin-bottom:12px;font-weight:600;">Information displayed:</p>
              <ul style="margin:0 0 24px 0;padding-left:24px;">
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Discussion topics:</strong> What was discussed in meetings</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Time reference:</strong> How many hours or days ago</li>
                <li style="margin-bottom:10px;padding-left:8px;"><strong>Activity type:</strong> Type of meeting event</li>
                <li style="margin-bottom:0;padding-left:8px;"><strong>Chronological order:</strong> Most recent activities first</li>
              </ul>

             
              <p style="margin:0;padding:16px;background:#f9fafb;border-left:3px solid #2563EB;border-radius:4px;font-size:14px;">
                <strong>Coming Soon:</strong> Additional features and detailed information will be available as development continues.
              </p>
            </div>
          `
        }
      ]
    }
  ]
}  ]
},

  };