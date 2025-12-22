import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { supabase } from './supabaseClient';

// Interfaces
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Sub-components
const SocialButton: React.FC<{ provider: string; icon: React.ReactNode; onClick: () => void; disabled: boolean; }> = ({ provider, icon, onClick, disabled }) => (
    <button type="button" onClick={onClick} disabled={disabled} className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
        <div className="text-gray-600">{icon}</div>
        Continue with {provider}
    </button>
);

const InputField: React.FC<{ name: string; label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; error?: string; icon?: React.ReactNode; showToggle?: boolean; onToggle?: () => void; placeholder?: string; }> = ({ name, label, type, value, onChange, error, icon, showToggle, onToggle, placeholder }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="block text-sm font-medium text-gray-900">{label}</label>
        <div className="relative">
            {icon && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">{icon}</div>}
            <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} className={`w-full ${icon ? 'pl-10' : 'pl-3'} ${showToggle ? 'pr-12' : 'pr-3'} py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-gray-900'}`} />
            {showToggle && <button type="button" onClick={onToggle} className="absolute inset-y-0 right-0 pr-3 flex items-center"><div className="text-gray-400 hover:text-gray-600 transition-colors">{type === 'password' ? <EyeOff size={20} /> : <Eye size={20} />}</div></button>}
        </div>
        {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
);


const AuthPages: React.FC = () => {
    const navigate = useNavigate();
    const [view, setView] = useState<'login' | 'signup' | 'forgotPassword' | 'updatePassword'>('login');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const [loginData, setLoginData] = useState<LoginData>({ email: '', password: '' });
    const [formData, setFormData] = useState<FormData>({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    const [resetEmail, setResetEmail] = useState('');
    const [newPassword, setNewPassword] = useState({ password: '', confirmPassword: '' });
    const [errors, setErrors] = useState<Partial<FormData & LoginData & { resetEmail?: string; newPassword?: string; confirmNewPassword?: string }>>({});

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
            if (event === 'PASSWORD_RECOVERY') {
                setView('updatePassword');
            }
        });
        return () => subscription.unsubscribe();
    }, []);

    const clearMessages = () => {
        setApiError(null);
        setSuccessMessage(null);
        setErrors({});
    };

    const handleViewChange = (newView: 'login' | 'signup' | 'forgotPassword') => {
        clearMessages();
        setView(newView);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        clearMessages();
        
        if (view === 'login') {
            setLoginData(prev => ({ ...prev, [name]: value }));
        } else if (view === 'signup') {
            setFormData(prev => ({ ...prev, [name]: value }));
        } else if (view === 'forgotPassword') {
            setResetEmail(value);
        } else if (view === 'updatePassword') {
            setNewPassword(prev => ({...prev, [name]: value}));
        }
    };

    const validateEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePassword = (password: string): boolean => password.length >= 8;

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        const newErrors: Partial<LoginData> = {};
        if (!loginData.email) newErrors.email = 'Email is required';
        if (!loginData.password) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginData.email,
                password: loginData.password,
            });
            if (error) throw error;
            navigate('/');
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        const newErrors: Partial<FormData> = {};
        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
        if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email';
        if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters';
        if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                    }
                }
            });
            if (error) throw error;
            
            setSuccessMessage('Signup successful! Please check your email to verify your account, then sign in.');
            setView('login');
            setFormData({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
            setLoginData({ email: formData.email, password: ''});

        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handlePasswordResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        if (!validateEmail(resetEmail)) {
            setErrors({ resetEmail: 'Please enter a valid email' });
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                redirectTo: window.location.origin,
            });
            if (error) throw error;
            setSuccessMessage('Password reset link sent! Please check your email.');
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        clearMessages();

        const newErrs: Partial<{newPassword?: string, confirmNewPassword?: string}> = {};
        if (!validatePassword(newPassword.password)) newErrs.newPassword = 'Password must be at least 8 characters';
        if (newPassword.password !== newPassword.confirmPassword) newErrs.confirmNewPassword = 'Passwords do not match';
        if(Object.keys(newErrs).length > 0) {
            setErrors(newErrs);
            return;
        }

        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword.password });
            if (error) throw error;
            setSuccessMessage('Password updated successfully! You can now sign in.');
            setNewPassword({ password: '', confirmPassword: ''});
            setView('login');
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSocialLogin = async (provider: 'google') => {
        setIsLoading(true);
        clearMessages();
        try {
            const { error } = await supabase.auth.signInWithOAuth({ 
                provider,
                options: {
                    redirectTo: 'https://testing-spiked-frontend-recall.vercel.app' 
                }
            });
            if (error) throw error;
        } catch (error: any) {
            setApiError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderFormContent = () => {
        switch(view) {
            case 'login':
                return (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Welcome back</h1>
                            <p className="text-gray-600 text-lg">Please sign in to your account</p>
                        </div>
                        <div className="space-y-3 mb-8">
                           <SocialButton provider="Google" onClick={() => handleSocialLogin('google')} disabled={isLoading} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>} />
                        </div>
                        <div className="relative mb-8"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div><div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">Or</span></div></div>
                        <form onSubmit={handleLoginSubmit} className="space-y-6" noValidate>
                            <InputField name="email" label="Email address" type="email" value={loginData.email} onChange={handleInputChange} error={errors.email} icon={<Mail size={20} />} placeholder="Enter your email" />
                            <InputField name="password" label="Password" type={showPassword ? 'text' : 'password'} value={loginData.password} onChange={handleInputChange} error={errors.password} icon={<Lock size={20} />} showToggle onToggle={() => setShowPassword(!showPassword)} placeholder="Enter your password" />
                            <div className="flex items-center justify-between">
                                <label className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900" /><span className="ml-2 text-sm text-gray-700">Keep me signed in</span></label>
                                <button type="button" onClick={() => handleViewChange('forgotPassword')} className="text-sm text-gray-900 hover:text-gray-700 font-medium">Forgot password?</button>
                            </div>
                            <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">{isLoading ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Signing in...</div> : 'Sign in'}</button>
                        </form>
                    </>
                );
            case 'signup':
                 return (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Create account</h1>
                            <p className="text-gray-600 text-lg">Get started with your free account</p>
                        </div>
                        <form onSubmit={handleSignupSubmit} className="space-y-6" noValidate>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField name="firstName" label="First name" type="text" value={formData.firstName} onChange={handleInputChange} error={errors.firstName} icon={<User size={20} />} placeholder="John" />
                                <InputField name="lastName" label="Last name" type="text" value={formData.lastName} onChange={handleInputChange} error={errors.lastName} icon={<User size={20} />} placeholder="Doe" />
                            </div>
                            <InputField name="email" label="Email address" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} icon={<Mail size={20} />} placeholder="john@example.com" />
                            <InputField name="password" label="Password" type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleInputChange} error={errors.password} icon={<Lock size={20} />} showToggle onToggle={() => setShowPassword(!showPassword)} placeholder="At least 8 characters" />
                            <InputField name="confirmPassword" label="Confirm password" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleInputChange} error={errors.confirmPassword} icon={<Lock size={20} />} showToggle onToggle={() => setShowConfirmPassword(!showConfirmPassword)} placeholder="Confirm your password" />
                            <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">{isLoading ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Creating account...</div> : 'Create account'}</button>
                        </form>
                    </>
                );
            case 'forgotPassword':
                return (
                    <>
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Forgot Password</h1>
                            <p className="text-gray-600 text-lg">Enter your email to receive a reset link</p>
                        </div>
                        <form onSubmit={handlePasswordResetRequest} className="space-y-6">
                            <InputField name="resetEmail" label="Email address" type="email" value={resetEmail} onChange={handleInputChange} error={errors.resetEmail} icon={<Mail size={20} />} placeholder="Enter your email" />
                            <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">{isLoading ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Sending...</div> : 'Send Reset Link'}</button>
                        </form>
                    </>
                );
            case 'updatePassword':
                return (
                     <>
                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-semibold text-gray-900 mb-3">Set New Password</h1>
                            <p className="text-gray-600 text-lg">Please enter and confirm your new password.</p>
                        </div>
                        <form onSubmit={handlePasswordUpdate} className="space-y-6">
                            <InputField name="password" label="New Password" type={showPassword ? 'text' : 'password'} value={newPassword.password} onChange={handleInputChange} error={errors.newPassword} icon={<Lock size={20} />} showToggle onToggle={() => setShowPassword(!showPassword)} placeholder="At least 8 characters" />
                            <InputField name="confirmPassword" label="Confirm New Password" type={showConfirmPassword ? 'text' : 'password'} value={newPassword.confirmPassword} onChange={handleInputChange} error={errors.confirmNewPassword} icon={<Lock size={20} />} showToggle onToggle={() => setShowConfirmPassword(!showConfirmPassword)} placeholder="Confirm your new password" />
                            <button type="submit" disabled={isLoading} className="w-full bg-gray-900 text-white py-3.5 px-4 rounded-lg font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">{isLoading ? <div className="flex items-center justify-center"><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>Updating...</div> : 'Update Password'}</button>
                        </form>
                    </>
                )
        }
    };
    
    const renderFooter = () => {
        if (view === 'login') {
            return (
                <p className="text-gray-600">Don't have an account? <button type="button" onClick={() => handleViewChange('signup')} className="font-medium text-gray-900 hover:text-gray-700 underline">Sign up</button></p>
            );
        }
        if (view === 'signup') {
            return (
                <p className="text-gray-600">Already have an account? <button type="button" onClick={() => handleViewChange('login')} className="font-medium text-gray-900 hover:text-gray-700 underline">Sign in</button></p>
            );
        }
        if (view === 'forgotPassword') {
            return (
                <p className="text-gray-600">Remember your password? <button type="button" onClick={() => handleViewChange('login')} className="font-medium text-gray-900 hover:text-gray-700 underline flex items-center justify-center gap-1 mx-auto"><ArrowLeft size={16}/> Back to Sign In</button></p>
            )
        }
        return null;
    };


    return (
        <div className="h-screen overflow-hidden md:grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-center items-center bg-gray-900 text-white p-12 text-center">
                <div className="max-w-md">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="relative">
                            <img src="/logo.png" alt="SpikedAI Logo" className="w-24 h-24 shadow-lg object-cover" style={{ background: "#e0f7fa" }}/>
                        </div>
                        <h2 className="text-5xl font-extrabold tracking-tight">SpikedAI</h2>
                    </div>
                    <p className="text-gray-300 text-lg leading-relaxed">The Revenue OS Platform. <br />
                        Sell like the CEO and unlock Quantum leap in revenue</p>
                </div>
            </div>

            <div className="bg-gray-50 flex justify-center overflow-y-auto px-4 py-12 sm:px-6 lg:px-8">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
                        {apiError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mb-6" role="alert">{apiError}</div>}
                        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-md relative mb-6" role="alert">{successMessage}</div>}
                        
                        {renderFormContent()}

                        <div className="text-center mt-8">
                            {renderFooter()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPages;